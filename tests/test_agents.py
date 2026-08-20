import unittest

from app.agents.defaults import ChangeReviewer, RequirementsAnalyst, SolutionArchitect
from app.orchestrator.models import (
    ChangeSet,
    FileChange,
    GenerationPlan,
    PlanTask,
    RunRequest,
)


def run_request() -> RunRequest:
    return RunRequest(
        user_id="user-1",
        project_id="project-1",
        prompt="Create a team task board with due dates",
        idempotency_key="agent-contract-0001",
    )


class AgentContractTests(unittest.IsolatedAsyncioTestCase):
    async def test_requirements_agent_returns_traceable_requirement(self):
        brief = await RequirementsAnalyst().analyze(run_request())

        self.assertEqual(brief.requirements[0].id, "REQ-001")
        self.assertEqual(brief.requirements[0].statement, run_request().prompt)
        self.assertGreaterEqual(len(brief.acceptance_criteria), 2)

    async def test_architecture_agent_defines_module_dependencies(self):
        request = run_request()
        brief = await RequirementsAnalyst().analyze(request)
        architecture = await SolutionArchitect().design(request, brief)

        modules = {module.name: module for module in architecture.modules}
        self.assertIn("application", modules)
        self.assertIn("domain", modules["application"].dependencies)
        self.assertIn("build", architecture.required_checks)

    async def test_review_agent_blocks_duplicate_file_changes(self):
        plan = GenerationPlan(
            summary="Create the requested feature",
            tasks=[
                PlanTask(
                    id="task-1",
                    title="Create task board",
                    description="Implement the task board",
                    target_files=["src/task-board.tsx"],
                )
            ],
        )
        changes = ChangeSet(
            summary="Task board implementation",
            files=[
                FileChange(path="src/task-board.tsx", content="first"),
                FileChange(path="src/task-board.tsx", content="second"),
            ],
        )

        review = await ChangeReviewer().review(plan, changes)

        self.assertFalse(review.approved)
        self.assertEqual(review.findings[0].code, "duplicate_path")

    async def test_review_agent_enforces_change_size_limit(self):
        plan = GenerationPlan(
            summary="Create the requested feature",
            tasks=[
                PlanTask(
                    id="task-1",
                    title="Create task board",
                    description="Implement the task board",
                )
            ],
        )
        changes = ChangeSet(
            summary="Oversized change",
            files=[
                FileChange(path=f"src/file-{index}.ts", content="content")
                for index in range(3)
            ],
        )

        review = await ChangeReviewer(max_files_per_change=2).review(plan, changes)

        self.assertFalse(review.approved)
        self.assertEqual(review.findings[0].code, "change_set_too_large")
