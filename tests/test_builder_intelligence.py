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
                self.repairs = 0
                self.feedback = []
                self.snapshots = []

            async def create_plan(
                    self,
                    request,
                    brief,
                    architecture,
            ):
                response = await super().create_plan(
                    request,
                    brief,
                    architecture,
                )

                response.plan.tasks[0].target_files = [
                    "src/App.jsx"
                ]

                response.plan.file_plan = [
                    FilePlanEntry(
                        path="src/App.jsx",
                        action="create",
                        reason=(
                            "Required for the working submit-button "
                            "interaction test."
                        ),
                    )
                ]

                return response

            async def generate_changes(
                    self,
                    request,
                    brief,
                    architecture,
                    plan,
            ):
                return ChangeResponse(
                    changes=ChangeSet(
                        summary=(
                            "Initial implementation with an incomplete "
                            "submit action."
                        ),
                        files=[
                            FileChange(
                                path="src/App.jsx",
                                content="""
    export default function App() {
        return (
            <main>
                <button type="button">
                    Submit
                </button>
            </main>
        );
    }
    """.strip(),
                                operation="upsert",
                            )
                        ],
                    ),
                    usage=ProviderUsage(output_tokens=10),
                )

            async def review_changes(
                    self,
                    request,
                    plan,
                    changes,
            ):
                self.reviews += 1

                # Store the exact snapshot received by the quality reviewer.
                self.snapshots.append(
                    changes.model_copy(deep=True)
                )

                # First quality review intentionally rejects the implementation.
                if self.reviews == 1:
                    return ReviewResponse(
                        review=ChangeReview(
                            approved=False,
                            findings=[
                                ReviewFinding(
                                    code="missing_interaction",
                                    message=(
                                        "The primary action has no handler"
                                    ),
                                    severity=ReviewSeverity.BLOCKING,
                                    path="src/App.jsx",
                                )
                            ],
                        ),
                        usage=ProviderUsage(output_tokens=10),
                    )

                # Second quality review verifies that the repair actually
                # implemented the missing interaction.
                app_file = next(
                    (
                        file
                        for file in changes.files
                        if file.path == "src/App.jsx"
                    ),
                    None,
                )

                assert app_file is not None
                assert "onClick" in app_file.content
                assert "handleSubmit" in app_file.content

                return ReviewResponse(
                    review=ChangeReview(
                        approved=True,
                        findings=[],
                    ),
                    usage=ProviderUsage(output_tokens=10),
                )

            async def repair_changes(
                    self,
                    request,
                    brief,
                    architecture,
                    plan,
                    changes,
                    feedback,
            ):
                self.repairs += 1
                self.feedback = list(feedback)

                # The exact blocking quality-review feedback must reach
                # the repair agent.
                assert any(
                    "The primary action has no handler" in item
                    for item in feedback
                )

                # Repair must receive the current authoritative snapshot.
                current_app = next(
                    (
                        file
                        for file in changes.files
                        if file.path == "src/App.jsx"
                    ),
                    None,
                )

                assert current_app is not None

                repaired_content = """
    export default function App() {
        const handleSubmit = () => {
            console.log("submitted");
        };

        return (
            <main>
                <button type="button" onClick={handleSubmit}>
                    Submit
                </button>
            </main>
        );
    }
    """.strip()

                # Preserve the complete current snapshot and replace ONLY
                # the file that needs repair.
                repaired_files = []

                for file in changes.files:
                    if file.path == "src/App.jsx":
                        repaired_files.append(
                            FileChange(
                                path="src/App.jsx",
                                content=repaired_content,
                                operation="upsert",
                            )
                        )
                    else:
                        repaired_files.append(
                            file.model_copy(deep=True)
                        )

                return ChangeResponse(
                    changes=ChangeSet(
                        summary=(
                            "Repair the missing primary action handler."
                        ),
                        files=repaired_files,
                    ),
                    usage=ProviderUsage(output_tokens=10),
                )

        provider = ReviewingProvider()

        service = OrchestratorService(
            InMemoryRunRepository(),
            provider,
            StaticChangeVerifier(),
        )

        request = RunRequest(
            user_id="u",
            project_id="p",
            prompt="Create a website with a working submit button",
            idempotency_key="polished-quality-repair",
            quality="polished",
        )

        run = await service.submit(request)
        result = await service.execute(run.id)

        print("\nDEBUG STATUS:", result.status)
        print(
            "DEBUG FAILURE:",
            result.failure.model_dump() if result.failure else None,
        )
        print(
            "DEBUG REPAIR ATTEMPTS:",
            result.repair_attempts,
        )
        print(
            "DEBUG MODEL CALLS:",
            result.model_calls,
        )

        # ---------------------------------------------------------
        # FINAL PIPELINE RESULT
        # ---------------------------------------------------------

        self.assertEqual(
            result.status.value,
            "completed",
        )

        # ---------------------------------------------------------
        # QUALITY REVIEW CALLS
        # ---------------------------------------------------------

        # Review #1 -> rejected
        # Repair -> executed
        # Review #2 -> approved
        self.assertEqual(
            provider.reviews,
            2,
        )

        # Exactly one quality-review repair.
        self.assertEqual(
            provider.repairs,
            1,
        )

        # ---------------------------------------------------------
        # QUALITY REVIEW FEEDBACK
        # ---------------------------------------------------------

        self.assertIn(
            "The primary action has no handler",
            provider.feedback,
        )

        # ---------------------------------------------------------
        # QUALITY REVIEW SNAPSHOTS
        # ---------------------------------------------------------

        self.assertEqual(
            len(provider.snapshots),
            2,
        )

        first_app = next(
            file
            for file in provider.snapshots[0].files
            if file.path == "src/App.jsx"
        )

        second_app = next(
            file
            for file in provider.snapshots[1].files
            if file.path == "src/App.jsx"
        )

        # First review saw the intentionally incomplete implementation.
        self.assertNotIn(
            "handleSubmit",
            first_app.content,
        )

        self.assertNotIn(
            "onClick",
            first_app.content,
        )

        # Second review must see the repaired implementation.
        self.assertIn(
            "handleSubmit",
            second_app.content,
        )

        self.assertIn(
            "onClick",
            second_app.content,
        )

        # ---------------------------------------------------------
        # REPAIR BUDGET
        # ---------------------------------------------------------

        # Exactly one repair attempt was consumed.
        self.assertEqual(
            result.repair_attempts,
            1,
        )


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