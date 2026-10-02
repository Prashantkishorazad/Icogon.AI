from __future__ import annotations

import json
import re
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


# ============================================================================
# REQUIREMENTS AGENT
# ============================================================================


class RequirementsAnalyst:
    """Turn the raw user prompt into a useful product brief.

    This layer intentionally does not generate implementation code. Its job is
    to give the planner explicit product signals so the model does not default
    to a generic landing page.
    """

    _TYPE_RULES = (
        ("ecommerce", ("ecommerce", "e-commerce", "shop", "store", "online store", "shopping")),
        ("education", ("school", "college", "university", "academy", "education", "student", "course", "learning")),
        ("fitness", ("gym", "fitness", "workout", "trainer", "training", "yoga")),
        ("restaurant", ("restaurant", "cafe", "café", "food", "menu", "dining", "bakery")),
        ("healthcare", ("hospital", "clinic", "doctor", "medical", "healthcare", "health")),
        ("real_estate", ("real estate", "property", "properties", "realtor", "house", "apartment")),
        ("portfolio", ("portfolio", "personal website", "developer portfolio", "designer portfolio", "resume")),
        ("saas", ("saas", "dashboard", "software platform", "web app", "admin panel", "management system")),
        ("community", ("community", "forum", "social network", "members")),
        ("service_business", ("agency", "service business", "company website", "business website")),
    )

    _FEATURE_SIGNALS = (
        ("authentication", ("login", "sign in", "signup", "register", "authentication", "auth")),
        ("payments", ("payment", "checkout", "subscription", "billing", "stripe")),
        ("booking", ("booking", "book", "appointment", "reservation", "schedule")),
        ("search", ("search", "filter", "find")),
        ("gallery", ("gallery", "photos", "images", "portfolio")),
        ("forms", ("contact form", "contact", "enquiry", "inquiry", "form")),
        ("cart", ("cart", "shopping cart", "add to cart")),
        ("reviews", ("reviews", "testimonials", "ratings")),
        ("maps", ("map", "location", "directions")),
        ("analytics", ("analytics", "reports", "statistics", "metrics")),
    )

    @staticmethod
    def _text(request: RunRequest) -> str:
        return " ".join(
            part for part in [
                request.prompt,
                *(file.path for file in request.context_files),
            ] if part
        ).strip()

    def _infer_type(self, text: str, fallback: str) -> str:
        lowered = text.lower()
        for application_type, keywords in self._TYPE_RULES:
            if any(keyword in lowered for keyword in keywords):
                return application_type
        return fallback or "web_application"

    def _infer_features(self, text: str) -> list[str]:
        lowered = text.lower()
        return [
            name for name, keywords in self._FEATURE_SIGNALS
            if any(keyword in lowered for keyword in keywords)
        ]

    def _target_users(self, application_type: str) -> list[str]:
        mapping = {
            "education": ["students", "parents", "teachers"],
            "fitness": ["members", "trainers", "gym owners"],
            "restaurant": ["customers", "restaurant staff", "owners"],
            "ecommerce": ["customers", "store administrators"],
            "healthcare": ["patients", "healthcare staff"],
            "real_estate": ["buyers", "renters", "property agents"],
            "portfolio": ["prospective clients", "recruiters", "visitors"],
            "saas": ["end users", "administrators"],
            "community": ["members", "moderators"],
            "service_business": ["prospective customers", "business staff"],
        }
        return mapping.get(application_type, ["website visitors", "end users"])

    async def analyze(
        self,
        request: RunRequest,
    ) -> ProjectBrief:
        context = design_context(
            request.prompt,
            request.context_files,
        )

        project_signals = context.get("project_signals", [])
        fallback_type = project_signals[0] if project_signals else "web_application"
        text = self._text(request)
        application_type = self._infer_type(text, fallback_type)
        features = self._infer_features(text)

        requirements = [
            Requirement(
                id="REQ-001",
                statement=request.prompt.strip(),
            ),
            Requirement(
                id="REQ-002",
                statement="Represent the product's actual information architecture, content and primary user flows rather than a generic template.",
            ),
            Requirement(
                id="REQ-003",
                statement="Generate a maintainable responsive implementation with reusable components and clear feature boundaries.",
            ),
        ]

        if features:
            requirements.append(
                Requirement(
                    id="REQ-004",
                    statement=(
                        "Where requested by the prompt, implement these feature areas: "
                        + ", ".join(features)
                        + "."
                    ),
                )
            )

        quality_attributes = [
            "responsive desktop, tablet and mobile experience",
            "accessible semantic UI and keyboard interaction",
            "maintainable component boundaries",
            "recoverable generation workflow",
            "server-side authorization for protected backend operations",
        ]

        constraints = [
            "Preserve the existing project conventions when editing an existing project",
            "Do not publish changes before verification passes",
            "Do not invent external integrations that are not available in project context",
            "Do not replace product-specific requirements with generic SaaS sections",
        ]

        acceptance = [
            "The generated information architecture represents the user's requested product.",
            "Every actionable planned file is implemented and internally connected.",
            "The generated application builds successfully after implementation and repair.",
            "The primary requested user flows are represented by concrete UI and interactions.",
        ]

        if features:
            acceptance.append(
                "Requested feature areas are represented in the implementation plan and generated UI."
            )

        return ProjectBrief(
            summary=request.prompt.strip(),
            application_type=application_type,
            target_users=self._target_users(application_type),
            requirements=requirements,
            quality_attributes=quality_attributes,
            constraints=constraints,
            acceptance_criteria=acceptance,
        )


# ============================================================================
# ARCHITECTURE AGENT
# ============================================================================


class SolutionArchitect:
    """Create a product-aware architecture context for the planner."""

    def _modules(
        self,
        application_type: str,
        prompt: str,
    ) -> list[ArchitectureModule]:
        modules = [
            ArchitectureModule(
                name="presentation",
                responsibility="Render product-specific pages, views, responsive layout and interaction states.",
            ),
            ArchitectureModule(
                name="application",
                responsibility="Coordinate user flows, navigation, local state and feature-level behavior.",
                dependencies=["presentation", "domain"],
            ),
            ArchitectureModule(
                name="domain",
                responsibility="Represent product concepts, content structures and business invariants.",
            ),
        ]

        type_modules = {
            "ecommerce": [
                ("catalog", "Represent products, categories, product detail and discovery."),
                ("commerce", "Represent cart, checkout and purchase-related UI flows."),
            ],
            "education": [
                ("learning", "Represent programs, courses, learning content and student-facing flows."),
                ("admissions", "Represent admissions, enquiry and enrollment information."),
            ],
            "fitness": [
                ("membership", "Represent memberships, plans, classes and member actions."),
                ("schedule", "Represent classes, trainers and schedule-related interactions."),
            ],
            "restaurant": [
                ("menu", "Represent menu categories, items and restaurant information."),
                ("reservation", "Represent reservation or enquiry flows when requested."),
            ],
            "healthcare": [
                ("services", "Represent healthcare services, departments and practitioner information."),
                ("appointments", "Represent appointment and enquiry flows when requested."),
            ],
            "real_estate": [
                ("listings", "Represent property discovery, listing details and filters."),
                ("enquiries", "Represent property enquiry and contact flows."),
            ],
            "portfolio": [
                ("showcase", "Represent projects, work samples, capabilities and case studies."),
                ("contact", "Represent contact and conversion flows."),
            ],
            "saas": [
                ("workspace", "Represent dashboard, workspace and authenticated product views."),
                ("settings", "Represent configuration and account-management views when requested."),
            ],
        }

        for name, responsibility in type_modules.get(application_type, []):
            modules.append(
                ArchitectureModule(
                    name=name,
                    responsibility=responsibility,
                    dependencies=["presentation", "application"],
                )
            )

        return modules

    async def design(
        self,
        request: RunRequest,
        brief: ProjectBrief,
    ) -> ArchitectureProposal:
        prompt = request.prompt.strip()
        application_type = brief.application_type
        feature_text = " ".join(
            requirement.statement for requirement in brief.requirements
        ).lower()

        modules = self._modules(application_type, feature_text)

        checks = [
            "path_policy",
            "build",
            "typecheck",
            "planned_files_implemented",
            "product_flow_coverage",
        ]

        decisions = [
            ArchitectureDecision(
                id="ADR-001",
                decision="Use a product-specific multi-file architecture instead of a single monolithic page.",
                rationale=(
                    "The generated project must remain editable, testable and repairable as features grow."
                ),
            ),
            ArchitectureDecision(
                id="ADR-002",
                decision="Keep reusable UI primitives separate from product-specific feature modules.",
                rationale=(
                    "This reduces duplication and allows later prompts to modify individual features without rewriting the whole application."
                ),
            ),
            ArchitectureDecision(
                id="ADR-003",
                decision="Represent unavailable external integrations explicitly rather than pretending they are connected.",
                rationale=(
                    "Generated code must remain truthful and buildable in the available project environment."
                ),
            ),
        ]

        risks = [
            "Generated dependencies may not be compatible with the base template.",
            "A large product may exceed one model response and require implementation batching.",
            "External services such as payments, databases or authentication require explicit project integrations before they can be claimed as connected.",
        ]

        return ArchitectureProposal(
            style=f"product_specific_{application_type}",
            modules=modules,
            decisions=decisions,
            risks=risks,
            required_checks=checks,
        )


# ============================================================================
# PROVIDER PLANNING AGENT
# ============================================================================


class ProviderPlanningAgent(PlanningAgent):
    def __init__(
        self,
        provider: AgentProvider,
    ) -> None:
        self._provider = provider

    async def plan(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
    ) -> PlanResponse:
        response = await self._provider.create_plan(
            request,
            brief,
            architecture,
        )

        if response is None:
            raise RuntimeError(
                "Planning provider returned None instead of PlanResponse."
            )

        if not isinstance(response, PlanResponse):
            raise RuntimeError(
                "Planning provider returned an invalid response type: "
                f"{type(response).__name__}. "
                "Expected PlanResponse."
            )

        if response.plan is None:
            raise RuntimeError(
                "Planning provider returned PlanResponse with plan=None."
            )

        if response.usage is None:
            raise RuntimeError(
                "Planning provider returned PlanResponse with usage=None."
            )

        return response


# ============================================================================
# PROVIDER IMPLEMENTATION AGENT
# ============================================================================


class ProviderImplementationAgent(ImplementationAgent):
    def __init__(
        self,
        provider: AgentProvider,
    ) -> None:
        self._provider = provider

    async def implement(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
    ) -> ChangeResponse:

        response = await self._provider.generate_changes(
            request,
            brief,
            architecture,
            plan,
        )

        # --------------------------------------------------------------------
        # IMPORTANT:
        #
        # The orchestrator later accesses:
        #
        #     response.usage
        #
        # Therefore returning None from the provider must never silently
        # propagate into the orchestrator.
        # --------------------------------------------------------------------

        if response is None:
            raise RuntimeError(
                "Implementation provider returned None instead of ChangeResponse. "
                "Check ModelProvider.generate_changes()."
            )

        if not isinstance(response, ChangeResponse):
            raise RuntimeError(
                "Implementation provider returned an invalid response type: "
                f"{type(response).__name__}. "
                "Expected ChangeResponse."
            )

        if response.changes is None:
            raise RuntimeError(
                "Implementation provider returned ChangeResponse with changes=None."
            )

        if response.usage is None:
            raise RuntimeError(
                "Implementation provider returned ChangeResponse with usage=None."
            )

        return response

    async def repair(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
        changes: ChangeSet,
        feedback: list[str],
    ) -> ChangeResponse:

        response = await self._provider.repair_changes(
            request,
            brief,
            architecture,
            plan,
            changes,
            feedback,
        )

        if response is None:
            raise RuntimeError(
                "Repair provider returned None instead of ChangeResponse. "
                "Check ModelProvider.repair_changes()."
            )

        if not isinstance(response, ChangeResponse):
            raise RuntimeError(
                "Repair provider returned an invalid response type: "
                f"{type(response).__name__}. "
                "Expected ChangeResponse."
            )

        if response.changes is None:
            raise RuntimeError(
                "Repair provider returned ChangeResponse with changes=None."
            )

        if response.usage is None:
            raise RuntimeError(
                "Repair provider returned ChangeResponse with usage=None."
            )

        return response


# ============================================================================
# CHANGE REVIEWER
# ============================================================================


class ChangeReviewer:
    def __init__(
        self,
        max_files_per_change: int = 100,
    ) -> None:
        self._max_files_per_change = max_files_per_change

    async def review(
        self,
        plan: GenerationPlan,
        changes: ChangeSet,
    ) -> ChangeReview:

        findings: list[ReviewFinding] = []

        # ====================================================================
        # BASIC INPUT VALIDATION
        # ====================================================================

        if changes is None:
            findings.append(
                ReviewFinding(
                    code="missing_change_set",
                    message="The implementation did not return a change set.",
                    severity=ReviewSeverity.BLOCKING,
                )
            )

            return ChangeReview(
                approved=False,
                findings=findings,
                required_checks=[
                    "path_policy",
                    "build",
                    "typecheck",
                ],
            )

        # ====================================================================
        # EMPTY CHANGE SET
        # ====================================================================

        if not changes.files:
            findings.append(
                ReviewFinding(
                    code="empty_change_set",
                    message=(
                        "The implementation did not produce any file changes."
                    ),
                    severity=ReviewSeverity.BLOCKING,
                )
            )

        # ====================================================================
        # FILE COUNT LIMIT
        # ====================================================================

        if len(changes.files) > self._max_files_per_change:
            findings.append(
                ReviewFinding(
                    code="change_set_too_large",
                    message=(
                        "The change exceeds the per-run file limit."
                    ),
                    severity=ReviewSeverity.BLOCKING,
                )
            )

        # ====================================================================
        # PATH VALIDATION
        # ====================================================================

        seen_paths: set[str] = set()

        for change in changes.files:
            try:
                normalized = str(
                    PurePosixPath(change.path)
                )
            except Exception:
                normalized = change.path

            # ---------------------------------------------------------------
            # Empty path
            # ---------------------------------------------------------------

            if not change.path.strip():
                findings.append(
                    ReviewFinding(
                        code="empty_file_path",
                        message="A file change contains an empty path.",
                        severity=ReviewSeverity.BLOCKING,
                        path=change.path,
                    )
                )
                continue

            # ---------------------------------------------------------------
            # Absolute path
            # ---------------------------------------------------------------

            if PurePosixPath(change.path).is_absolute():
                findings.append(
                    ReviewFinding(
                        code="absolute_path",
                        message=(
                            "File paths must be relative to the generated "
                            "project root."
                        ),
                        severity=ReviewSeverity.BLOCKING,
                        path=change.path,
                    )
                )

            # ---------------------------------------------------------------
            # Parent traversal
            # ---------------------------------------------------------------

            if ".." in PurePosixPath(change.path).parts:
                findings.append(
                    ReviewFinding(
                        code="path_traversal",
                        message=(
                            "File paths must not contain parent-directory "
                            "traversal."
                        ),
                        severity=ReviewSeverity.BLOCKING,
                        path=change.path,
                    )
                )

            # ---------------------------------------------------------------
            # Duplicate path
            # ---------------------------------------------------------------

            if normalized in seen_paths:
                findings.append(
                    ReviewFinding(
                        code="duplicate_path",
                        message=(
                            "The change set contains the same path "
                            "more than once."
                        ),
                        severity=ReviewSeverity.BLOCKING,
                        path=change.path,
                    )
                )

            seen_paths.add(normalized)

            # ---------------------------------------------------------------
            # Operation validation
            # ---------------------------------------------------------------

            if change.operation not in {
                "upsert",
                "delete",
            }:
                findings.append(
                    ReviewFinding(
                        code="invalid_operation",
                        message=(
                            "File operation must be either 'upsert' "
                            "or 'delete'."
                        ),
                        severity=ReviewSeverity.BLOCKING,
                        path=change.path,
                    )
                )

            # ---------------------------------------------------------------
            # Delete should not carry meaningful content
            # ---------------------------------------------------------------

            if change.operation == "delete" and change.content:
                findings.append(
                    ReviewFinding(
                        code="delete_contains_content",
                        message=(
                            "Deleted files must not contain file content."
                        ),
                        severity=ReviewSeverity.WARNING,
                        path=change.path,
                    )
                )

        # ====================================================================
        # BLUEPRINT VALIDATION
        # ====================================================================

        required_checks = [
            "path_policy",
            "build",
            "typecheck",
        ]

        if plan is None:
            findings.append(
                ReviewFinding(
                    code="missing_generation_plan",
                    message=(
                        "The implementation review cannot run without "
                        "a generation plan."
                    ),
                    severity=ReviewSeverity.BLOCKING,
                )
            )

            return ChangeReview(
                approved=False,
                findings=findings,
                required_checks=required_checks,
            )

        blueprint = plan.blueprint

        if blueprint is not None:

            # ---------------------------------------------------------------
            # Snapshot of generated/upserted files
            # ---------------------------------------------------------------

            snapshot = {
                file_change.path: file_change.content
                for file_change in changes.files
                if file_change.operation == "upsert"
            }

            # ---------------------------------------------------------------
            # Required entry files
            # ---------------------------------------------------------------

            if blueprint.template == "html":
                required = [
                    "index.html",
                ]

            elif blueprint.template == "react":
                required = [
                    "src/main.tsx",
                    "src/App.tsx",
                    "src/styles.css",
                    "index.html",
                    "package.json",
                ]

            elif blueprint.template == "react-three":
                required = [
                    "src/main.tsx",
                    "src/App.tsx",
                    "src/styles.css",
                    "index.html",
                    "package.json",
                ]

            else:
                required = []

            for missing in required:
                if missing not in snapshot:
                    findings.append(
                        ReviewFinding(
                            code="missing_entry_file",
                            message=(
                                f"The {blueprint.template} blueprint "
                                f"requires {missing}."
                            ),
                            severity=ReviewSeverity.BLOCKING,
                            path=missing,
                        )
                    )

            # ---------------------------------------------------------------
            # package.json validation
            # ---------------------------------------------------------------

            if "package.json" in snapshot:
                package_source = snapshot["package.json"]

                try:
                    package = json.loads(
                        package_source
                    )

                    if not isinstance(package, dict):
                        raise ValueError(
                            "package.json must contain a JSON object."
                        )

                    scripts = package.get(
                        "scripts",
                        {},
                    )

                    if scripts is not None and not isinstance(
                        scripts,
                        dict,
                    ):
                        raise ValueError(
                            "package.json scripts must be an object."
                        )

                    scripts = scripts or {}

                    forbidden_hooks = {
                        "preinstall",
                        "install",
                        "postinstall",
                        "prepare",
                    }

                    forbidden_present = (
                        forbidden_hooks.intersection(
                            scripts.keys()
                        )
                    )

                    if forbidden_present:
                        raise ValueError(
                            "Installation lifecycle hooks are not allowed."
                        )

                except (
                    ValueError,
                    TypeError,
                    json.JSONDecodeError,
                ):
                    findings.append(
                        ReviewFinding(
                            code="invalid_package_manifest",
                            message=(
                                "Provide a valid package.json without "
                                "installation lifecycle hooks."
                            ),
                            severity=ReviewSeverity.BLOCKING,
                            path="package.json",
                        )
                    )

            # ---------------------------------------------------------------
            # React source sanity
            # ---------------------------------------------------------------

            if blueprint.template in {
                "react",
                "react-three",
            }:

                react_source_files = {
                    path: source
                    for path, source in snapshot.items()
                    if path.endswith(
                        (
                            ".tsx",
                            ".ts",
                            ".jsx",
                            ".js",
                        )
                    )
                }

                if not react_source_files:
                    findings.append(
                        ReviewFinding(
                            code="missing_react_source",
                            message=(
                                "The React blueprint requires "
                                "actual React source files."
                            ),
                            severity=ReviewSeverity.BLOCKING,
                        )
                    )

            # ---------------------------------------------------------------
            # Three.js validation
            # ---------------------------------------------------------------

            if blueprint.template == "react-three":

                has_three = any(
                    "three" in source.lower()
                    for path, source in snapshot.items()
                    if path.endswith(
                        (
                            ".tsx",
                            ".ts",
                            ".jsx",
                            ".js",
                        )
                    )
                )

                if not has_three:
                    findings.append(
                        ReviewFinding(
                            code="missing_three_scene",
                            message=(
                                "The 3D blueprint requires an actual "
                                "Three.js implementation."
                            ),
                            severity=ReviewSeverity.BLOCKING,
                        )
                    )

        # ====================================================================
        # FINAL REVIEW RESULT
        # ====================================================================

        has_blocking = any(
            finding.severity == ReviewSeverity.BLOCKING
            for finding in findings
        )

        return ChangeReview(
            approved=not has_blocking,
            findings=findings,
            required_checks=required_checks,
        )
