import asyncio

from app.orchestrator.models import RunRequest
from app.orchestrator.provider import build_provider
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.service import OrchestratorService
from app.orchestrator.mock import StaticChangeVerifier


async def main():
    print("=" * 80)
    print("ICOGON AI — REAL GROQ END-TO-END SMOKE TEST")
    print("=" * 80)

    provider = build_provider()

    print(f"Provider: {type(provider).__name__}")
    print(f"Model: {provider.model}")
    print(f"Planning: {provider.planning_model}")

    service = OrchestratorService(
        repository=InMemoryRunRepository(),
        provider=provider,
        verifier=StaticChangeVerifier(),
    )

    request = RunRequest(
        user_id="groq-e2e-user",
        project_id="groq-e2e-project",
        idempotency_key="groq-e2e-001",
        prompt=(
            "Build a production-quality modern SaaS landing page for "
            "an AI website generator called ICOGON AI. "
            "Use a clean responsive layout with a navbar, hero section, "
            "features section, pricing section, and footer."
        ),
        quality="fast",
    )

    print("\n[1/2] Submitting run...")

    submitted = await service.submit(request)

    print(f"Run ID: {submitted.id}")
    print(f"Initial status: {submitted.status.value}")

    print("\n[2/2] Executing REAL Groq E2E pipeline...")
    print("-" * 80)

    completed = await service.execute(submitted.id)

    print("\n" + "=" * 80)
    print("RESULT")
    print("=" * 80)

    print(f"Status: {completed.status.value}")
    print(f"Model calls: {completed.model_calls}")
    print("Usage: tracked per model call in orchestration steps")
    print(f"Failure: {completed.failure}")

    print("\nSteps:")

    for step in completed.steps:
        status = step.status.value if hasattr(step.status, "value") else step.status
        print(f"  - {step.name}: {status}")

    if completed.failure:
        print("\nFailure:")
        print(completed.failure)

    print("\n" + "=" * 80)

    if completed.status.value == "completed":
        print("GROQ E2E SUCCESS")
    else:
        print("GROQ E2E FAILED")

    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
