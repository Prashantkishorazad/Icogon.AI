import json
from pathlib import PurePosixPath

from app.agents.contracts import (
    ArchitectureDecision,
    ArchitectureModule,
    ArchitectureProposal,
    ChangeReview,
    ProjectBrief,
    Requirement,
    ReviewFinding,
    ReviewSeverity,
)
from app.agents.design import design_context
from app.agents.roles import ImplementationAgent, PlanningAgent
from app.orchestrator.models import (
    ChangeResponse,
    ChangeSet,
    GenerationPlan,
    PlanResponse,
    RunRequest,
)
from app.orchestrator.ports import AgentProvider


class RequirementsAnalyst:
    async def analyze(self, request: RunRequest) -> ProjectBrief:
        return ProjectBrief(
            summary=request.prompt.strip(),
            application_type=design_context(request.prompt, request.context_files)[
                "project_signals"
            ][0],
            target_users=["authenticated_user"],
            requirements=[
                Requirement(id="REQ-001", statement=request.prompt.strip()),
            ],
            quality_attributes=[
                "responsive user experience",
                "recoverable generation workflow",
                "server-side authorization",
            ],
            constraints=[
                "Preserve the existing project conventions",
                "Do not publish changes before verification passes",
            ],
            acceptance_criteria=[
                "The generated project builds successfully",
                "The requested user flow is represented in the implementation plan",
            ],
        )


class SolutionArchitect:
    async def design(
        self,
        request: RunRequest,
        brief: ProjectBrief,
    ) -> ArchitectureProposal:
        return ArchitectureProposal(
            style="modular_web_application",
            modules=[
                ArchitectureModule(
                    name="presentation",
                    responsibility="Render user-facing flows and application state",
                ),
                ArchitectureModule(
                    name="application",
                    responsibility="Coordinate use cases and enforce workflow rules",
                    dependencies=["domain"],
                ),
                ArchitectureModule(
                    name="domain",
                    responsibility="Define project data and business invariants",
                ),
            ],
            decisions=[
                ArchitectureDecision(
                    id="ADR-001",
                    decision="Keep generated features behind explicit module boundaries",
                    rationale="Incremental edits remain reviewable and easier to repair",
                )
            ],
            risks=[
                "Generated dependencies may not be compatible with the base template"
            ],
            required_checks=["path_policy", "build", "typecheck"],
        )


class ProviderPlanningAgent(PlanningAgent):
    def __init__(self, provider: AgentProvider) -> None:
        self._provider = provider

    async def plan(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
    ) -> PlanResponse:
        return await self._provider.create_plan(request, brief, architecture)


class ProviderImplementationAgent(ImplementationAgent):
    def __init__(self, provider: AgentProvider) -> None:
        self._provider = provider

    async def implement(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
    ) -> ChangeResponse:
        return await self._provider.generate_changes(
            request,
            brief,
            architecture,
            plan,
        )

    async def repair(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
        changes: ChangeSet,
        feedback: list[str],
    ) -> ChangeResponse:
        return await self._provider.repair_changes(
            request,
            brief,
            architecture,
            plan,
            changes,
            feedback,
        )


class ChangeReviewer:
    def __init__(self, max_files_per_change: int = 100) -> None:
        self._max_files_per_change = max_files_per_change

    async def review(
        self,
        plan: GenerationPlan,
        changes: ChangeSet,
    ) -> ChangeReview:
        findings: list[ReviewFinding] = []
        if not changes.files:
            findings.append(
                ReviewFinding(
                    code="empty_change_set",
                    message="The implementation did not produce any file changes",
                    severity=ReviewSeverity.BLOCKING,
                )
            )
        if len(changes.files) > self._max_files_per_change:
            findings.append(
                ReviewFinding(
                    code="change_set_too_large",
                    message="The change exceeds the per-run file limit",
                    severity=ReviewSeverity.BLOCKING,
                )
            )

        seen_paths: set[str] = set()
        for change in changes.files:
            normalized = str(PurePosixPath(change.path))
            if normalized in seen_paths:
                findings.append(
                    ReviewFinding(
                        code="duplicate_path",
                        message="The change set contains the same path more than once",
                        severity=ReviewSeverity.BLOCKING,
                        path=change.path,
                    )
                )
            seen_paths.add(normalized)

        required_checks = ["path_policy", "build", "typecheck"]
        if plan.blueprint:
            snapshot = {
                f.path: f.content for f in changes.files if f.operation == "upsert"
            }
            required = (
                ["index.html"]
                if plan.blueprint.template == "html"
                else ["src/main.tsx", "src/App.tsx", "src/styles.css", "package.json"]
            )
            for missing in set(required) - snapshot.keys():
                findings.append(
                    ReviewFinding(
                        code="missing_entry_file",
                        message=f"The {plan.blueprint.template} blueprint requires {missing}.",
                        severity=ReviewSeverity.BLOCKING,
                        path=missing,
                    )
                )
            if "package.json" in snapshot:
                try:
                    package = json.loads(snapshot["package.json"])
                    scripts = package.get("scripts", {})
                    if not isinstance(scripts, dict) or any(
                        name in scripts
                        for name in ("preinstall", "install", "postinstall", "prepare")
                    ):
                        raise ValueError("Installation hooks are not allowed")
                except (ValueError, AttributeError):
                    findings.append(
                        ReviewFinding(
                            code="invalid_package_manifest",
                            message="Provide a valid package.json without installation lifecycle hooks.",
                            severity=ReviewSeverity.BLOCKING,
                            path="package.json",
                        )
                    )
            if plan.blueprint.template == "react-three" and not any(
                "three" in source
                for path, source in snapshot.items()
                if path.endswith((".tsx", ".ts", ".jsx", ".js"))
            ):
                findings.append(
                    ReviewFinding(
                        code="missing_three_scene",
                        message="The 3D blueprint requires an actual Three.js implementation.",
                        severity=ReviewSeverity.BLOCKING,
                    )
                )
        return ChangeReview(
            approved=not any(
                finding.severity == ReviewSeverity.BLOCKING for finding in findings
            ),
            findings=findings,
            required_checks=required_checks,
        )
