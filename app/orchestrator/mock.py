from __future__ import annotations

from pathlib import PurePosixPath

from app.agents.contracts import ArchitectureProposal, ProjectBrief
from app.orchestrator.models import (
    ChangeResponse,
    ChangeSet,
    FileChange,
    GenerationPlan,
    PlanResponse,
    PlanTask,
    ProviderUsage,
    RunRequest,
    VerificationResult,
)


class MockAgentProvider:
    async def create_plan(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
    ) -> PlanResponse:
        plan = GenerationPlan(
            summary=f"Create a minimal implementation for: {request.prompt}",
            assumptions=[
                "The project uses the existing repository conventions.",
                "Generated code must be verified before it is published.",
            ],
            tasks=[
                PlanTask(
                    id="task-1",
                    title="Generate project change",
                    description=request.prompt,
                    target_files=["src/generated/README.md"],
                )
            ],
        )
        return PlanResponse(
            plan=plan,
            usage=ProviderUsage(input_tokens=30, output_tokens=80),
        )

    async def generate_changes(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
    ) -> ChangeResponse:
        content = (
            f"# Project change\n\n{plan.summary}\n\nStatus: ready for implementation.\n"
        )
        return ChangeResponse(
            changes=ChangeSet(
                summary="Prepare the requested project changes",
                files=[FileChange(path="src/generated/README.md", content=content)],
            ),
            usage=ProviderUsage(input_tokens=90, output_tokens=120),
        )

    async def repair_changes(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
        changes: ChangeSet,
        feedback: list[str],
    ) -> ChangeResponse:
        repaired = changes.model_copy(deep=True)
        repaired.summary = "Repair generated output after verification feedback"
        if repaired.files:
            repaired.files[0].content += "\nVerification feedback addressed.\n"
        return ChangeResponse(
            changes=repaired,
            usage=ProviderUsage(input_tokens=100, output_tokens=60),
        )


class StaticChangeVerifier:
    async def verify(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> VerificationResult:
        has_files = bool(changes.files)
        paths_are_relative = all(
            self._is_safe_project_path(change.path) for change in changes.files
        )
        passed = has_files and paths_are_relative
        feedback: list[str] = []
        if not has_files:
            feedback.append("The change set must contain at least one file.")
        if not paths_are_relative:
            feedback.append(
                "All generated paths must stay inside the project workspace."
            )
        return VerificationResult(
            passed=passed,
            checks={"has_files": has_files, "safe_relative_paths": paths_are_relative},
            feedback=feedback,
        )

    @staticmethod
    def _is_safe_project_path(path: str) -> bool:
        if not path or "\\" in path or "\x00" in path:
            return False
        candidate = PurePosixPath(path)
        return (
            not candidate.is_absolute()
            and candidate.parts not in {(), (".",)}
            and ".." not in candidate.parts
            and ":" not in candidate.parts[0]
        )
