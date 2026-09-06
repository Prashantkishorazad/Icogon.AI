import unittest

from pydantic import ValidationError

from app.agents.context import (
    ChangeScopeError,
    assemble_snapshot,
    content_hash,
    file_manifest,
    implementation_context,
    validate_file_plan,
)
from app.orchestrator.mock import MockAgentProvider, StaticChangeVerifier
from app.orchestrator.models import (
    ChangeSet,
    FileChange,
    FilePlanEntry,
    GenerationPlan,
    PlanTask,
    RunRequest,
)
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.service import OrchestratorService


def plan(*entries: FilePlanEntry) -> GenerationPlan:
    return GenerationPlan(
        summary="Incremental edit",
        tasks=[PlanTask(id="edit", title="Edit", description="Edit one file")],
        file_plan=list(entries),
    )


class IncrementalContextTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.base = [
            FileChange(path="src/App.tsx", content="old app"),
            FileChange(path="src/styles.css", content="stable styles"),
            FileChange(path="src/feature.ts", content="stable feature"),
            FileChange(path="package-lock.json", content="stable lock"),
        ]

    def test_manifest_is_stable_content_addressed_and_marks_lockfiles(self):
        manifest = file_manifest(self.base)
        lock = next(item for item in manifest if item["path"] == "package-lock.json")
        self.assertEqual(lock["sha256"], content_hash("stable lock"))
        self.assertTrue(lock["stable"])

    def test_only_relevant_files_enter_implementation_context(self):
        selected = implementation_context(
            self.base,
            plan(
                FilePlanEntry(
                    path="src/App.tsx", action="modify", reason="Requested change"
                ),
                FilePlanEntry(
                    path="src/feature.ts", action="preserve", reason="Unrelated"
                ),
                FilePlanEntry(
                    path="package-lock.json", action="preserve", reason="Stable"
                ),
            ),
        )
        self.assertEqual(
            {file.path for file in selected}, {"src/App.tsx", "src/styles.css"}
        )

    def test_unchanged_files_are_reused_byte_for_byte(self):
        merged, stats = assemble_snapshot(
            self.base,
            ChangeSet(
                summary="Changed app",
                files=[FileChange(path="src/App.tsx", content="new app")],
            ),
            plan(
                FilePlanEntry(
                    path="src/App.tsx", action="modify", reason="Requested change"
                )
            ),
        )
        snapshot = {file.path: file.content for file in merged.files}
        self.assertEqual(snapshot["src/App.tsx"], "new app")
        self.assertEqual(snapshot["src/feature.ts"], "stable feature")
        self.assertEqual(snapshot["package-lock.json"], "stable lock")
        self.assertEqual(stats["generated"], 1)
        self.assertEqual(stats["reused"], 3)

    def test_out_of_scope_and_lockfile_changes_fail_closed(self):
        scoped = plan(
            FilePlanEntry(
                path="src/App.tsx", action="modify", reason="Requested change"
            )
        )
        for path in ["src/feature.ts", "package-lock.json"]:
            with self.subTest(path=path), self.assertRaises(ChangeScopeError):
                assemble_snapshot(
                    self.base,
                    ChangeSet(
                        summary="Unexpected", files=[FileChange(path=path, content="x")]
                    ),
                    scoped,
                )

    def test_file_plan_rejects_missing_and_lockfile_mutations(self):
        with self.assertRaises(ValueError):
            validate_file_plan(
                [FilePlanEntry(path="missing.ts", action="modify", reason="No file")],
                {file.path for file in self.base},
            )

    def test_file_plan_rejects_workspace_escape(self):
        with self.assertRaises(ValidationError):
            FilePlanEntry(
                path="../../outside.ts", action="create", reason="Invalid path"
            )
        with self.assertRaises(ValueError):
            validate_file_plan(
                [
                    FilePlanEntry(
                        path="package-lock.json",
                        action="modify",
                        reason="Do not allow",
                    )
                ],
                {file.path for file in self.base},
            )

    async def test_agent_handoffs_are_typed_ordered_and_observable(self):
        service = OrchestratorService(
            InMemoryRunRepository(), MockAgentProvider(), StaticChangeVerifier()
        )
        submitted = await service.submit(
            RunRequest(
                user_id="user",
                project_id="project",
                prompt="Create a task board",
                idempotency_key="handoff-test-001",
            )
        )
        result = await service.execute(submitted.id)
        self.assertEqual(result.status.value, "completed")
        self.assertEqual(
            [(item.sender, item.recipient) for item in result.handoffs],
            [
                ("requirements", "architecture"),
                ("architecture", "planner"),
                ("planner", "implementation"),
                ("implementation", "review"),
                ("review", "security"),
                ("security", "verification"),
                ("verification", "orchestrator"),
            ],
        )
        events = await service.list_events(result.id)
        self.assertEqual(
            len([event for event in events if event.event_type == "agent.handoff"]),
            len(result.handoffs),
        )

    async def test_followup_run_preserves_unrelated_files(self):
        service = OrchestratorService(
            InMemoryRunRepository(), MockAgentProvider(), StaticChangeVerifier()
        )
        request = RunRequest(
            user_id="user",
            project_id="project",
            prompt="Update the task board heading",
            idempotency_key="incremental-run-001",
            context_files=self.base,
            base_run_id="previous-run",
        )
        result = await service.execute((await service.submit(request)).id)
        self.assertEqual(result.status.value, "completed")
        snapshot = {file.path: file.content for file in result.changes.files}
        self.assertEqual(snapshot["src/feature.ts"], "stable feature")
        self.assertEqual(snapshot["package-lock.json"], "stable lock")
        implementation = next(
            step for step in result.steps if step.name == "implementation"
        )
        self.assertEqual(implementation.details["generated"], 1)
        self.assertEqual(implementation.details["reused"], 4)
