
# app/orchestrator/provider.py

from __future__ import annotations

import asyncio
import json
import os
import re
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError

from app.agents.context import file_manifest
from app.agents.contracts import ChangeReview
from app.agents.design import DESIGN_SYSTEM_PROMPT, design_context
from app.orchestrator.mock import MockAgentProvider
from app.orchestrator.models import (
    ChangeResponse,
    ChangeSet,
    IntelligentPlan,
    PlanResponse,
    ProviderUsage,
    ReviewResponse,
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv(
    Path(__file__).resolve().parents[2] / ".env"
)


# ============================================================
# LIMITS
# ============================================================

GROQ_TPM_BUDGET = 7600
CHARS_PER_TOKEN = 4
TOKEN_SAFETY_MARGIN = 300

PLANNER_OUTPUT_LIMIT = 3600
PLANNER_RETRY_OUTPUT_LIMIT = 3800

QUALITY_OUTPUT_LIMIT = 850

IMPLEMENTATION_OUTPUT_LIMIT = 7000
IMPLEMENTATION_RETRY_OUTPUT_LIMIT = 6800

REPAIR_OUTPUT_LIMIT = 2200

MAX_REPAIR_FILES = 3
MAX_REPAIR_FILE_CHARS = 9000

MAX_IMPLEMENTATION_CONTEXT_FILE_CHARS = 4000
MAX_REVIEW_FILE_CHARS = 5000

MAX_REQUEST_BYTES = 450_000


# ============================================================
# PROVIDER ERROR
# ============================================================

class ProviderError(RuntimeError):

    def __init__(
        self,
        code: str,
        message: str,
        retryable: bool = False,
    ):
        super().__init__(message)

        self.code = code
        self.retryable = retryable


# ============================================================
# JSON HELPERS
# ============================================================

def _strip_markdown_fences(
    content: str,
) -> str:

    text = (content or "").strip()

    text = re.sub(
        r"^```(?:json|JSON)?\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"\s*```$",
        "",
        text,
    )

    return text.strip()


def _extract_json_object(
    content: str,
) -> str:

    text = _strip_markdown_fences(
        content
    )

    if not text:
        raise ValueError(
            "Provider returned empty content."
        )

    try:

        parsed = json.loads(text)

        if isinstance(parsed, dict):

            return json.dumps(
                parsed,
                ensure_ascii=False,
            )

    except json.JSONDecodeError:
        pass

    start = text.find("{")

    if start == -1:
        raise ValueError(
            "No JSON object found in model response."
        )

    depth = 0
    in_string = False
    escaped = False

    for index in range(
        start,
        len(text),
    ):

        char = text[index]

        if in_string:

            if escaped:
                escaped = False

            elif char == "\\":
                escaped = True

            elif char == '"':
                in_string = False

            continue

        if char == '"':
            in_string = True
            continue

        if char == "{":
            depth += 1

        elif char == "}":

            depth -= 1

            if depth == 0:

                candidate = text[
                    start:index + 1
                ]

                try:

                    parsed = json.loads(
                        candidate
                    )

                except json.JSONDecodeError as exc:

                    raise ValueError(
                        "Model returned malformed JSON: "
                        f"{exc}"
                    ) from None

                if not isinstance(
                    parsed,
                    dict,
                ):
                    raise ValueError(
                        "Model response JSON must be an object."
                    )

                return json.dumps(
                    parsed,
                    ensure_ascii=False,
                )

    raise ValueError(
        "Incomplete JSON object in model response."
    )


def _restore_string_maps(
    value: Any,
) -> Any:

    if isinstance(
        value,
        list,
    ):

        return [
            _restore_string_maps(item)
            for item in value
        ]

    if isinstance(
        value,
        dict,
    ):

        result: dict[str, Any] = {}

        for key, item in value.items():

            if (
                key == "design_tokens"
                and isinstance(
                    item,
                    str,
                )
            ):

                try:

                    decoded = json.loads(
                        item
                    )

                    if isinstance(
                        decoded,
                        dict,
                    ):

                        result[key] = decoded
                        continue

                except (
                    json.JSONDecodeError,
                    TypeError,
                ):
                    pass

            result[key] = _restore_string_maps(
                item
            )

        return result

    return value


# ============================================================
# MODEL HELPERS
# ============================================================

def _model_dump(
    value: Any,
) -> Any:

    if isinstance(
        value,
        BaseModel,
    ):
        return value.model_dump(
            mode="json"
        )

    return value


def _truncate(
    value: Any,
    max_chars: int,
) -> str:

    if value is None:
        return ""

    if isinstance(
        value,
        str,
    ):
        text = value

    else:

        text = json.dumps(
            _model_dump(value),
            ensure_ascii=False,
        )

    if len(text) <= max_chars:
        return text

    return (
        text[:max_chars]
        + "\n...[TRUNCATED]..."
    )


def _validation_message(
    error: ValidationError,
) -> str:

    parts: list[str] = []

    for item in error.errors():

        location = ".".join(
            str(part)
            for part in item.get(
                "loc",
                [],
            )
        )

        message = item.get(
            "msg",
            "validation error",
        )

        if location:

            parts.append(
                f"{location}: {message}"
            )

        else:

            parts.append(
                message
            )

    return "; ".join(parts)


# ============================================================
# PLAN NORMALIZATION
# ============================================================

def _normalize_template(
    value: Any,
) -> str:

    if not isinstance(
        value,
        str,
    ):
        return "react"

    value = value.strip().lower()

    aliases = {
        "reactjs": "react",
        "react.js": "react",
        "vite": "react",
        "typescript": "react",
        "tsx": "react",
        "next": "react",
        "nextjs": "react",
        "web": "react",
        "website": "react",
        "html5": "html",
        "three": "react-three",
        "threejs": "react-three",
        "react three": "react-three",
    }

    value = aliases.get(
        value,
        value,
    )

    if value not in {
        "html",
        "react",
        "react-three",
    }:

        return "react"

    return value


def _normalize_file_plan(
    file_plan: Any,
) -> list[dict[str, Any]]:

    if not isinstance(
        file_plan,
        list,
    ):
        return []

    result: list[dict[str, Any]] = []

    for item in file_plan:

        if not isinstance(
            item,
            dict,
        ):
            continue

        path = (
            item.get("path")
            or item.get("file")
            or item.get("filename")
            or item.get("file_path")
            or item.get("target")
        )

        if not isinstance(
            path,
            str,
        ):
            continue

        path = path.strip()

        if not path:
            continue

        action = (
            item.get("action")
            or item.get("operation")
            or "create"
        )

        # IMPORTANT:
        # IntelligentPlan does NOT allow "upsert".
        if action == "update":
            action = "modify"

        if action == "upsert":
            action = "create"

        if action not in {
            "preserve",
            "read",
            "modify",
            "create",
            "delete",
        }:
            action = "create"

        reason = (
            item.get("reason")
            or item.get("purpose")
            or item.get("description")
            or "Required for the generated application."
        )

        result.append(
            {
                "path": path,
                "action": action,
                "reason": _truncate(
                    str(reason),
                    300,
                ),
            }
        )

    return result



def _string_list(
    value: Any,
) -> list[str]:
    """Normalize model-produced list values to plain strings."""

    if isinstance(value, str):
        value = [value]

    if not isinstance(value, list):
        return []

    result: list[str] = []
    seen: set[str] = set()

    preferred_keys = (
        "description",
        "statement",
        "text",
        "title",
        "name",
        "value",
    )

    for item in value:
        text = ""

        if isinstance(item, str):
            text = item.strip()

        elif isinstance(item, dict):
            for key in preferred_keys:
                candidate = item.get(key)
                if isinstance(candidate, str) and candidate.strip():
                    text = candidate.strip()
                    break

            if not text:
                for candidate in item.values():
                    if isinstance(candidate, str) and candidate.strip():
                        text = candidate.strip()
                        break

        elif item is not None:
            text = str(item).strip()

        if not text:
            continue

        if text in seen:
            continue

        seen.add(text)
        result.append(text)

    return result

def _normalize_plan_json(raw: Any) -> Any:
    """
    Normalize planner output without overwriting valid product-specific data.

    The planner's valid values are treated as authoritative. Defaults are
    added only when fields are genuinely missing or malformed.
    """
    if not isinstance(raw, dict):
        return raw

    data = dict(raw)

    # ================================================================
    # SUMMARY
    # ================================================================

    summary = data.get("summary")
    if not isinstance(summary, str) or not summary.strip():
        data["summary"] = (
            "Implementation plan for the requested application."
        )

    # ================================================================
    # BLUEPRINT
    # ================================================================

    blueprint_raw = data.get("blueprint")

    if isinstance(blueprint_raw, dict):
        blueprint = dict(blueprint_raw)
    else:
        blueprint = {}

    # Template
    blueprint["template"] = _normalize_template(
        blueprint.get("template")
    )

    # Project type
    project_type = blueprint.get("project_type")

    if not isinstance(project_type, str) or not project_type.strip():
        blueprint["project_type"] = "web_application"
    else:
        blueprint["project_type"] = project_type.strip()

    # Audience
    #
    # IMPORTANT:
    # The model schema uses a list of audience values. Do not replace a
    # valid list with "general users".
    audience = blueprint.get("audience")

    if isinstance(audience, list):
        normalized_audience = [
            item.strip()
            for item in audience
            if isinstance(item, str) and item.strip()
        ]

        blueprint["audience"] = list(
            dict.fromkeys(normalized_audience)
        )

    elif isinstance(audience, str):
        audience_value = audience.strip()

        blueprint["audience"] = (
            [audience_value]
            if audience_value
            else ["general users"]
        )

    else:
        blueprint["audience"] = ["general users"]

    # Visual direction
    #
    # Preserve the planner's valid product-specific direction exactly.
    visual_direction = blueprint.get("visual_direction")

    if not isinstance(visual_direction, str) or not visual_direction.strip():
        blueprint["visual_direction"] = (
            "Modern product-specific responsive interface with strong "
            "hierarchy, coherent typography, accessible contrast and "
            "polished interactions."
        )
    else:
        blueprint["visual_direction"] = visual_direction.strip()

    # ================================================================
    # DESIGN TOKENS
    # ================================================================

    tokens = blueprint.get("design_tokens")

    if not isinstance(tokens, dict) or not tokens:
        blueprint["design_tokens"] = {
            "primary": "#2563eb",
            "secondary": "#7c3aed",
            "background": "#ffffff",
            "surface": "#f8fafc",
            "text": "#0f172a",
            "muted_text": "#64748b",
            "border": "#e2e8f0",
            "radius": "14px",
            "spacing": "4,8,12,16,24,32,48,64",
            "font_heading": "Inter, system-ui, sans-serif",
            "font_body": "Inter, system-ui, sans-serif",
        }
    else:
        # Keep all planner-provided tokens intact.
        blueprint["design_tokens"] = dict(tokens)

    # ================================================================
    # PAGES
    # ================================================================

    pages = _string_list(
        blueprint.get("pages")
    )

    blueprint["pages"] = (
        list(dict.fromkeys(pages))
        if pages
        else ["Home"]
    )

    # ================================================================
    # INTERACTIONS
    # ================================================================

    interactions = _string_list(
        blueprint.get("interactions")
    )

    blueprint["interactions"] = (
        list(dict.fromkeys(interactions))
        if interactions
        else ["Responsive navigation"]
    )

    # ================================================================
    # ACCEPTANCE CRITERIA
    # ================================================================

    acceptance_criteria = _string_list(
        blueprint.get("acceptance_criteria")
    )

    if len(acceptance_criteria) < 2:
        acceptance_criteria = [
            "The requested user experience is implemented.",
            "The application is responsive and usable.",
        ]

    blueprint["acceptance_criteria"] = list(
        dict.fromkeys(acceptance_criteria)
    )

    # ================================================================
    # LIMITATIONS
    # ================================================================

    limitations = _string_list(
        blueprint.get("limitations")
    )

    blueprint["limitations"] = list(
        dict.fromkeys(limitations)
    )

    data["blueprint"] = blueprint

    # ================================================================
    # FILE PLAN
    # ================================================================

    plan = _normalize_file_plan(
        data.get("file_plan")
    )

    if not plan:
        if blueprint["template"] in {"react", "react-three"}:
            plan = [
                {
                    "path": "index.html",
                    "action": "create",
                    "reason": (
                        "Application document entry point."
                    ),
                },
                {
                    "path": "package.json",
                    "action": "create",
                    "reason": (
                        "Dependencies and build scripts."
                    ),
                },
                {
                    "path": "src/main.tsx",
                    "action": "create",
                    "reason": "React bootstrap.",
                },
                {
                    "path": "src/App.tsx",
                    "action": "create",
                    "reason": "Application composition.",
                },
                {
                    "path": "src/styles.css",
                    "action": "create",
                    "reason": (
                        "Global responsive styling."
                    ),
                },
            ]
        else:
            plan = [
                {
                    "path": "index.html",
                    "action": "create",
                    "reason": (
                        "HTML application entry point."
                    ),
                },
                {
                    "path": "styles.css",
                    "action": "create",
                    "reason": (
                        "Global responsive styles."
                    ),
                },
                {
                    "path": "script.js",
                    "action": "create",
                    "reason": (
                        "Client-side behavior."
                    ),
                },
            ]

    # ================================================================
    # REACT FOUNDATION
    # ================================================================

    if blueprint["template"] in {"react", "react-three"}:
        foundation = [
            (
                "index.html",
                "Application document entry point and metadata.",
            ),
            (
                "package.json",
                "Dependencies and development/build scripts.",
            ),
            (
                "src/main.tsx",
                "React bootstrap and root mount.",
            ),
            (
                "src/App.tsx",
                "Main application composition.",
            ),
            (
                "src/styles.css",
                "Global styling and responsive design system.",
            ),
        ]

        existing = {
            item["path"]
            for item in plan
            if (
                isinstance(item, dict)
                and isinstance(item.get("path"), str)
            )
        }

        for path, reason in foundation:
            if path not in existing:
                plan.append(
                    {
                        "path": path,
                        "action": "create",
                        "reason": reason,
                    }
                )
                existing.add(path)

        actionable_count = sum(
            1
            for item in plan
            if item.get("action") in {"create", "modify"}
        )

        if actionable_count < 7:
            for path, reason in [
                (
                    "src/components/SiteHeader.tsx",
                    "Reusable responsive site header/navigation.",
                ),
                (
                    "src/components/SiteFooter.tsx",
                    "Reusable site footer and secondary navigation.",
                ),
            ]:
                if path not in existing:
                    plan.append(
                        {
                            "path": path,
                            "action": "create",
                            "reason": reason,
                        }
                    )
                    existing.add(path)

    data["file_plan"] = plan

    planned_paths = [
        item["path"]
        for item in plan
        if (
            isinstance(item, dict)
            and isinstance(item.get("path"), str)
            and item.get("path")
        )
    ]

    planned = set(planned_paths)

    # ================================================================
    # TASKS
    # ================================================================

    tasks_raw = data.get("tasks")
    tasks = (
        tasks_raw
        if isinstance(tasks_raw, list)
        else []
    )

    normalized_tasks: list[dict[str, Any]] = []
    used_ids: set[str] = set()

    for index, raw_task in enumerate(tasks):
        if not isinstance(raw_task, dict):
            continue

        task = dict(raw_task)

        task_id = str(
            task.get("id") or ""
        ).strip()

        if not task_id or task_id in used_ids:
            task_id = f"TASK-{index + 1:03d}"

            counter = index + 1

            while task_id in used_ids:
                counter += 1
                task_id = f"TASK-{counter:03d}"

        used_ids.add(task_id)

        title = task.get("title")

        if (
            not isinstance(title, str)
            or not title.strip()
        ):
            title = "Implement requested feature"

        description = task.get("description")

        if (
            not isinstance(description, str)
            or not description.strip()
        ):
            description = (
                "Implement the requested feature "
                "according to the project plan."
            )

        targets = [
            path
            for path in _string_list(
                task.get("target_files")
            )
            if path in planned
        ]

        normalized_tasks.append(
            {
                "id": task_id,
                "title": title.strip(),
                "description": description.strip(),
                "target_files": list(
                    dict.fromkeys(targets)
                ),
                "depends_on": _string_list(
                    task.get("depends_on")
                ),
            }
        )

    # ================================================================
    # FALLBACK TASKS
    # ================================================================

    if not normalized_tasks:
        foundation = [
            path
            for path in [
                "index.html",
                "package.json",
                "src/main.tsx",
                "src/App.tsx",
                "src/styles.css",
            ]
            if path in planned
        ]

        normalized_tasks.append(
            {
                "id": "TASK-001",
                "title": "Build application foundation",
                "description": (
                    "Create the project entry point, dependency "
                    "manifest, application bootstrap, root "
                    "composition and global styling foundation."
                ),
                "target_files": (
                    foundation or planned_paths[:5]
                ),
                "depends_on": [],
            }
        )

        remaining = [
            path
            for path in planned_paths
            if path not in set(foundation)
        ]

        if remaining:
            normalized_tasks.append(
                {
                    "id": "TASK-002",
                    "title": "Implement product-specific experience",
                    "description": (
                        "Implement the pages, sections, components, "
                        "interactions and content represented by "
                        "the product blueprint."
                    ),
                    "target_files": remaining,
                    "depends_on": ["TASK-001"],
                }
            )

    # ================================================================
    # ENSURE ACTIONABLE FILE OWNERSHIP
    # ================================================================

    actionable_paths = [
        item["path"]
        for item in plan
        if item.get("action") in {
            "create",
            "modify",
            "delete",
        }
    ]

    owned: set[str] = set()

    for task in normalized_tasks:
        task["target_files"] = [
            path
            for path in _string_list(
                task.get("target_files")
            )
            if path in planned
        ]

        owned.update(
            task["target_files"]
        )

    if not normalized_tasks and actionable_paths:
        normalized_tasks.append(
            {
                "id": "TASK-001",
                "title": "Implement application",
                "description": (
                    "Implement the complete planned application."
                ),
                "target_files": [],
                "depends_on": [],
            }
        )

    for path in actionable_paths:
        if path not in owned:
            normalized_tasks[-1]["target_files"].append(
                path
            )
            owned.add(path)

    # ================================================================
    # DEPENDENCY CLEANUP
    # ================================================================

    task_ids = {
        task["id"]
        for task in normalized_tasks
    }

    for task in normalized_tasks:
        task["depends_on"] = [
            dependency
            for dependency in _string_list(
                task.get("depends_on")
            )
            if (
                dependency in task_ids
                and dependency != task["id"]
            )
        ]

    data["tasks"] = normalized_tasks

    return data


# ============================================================
# QUALITY FALLBACK
# ============================================================

def _quality_review_fallback(
    schema: type[BaseModel],
    reason: str,
):

    data = {
        "approved": True,
        "findings": [
            {
                "code": "quality_review_unavailable",
                "message": (
                    "Automated quality review was unavailable. "
                    "Static verification should still run."
                ),
                "severity": "warning",
                "path": None,
            }
        ],
        "required_checks": [
            "path_policy",
            "build",
            "typecheck",
        ],
    }

    try:

        return schema.model_validate(
            data
        )

    except ValidationError:

        return schema.model_validate(
            {
                "approved": True,
                "findings": [],
                "required_checks": [
                    "path_policy",
                    "build",
                    "typecheck",
                ],
            }
        )


# ============================================================
# MODEL PROVIDER
# ============================================================

class ModelProvider:

    def __init__(
        self,
        *,
        key: str,
        base_url: str,
        model: str,
        planning_model: str = "",
        review_model: str = "",
        fallback_model: str = "",
        timeout: float = 90,
        max_tokens: int = 5000,
        max_retries: int = 2,
        transport=None,
    ):

        self.key = key
        self.base_url = (
            base_url.rstrip("/")
        )

        self.model = model

        self.planning_model = (
            planning_model
            or model
        )

        self.review_model = (
            review_model
            or model
        )

        self.fallback_model = (
            fallback_model
            or model
        )

        self.timeout = timeout

        self.max_tokens = min(
            max(
                500,
                max_tokens,
            ),
            IMPLEMENTATION_OUTPUT_LIMIT,
        )

        self.max_retries = max(
            0,
            max_retries,
        )

        self.transport = transport

    # ========================================================
    # MODEL SELECTION
    # ========================================================

    def _model_for_role(
        self,
        role: str,
    ) -> str:

        if role == "planner":
            return self.planning_model

        if role == "quality reviewer":
            return self.review_model

        return self.model

    # ========================================================
    # PROVIDER NAME
    # ========================================================

    def _provider_name(
        self,
    ) -> str:

        if "groq.com" in (
            self.base_url.lower()
        ):
            return "groq"

        return "compatible"

    # ========================================================
    # USAGE
    # ========================================================

    def _empty_usage(
        self,
        model: str,
    ) -> ProviderUsage:

        return ProviderUsage(
            input_tokens=0,
            output_tokens=0,
            model=model,
            provider=self._provider_name(),
        )

    def _usage_from_response(
        self,
        data: dict[str, Any],
        model: str,
    ) -> ProviderUsage:

        usage = (
            data.get("usage")
            or {}
        )

        return ProviderUsage(
            input_tokens=int(
                usage.get(
                    "prompt_tokens",
                    0,
                )
            ),
            output_tokens=int(
                usage.get(
                    "completion_tokens",
                    0,
                )
            ),
            model=model,
            provider=self._provider_name(),
        )

    # ========================================================
    # SYSTEM PROMPT
    # ========================================================

    def _system_prompt(
        self,
        role: str,
    ) -> str:

        common = (
            f"You are ICOGON's {role}.\n"
            "Return exactly ONE valid JSON object.\n"
            "No markdown.\n"
            "No code fences.\n"
            "No explanation outside JSON.\n"
            "Do not output reasoning.\n"
            "Never include credentials or secrets.\n"
        )

        if role == "planner":

            return (
                common
                + DESIGN_SYSTEM_PROMPT
                + "\n\n"
                "PLANNER CONTRACT:\n"
                "Return a complete IntelligentPlan that describes the actual product requested by the user.\n"
                "Do NOT create a generic ICOGON/SaaS template unless the user explicitly requested one.\n"
                "Derive the information architecture, pages, sections, interactions, content model and visual direction from the user's prompt.\n"
                "For a non-trivial React website, plan a real multi-file application, not a single-file demo.\n"
                "A production React website normally includes index.html, package.json, an application entry, a main App, global styles, reusable components and feature/page modules as appropriate.\n"
                "Add only files that are genuinely useful for the requested product; do not pad the project with meaningless files.\n"
                "Every user-requested feature must map to one or more concrete tasks and files.\n"
                "template must be html, react or react-three.\n"
                "file_plan actions must be exactly: preserve, read, modify, create, delete.\n"
                "Never use upsert as file_plan action.\n"
                "Every task must have id, title, description, target_files and depends_on.\n"
                "blueprint.pages must list the actual pages/routes or major views.\n"
                "blueprint.interactions must list concrete interactive behaviors.\n"
                "blueprint.acceptance_criteria must contain at least two concrete, testable criteria.\n"
                "design_tokens must be an object with a coherent palette, typography, spacing, radius and visual hierarchy.\n"
                "Prefer reusable components over giant monolithic files.\n"
                "Do not invent backend functionality unless the requested product needs it; clearly represent unavailable integrations in limitations.\n"
                "Keep the plan concise enough to leave maximum context budget for implementation.\n"
            )

        if role == "quality reviewer":

            return (
                common
                + "\n"
                "QUALITY REVIEW CONTRACT:\n"
                "{"
                "\"approved\":true|false,"
                "\"findings\":[],"
                "\"required_checks\":[]"
                "}\n"
                "severity must be blocking or warning.\n"
                "path can be null.\n"
                "Do not claim that build or typecheck was executed.\n"
            )

        return (
            common
            + "\n"
            "IMPLEMENTATION CONTRACT:\n"
            "{"
            "\"summary\":\"string\","
            "\"files\":[]"
            "}\n"
            "You are the primary production code-generation engineer.\n"
            "Implement the user's requested product, not a generic demo and not an ICOGON-branded sample.\n"
            "Treat the supplied plan as the source of truth for the project architecture.\n"
            "Implement every actionable file in the plan and nothing outside the allowed scope.\n"            "Treat file_plan as a mandatory manifest: return every actionable planned file.\n"
            "Never merge separate planned components just to reduce file count.\n"
            "Use blueprint pages, tasks and prompt-specific requirements to drive actual content and UI.\n"

            "For a non-trivial React website, produce a coherent multi-file project with a real entry point, App, styling, reusable components and feature/page modules where planned.\n"
            "Build polished responsive desktop, tablet and mobile layouts.\n"
            "Use realistic, prompt-specific copy and content. Never use lorem ipsum, generic 'Welcome to our website', fake ICOGON branding, TODOs, empty handlers or visual placeholders.\n"
            "Implement real client-side interactions that can work without unavailable backend services.\n"
            "Use accessible semantic HTML, keyboard-friendly controls, sensible focus states, responsive navigation and useful loading/error/empty states where relevant.\n"
            "Keep components maintainable and avoid putting the entire application into one giant file.\n"
            "Keep imports, package dependencies, file paths and exports internally consistent.\n"
            "If the plan specifies Tailwind or an existing styling convention, follow it; otherwise use the project's planned styling approach.\n"
            "Never claim that external APIs, databases, payments, authentication or deployments are actually connected unless the supplied project context contains those integrations.\n"
            "Never return partial files, placeholders, markdown fences or explanations outside JSON.\n"
            "For upsert, content must be the COMPLETE final file contents from the first character to the last.\n"
            "Close the JSON completely.\n"
        )

    # ========================================================
    # TOKEN ESTIMATION
    # ========================================================

    @staticmethod
    def _estimate_tokens(
        text: str,
    ) -> int:

        if not text:
            return 0

        return max(
            1,
            len(text) // CHARS_PER_TOKEN,
        )

    def _output_budget(
        self,
        system: str,
        encoded: str,
        requested: int,
    ) -> int:

        input_tokens = (
            self._estimate_tokens(system)
            + self._estimate_tokens(encoded)
        )

        available = (
            GROQ_TPM_BUDGET
            - input_tokens
            - TOKEN_SAFETY_MARGIN
        )

        available = max(
            256,
            available,
        )

        return max(
            256,
            min(
                requested,
                available,
            ),
        )

    # ========================================================
    # COMPACT PLAN
    # ========================================================

    def _compact_plan(
        self,
        plan: Any,
    ) -> dict[str, Any]:

        data = _model_dump(
            plan
        )

        if not isinstance(
            data,
            dict,
        ):
            return {}

        blueprint = data.get(
            "blueprint",
            {},
        )

        if not isinstance(
            blueprint,
            dict,
        ):
            blueprint = {}

        return {
            "summary": _truncate(
                data.get(
                    "summary",
                    "",
                ),
                800,
            ),
            "tasks": data.get(
                "tasks",
                [],
            ),
            "file_plan": data.get(
                "file_plan",
                [],
            ),
            "pages": blueprint.get(
                "pages",
                [],
            ),
            "interactions": blueprint.get(
                "interactions",
                [],
            ),
            "acceptance_criteria": blueprint.get(
                "acceptance_criteria",
                [],
            ),
        }

    # ========================================================
    # IMPLEMENTATION FILES
    # ========================================================

    def _implementation_files(
        self,
        request,
    ) -> list[dict[str, Any]]:

        result = []

        for file in request.context_files:

            result.append(
                {
                    "path": file.path,
                    "bytes": len(
                        file.content.encode()
                    ),
                    "content": _truncate(
                        file.content,
                        MAX_IMPLEMENTATION_CONTEXT_FILE_CHARS,
                    ),
                }
            )

        return result

    # ========================================================
    # PAYLOAD
    # ========================================================

    def _payload(
        self,
        *,
        role: str,
        request,
        context: dict[str, Any],
    ) -> dict[str, Any]:

        payload = {
            "prompt": request.prompt,
            "quality": request.quality,
        }

        if role == "planner":

            payload["design_context"] = _truncate(
                design_context(
                    request.prompt,
                    request.context_files,
                ),
                3000,
            )

            payload["existing_file_manifest"] = (
                file_manifest(
                    request.context_files
                )
            )

            payload["existing_files"] = [
                {
                    "path": file.path,
                    "bytes": len(
                        file.content.encode()
                    ),
                    "excerpt": file.content[:500],
                }
                for file in request.context_files
            ]

            payload["brief"] = _model_dump(
                context.get("brief")
            )

            payload["architecture"] = _model_dump(
                context.get("architecture")
            )

            return payload

        if role == "implementation engineer":

            payload["brief"] = _truncate(
                _model_dump(context.get("brief")),
                4500,
            )

            payload["architecture"] = _truncate(
                _model_dump(context.get("architecture")),
                5500,
            )

            payload["plan"] = self._compact_plan(
                context.get("plan")
            )

            payload["existing_files"] = (
                self._implementation_files(
                    request
                )
            )

            payload["production_requirements"] = [
                "Build the actual product described by the user prompt.",
                "Do not use generic ICOGON branding or generic SaaS copy unless requested.",
                "Implement the complete actionable file plan.",
                "Use reusable components and clear feature boundaries.",
                "Make the UI polished and responsive across mobile, tablet and desktop.",
                "Use prompt-specific content, labels, sections and interactions.",
                "Implement functional client-side interactions instead of decorative controls.",
                "Use semantic accessible HTML and visible keyboard focus states.",
                "Keep dependencies minimal and consistent with package.json.",
                "Never use lorem ipsum, TODO, placeholder blocks or fake functionality.",
                "Do not invent external integrations that are not available in context.",
            ]

            payload["implementation_rules"] = [
                "Return complete files.",
                "Implement every actionable file in file_plan.",
                "Do not invent files outside file_plan.",
                "Do not omit required files.",
                "Do not use placeholders.",
                "Do not collapse a multi-file project into one file.",
                "Return valid JSON only.",
            ]

            payload["output_contract"] = {
                "summary": "string",
                "files": [
                    {
                        "path": "relative/path",
                        "content": "COMPLETE final file contents",
                        "operation": "upsert",
                    }
                ],
            }

            return payload

        if role == "quality reviewer":

            payload["plan"] = self._compact_plan(
                context.get("plan")
            )

            changes = _model_dump(
                context.get("changes")
            )

            if not isinstance(
                changes,
                dict,
            ):
                changes = {}

            compact_files = []

            for file_data in changes.get(
                "files",
                [],
            ):

                if not isinstance(
                    file_data,
                    dict,
                ):
                    continue

                compact_files.append(
                    {
                        "path": file_data.get(
                            "path"
                        ),
                        "operation": file_data.get(
                            "operation",
                            "upsert",
                        ),
                        "content": _truncate(
                            file_data.get(
                                "content",
                                "",
                            ),
                            MAX_REVIEW_FILE_CHARS,
                        ),
                    }
                )

            payload["changes"] = {
                "summary": _truncate(
                    changes.get(
                        "summary",
                        "",
                    ),
                    600,
                ),
                "files": compact_files,
            }

            payload["review_instructions"] = (
                "Check concrete defects only. "
                "Do not claim tests were run. "
                "Return findings=[] when no concrete "
                "blocking defect exists."
            )

            return payload

        if role == "repair engineer":

            payload["plan"] = self._compact_plan(
                context.get("plan")
            )

            payload["feedback"] = _model_dump(
                context.get("feedback")
            )

            payload["changes"] = _model_dump(
                context.get("changes")
            )

            payload["repair_instruction"] = (
                "Repair only files that are actually affected. "
                "Return complete replacement file content."
            )

            payload["output_contract"] = {
                "summary": "string",
                "files": [
                    {
                        "path": "relative/path",
                        "content": "COMPLETE file",
                        "operation": "upsert",
                    }
                ],
            }

            return payload

        return payload

    # ========================================================
    # HTTP REQUEST
    # ========================================================

    async def _request(
        self,
        *,
        model: str,
        system: str,
        encoded: str,
        max_tokens: int,
    ) -> httpx.Response:
        """Send an OpenAI-compatible request with GPT-OSS-safe options."""

        base_url_lower = self.base_url.lower()
        is_groq = "groq.com" in base_url_lower
        is_gpt_oss = model.startswith("openai/gpt-oss-")

        body: dict[str, Any] = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": system,
                },
                {
                    "role": "user",
                    "content": encoded,
                },
            ],
            "temperature": 0,
            "stream": False,
        }

        safe_max_tokens = max(
            256,
            int(max_tokens),
        )

        if is_groq and is_gpt_oss:
            body["max_completion_tokens"] = safe_max_tokens
            body["include_reasoning"] = False
        else:
            body["max_tokens"] = safe_max_tokens

        # JSON object mode is useful for GPT-OSS structured generation.
        # If an older compatible provider rejects this parameter, its HTTP
        # error will still be surfaced rather than silently changing output.
        if is_groq and is_gpt_oss:
            body["response_format"] = {
                "type": "json_object"
            }

        response = None

        for attempt in range(
            self.max_retries + 1
        ):
            try:
                async with httpx.AsyncClient(
                    timeout=self.timeout,
                    transport=self.transport,
                ) as client:
                    response = await client.post(
                        self.base_url
                        + "/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.key}",
                            "Content-Type": "application/json",
                        },
                        json=body,
                    )

            except httpx.TimeoutException:
                if attempt < self.max_retries:
                    await asyncio.sleep(
                        1.5 * (attempt + 1)
                    )
                    continue

                raise ProviderError(
                    "provider_timeout",
                    "Model request timed out.",
                    True,
                ) from None

            except httpx.RequestError as exc:
                if attempt < self.max_retries:
                    await asyncio.sleep(
                        1.5 * (attempt + 1)
                    )
                    continue

                raise ProviderError(
                    "provider_unavailable",
                    f"Cannot reach model provider: {exc}",
                    True,
                ) from None

            if response.status_code < 400:
                return response

            if (
                response.status_code == 429
                and attempt < self.max_retries
            ):
                await asyncio.sleep(
                    self._retry_after_seconds(response)
                )
                continue

            if (
                response.status_code >= 500
                and attempt < self.max_retries
            ):
                await asyncio.sleep(
                    1.5 * (attempt + 1)
                )
                continue

            return response

        raise ProviderError(
            "provider_unavailable",
            "No response from model provider.",
            True,
        )

    @staticmethod
    def _retry_after_seconds(
        response: httpx.Response,
    ) -> float:

        header = response.headers.get(
            "retry-after"
        )

        if header:

            try:

                return max(
                    0.5,
                    min(
                        float(header),
                        30.0,
                    ),
                )

            except ValueError:
                pass

        body = response.text or ""

        match = re.search(
            r"try again in\s+"
            r"([0-9]+(?:\.[0-9]+)?)s",
            body,
            flags=re.IGNORECASE,
        )

        if match:

            return max(
                0.5,
                min(
                    float(match.group(1)),
                    30.0,
                ),
            )

        return 2.0

    # ========================================================
    # HTTP ERROR
    # ========================================================

    def _raise_http(
        self,
        response: httpx.Response,
    ) -> None:

        message = (
            "Model provider returned HTTP "
            f"{response.status_code}."
        )

        try:

            body = response.json()

            if isinstance(
                body,
                dict,
            ):

                error = body.get(
                    "error"
                )

                if isinstance(
                    error,
                    dict,
                ):

                    provider_message = error.get(
                        "message"
                    )

                    if provider_message:
                        message += (
                            f" {provider_message}"
                        )

        except Exception:
            pass

        raise ProviderError(
            "provider_http_error",
            message,
            (
                response.status_code == 429
                or response.status_code >= 500
            ),
        )

    # ========================================================
    # PARSE RESPONSE
    # ========================================================

    async def _parse_response(
        self,
        response: httpx.Response,
        schema: type[BaseModel],
        model: str,
        normalize_plan: bool = False,
    ):
        """Parse provider output, including GPT-OSS response variants."""

        data = response.json()

        if not isinstance(data, dict):
            raise ValueError(
                "Provider response is not an object."
            )

        usage = self._usage_from_response(
            data,
            model,
        )

        choices = data.get("choices")
        if not choices:
            raise ValueError(
                "Provider returned no choices."
            )

        choice = choices[0]
        if not isinstance(choice, dict):
            raise ValueError(
                "Provider returned invalid choice."
            )

        finish_reason = choice.get("finish_reason")

        if finish_reason != "stop":
            raise ProviderError(
                "incomplete_output",
                (
                    "Model returned incomplete output "
                    f"with finish_reason={finish_reason!r}."
                ),
                True,
            )

        message = choice.get("message") or {}

        message = choice.get("message") or {}

        if not isinstance(message, dict):
            raise ProviderError(
                "invalid_model_output",
                "Provider returned invalid message.",
                False,
            )

        def extract_text(value: Any) -> str:
            if isinstance(value, str):
                return value.strip()

            if isinstance(value, list):
                parts: list[str] = []

                for item in value:
                    if isinstance(item, str):
                        if item.strip():
                            parts.append(item.strip())
                        continue

                    if isinstance(item, dict):
                        for key in (
                                "text",
                                "content",
                                "value",
                        ):
                            candidate = item.get(key)

                            if (
                                    isinstance(candidate, str)
                                    and candidate.strip()
                            ):
                                parts.append(
                                    candidate.strip()
                                )
                                break

                return "\n".join(parts).strip()

            if isinstance(value, dict):
                for key in (
                        "text",
                        "content",
                        "value",
                ):
                    candidate = value.get(key)

                    if (
                            isinstance(candidate, str)
                            and candidate.strip()
                    ):
                        return candidate.strip()

            return ""

        model_text = extract_text(
            message.get("content")
        )

        # Groq GPT-OSS may return reasoning separately.
        if not model_text:
            model_text = extract_text(
                message.get("reasoning")
            )

        # Compatibility with other OpenAI-compatible providers.
        if not model_text:
            model_text = extract_text(
                message.get("reasoning_content")
            )

        if not model_text:
            model_text = extract_text(
                choice.get("text")
            )

        if not model_text:
            model_text = extract_text(
                choice.get("output")
            )

        if not model_text:
            raise ProviderError(
                "invalid_model_output",
                (
                    "Provider returned empty content. "
                    f"model={model}, "
                    f"finish_reason={finish_reason}, "
                    f"message_keys={list(message.keys())}"
                ),
                False,
            )

        json_text = _extract_json_object(
            model_text
        )

        raw = json.loads(
            json_text
        )

        if not isinstance(raw, dict):
            raise ProviderError(
                "invalid_model_output",
                "Model JSON response must be an object.",
                False,
            )



        if not raw:
            raise ProviderError(
                "invalid_model_output",
                "Model returned an empty JSON object.",
                False,
            )

        raw = _restore_string_maps(
            raw
        )

        if normalize_plan:
            raw = _normalize_plan_json(
                raw
            )

        result = schema.model_validate(
            raw
        )

        return result, usage

    # ========================================================
    # IMPLEMENTATION RETRY
    # ========================================================

    async def _implementation_retry(
        self,
        request,
        schema,
        context,
        model,
    ):

        payload = {
            "prompt": request.prompt,
            "quality": request.quality,
            "plan": self._compact_plan(
                context.get("plan")
            ),
            "instruction": (
                "Return ONE complete JSON object. "
                "Implement every actionable file in the plan. "
                "Build the actual user-requested product, not a generic template. "
                "Every file must contain complete source. "
                "Preserve the planned multi-file architecture. "
                "No placeholders, lorem ipsum, TODOs or fake ICOGON branding. "
                "Use realistic prompt-specific content and functional client-side interactions. "
                "No markdown. No explanation."
            ),
            "output_contract": {
                "summary": "string",
                "files": [
                    {
                        "path": "relative/path",
                        "content": "COMPLETE file",
                        "operation": "upsert",
                    }
                ],
            },
        }

        encoded = json.dumps(
            payload,
            ensure_ascii=False,
            separators=(",", ":"),
        )

        system = self._system_prompt(
            "implementation engineer"
        )

        budget = self._output_budget(
            system,
            encoded,
            IMPLEMENTATION_RETRY_OUTPUT_LIMIT,
        )

        retry_model = (
            self.fallback_model
            or model
        )

        response = await self._request(
            model=retry_model,
            system=system,
            encoded=encoded,
            max_tokens=budget,
        )

        if response.status_code >= 400:
            self._raise_http(
                response
            )

        return await self._parse_response(
            response,
            schema,
            retry_model,
        )

    # ========================================================
    # CORE CALL
    # ========================================================

    async def _call(
        self,
        role: str,
        schema: type[BaseModel],
        request,
        **context,
    ):

        if not self.key:

            raise ProviderError(
                "provider_not_configured",
                "Set LLM_API_KEY or GROQ_API_KEY.",
            )

        model = self._model_for_role(
            role
        )

        if not model:

            raise ProviderError(
                "model_not_configured",
                f"No model configured for role: {role}",
            )

        system = self._system_prompt(
            role
        )

        payload = self._payload(
            role=role,
            request=request,
            context=context,
        )

        encoded = json.dumps(
            payload,
            ensure_ascii=False,
            separators=(",", ":"),
        )

        if len(
            encoded.encode()
        ) > MAX_REQUEST_BYTES:

            raise ProviderError(
                "context_too_large",
                (
                    f"{role} request exceeds "
                    f"{MAX_REQUEST_BYTES} bytes."
                ),
                True,
            )

        if role == "planner":

            requested = PLANNER_OUTPUT_LIMIT

        elif role == "quality reviewer":

            requested = QUALITY_OUTPUT_LIMIT

        elif role == "repair engineer":

            requested = REPAIR_OUTPUT_LIMIT

        else:

            requested = min(
                self.max_tokens,
                IMPLEMENTATION_OUTPUT_LIMIT,
            )

        if request.quality == "fast":

            if role == "planner":

                requested = min(
                    requested,
                    2500,
                )

            elif role == "quality reviewer":

                requested = min(
                    requested,
                    650,
                )

            elif role == "repair engineer":

                requested = min(
                    requested,
                    1800,
                )

            else:

                requested = min(
                    requested,
                    4000,
                )

        max_output_tokens = self._output_budget(
            system,
            encoded,
            requested,
        )

        response = await self._request(
            model=model,
            system=system,
            encoded=encoded,
            max_tokens=max_output_tokens,
        )

        if response.status_code >= 400:

            self._raise_http(
                response
            )

        try:

            return await self._parse_response(
                response,
                schema,
                model,
                normalize_plan=(
                    role == "planner"
                ),
            )


        except ProviderError:

            raise


        except ValidationError as exc:

            message = _validation_message(
                exc
            )

            if role == "planner":

                return await self._planner_retry(
                    request=request,
                    schema=schema,
                    brief=context.get(
                        "brief"
                    ),
                    architecture=context.get(
                        "architecture"
                    ),
                    error_message=message,
                )

            if role == "quality reviewer":

                return (
                    _quality_review_fallback(
                        schema,
                        message,
                    ),
                    self._empty_usage(
                        model
                    ),
                )

            raise ProviderError(
                "invalid_model_output",
                (
                    "Model returned JSON, but it "
                    f"does not match {schema.__name__}: "
                    f"{message}"
                ),
                False,
            ) from None

        except (
            ValueError,
            KeyError,
            IndexError,
            TypeError,
            json.JSONDecodeError,
        ) as exc:

            message = str(exc)

            if role == "planner":

                return await self._planner_retry(
                    request=request,
                    schema=schema,
                    brief=context.get(
                        "brief"
                    ),
                    architecture=context.get(
                        "architecture"
                    ),
                    error_message=message,
                )

            if role == "implementation engineer":

                if (
                    "Incomplete JSON"
                    in message
                    or "empty content"
                    in message
                    or "malformed JSON"
                    in message
                ):

                    return await self._implementation_retry(
                        request=request,
                        schema=schema,
                        context=context,
                        model=model,
                    )

            if role == "quality reviewer":

                return (
                    _quality_review_fallback(
                        schema,
                        message,
                    ),
                    self._empty_usage(
                        model
                    ),
                )

            raise ProviderError(
                "invalid_model_output",
                (
                    "Model returned an invalid "
                    f"structured response: {message}"
                ),
                False,
            ) from None

        except Exception as exc:

            raise ProviderError(
                "provider_parse_error",
                (
                    "Could not parse model response: "
                    f"{exc}"
                ),
                False,
            ) from None

    # ========================================================
    # PLANNER
    # ========================================================

    async def _planner_retry(self, request, schema, brief, architecture, error_message):
        """Retry planner with an explicit product-specific multi-file contract."""
        payload={
            "prompt":request.prompt,
            "quality":request.quality,
            "brief":_model_dump(brief),
            "architecture":_model_dump(architecture),
            "previous_error":_truncate(error_message,1200),
            "instruction":(
                "Return ONLY one complete valid IntelligentPlan JSON object. No markdown and no explanation. "
                "Infer the actual product from the user prompt. Choose real pages or major views, reusable components, "
                "feature modules, interactions and content structure for that product. "
                "For a non-trivial React website, file_plan MUST be a real multi-file application plan, never a single App.tsx demo. "
                "Always include the React foundation plus product-specific files genuinely needed by the prompt. "
                "Do not invent generic SaaS sections unless requested. Every requested feature must map to concrete files and a task. "
                "Every actionable file must be owned by a task. file_plan actions: preserve, read, modify, create, delete. "
                "target_files, depends_on, pages, interactions, acceptance_criteria and limitations must be arrays of strings. "
                "design_tokens must be an object. Close all JSON objects and arrays."
            ),
            "required_shape":{
                "blueprint":{
                    "project_type":"product-specific web application",
                    "template":"react",
                    "audience":"specific target users",
                    "visual_direction":"visual direction derived from the prompt",
                    "design_tokens":{"primary":"#2563eb","background":"#ffffff","text":"#0f172a","radius":"14px"},
                    "pages":["A real page/view derived from the prompt"],
                    "interactions":["A concrete interaction derived from the prompt"],
                    "acceptance_criteria":["Requested experience is implemented.","Application is responsive and usable."],
                    "limitations":[]
                },
                "file_plan":[
                    {"path":"index.html","action":"create","reason":"Application document entry point."},
                    {"path":"package.json","action":"create","reason":"Dependencies and build scripts."},
                    {"path":"src/main.tsx","action":"create","reason":"React bootstrap."},
                    {"path":"src/App.tsx","action":"create","reason":"Application composition."},
                    {"path":"src/styles.css","action":"create","reason":"Global styling."},
                    {"path":"src/components/ProductSpecificComponent.tsx","action":"create","reason":"A component derived from the requested product."}
                ],
                "tasks":[
                    {"id":"TASK-001","title":"Build application foundation","description":"Create the runnable React foundation.","target_files":["index.html","package.json","src/main.tsx","src/App.tsx","src/styles.css"],"depends_on":[]},
                    {"id":"TASK-002","title":"Implement product experience","description":"Implement product-specific pages, components and interactions.","target_files":["src/components/ProductSpecificComponent.tsx"],"depends_on":["TASK-001"]}
                ]
            }
        }
        encoded=json.dumps(payload,ensure_ascii=False,separators=(",",":"))
        system=self._system_prompt("planner")
        budget=self._output_budget(system,encoded,PLANNER_RETRY_OUTPUT_LIMIT)
        retry_model=self.fallback_model or self.planning_model
        response=await self._request(model=retry_model,system=system,encoded=encoded,max_tokens=budget)
        if response.status_code>=400: self._raise_http(response)
        try:
            return await self._parse_response(response,schema,retry_model,normalize_plan=True)
        except ProviderError:
            raise
        except Exception as exc:
            raise ProviderError("invalid_model_output",f"Planner retry failed: {exc}",False) from None


    # ========================================================
    # PUBLIC: CREATE PLAN
    # ========================================================

    async def create_plan(
        self,
        request,
        brief,
        architecture,
    ) -> PlanResponse:

        result, usage = await self._call(
            "planner",
            IntelligentPlan,
            request,
            brief=brief,
            architecture=architecture,
        )

        if result is None:

            raise ProviderError(
                "planner_empty_result",
                "Planner returned None.",
                False,
            )

        if usage is None:

            usage = self._empty_usage(
                self.planning_model
            )

        return PlanResponse(
            plan=result,
            usage=usage,
        )

    # ========================================================
    # PUBLIC: GENERATE CHANGES
    # ========================================================

    async def generate_changes(
        self,
        request,
        brief,
        architecture,
        plan,
    ) -> ChangeResponse:

        result, usage = await self._call(
            "implementation engineer",
            ChangeSet,
            request,
            brief=brief,
            architecture=architecture,
            plan=plan,
        )

        # ----------------------------------------------------
        # HARD CONTRACT
        # ----------------------------------------------------

        if result is None:

            raise ProviderError(
                "implementation_empty_result",
                (
                    "Implementation model returned no ChangeSet."
                ),
                False,
            )

        if not isinstance(
            result,
            ChangeSet,
        ):

            raise ProviderError(
                "implementation_invalid_result",
                (
                    "Implementation provider returned "
                    f"{type(result).__name__}, expected ChangeSet."
                ),
                False,
            )

        if usage is None:

            usage = self._empty_usage(
                self.model
            )

        response = ChangeResponse(
            changes=result,
            usage=usage,
        )

        # ----------------------------------------------------
        # FINAL GUARANTEE
        # ----------------------------------------------------

        if response is None:

            raise ProviderError(
                "implementation_response_creation_failed",
                "Could not create ChangeResponse.",
                False,
            )

        return response

    # ========================================================
    # PUBLIC: QUALITY REVIEW
    # ========================================================

    async def review_changes(
        self,
        request,
        plan,
        changes,
    ) -> ReviewResponse:

        result, usage = await self._call(
            "quality reviewer",
            ChangeReview,
            request,
            plan=plan,
            changes=changes,
        )

        if result is None:

            result = _quality_review_fallback(
                ChangeReview,
                "Reviewer returned no result.",
            )

        if usage is None:

            usage = self._empty_usage(
                self.review_model
            )

        result.approved = (
            result.approved
            and not any(
                getattr(
                    finding.severity,
                    "value",
                    finding.severity,
                )
                == "blocking"
                for finding in result.findings
            )
        )

        return ReviewResponse(
            review=result,
            usage=usage,
        )

    # ========================================================
    # PUBLIC: REPAIR
    # ========================================================

    async def repair_changes(
        self,
        request,
        brief,
        architecture,
        plan,
        changes,
        feedback,
    ) -> ChangeResponse:

        result, usage = await self._call(
            "repair engineer",
            ChangeSet,
            request,
            brief=brief,
            architecture=architecture,
            plan=plan,
            changes=changes,
            feedback=feedback,
        )

        if result is None:

            raise ProviderError(
                "repair_empty_result",
                "Repair provider returned no ChangeSet.",
                False,
            )

        if not isinstance(
            result,
            ChangeSet,
        ):

            raise ProviderError(
                "repair_invalid_result",
                (
                    "Repair provider returned "
                    f"{type(result).__name__}, expected ChangeSet."
                ),
                False,
            )

        if usage is None:

            usage = self._empty_usage(
                self.model
            )

        return ChangeResponse(
            changes=result,
            usage=usage,
        )


# ============================================================
# PROVIDER SETTINGS
# ============================================================

def provider_settings() -> dict:

    mode = os.getenv(
        "ORCHESTRATOR_PROVIDER",
        "mock",
    ).strip().lower()

    return {
        "provider": mode,

        "configured": (
            mode == "mock"
            or bool(
                os.getenv("LLM_API_KEY")
                or os.getenv("GROQ_API_KEY")
            )
        ),

        "model": (
            os.getenv(
                "LLM_MODEL",
                "openai/gpt-oss-120b",
            )
            if mode != "mock"
            else "deterministic-demo"
        ),

        "planning_model": os.getenv(
            "LLM_PLANNING_MODEL",
            "openai/gpt-oss-20b",
        ),

        "review_model": os.getenv(
            "LLM_REVIEW_MODEL",
            "openai/gpt-oss-20b",
        ),

        "fallback_model": os.getenv(
            "LLM_FALLBACK_MODEL",
            "openai/gpt-oss-20b",
        ),

        "verification": os.getenv(
            "CHANGE_VERIFIER_BACKEND",
            "static",
        ),

        "persistence": os.getenv(
            "ORCHESTRATOR_BACKEND",
            "memory",
        ),

        "templates": [
            "html",
            "react",
            "react-three",
        ],

        "quality_modes": [
            "fast",
            "balanced",
            "polished",
        ],
    }


# ============================================================
# BUILD PROVIDER
# ============================================================

def build_provider():

    settings = provider_settings()

    mode = settings[
        "provider"
    ]

    if mode == "mock":

        return MockAgentProvider()

    if mode not in {
        "groq",
        "compatible",
    }:

        raise RuntimeError(
            "ORCHESTRATOR_PROVIDER must be "
            "mock, groq, or compatible"
        )

    key = (
        os.getenv(
            "LLM_API_KEY"
        )
        or os.getenv(
            "GROQ_API_KEY",
            "",
        )
    )

    if not key:

        raise RuntimeError(
            "LLM_API_KEY or GROQ_API_KEY is required."
        )

    return ModelProvider(
        key=key,

        base_url=os.getenv(
            "LLM_BASE_URL",
            "https://api.groq.com/openai/v1",
        ),

        model=os.getenv(
            "LLM_MODEL",
            "openai/gpt-oss-120b",
        ),

        planning_model=os.getenv(
            "LLM_PLANNING_MODEL",
            "openai/gpt-oss-20b",
        ),

        review_model=os.getenv(
            "LLM_REVIEW_MODEL",
            "openai/gpt-oss-20b",
        ),

        fallback_model=os.getenv(
            "LLM_FALLBACK_MODEL",
            "openai/gpt-oss-20b",
        ),

        timeout=float(
            os.getenv(
                "LLM_TIMEOUT_SECONDS",
                "90",
            )
        ),

        max_tokens=int(
            os.getenv(
                "LLM_MAX_OUTPUT_TOKENS",
                "7000",
            )
        ),

        max_retries=int(
            os.getenv(
                "LLM_MAX_RETRIES",
                "2",
            )
        ),
    )


