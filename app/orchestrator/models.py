from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal
from uuid import uuid4

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


# ============================================================================
# TIME
# ============================================================================

def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ============================================================================
# RUN STATUS
# ============================================================================

class RunStatus(str, Enum):
    QUEUED = "queued"
    ANALYZING = "analyzing"
    DESIGNING = "designing"
    PLANNING = "planning"
    GENERATING = "generating"
    REVIEWING = "reviewing"
    REPAIRING = "repairing"
    VERIFYING = "verifying"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

    @property
    def is_terminal(self) -> bool:
        return self in TERMINAL_STATUSES


TERMINAL_STATUSES = {
    RunStatus.COMPLETED,
    RunStatus.FAILED,
    RunStatus.CANCELLED,
}


_ALLOWED_TRANSITIONS: dict[RunStatus, set[RunStatus]] = {
    RunStatus.QUEUED: {
        RunStatus.ANALYZING,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.ANALYZING: {
        RunStatus.DESIGNING,
        RunStatus.REPAIRING,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.DESIGNING: {
        RunStatus.PLANNING,
        RunStatus.REPAIRING,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.PLANNING: {
        RunStatus.GENERATING,
        RunStatus.REPAIRING,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.GENERATING: {
        RunStatus.REVIEWING,
        RunStatus.REPAIRING,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.REVIEWING: {
        RunStatus.REPAIRING,
        RunStatus.VERIFYING,
        RunStatus.COMPLETED,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.REPAIRING: {
        RunStatus.REVIEWING,
        RunStatus.VERIFYING,
        RunStatus.GENERATING,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.VERIFYING: {
        RunStatus.REPAIRING,
        RunStatus.COMPLETED,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
    },
    RunStatus.COMPLETED: set(),
    RunStatus.FAILED: set(),
    RunStatus.CANCELLED: set(),
}


# ============================================================================
# BUDGET
# ============================================================================

class RunBudget(BaseModel):
    model_config = ConfigDict(extra="forbid")

    max_model_calls: int = Field(
        default=8,
        ge=1,
        le=50,
    )
    max_repair_attempts: int = Field(
        default=2,
        ge=0,
        le=20,
    )
    max_output_tokens: int = Field(
        default=20_000,
        ge=256,
        le=200_000,
    )

    @field_validator(
        "max_model_calls",
        "max_repair_attempts",
        "max_output_tokens",
    )
    @classmethod
    def positive_budget(cls, value: int) -> int:
        if value < 0:
            raise ValueError("Budget values cannot be negative")
        return value


# ============================================================================
# REQUEST / CONTEXT
# ============================================================================

class RunRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: str
    project_id: str

    prompt: str = Field(
        min_length=1,
        max_length=50_000,
    )

    idempotency_key: str = Field(
        min_length=1,
        max_length=255,
    )

    budget: RunBudget = Field(
        default_factory=RunBudget
    )

    context_files: list["FileChange"] = Field(
        default_factory=list
    )

    base_run_id: str | None = None

    quality: Literal[
        "fast",
        "balanced",
        "polished",
    ] = "balanced"

    @field_validator("prompt")
    @classmethod
    def normalize_prompt(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Prompt cannot be empty")

        return value


# ============================================================================
# PLAN TASK
# ============================================================================

class PlanTask(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    description: str

    target_files: list[str] = Field(
        default_factory=list
    )

    depends_on: list[str] = Field(
        default_factory=list
    )


# ============================================================================
# FILE PLAN
# ============================================================================

class FilePlanEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    path: str = Field(min_length=1)
    action: Literal[
        "preserve",
        "read",
        "modify",
        "create",
        "delete",
    ]
    preserve: bool = False
    read: bool = False
    modify: bool = False
    create: bool = False
    delete: bool = False
    reason: str = ""

    @field_validator("path")
    @classmethod
    def validate_path(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("File plan path cannot be empty")

        # Never allow absolute paths or workspace traversal.
        if (
            value.startswith("/")
            or value.startswith("\\")
            or "\x00" in value
            or "\\" in value
            or ".." in value.split("/")
            or ":" in value.split("/")[0]
        ):
            raise ValueError(
                "File plan paths must stay inside the project workspace"
            )

        return value

    @model_validator(mode="after")
    def normalize_flags(self) -> "FilePlanEntry":
        action = self.action

        self.preserve = action == "preserve"
        self.read = action == "read"
        self.modify = action == "modify"
        self.create = action == "create"
        self.delete = action == "delete"

        return self


# ============================================================================
# DESIGN BLUEPRINT
# ============================================================================

class DesignBlueprint(BaseModel):
    model_config = ConfigDict(extra="allow")

    project_type: str = "web_application"

    template: Literal[
        "html",
        "react",
        "react-three",
    ] = "react"

    # Accept both:
    # audience="students"
    # audience=["students", "teachers"]
    audience: str | list[str] = Field(
        default_factory=list
    )

    visual_direction: str = ""

    design_tokens: dict[str, Any] = Field(
        default_factory=dict
    )

    pages: list[str] = Field(
        default_factory=list
    )

    interactions: list[str] = Field(
        default_factory=list
    )

    acceptance_criteria: list[str] = Field(
        default_factory=list
    )

    limitations: list[str] = Field(
        default_factory=list
    )

    @field_validator("audience", mode="before")
    @classmethod
    def normalize_audience(
        cls,
        value: Any,
    ) -> list[str]:
        if value is None:
            return []

        if isinstance(value, str):
            value = value.strip()

            if not value:
                return []

            return [value]

        if isinstance(value, (tuple, set)):
            return [str(item) for item in value]

        if isinstance(value, list):
            return [str(item) for item in value]

        return [str(value)]


# ============================================================================
# GENERATION PLAN
# ============================================================================

class GenerationPlan(BaseModel):
    model_config = ConfigDict(extra="allow")

    summary: str = Field(
        min_length=1
    )

    assumptions: list[str] = Field(
        default_factory=list
    )

    tasks: list[PlanTask] = Field(
        default_factory=list
    )

    # Normal/mock plans may not have a blueprint yet.
    # IntelligentPlan requires one.
    blueprint: DesignBlueprint | None = None

    file_plan: list[FilePlanEntry] = Field(
        default_factory=list
    )

    @property
    def planned_paths(self) -> set[str]:
        return {
            entry.path
            for entry in self.file_plan
        }

    @property
    def actionable_paths(self) -> set[str]:
        return {
            entry.path
            for entry in self.file_plan
            if entry.action in {
                "create",
                "modify",
                "delete",
            }
        }


# ============================================================================
# WORKER LEASE
# ============================================================================

class WorkerLease(BaseModel):
    model_config = ConfigDict(extra="allow")

    run_id: str
    worker_id: str

    token: str = Field(
        default_factory=lambda: str(uuid4())
    )

    expires_at: datetime

    recovered: bool = False


# ============================================================================
# INTELLIGENT PLAN
# ============================================================================

class IntelligentPlan(GenerationPlan):
    tasks: list[PlanTask] = Field(
        default_factory=list,
        max_length=40,
    )

    file_plan: list[FilePlanEntry] = Field(
        min_length=1,
        max_length=150,
    )

    blueprint: DesignBlueprint

    @model_validator(mode="after")
    def validate_dependency_graph(
        self,
    ) -> "IntelligentPlan":

        # --------------------------------------------------------------
        # Unique task IDs
        # --------------------------------------------------------------

        task_ids = {
            task.id
            for task in self.tasks
        }

        if len(task_ids) != len(self.tasks):
            raise ValueError(
                "Task IDs must be unique"
            )

        # --------------------------------------------------------------
        # Dependency validation
        # --------------------------------------------------------------

        for task in self.tasks:
            unknown = (
                set(task.depends_on)
                - task_ids
            )

            if unknown:
                raise ValueError(
                    f"Task {task.id} depends on unknown tasks: "
                    + ", ".join(sorted(unknown))
                )

        # --------------------------------------------------------------
        # File target validation
        # --------------------------------------------------------------

        planned = self.planned_paths

        for task in self.tasks:
            unknown_paths = (
                set(task.target_files)
                - planned
            )

            if unknown_paths:
                raise ValueError(
                    f"Task {task.id} targets files outside file_plan: "
                    + ", ".join(sorted(unknown_paths))
                )

        # --------------------------------------------------------------
        # Dependency cycle detection
        # --------------------------------------------------------------

        graph = {
            task.id: task.depends_on
            for task in self.tasks
        }

        visited: set[str] = set()
        active: set[str] = set()

        def visit(node: str) -> None:
            if node in active:
                raise ValueError(
                    "Task dependencies contain a cycle"
                )

            if node in visited:
                return

            if node not in graph:
                raise ValueError(
                    f"Task dependency does not exist: {node}"
                )

            active.add(node)

            for dependency in graph[node]:
                visit(dependency)

            active.remove(node)
            visited.add(node)

        for task_id in graph:
            visit(task_id)

        return self


# ============================================================================
# GENERATED FILES
# ============================================================================

class FileChange(BaseModel):
    model_config = ConfigDict(extra="forbid")

    path: str = Field(
        min_length=1,
        max_length=500,
    )

    content: str = ""

    operation: Literal[
        "upsert",
        "delete",
    ] = "upsert"

    @field_validator("path")
    @classmethod
    def normalize_path(cls, value: str) -> str:
        value = value.replace("\\", "/").strip()

        if not value:
            raise ValueError(
                "File path cannot be empty"
            )

        return value


class ChangeSet(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str = ""

    files: list[FileChange] = Field(
        default_factory=list,
        max_length=150,
    )


# ============================================================================
# VERIFICATION
# ============================================================================

class VerificationResult(BaseModel):
    model_config = ConfigDict(extra="allow")

    passed: bool

    checks: dict[str, bool] = Field(
        default_factory=dict
    )

    feedback: list[str] = Field(
        default_factory=list
    )


# ============================================================================
# PROVIDER USAGE
# ============================================================================

class ProviderUsage(BaseModel):
    model_config = ConfigDict(extra="allow")

    model: str = ""

    provider: str = ""

    input_tokens: int = Field(
        default=0,
        ge=0,
    )

    output_tokens: int = Field(
        default=0,
        ge=0,
    )

    total_tokens: int = Field(
        default=0,
        ge=0,
    )

    @model_validator(mode="after")
    def normalize_total(
        self,
    ) -> "ProviderUsage":

        if self.total_tokens <= 0:
            self.total_tokens = (
                self.input_tokens
                + self.output_tokens
            )

        return self


# ============================================================================
# PROVIDER RESPONSES
# ============================================================================

class PlanResponse(BaseModel):
    plan: GenerationPlan
    usage: ProviderUsage = Field(
        default_factory=ProviderUsage
    )


class ChangeResponse(BaseModel):
    changes: ChangeSet

    usage: ProviderUsage = Field(
        default_factory=ProviderUsage
    )


class ReviewResponse(BaseModel):
    review: "ChangeReview"

    usage: ProviderUsage = Field(
        default_factory=ProviderUsage
    )


# ============================================================================
# RUN EVENTS / STEPS / HANDOFFS
# ============================================================================

class RunStep(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(
        default_factory=lambda: str(uuid4())
    )

    name: str

    status: str = "running"

    started_at: datetime = Field(
        default_factory=utc_now
    )

    finished_at: datetime | None = None

    details: dict[str, Any] = Field(
        default_factory=dict
    )

    error: str | None = None


class RunEvent(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(
        default_factory=lambda: str(uuid4())
    )

    run_id: str

    sequence: int = Field(
        default=0,
        ge=0,
    )

    event_type: str

    payload: dict[str, Any] = Field(
        default_factory=dict
    )

    created_at: datetime = Field(
        default_factory=utc_now
    )


class AgentMessage(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(
        default_factory=lambda: str(uuid4())
    )

    sender: str

    recipient: str

    kind: Literal[
        "request",
        "artifact",
        "feedback",
        "decision",
    ]

    summary: str

    artifact: str | None = None

    created_at: datetime = Field(
        default_factory=utc_now
    )


class RunFailure(BaseModel):
    code: str
    message: str
    retryable: bool = False


# ============================================================================
# AGENT RUN
# ============================================================================

class AgentRun(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(
        default_factory=lambda: str(uuid4())
    )

    user_id: str

    project_id: str

    prompt: str

    idempotency_key: str

    budget: RunBudget = Field(
        default_factory=RunBudget
    )

    context_files: list[FileChange] = Field(
        default_factory=list
    )

    base_run_id: str | None = None

    quality: Literal[
        "fast",
        "balanced",
        "polished",
    ] = "balanced"

    status: RunStatus = RunStatus.QUEUED

    version: int = 1

    created_at: datetime = Field(
        default_factory=utc_now
    )

    updated_at: datetime = Field(
        default_factory=utc_now
    )

    # ------------------------------------------------------------------
    # EXECUTION
    # ------------------------------------------------------------------

    execution_attempts: int = 0

    model_calls: int = 0

    repair_attempts: int = 0

    input_tokens: int = 0

    output_tokens: int = 0

    # ------------------------------------------------------------------
    # DURABLE WORKER LEASE
    # ------------------------------------------------------------------
    #
    # These fields are required by:
    # - InMemoryRunRepository
    # - PostgresRunRepository
    # - OrchestratorService
    # - worker heartbeat/recovery
    #

    lease_owner: str | None = None

    lease_token: str | None = None

    lease_expires_at: datetime | None = None

    last_heartbeat_at: datetime | None = None

    # ------------------------------------------------------------------
    # AGENT ARTIFACTS
    # ------------------------------------------------------------------

    brief: Any | None = None

    architecture: Any | None = None

    plan: GenerationPlan | None = None

    changes: ChangeSet | None = None

    review: Any | None = None

    verification: VerificationResult | None = None

    # ------------------------------------------------------------------
    # RUN HISTORY
    # ------------------------------------------------------------------

    steps: list[RunStep] = Field(
        default_factory=list
    )

    events: list[RunEvent] = Field(
        default_factory=list
    )

    handoffs: list[AgentMessage] = Field(
        default_factory=list
    )

    # ------------------------------------------------------------------
    # FAILURE / CANCELLATION
    # ------------------------------------------------------------------

    failure: RunFailure | None = None

    cancel_requested_at: datetime | None = None

    # Worker lease state
    lease_owner: str | None = None
    lease_token: str | None = Field(default=None, exclude=True)
    lease_expires_at: datetime | None = None
    last_heartbeat_at: datetime | None = None

    execution_attempts: int = 0

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    version: int = 1

    # ------------------------------------------------------------------
    # HELPERS
    # ------------------------------------------------------------------

    @property
    def is_terminal(self) -> bool:
        return self.status.is_terminal

    def transition_to(
        self,
        target: RunStatus,
    ) -> None:

        if self.status == target:
            return

        if self.is_terminal:
            raise ValueError(
                f"Cannot transition terminal run "
                f"{self.status.value} -> {target.value}"
            )

        allowed = _ALLOWED_TRANSITIONS.get(
            self.status,
            set(),
        )

        if target not in allowed:
            raise ValueError(
                f"Invalid run status transition: "
                f"{self.status.value} -> {target.value}"
            )

        self.status = target
        self.updated_at = utc_now()
        self.version += 1


# ============================================================================
# FORWARD REFERENCES
# ============================================================================

from app.agents.contracts import ChangeReview  # noqa: E402


RunRequest.model_rebuild()
ReviewResponse.model_rebuild()