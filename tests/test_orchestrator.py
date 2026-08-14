import unittest

from app.orchestrator.mock import MockAgentProvider, StaticChangeVerifier
from app.orchestrator.models import (
    ChangeSet,
    FileChange,
    RunBudget,
    RunRequest,
    RunStatus,
    VerificationResult,
)
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.service import OrchestratorService


def request(key: str = "request-0001", budget: RunBudget | None = None) -> RunRequest:
    return RunRequest(
        user_id="user-1",
        project_id="project-1",
        prompt="Create a small task management application",
        idempotency_key=key,
        budget=budget or RunBudget(),
    )


class FailOnceVerifier:
    def __init__(self) -> None:
        self.calls = 0

    async def verify(self, changes: ChangeSet) -> VerificationResult:
        self.calls += 1
        return VerificationResult(
            passed=self.calls > 1,
            checks={"build": self.calls > 1},
            feedback=[] if self.calls > 1 else ["Build failed once"],
        )


class OrchestratorTests(unittest.IsolatedAsyncioTestCase):
    def make_service(self, verifier=None) -> OrchestratorService:
        return OrchestratorService(
            repository=InMemoryRunRepository(),
            provider=MockAgentProvider(),
            verifier=verifier or StaticChangeVerifier(),
        )

    async def test_run_completes_with_mock_provider(self):
        service = self.make_service()
        submitted = await service.submit(request())
        completed = await service.execute(submitted.id)

        self.assertEqual(completed.status, RunStatus.COMPLETED)
        self.assertEqual([step.name for step in completed.steps], [
            "planning",
            "generating",
            "verifying",
        ])
        self.assertEqual(completed.model_calls, 2)
        self.assertIsNotNone(completed.changes)

    async def test_submission_is_idempotent_per_user(self):
        service = self.make_service()
        first = await service.submit(request())
        second = await service.submit(request())
        self.assertEqual(first.id, second.id)

    async def test_failed_verification_triggers_bounded_repair(self):
        verifier = FailOnceVerifier()
        service = self.make_service(verifier)
        submitted = await service.submit(request("request-0002"))
        completed = await service.execute(submitted.id)

        self.assertEqual(completed.status, RunStatus.COMPLETED)
        self.assertEqual(completed.repair_attempts, 1)
        self.assertEqual(completed.model_calls, 3)
        self.assertEqual(verifier.calls, 2)

    async def test_model_call_budget_fails_run(self):
        service = self.make_service()
        submitted = await service.submit(
            request("request-0003", RunBudget(max_model_calls=1))
        )
        failed = await service.execute(submitted.id)

        self.assertEqual(failed.status, RunStatus.FAILED)
        self.assertEqual(failed.failure.code, "budget_exceeded")

    async def test_terminal_run_is_not_executed_twice(self):
        service = self.make_service()
        submitted = await service.submit(request("request-0004"))
        first = await service.execute(submitted.id)
        second = await service.execute(submitted.id)
        self.assertEqual(len(first.steps), len(second.steps))

    async def test_verifier_rejects_workspace_escape_paths(self):
        verifier = StaticChangeVerifier()
        unsafe_paths = ["../secret.txt", "/etc/passwd", "C:/secrets.txt", "..\\secret.txt"]

        for path in unsafe_paths:
            with self.subTest(path=path):
                result = await verifier.verify(
                    ChangeSet(
                        summary="unsafe",
                        files=[FileChange(path=path, content="test")],
                    )
                )
                self.assertFalse(result.passed)


if __name__ == "__main__":
    unittest.main()
