from dataclasses import dataclass

from app.agents.defaults import (
    ChangeReviewer,
    ProviderImplementationAgent,
    ProviderPlanningAgent,
    RequirementsAnalyst,
    SolutionArchitect,
)
from app.agents.roles import (
    ArchitectureAgent,
    ImplementationAgent,
    PlanningAgent,
    RequirementsAgent,
    ReviewAgent,
    SecurityAgent,
    VerificationAgent,
)
from app.agents.security import ChangeSecurityAgent
from app.orchestrator.ports import AgentProvider, ChangeVerifier


@dataclass(frozen=True)
class AgentPipeline:
    requirements: RequirementsAgent
    architecture: ArchitectureAgent
    planning: PlanningAgent
    implementation: ImplementationAgent
    review: ReviewAgent
    security: SecurityAgent
    verification: VerificationAgent

    @classmethod
    def from_provider(
        cls,
        provider: AgentProvider,
        verifier: ChangeVerifier,
    ) -> "AgentPipeline":
        return cls(
            requirements=RequirementsAnalyst(),
            architecture=SolutionArchitect(),
            planning=ProviderPlanningAgent(provider),
            implementation=ProviderImplementationAgent(provider),
            review=ChangeReviewer(),
            security=ChangeSecurityAgent(),
            verification=verifier,
        )
