import unittest
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.middleware.jwtauth import get_current_user, get_supabase
from app.orchestrator.mock import MockAgentProvider, StaticChangeVerifier
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.runtime import get_orchestrator_service
from app.orchestrator.service import OrchestratorService
from app.routers.orchestrator import router


class ProjectQuery:
    def __init__(self):
        self.filters = {}

    def table(self, name):
        return self

    def select(self, columns):
        return self

    def eq(self, name, value):
        self.filters[name] = value
        return self

    def execute(self):
        return SimpleNamespace(
            data=[{"id": "project"}]
            if self.filters == {"id": "project", "user_id": "owner"}
            else []
        )


class OrchestratorApiTests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        app.include_router(router)
        self.owner = "owner"
        self.service = OrchestratorService(
            InMemoryRunRepository(), MockAgentProvider(), StaticChangeVerifier()
        )
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
            id=self.owner
        )
        app.dependency_overrides[get_supabase] = ProjectQuery
        app.dependency_overrides[get_orchestrator_service] = lambda: self.service
        self.client = TestClient(app)
        self.payload = {
            "project_id": "project",
            "prompt": "Build a task board",
            "idempotency_key": "api-request-001",
        }

    def test_submit_poll_idempotency_and_followup(self):
        created = self.client.post("/orchestrator/runs", json=self.payload)
        self.assertEqual(created.status_code, 202)
        run_id = created.json()["id"]
        result = self.client.get(f"/orchestrator/runs/{run_id}").json()
        self.assertEqual(result["status"], "completed")
        repeated = self.client.post("/orchestrator/runs", json=self.payload)
        self.assertEqual(repeated.json()["id"], run_id)
        followup = self.client.post(
            "/orchestrator/runs",
            json={
                **self.payload,
                "base_run_id": run_id,
                "idempotency_key": "api-request-002",
            },
        )
        self.assertEqual(followup.status_code, 202)
        self.assertEqual(followup.json()["context_files"], result["changes"]["files"])

    def test_project_ownership_is_required(self):
        self.owner = "other"
        self.assertEqual(
            self.client.post("/orchestrator/runs", json=self.payload).status_code, 404
        )

    def test_foreign_run_cannot_be_read_cancelled_or_used_as_context(self):
        run_id = self.client.post("/orchestrator/runs", json=self.payload).json()["id"]
        self.owner = "other"
        self.assertEqual(
            self.client.get(f"/orchestrator/runs/{run_id}").status_code, 404
        )
        self.assertEqual(
            self.client.post(f"/orchestrator/runs/{run_id}/cancel").status_code, 404
        )
        self.assertEqual(
            self.client.get(f"/orchestrator/runs/{run_id}/events").status_code, 404
        )

    def test_unknown_base_run_rejected(self):
        response = self.client.post(
            "/orchestrator/runs", json={**self.payload, "base_run_id": "missing"}
        )
        self.assertEqual(response.status_code, 404)
