import unittest
from pathlib import Path

from pydantic import ValidationError

from app.agents.contracts import ChangeReview, ReviewFinding, ReviewSeverity
from app.agents.defaults import ChangeReviewer
from app.agents.design import design_context
from app.agents.templates import scene_blueprint, scene_snapshot
from app.orchestrator.mock import MockAgentProvider, StaticChangeVerifier
from app.orchestrator.models import (
    ChangeResponse,
    ChangeSet,
    FileChange,
    FilePlanEntry,
    GenerationPlan,
    IntelligentPlan,
    PlanTask,
    ProviderUsage,
    ReviewResponse,
    RunRequest,
)
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.service import OrchestratorService
from app.sandbox.preview import PreviewBuildVerifier, PreviewError, compile_preview


class IntelligenceTests(unittest.IsolatedAsyncioTestCase):
    def test_combined_project_hints_preserve_3d_and_commerce(self):
        context = design_context(
            "Build a 3D ecommerce shop with a product configurator"
        )
        self.assertEqual(context["suggested_template"], "react-three")
        self.assertIn("commerce", context["project_signals"])

    def test_invalid_task_graphs_rejected(self):
        for dependencies in [["missing"], ["one"]]:
            with (
                self.subTest(dependencies=dependencies),
                self.assertRaises(ValidationError),
            ):
                IntelligentPlan(
                    summary="Plan",
                    blueprint=scene_blueprint(),
                    file_plan=[
                        FilePlanEntry(
                            path="src/App.tsx",
                            action="create",
                            reason="Create the application",
                        )
                    ],
                    tasks=[
                        PlanTask(
                            id="one",
                            title="Scene",
                            description="Create scene",
                            depends_on=dependencies,
                        )
                    ],
                )

    async def test_incomplete_react_snapshot_blocked(self):
        plan = GenerationPlan(
            summary="3D",
            blueprint=scene_blueprint(),
            tasks=[PlanTask(id="one", title="Scene", description="Create scene")],
        )
        review = await ChangeReviewer().review(
            plan,
            ChangeSet(
                summary="Empty shell",
                files=[FileChange(path="index.html", content="<h1>Scene</h1>")],
            ),
        )
        self.assertFalse(review.approved)
        self.assertIn(
            "missing_entry_file", [finding.code for finding in review.findings]
        )

    async def test_polished_review_feeds_repair_and_counts_calls(self):
        class ReviewingProvider(MockAgentProvider):
            def __init__(self):
                self.reviews = 0
                self.feedback = []

            async def review_changes(inner, request, plan, changes):
                inner.reviews += 1
                approved = inner.reviews > 1
                return ReviewResponse(
                    review=ChangeReview(
                        approved=approved,
                        findings=[]
                        if approved
                        else [
                            ReviewFinding(
                                code="missing_interaction",
                                message="The primary action has no handler",
                                severity=ReviewSeverity.BLOCKING,
                            )
                        ],
                    ),
                    usage=ProviderUsage(output_tokens=10),
                )

            async def repair_changes(
                inner, request, brief, architecture, plan, changes, feedback
            ):
                inner.feedback = feedback
                return ChangeResponse(
                    changes=changes, usage=ProviderUsage(output_tokens=10)
                )

        provider = ReviewingProvider()
        service = OrchestratorService(
            InMemoryRunRepository(), provider, StaticChangeVerifier()
        )
        request = RunRequest(
            user_id="u",
            project_id="p",
            prompt="Create a website",
            idempotency_key="polished-request",
            quality="polished",
        )
        run = await service.submit(request)
        result = await service.execute(run.id)
        self.assertEqual(result.status.value, "completed")
        self.assertEqual(result.model_calls, 5)
        self.assertEqual(result.repair_attempts, 1)
        self.assertIn("The primary action has no handler", provider.feedback)


@unittest.skipUnless(
    Path("icogon-frontend/node_modules/esbuild").exists(),
    "Install frontend dependencies to run real compiler tests",
)
class PreviewCompilerTests(unittest.IsolatedAsyncioTestCase):
    async def test_real_three_scene_compiles_and_cache_is_stable(self):
        snapshot = scene_snapshot()
        result = await compile_preview(snapshot)
        self.assertEqual(result["compiler"], "esbuild")
        self.assertIn('<div id="root"></div>', result["html"])
        self.assertIn("Pause rotation", result["html"])
        self.assertEqual((await compile_preview(snapshot))["html"], result["html"])

    async def test_unsafe_imports_fail_without_reading_host_files(self):
        for specifier in [
            "node:fs",
            "../../.env",
            "https://example.com/a.js",
            "react/../../.env",
            "lodash",
        ]:
            with self.subTest(specifier=specifier), self.assertRaises(PreviewError):
                await compile_preview(
                    ChangeSet(
                        summary="Untrusted import",
                        files=[
                            FileChange(
                                path="src/main.tsx",
                                content=f"import value from '{specifier}'; console.log(value)",
                            )
                        ],
                    )
                )

    async def test_missing_relative_module_becomes_repair_feedback(self):
        result = await PreviewBuildVerifier(StaticChangeVerifier()).verify(
            "p",
            ChangeSet(
                summary="Broken import",
                files=[
                    FileChange(
                        path="src/main.tsx",
                        content="import App from './Missing'; console.log(App)",
                    )
                ],
            ),
        )
        self.assertFalse(result.passed)
        self.assertFalse(result.checks["preview_bundle"])
        self.assertIn("Missing", result.feedback[0])

    async def test_syntax_error_rejected(self):
        with self.assertRaises(PreviewError):
            await compile_preview(
                ChangeSet(
                    summary="Invalid code",
                    files=[
                        FileChange(
                            path="src/main.tsx",
                            content="export default function () { <div>",
                        )
                    ],
                )
            )

    async def test_package_scripts_and_config_are_never_executed(self):
        result = await compile_preview(
            ChangeSet(
                summary="Untrusted configuration",
                files=[
                    FileChange(
                        path="src/main.tsx",
                        content="document.getElementById('root').textContent='Hello';",
                    ),
                    FileChange(
                        path="vite.config.js",
                        content="throw new Error('MUST NEVER EXECUTE');",
                    ),
                    FileChange(
                        path="package.json",
                        content='{"scripts":{"postinstall":"MUST NEVER EXECUTE"}}',
                    ),
                ],
            )
        )
        self.assertEqual(result["compiler"], "esbuild")
