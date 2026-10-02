from __future__ import annotations

import asyncio

from app.agents.contracts import (
    ArchitectureProposal,
    ProjectBrief,
    Requirement,
)
from app.agents.pipeline import AgentPipeline
from app.orchestrator.models import (
    AgentRun,
    ChangeResponse,
    ChangeSet,
    FileChange,
    ProviderUsage,
    RunBudget,
    RunStatus,
)
from app.orchestrator.service import (
    OrchestratorService,
    validate_implementation_contract,
)
from app.orchestrator.service import OrchestratorService


class FakeRepository:
    def __init__(self, run: AgentRun):
        self.run = run
        self.events = []

    async def get(self, run_id: str):
        return self.run if run_id == self.run.id else None

    async def save(self, run: AgentRun, token=None):
        self.run = run
        return run

    async def append_event(self, event, token=None):
        self.events.append(event)
        return event


class FakeRepairAgent:
    def __init__(self):
        self.calls = 0
        self.received_feedback: list[str] = []
        self.received_snapshot: ChangeSet | None = None

    async def repair(
        self,
        request,
        brief,
        architecture,
        plan,
        current_changes,
        feedback,
    ) -> ChangeResponse:
        self.calls += 1
        self.received_feedback = list(feedback)
        self.received_snapshot = current_changes

        return ChangeResponse(
            changes=ChangeSet(
                summary="Add the missing planned Navbar implementation.",
                files=[
                    FileChange(
                        path="src/components/Navbar.jsx",
                        content=(
                            "export default function Navbar() {"
                            " return <nav>Navbar</nav>;"
                            " }"
                        ),
                        operation="upsert",
                    )
                ],
            ),
            usage=ProviderUsage(
                input_tokens=10,
                output_tokens=20,
                model="fake-repair-model",
                provider="fake",
            ),
        )


class FakeReviewAgent:
    async def review(self, plan, changes):
        from app.agents.contracts import ChangeReview

        return ChangeReview(approved=True, findings=[])


class FakeSecurityAgent:
    async def assess(self, changes):
        from app.agents.contracts import SecurityAssessment

        return SecurityAssessment(approved=True, findings=[])


class FakeVerifier:
    def __init__(self):
        self.calls = 0

    async def verify(self, project_id, changes):
        from app.orchestrator.models import VerificationResult

        self.calls += 1
        return VerificationResult(
            passed=True,
            checks={"fake_build": True},
            feedback=[],
        )


class UnusedAgent:
    pass


async def main() -> None:
    plan = __import__("app.orchestrator.models", fromlist=["GenerationPlan"]).GenerationPlan(
        summary="Test repair-loop plan",
        tasks=[
            __import__("app.orchestrator.models", fromlist=["PlanTask"]).PlanTask(
                id="task-1",
                title="Build page",
                description="Build the application page.",
                target_files=["src/App.jsx"],
            ),
            __import__("app.orchestrator.models", fromlist=["PlanTask"]).PlanTask(
                id="task-2",
                title="Build navbar",
                description="Build the navigation bar.",
                target_files=["src/components/Navbar.jsx"],
            ),
        ],
        file_plan=[
            __import__("app.orchestrator.models", fromlist=["FilePlanEntry"]).FilePlanEntry(
                path="src/App.jsx",
                action="create",
                reason="Main application page",
            ),
            __import__("app.orchestrator.models", fromlist=["FilePlanEntry"]).FilePlanEntry(
                path="src/components/Navbar.jsx",
                action="create",
                reason="Required navigation component",
            ),
        ],
    )

    brief = ProjectBrief(
        summary="Repair loop contract integration test",
        application_type="react",
        requirements=[
            Requirement(
                id="req-1",
                statement="The application must contain a working navigation component.",
            )
        ],
    )

    architecture = ArchitectureProposal(
        style="component-based React",
        modules=[
            {
                "name": "frontend",
                "responsibility": "React application",
                "dependencies": [],
            }
        ],
    )

    bad_changes = ChangeSet(
        summary="Initial implementation is intentionally incomplete.",
        files=[
            FileChange(
                path="src/App.jsx",
                content="export default function App() { return <main>App</main>; }",
                operation="upsert",
            )
        ],
    )

    run = AgentRun(
        user_id="test-user",
        project_id="test-project",
        prompt="Create a React app with a navbar.",
        idempotency_key="repair-loop-test-123",
        status=RunStatus.REVIEWING,
        budget=RunBudget(
            max_model_calls=5,
            max_repair_attempts=2,
            max_output_tokens=5000,
        ),
        brief=brief,
        architecture=architecture,
        plan=plan,
        changes=bad_changes,
    )

    repair_agent = FakeRepairAgent()
    verifier = FakeVerifier()

    pipeline = AgentPipeline(
        requirements=UnusedAgent(),
        architecture=UnusedAgent(),
        planning=UnusedAgent(),
        implementation=repair_agent,
        review=FakeReviewAgent(),
        security=FakeSecurityAgent(),
        verification=verifier,
    )

    repository = FakeRepository(run)
    service = OrchestratorService(
        repository=repository,
        provider=object(),
        verifier=verifier,
        pipeline=pipeline,
    )

    initial_issues = validate_implementation_contract(
        run.plan,
        run.changes,
        context_files=[],
        require_complete=True,
    )
    assert initial_issues, "Initial intentionally incomplete implementation should fail."

    original_snapshot = run.changes.model_copy(deep=True)

    from app.orchestrator.models import RunRequest

    request = RunRequest(
        user_id=run.user_id,
        project_id=run.project_id,
        prompt=run.prompt,
        idempotency_key=run.idempotency_key,
        budget=run.budget,
    )

    await service._verification_loop(run, request)

    assert repair_agent.calls == 1, (
        f"Expected exactly one repair call, got {repair_agent.calls}"
    )

    assert repair_agent.received_snapshot is not None
    assert repair_agent.received_snapshot.model_dump() == original_snapshot.model_dump(), (
        "Repair Agent must receive the current bad snapshot before repair."
    )

    assert repair_agent.received_feedback, "Repair feedback must not be empty."
    assert any(
        "Implementation contract failure:" in item
        for item in repair_agent.received_feedback
    ), "Repair Agent did not receive the exact implementation-contract feedback."

    repaired_paths = {file.path for file in run.changes.files}
    assert "src/App.jsx" in repaired_paths
    assert "src/components/Navbar.jsx" in repaired_paths, (
        "Valid repair must be merged into the implementation snapshot."
    )

    final_issues = validate_implementation_contract(
        run.plan,
        run.changes,
        context_files=[],
        require_complete=True,
    )
    assert not final_issues, f"Final merged snapshot is invalid: {final_issues}"

    assert run.status == RunStatus.COMPLETED, (
        f"Expected completed status, got {run.status.value}"
    )
    assert verifier.calls == 1, f"Expected verifier once, got {verifier.calls}"

    print("=" * 72)
    print("ICOGON ACTUAL REPAIR-LOOP INTEGRATION TEST")
    print("=" * 72)
    print("1. INITIAL IMPLEMENTATION CONTRACT FAIL:              PASS")
    print("2. ACTUAL OrchestratorService._verification_loop():  PASS")
    print("3. REPAIR AGENT CALLED:                              PASS")
    print("4. EXACT CONTRACT FEEDBACK RECEIVED:                 PASS")
    print("5. ORIGINAL SNAPSHOT PRESERVED FOR REPAIR:           PASS")
    print("6. VALID REPAIR DELTA ACCEPTED:                      PASS")
    print("7. REPAIRED SNAPSHOT MERGED:                         PASS")
    print("8. FINAL FULL CONTRACT VALIDATION:                   PASS")
    print("9. VERIFIER PASSED:                                  PASS")
    print("10. RUN COMPLETED:                                   PASS")
    print()
    print("=" * 72)
    print("REPAIR LOOP INTEGRATION TEST: PASS")
    print("=" * 72)
    print("Initial bad output -> service verification loop -> repair ->")
    print("repair validation -> snapshot merge -> review/security -> verifier -> completed")


if __name__ == "__main__":
    asyncio.run(main())
