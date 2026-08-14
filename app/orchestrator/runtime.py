from app.orchestrator.mock import MockAgentProvider, StaticChangeVerifier
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.service import OrchestratorService


repository = InMemoryRunRepository()
service = OrchestratorService(
    repository=repository,
    provider=MockAgentProvider(),
    verifier=StaticChangeVerifier(),
)
