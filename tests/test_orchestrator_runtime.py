import os
import unittest
from datetime import timezone
from unittest.mock import patch
from uuid import uuid4

from app.orchestrator.models import AgentRun, RunRequest, RunStatus, utc_now
from app.orchestrator.postgres_repository import PostgresRunRepository
from app.orchestrator.runtime import OrchestratorRuntime


class OrchestratorRuntimeTests(unittest.IsolatedAsyncioTestCase):
    async def test_memory_runtime_processes_queued_work(self):
        with patch.dict(os.environ, {"ORCHESTRATOR_BACKEND": "memory"}, clear=False):
            runtime = OrchestratorRuntime()
            service = await runtime.get_service()
            submitted = await service.submit(
                RunRequest(
                    user_id="user-1",
                    project_id="project-1",
                    prompt="Build the runtime test fixture",
                    idempotency_key="runtime-request-0001",
                )
            )

            completed = await service.process_next("runtime-worker")

            self.assertEqual(completed.id, submitted.id)
            self.assertEqual(completed.status, RunStatus.COMPLETED)
            self.assertIsNone(await service.process_next("runtime-worker"))
            await runtime.close()

    async def test_postgres_runtime_requires_database_url(self):
        environment = {"ORCHESTRATOR_BACKEND": "postgres", "DATABASE_URL": ""}
        with patch.dict(os.environ, environment, clear=False):
            runtime = OrchestratorRuntime()
            with self.assertRaisesRegex(RuntimeError, "DATABASE_URL is required"):
                await runtime.get_service()

    def test_postgres_codec_preserves_run_state(self):
        run = AgentRun(
            user_id=str(uuid4()),
            project_id="project-1",
            prompt="Round-trip a persisted run",
            idempotency_key="postgres-codec-0001",
        )
        state = PostgresRunRepository._state(run)
        now = utc_now().astimezone(timezone.utc)
        row = {
            "id": run.id,
            "user_id": run.user_id,
            "project_id": run.project_id,
            "prompt": run.prompt,
            "idempotency_key": run.idempotency_key,
            "status": run.status.value,
            "state": state,
            "cancel_requested_at": None,
            "lease_owner": None,
            "lease_token": None,
            "lease_expires_at": None,
            "last_heartbeat_at": None,
            "execution_attempts": 0,
            "version": run.version,
            "created_at": now,
            "updated_at": now,
        }

        restored = PostgresRunRepository._from_row(row)

        self.assertEqual(restored.id, run.id)
        self.assertEqual(restored.budget, run.budget)
        self.assertEqual(restored.status, RunStatus.QUEUED)
