import asyncio
import json
import os
import unittest
from unittest.mock import patch

import httpx

from app.agents.defaults import RequirementsAnalyst, SolutionArchitect
from app.agents.templates import scene_blueprint
from app.orchestrator.mock import MockAgentProvider, StaticChangeVerifier
from app.orchestrator.models import FileChange, IntelligentPlan, RunRequest
from app.orchestrator.provider import ModelProvider, ProviderError, build_provider
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.service import OrchestratorService


class ModelProviderTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.request = RunRequest(
            user_id="u",
            project_id="p",
            prompt="Build a task board",
            idempotency_key="provider-test-001",
            context_files=[FileChange(path="index.html", content="existing project")],
        )
        self.brief = await RequirementsAnalyst().analyze(self.request)
        self.architecture = await SolutionArchitect().design(self.request, self.brief)
        self.plan = (
            await MockAgentProvider().create_plan(
                self.request, self.brief, self.architecture
            )
        ).plan
        blueprint = scene_blueprint().model_copy(
            update={"template": "html", "project_type": "dashboard"}
        )
        self.plan = IntelligentPlan.model_validate(
            {**self.plan.model_dump(), "blueprint": blueprint}
        )

    def provider(self, handler, key="test-only"):
        return ModelProvider(
            key=key,
            base_url="https://example.test/v1",
            model="coder",
            planning_model="planner",
            transport=httpx.MockTransport(handler),
        )

    async def test_plan_schema_context_model_and_usage(self):
        def handler(request):
            data = json.loads(request.content)
            self.assertEqual(data["model"], "planner")
            self.assertIn("existing project", data["messages"][1]["content"])
            self.assertLessEqual(
                data["max_tokens"], self.request.budget.max_output_tokens
            )
            return httpx.Response(
                200,
                json={
                    "choices": [
                        {
                            "finish_reason": "stop",
                            "message": {"content": self.plan.model_dump_json()},
                        }
                    ],
                    "usage": {"prompt_tokens": 11, "completion_tokens": 23},
                },
            )

        result = await self.provider(handler).create_plan(
            self.request, self.brief, self.architecture
        )
        self.assertEqual(result.plan, self.plan)
        self.assertEqual(result.usage.output_tokens, 23)

    async def test_missing_key_does_not_call_network(self):
        def handler(request):
            self.fail("Missing-key request reached network")

        with self.assertRaises(ProviderError) as caught:
            await self.provider(handler, key="").create_plan(
                self.request, self.brief, self.architecture
            )
        self.assertEqual(caught.exception.code, "provider_not_configured")

    async def test_provider_errors_do_not_expose_body_or_credentials(self):
        for status in [401, 429, 500]:
            with self.subTest(status=status):
                provider = self.provider(
                    lambda request, status=status: httpx.Response(
                        status, text="secret-test-only"
                    )
                )
                with self.assertRaises(ProviderError) as caught:
                    await provider.create_plan(
                        self.request, self.brief, self.architecture
                    )
                self.assertNotIn("secret", str(caught.exception))
                self.assertEqual(caught.exception.retryable, status != 401)

    async def test_invalid_and_truncated_outputs_fail_closed(self):
        for finish, content in [("length", "{}"), ("stop", "not json"), ("stop", "{}")]:
            with self.subTest(finish=finish, content=content):
                provider = self.provider(
                    lambda request, finish=finish, content=content: httpx.Response(
                        200,
                        json={
                            "choices": [
                                {
                                    "finish_reason": finish,
                                    "message": {"content": content},
                                }
                            ],
                            "usage": {"prompt_tokens": 1, "completion_tokens": 2},
                        },
                    )
                )
                with self.assertRaises(ProviderError):
                    await provider.create_plan(
                        self.request, self.brief, self.architecture
                    )

    async def test_timeout_is_classified(self):
        def handler(request):
            raise httpx.ReadTimeout("sensitive URL", request=request)

        with self.assertRaises(ProviderError) as caught:
            await self.provider(handler).create_plan(
                self.request, self.brief, self.architecture
            )
        self.assertEqual(caught.exception.code, "provider_timeout")

    async def test_real_pipeline_with_stubbed_http(self):
        calls = []

        def handler(request):
            data = json.loads(request.content)
            calls.append(data)
            result = (
                self.plan.model_dump_json()
                if len(calls) == 1
                else json.dumps(
                    {
                        "summary": "Built",
                        "files": [
                            {
                                "path": "index.html",
                                "content": "<!doctype html><h1>Task board</h1>",
                            }
                        ],
                    }
                )
            )
            return httpx.Response(
                200,
                json={
                    "choices": [
                        {"finish_reason": "stop", "message": {"content": result}}
                    ],
                    "usage": {"prompt_tokens": 10, "completion_tokens": 100},
                },
            )

        service = OrchestratorService(
            InMemoryRunRepository(), self.provider(handler), StaticChangeVerifier()
        )
        submitted = await service.submit(self.request)
        result = await service.execute(submitted.id)
        self.assertEqual(result.status.value, "completed")
        self.assertEqual(result.model_calls, 2)
        self.assertEqual(result.output_tokens, 200)
        self.assertEqual(result.context_files, self.request.context_files)

    async def test_cancellation_during_provider_call_is_preserved(self):
        entered, release = asyncio.Event(), asyncio.Event()

        class PausingProvider(MockAgentProvider):
            async def create_plan(inner, *args):
                entered.set()
                await release.wait()
                return await super().create_plan(*args)

        service = OrchestratorService(
            InMemoryRunRepository(), PausingProvider(), StaticChangeVerifier()
        )
        run = await service.submit(self.request)
        task = asyncio.create_task(service.execute(run.id))
        await entered.wait()
        await service.request_cancel(run.id)
        release.set()
        result = await task
        self.assertEqual(result.status.value, "cancelled")
        self.assertIsNone(result.changes)

    def test_mode_is_explicit(self):
        with patch.dict(
            os.environ, {"ORCHESTRATOR_PROVIDER": "mock", "GROQ_API_KEY": "unused"}
        ):
            self.assertIsInstance(build_provider(), MockAgentProvider)
