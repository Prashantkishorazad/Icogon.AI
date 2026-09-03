from __future__ import annotations

from typing import Protocol

from app.agents.contracts import ArchitectureProposal, ProjectBrief
from app.orchestrator.models import (
    AgentRun,
    ChangeResponse,
    ChangeSet,
    GenerationPlan,
    PlanResponse,
    RunEvent,
    RunRequest,
    VerificationResult,
    WorkerLease,
)


class AgentProvider(Protocol):
    async def create_plan(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
    ) -> PlanResponse: ...

    async def generate_changes(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
    ) -> ChangeResponse: ...

    async def repair_changes(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
        changes: ChangeSet,
        feedback: list[str],
    ) -> ChangeResponse: ...


class ChangeVerifier(Protocol):
    async def verify(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> VerificationResult: ...


class RunRepository(Protocol):
    async def create(self, run: AgentRun) -> AgentRun: ...

    async def get(self, run_id: str) -> AgentRun | None: ...

    async def get_by_idempotency_key(
        self,
        user_id: str,
        idempotency_key: str,
    ) -> AgentRun | None: ...

    async def save(
        self,
        run: AgentRun,
        lease_token: str | None = None,
    ) -> AgentRun: ...

    async def append_event(
        self,
        event: RunEvent,
        lease_token: str | None = None,
    ) -> RunEvent: ...

    async def list_events(self, run_id: str, after: int = 0) -> list[RunEvent]: ...

    async def claim(
        self,
        run_id: str,
        worker_id: str,
        lease_seconds: int,
    ) -> WorkerLease | None: ...

    async def heartbeat(self, token: str, lease_seconds: int) -> WorkerLease | None: ...

    async def release(self, token: str) -> bool: ...

    async def request_cancel(self, run_id: str) -> AgentRun | None: ...

    async def next_claimable_run_id(self) -> str | None: ...
