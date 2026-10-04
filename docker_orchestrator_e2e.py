import asyncio

from app.orchestrator.models import RunBudget, RunRequest
from app.orchestrator.mock import MockAgentProvider
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.service import OrchestratorService
from app.sandbox.runtime import build_change_verifier


async def main():
    print("=" * 80)
    print("ICOGON AI — DOCKER ORCHESTRATOR E2E")
    print("=" * 80)

    repository = InMemoryRunRepository()

    # Keep the provider mock for this test.
    # The purpose here is to verify the real Docker verification backend
    # through the actual OrchestratorService pipeline.
    provider = MockAgentProvider()

    # This MUST come from runtime configuration.
    verifier = build_change_verifier()

    print("\nRuntime components:")
    print(f"  Provider : {type(provider).__name__}")
    print(f"  Verifier : {type(verifier).__name__}")

    if hasattr(verifier, "_sandbox"):
        print(f"  Sandbox  : {type(verifier._sandbox).__name__}")

    if hasattr(verifier, "_commands"):
        print("  Commands:")
        for index, command in enumerate(verifier._commands, start=1):
            print(
                f"    {index}. argv={command.argv} "
                f"network={command.network}"
            )

    service = OrchestratorService(
        repository=repository,
        provider=provider,
        verifier=verifier,
    )

    request = RunRequest(
        user_id="docker-e2e-user",
        project_id="docker-e2e-project",
        prompt=(
            "Create a small React task management application "
            "with a header, task list, add-task interface, "
            "and footer."
        ),
        idempotency_key="docker-orchestrator-e2e-001",
        budget=RunBudget(),
    )

    print("\nSubmitting run...")
    print("-" * 80)

    submitted = await service.submit(request)

    print(f"Run ID: {submitted.id}")
    print(f"Initial status: {submitted.status}")

    print("\nExecuting orchestrator...")
    print("-" * 80)

    completed = await service.execute(submitted.id)

    print("\n" + "=" * 80)
    print("RESULT")
    print("=" * 80)

    print(f"Status: {completed.status}")
    print(f"Model calls: {completed.model_calls}")
    print(f"Repair attempts: {completed.repair_attempts}")

    if completed.failure:
        print("\nFailure:")
        print(completed.failure.model_dump())

    print("\nSteps:")

    for step in completed.steps:
        print(
            f"  - {step.name}: "
            f"{step.status}"
        )

    print("\n" + "=" * 80)

    if completed.status.value == "completed":
        print("DOCKER ORCHESTRATOR E2E SUCCESS")
    else:
        print("DOCKER ORCHESTRATOR E2E FAILED")

    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())