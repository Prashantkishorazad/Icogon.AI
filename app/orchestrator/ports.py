from __future__ import annotations

from typing import Protocol

from app.orchestrator.models import (
    AgentRun,
    ChangeResponse,
    ChangeSet,
    GenerationPlan,
    PlanResponse,
    RunEvent,
    RunRequest,
    VerificationResult,
)


class AgentProvider(Protocol):
    async def create_plan(self, request: RunRequest) -> PlanResponse: ...

    async def generate_changes(
        self,
        request: RunRequest,
        plan: GenerationPlan,
    ) -> ChangeResponse: ...

    async def repair_changes(
        self,
        request: RunRequest,
        plan: GenerationPlan,
        changes: ChangeSet,
        feedback: list[str],
    ) -> ChangeResponse: ...


class ChangeVerifier(Protocol):
    async def verify(self, changes: ChangeSet) -> VerificationResult: ...


class RunRepository(Protocol):
    async def create(self, run: AgentRun) -> AgentRun: ...

    async def get(self, run_id: str) -> AgentRun | None: ...

    async def get_by_idempotency_key(
        self,
        user_id: str,
        idempotency_key: str,
    ) -> AgentRun | None: ...

    async def save(self, run: AgentRun) -> AgentRun: ...

    async def append_event(self, event: RunEvent) -> RunEvent: ...

    async def list_events(self, run_id: str, after: int = 0) -> list[RunEvent]: ...
