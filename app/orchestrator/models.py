from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field, model_validator

from app.agents.contracts import ArchitectureProposal, ChangeReview, ProjectBrief


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class RunStatus(str, Enum):
    QUEUED = "queued"
    ANALYZING = "analyzing"
    DESIGNING = "designing"
    PLANNING = "planning"
    GENERATING = "generating"
    REVIEWING = "reviewing"
    VERIFYING = "verifying"
    REPAIRING = "repairing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


TERMINAL_STATUSES = {
    RunStatus.COMPLETED,
    RunStatus.FAILED,
    RunStatus.CANCELLED,
}


ALLOWED_TRANSITIONS: dict[RunStatus, set[RunStatus]] = {
    RunStatus.QUEUED: {RunStatus.ANALYZING, RunStatus.CANCELLED, RunStatus.FAILED},
    RunStatus.ANALYZING: {
        RunStatus.DESIGNING,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.DESIGNING: {RunStatus.PLANNING, RunStatus.CANCELLED, RunStatus.FAILED},
    RunStatus.PLANNING: {RunStatus.GENERATING, RunStatus.CANCELLED, RunStatus.FAILED},
    RunStatus.GENERATING: {RunStatus.REVIEWING, RunStatus.CANCELLED, RunStatus.FAILED},
    RunStatus.REVIEWING: {
        RunStatus.VERIFYING,
        RunStatus.REPAIRING,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.VERIFYING: {
        RunStatus.REPAIRING,
        RunStatus.COMPLETED,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.REPAIRING: {RunStatus.REVIEWING, RunStatus.CANCELLED, RunStatus.FAILED},
    RunStatus.COMPLETED: set(),
    RunStatus.FAILED: set(),
    RunStatus.CANCELLED: set(),
}


class RunBudget(BaseModel):
    max_model_calls: int = Field(default=8, ge=1, le=50)
    max_repair_attempts: int = Field(default=2, ge=0, le=10)
    max_output_tokens: int = Field(default=20_000, ge=100, le=1_000_000)


class RunRequest(BaseModel):
    user_id: str = Field(min_length=1)
    project_id: str = Field(min_length=1)
    prompt: str = Field(min_length=3, max_length=20_000)
    idempotency_key: str = Field(min_length=8, max_length=200)
    budget: RunBudget = Field(default_factory=RunBudget)
    context_files: list[FileChange] = Field(default_factory=list, max_length=100)
    base_run_id: str | None = None
    quality: Literal["fast", "balanced", "polished"] = "balanced"


class PlanTask(BaseModel):
    id: str
    title: str
    description: str
    target_files: list[str] = Field(default_factory=list)
    depends_on: list[str] = Field(default_factory=list)


class DesignBlueprint(BaseModel):
    project_type: str = Field(min_length=3)
    template: Literal["html", "react", "react-three"]
    audience: str = Field(min_length=3)
    visual_direction: str = Field(min_length=10)
    design_tokens: dict[str, str] = Field(min_length=3)
    pages: list[str] = Field(min_length=1)
    interactions: list[str] = Field(min_length=1)
    acceptance_criteria: list[str] = Field(min_length=2)
    limitations: list[str] = Field(default_factory=list)


class GenerationPlan(BaseModel):
    summary: str
    assumptions: list[str] = Field(default_factory=list)
    tasks: list[PlanTask] = Field(min_length=1)
    blueprint: DesignBlueprint | None = None


class IntelligentPlan(GenerationPlan):
    blueprint: DesignBlueprint
    tasks: list[PlanTask] = Field(min_length=1, max_length=40)

    @model_validator(mode="after")
    def valid_task_graph(self):
        graph = {task.id: task.depends_on for task in self.tasks}
        if len(graph) != len(self.tasks):
            raise ValueError("Task IDs must be unique")
        visited, active = set(), set()

        def visit(node):
            if node not in graph:
                raise ValueError("Task dependency does not exist")
            if node in active:
                raise ValueError("Task dependencies contain a cycle")
            if node in visited:
                return
            active.add(node)
            for dependency in graph[node]:
                visit(dependency)
            active.remove(node)
            visited.add(node)

        for node in graph:
            visit(node)
        return self


class FileChange(BaseModel):
    path: str = Field(min_length=1)
    content: str
    operation: str = Field(default="upsert", pattern="^(upsert|delete)$")


class ChangeSet(BaseModel):
    summary: str
    files: list[FileChange] = Field(default_factory=list)


class VerificationResult(BaseModel):
    passed: bool
    checks: dict[str, bool] = Field(default_factory=dict)
    feedback: list[str] = Field(default_factory=list)


class ProviderUsage(BaseModel):
    input_tokens: int = Field(default=0, ge=0)
    output_tokens: int = Field(default=0, ge=0)
    model: str = "mock"
    provider: str = "mock"


class PlanResponse(BaseModel):
    plan: GenerationPlan
    usage: ProviderUsage = Field(default_factory=ProviderUsage)


class ChangeResponse(BaseModel):
    changes: ChangeSet
    usage: ProviderUsage = Field(default_factory=ProviderUsage)


class ReviewResponse(BaseModel):
    review: ChangeReview
    usage: ProviderUsage


class RunStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    status: str = "running"
    started_at: datetime = Field(default_factory=utc_now)
    finished_at: datetime | None = None
    details: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None


class RunFailure(BaseModel):
    code: str
    message: str
    retryable: bool = False


class RunEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    run_id: str
    sequence: int = Field(default=0, ge=0)
    event_type: str
    payload: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=utc_now)


class WorkerLease(BaseModel):
    run_id: str
    worker_id: str
    token: str = Field(default_factory=lambda: str(uuid4()))
    expires_at: datetime
    recovered: bool = False


class AgentRun(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    project_id: str
    prompt: str
    idempotency_key: str
    status: RunStatus = RunStatus.QUEUED
    budget: RunBudget = Field(default_factory=RunBudget)
    context_files: list[FileChange] = Field(default_factory=list, max_length=100)
    base_run_id: str | None = None
    quality: Literal["fast", "balanced", "polished"] = "balanced"
    model_calls: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    repair_attempts: int = 0
    brief: ProjectBrief | None = None
    architecture: ArchitectureProposal | None = None
    plan: GenerationPlan | None = None
    changes: ChangeSet | None = None
    review: ChangeReview | None = None
    verification: VerificationResult | None = None
    steps: list[RunStep] = Field(default_factory=list)
    failure: RunFailure | None = None
    cancel_requested_at: datetime | None = None
    lease_owner: str | None = None
    lease_token: str | None = Field(default=None, exclude=True)
    lease_expires_at: datetime | None = None
    last_heartbeat_at: datetime | None = None
    execution_attempts: int = 0
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    version: int = 1

    def transition_to(self, target: RunStatus) -> None:
        if target not in ALLOWED_TRANSITIONS[self.status]:
            raise ValueError(
                f"Illegal run transition: {self.status.value} -> {target.value}"
            )
        self.status = target
        self.updated_at = utc_now()
        self.version += 1

    @property
    def is_terminal(self) -> bool:
        return self.status in TERMINAL_STATUSES
