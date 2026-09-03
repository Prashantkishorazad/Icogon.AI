from typing import Protocol

from app.agents.contracts import (
    ArchitectureProposal,
    ChangeReview,
    ProjectBrief,
    SecurityAssessment,
)
from app.orchestrator.models import (
    ChangeResponse,
    ChangeSet,
    GenerationPlan,
    PlanResponse,
    RunRequest,
    VerificationResult,
)


class RequirementsAgent(Protocol):
    async def analyze(self, request: RunRequest) -> ProjectBrief: ...


class ArchitectureAgent(Protocol):
    async def design(
        self,
        request: RunRequest,
        brief: ProjectBrief,
    ) -> ArchitectureProposal: ...


class PlanningAgent(Protocol):
    async def plan(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
    ) -> PlanResponse: ...


class ImplementationAgent(Protocol):
    async def implement(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
    ) -> ChangeResponse: ...

    async def repair(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
        changes: ChangeSet,
        feedback: list[str],
    ) -> ChangeResponse: ...


class ReviewAgent(Protocol):
    async def review(
        self,
        plan: GenerationPlan,
        changes: ChangeSet,
    ) -> ChangeReview: ...


class SecurityAgent(Protocol):
    async def assess(self, changes: ChangeSet) -> SecurityAssessment: ...


class VerificationAgent(Protocol):
    async def verify(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> VerificationResult: ...
