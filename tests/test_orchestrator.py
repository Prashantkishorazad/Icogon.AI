import asyncio
import unittest
from datetime import timedelta

from app.orchestrator.mock import MockAgentProvider, StaticChangeVerifier
from app.orchestrator.models import (
    AgentRun,
    ChangeSet,
    FileChange,
    PlanResponse,
    RunBudget,
    RunRequest,
    RunStatus,
    VerificationResult,
    utc_now,
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


class SlowMockProvider(MockAgentProvider):
    async def create_plan(self, request: RunRequest) -> PlanResponse:
        await asyncio.sleep(1.2)
        return await super().create_plan(request)


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
        self.assertEqual(
            [step.name for step in completed.steps],
            [
                "planning",
                "generating",
                "verifying",
            ],
        )
        self.assertEqual(completed.model_calls, 2)
        self.assertIsNotNone(completed.changes)

    async def test_submission_is_idempotent_per_user(self):
        service = self.make_service()
        first = await service.submit(request())
        second = await service.submit(request())
        self.assertEqual(first.id, second.id)

        events = await service.list_events(first.id)
        self.assertEqual([event.event_type for event in events], ["run.created"])

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
        unsafe_paths = [
            "../secret.txt",
            "/etc/passwd",
            "C:/secrets.txt",
            "..\\secret.txt",
        ]

        for path in unsafe_paths:
            with self.subTest(path=path):
                result = await verifier.verify(
                    ChangeSet(
                        summary="unsafe",
                        files=[FileChange(path=path, content="test")],
                    )
                )
                self.assertFalse(result.passed)

    async def test_run_events_are_ordered_and_incremental(self):
        service = self.make_service()
        submitted = await service.submit(request("request-0005"))
        await service.execute(submitted.id)

        events = await service.list_events(submitted.id)
        self.assertEqual(
            [event.sequence for event in events],
            list(range(1, len(events) + 1)),
        )
        self.assertEqual(events[0].event_type, "run.created")
        completed_event = next(
            event
            for event in events
            if event.event_type == "run.status_changed"
            and event.payload.get("to") == RunStatus.COMPLETED.value
        )
        self.assertIsNotNone(completed_event)
        tail = await service.list_events(submitted.id, after=events[-2].sequence)
        self.assertEqual([event.sequence for event in tail], [events[-1].sequence])

    async def test_queued_run_can_be_cancelled(self):
        service = self.make_service()
        submitted = await service.submit(request("request-0006"))
        cancelled = await service.request_cancel(submitted.id)
        executed = await service.execute(submitted.id)

        self.assertEqual(cancelled.status, RunStatus.CANCELLED)
        self.assertEqual(executed.status, RunStatus.CANCELLED)
        events = await service.list_events(submitted.id)
        self.assertIn("run.cancel_requested", [event.event_type for event in events])

    async def test_active_lease_prevents_a_second_worker_claim(self):
        repository = InMemoryRunRepository()
        run = await repository.create(AgentRun(**request("request-0007").model_dump()))
        first = await repository.claim(run.id, "worker-a", 30)
        second = await repository.claim(run.id, "worker-b", 30)

        self.assertIsNotNone(first)
        self.assertIsNone(second)
        self.assertTrue(await repository.release(first.token))
        third = await repository.claim(run.id, "worker-b", 30)
        self.assertIsNotNone(third)

    async def test_expired_worker_run_recovers_from_durable_checkpoint(self):
        repository = InMemoryRunRepository()
        service = OrchestratorService(
            repository=repository,
            provider=MockAgentProvider(),
            verifier=StaticChangeVerifier(),
        )
        submitted = await service.submit(request("request-0008"))
        stale_lease = await repository.claim(submitted.id, "dead-worker", 30)
        interrupted = await repository.get(submitted.id)
        interrupted.status = RunStatus.PLANNING
        interrupted.lease_expires_at = utc_now() - timedelta(seconds=1)
        await repository.save(interrupted)

        completed = await service.execute(submitted.id, worker_id="recovery-worker")

        self.assertEqual(completed.status, RunStatus.COMPLETED)
        self.assertEqual(completed.execution_attempts, 2)
        events = await service.list_events(submitted.id)
        recovered = [event for event in events if event.event_type == "run.recovered"]
        self.assertEqual(len(recovered), 1)
        self.assertEqual(recovered[0].payload["checkpoint"], "queued")
        self.assertIsNotNone(stale_lease)

    async def test_stale_worker_cannot_overwrite_new_lease_owner(self):
        repository = InMemoryRunRepository()
        run = await repository.create(AgentRun(**request("request-0009").model_dump()))
        stale_lease = await repository.claim(run.id, "worker-a", 30)
        stale_snapshot = await repository.get(run.id)
        stale_snapshot.lease_expires_at = utc_now() - timedelta(seconds=1)
        await repository.save(stale_snapshot)
        current_lease = await repository.claim(run.id, "worker-b", 30)

        self.assertIsNotNone(current_lease)
        with self.assertRaises(PermissionError):
            await repository.save(stale_snapshot, stale_lease.token)

    async def test_heartbeat_keeps_lease_active_during_long_model_call(self):
        repository = InMemoryRunRepository()
        service = OrchestratorService(
            repository=repository,
            provider=SlowMockProvider(),
            verifier=StaticChangeVerifier(),
        )
        submitted = await service.submit(request("request-0010"))

        completed = await service.execute(
            submitted.id,
            worker_id="slow-worker",
            lease_seconds=1,
        )

        self.assertEqual(completed.status, RunStatus.COMPLETED)
        self.assertIsNotNone(completed.last_heartbeat_at)


if __name__ == "__main__":
    unittest.main()
