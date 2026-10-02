from __future__ import annotations

"""
Deterministic project context, file-plan validation, implementation
contract validation and incremental snapshot assembly.

The model decides what to build.
This module enforces:
- safe workspace paths
- explicit file scope
- protected dependency files
- relevant implementation context
- deterministic snapshot merging
- implementation completeness
"""

from pathlib import PurePosixPath
from typing import Iterable
import hashlib
import re

from app.orchestrator.models import (
    ChangeSet,
    FileChange,
    FilePlanEntry,
    GenerationPlan,
)


# ============================================================================
# PROTECTED FILES
# ============================================================================

ALWAYS_PRESERVE = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lock",
    "bun.lockb",
}


# ============================================================================
# HIGH-VALUE PROJECT CONTEXT
# ============================================================================

CONTEXT_NAMES = {
    "package.json",
    "vite.config.ts",
    "vite.config.js",
    "tsconfig.json",
    "tsconfig.app.json",
    "index.html",
    "src/main.tsx",
    "src/main.jsx",
    "src/main.js",
    "src/App.tsx",
    "src/App.jsx",
    "src/styles.css",
    "src/index.css",
}


# ============================================================================
# ERRORS
# ============================================================================

class ChangeScopeError(ValueError):
    """Raised when generated changes leave the approved scope."""


# ============================================================================
# PATH HELPERS
# ============================================================================

def _path(path: str) -> PurePosixPath:
    return PurePosixPath(
        str(path)
        .replace("\\", "/")
        .strip()
    )


def _is_safe_relative_path(path: str) -> bool:
    """
    Reject:
    - absolute paths
    - empty paths
    - parent traversal
    - Windows drive-style paths
    """
    if not isinstance(path, str):
        return False

    value = path.strip()

    if not value:
        return False

    normalized = value.replace("\\", "/")

    # Unix absolute
    if normalized.startswith("/"):
        return False

    # Windows absolute / drive paths
    if len(normalized) >= 2 and normalized[1] == ":":
        return False

    p = PurePosixPath(normalized)

    if p.is_absolute():
        return False

    if ".." in p.parts:
        return False

    return True


def _normalize_operation(operation: str) -> str:
    value = str(
        operation or ""
    ).strip().lower()

    if value in {
        "upsert",
        "update",
        "create",
        "modify",
    }:
        return "upsert"

    return value


def _change_content(file: FileChange) -> str:
    value = getattr(
        file,
        "content",
        "",
    )

    if isinstance(value, str):
        return value

    return str(value or "")


# ============================================================================
# HASHING / MANIFEST
# ============================================================================

def content_hash(content: str) -> str:
    return hashlib.sha256(
        content.encode("utf-8")
    ).hexdigest()


def _is_binary_asset(path: str) -> bool:
    suffix = _path(path).suffix.lower()

    return suffix in {
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".avif",
        ".ico",
        ".pdf",
        ".zip",
        ".woff",
        ".woff2",
        ".ttf",
        ".otf",
        ".mp3",
        ".mp4",
        ".mov",
        ".webm",
        ".glb",
        ".gltf",
    }


def file_manifest(
    files: Iterable[FileChange],
) -> list[dict[str, object]]:
    """
    Create a deterministic content-addressed manifest.

    `stable=True` means the file is protected from automatic replacement.
    """

    result: list[dict[str, object]] = []

    for file in sorted(
        files,
        key=lambda item: item.path,
    ):
        if file.operation != "upsert":
            continue

        path = file.path
        content = _change_content(file)

        result.append(
            {
                "path": path,
                "operation": file.operation,
                "bytes": len(
                    content.encode("utf-8")
                ),
                "sha256": content_hash(content),
                "stable": (
                    path in ALWAYS_PRESERVE
                    or _is_binary_asset(path)
                ),
            }
        )

    return result


# ============================================================================
# PLAN HELPERS
# ============================================================================

def _plan_map(
    plan: GenerationPlan,
) -> dict[str, FilePlanEntry]:
    result: dict[str, FilePlanEntry] = {}

    for entry in plan.file_plan:
        path = entry.path.strip()

        if not path:
            continue

        result[path] = entry

    return result


def _actionable_entries(
    plan: GenerationPlan,
) -> dict[str, FilePlanEntry]:
    return {
        path: entry
        for path, entry in _plan_map(plan).items()
        if entry.action in {
            "create",
            "modify",
            "delete",
        }
    }


# ============================================================================
# FILE PLAN VALIDATION
# ============================================================================

def validate_file_plan(
    file_plan: list[FilePlanEntry],
    context_paths: set[str] | None = None,
) -> None:
    """
    Validate the planner's file manifest.

    Rules:
    - every path must remain inside the project workspace
    - paths must be unique
    - existing files cannot be created again
    - missing files cannot be modified/deleted/read/preserved
    - dependency lockfiles can only be preserved
    """

    existing_paths = set(
        context_paths or set()
    )

    seen: set[str] = set()

    for entry in file_plan:
        path = entry.path.strip()

        # ---------------------------------------------------------------
        # Safe workspace path
        # ---------------------------------------------------------------

        if not _is_safe_relative_path(path):
            raise ValueError(
                f"Invalid planned path: {path}"
            )

        # ---------------------------------------------------------------
        # Duplicate paths
        # ---------------------------------------------------------------

        if path in seen:
            raise ValueError(
                f"Duplicate planned path: {path}"
            )

        seen.add(path)

        # ---------------------------------------------------------------
        # Action
        # ---------------------------------------------------------------

        action = str(
            entry.action
        ).strip().lower()

        if action not in {
            "preserve",
            "read",
            "modify",
            "create",
            "delete",
        }:
            raise ValueError(
                f"Unsupported file-plan action "
                f"for {path}: {entry.action}"
            )

        # ---------------------------------------------------------------
        # Protected dependency files
        # ---------------------------------------------------------------

        if path in ALWAYS_PRESERVE:
            if action != "preserve":
                raise ValueError(
                    f"Dependency lockfile must be preserved: {path}"
                )

            # A protected lockfile also has to exist when the planner
            # says preserve.
            if path not in existing_paths:
                raise ValueError(
                    f"Cannot preserve missing lockfile: {path}"
                )

            continue

        # ---------------------------------------------------------------
        # Existing / missing file semantics
        # ---------------------------------------------------------------

        exists = path in existing_paths

        if action in {
            "modify",
            "delete",
            "read",
            "preserve",
        } and not exists:
            raise ValueError(
                f"Cannot {action} missing file: {path}"
            )

        if action == "create" and exists:
            raise ValueError(
                f"Cannot create existing file: {path}"
            )


# ============================================================================
# IMPLEMENTATION CONTRACT
# ============================================================================

def validate_implementation_contract(
    plan: GenerationPlan,
    changes: ChangeSet,
    *,
    context_files: list[FileChange] | None = None,
    require_complete: bool = True,
) -> list[str]:
    """
    Validate implementation output against the approved file plan.

    Returns issues instead of raising so the orchestrator can route the
    failure into the repair loop.

    When ``require_complete=True``, ``changes`` represents the complete
    assembled project snapshot. Existing context files that are preserved
    or otherwise reused are therefore valid members of that snapshot.

    When ``require_complete=False``, ``changes`` represents an
    implementation/repair delta. In that mode preserved/protected files
    must never be returned as modifications.
    """

    issues: list[str] = []

    if changes is None:
        return ["Implementation returned no change set."]

    context_files = context_files or []

    context_paths = {
        file.path
        for file in context_files
        if file.operation == "upsert"
    }

    try:
        validate_file_plan(
            plan.file_plan,
            context_paths,
        )
    except Exception as exc:
        issues.append(str(exc))
        return issues

    planned = _plan_map(plan)
    actionable = _actionable_entries(plan)

    seen: set[str] = set()

    for change in changes.files:
        path = str(change.path).strip()

        # ---------------------------------------------------------------
        # Safe path
        # ---------------------------------------------------------------

        if not _is_safe_relative_path(path):
            issues.append(
                f"Unsafe implementation path: {path}"
            )
            continue

        # ---------------------------------------------------------------
        # Duplicate
        # ---------------------------------------------------------------

        if path in seen:
            issues.append(
                f"Duplicate implementation path: {path}"
            )
            continue

        seen.add(path)

        # ---------------------------------------------------------------
        # Protected files
        #
        # A complete assembled snapshot may legitimately contain an
        # existing protected/context file because it was reused byte-for-
        # byte. A delta may never return that file as a change.
        # ---------------------------------------------------------------

        if path in ALWAYS_PRESERVE:
            if require_complete and path in context_paths:
                continue

            issues.append(
                f"Protected file cannot be changed: {path}"
            )
            continue

        # ---------------------------------------------------------------
        # Must exist in plan
        # ---------------------------------------------------------------

        if path not in planned:
            # Existing context files may appear in a complete snapshot
            # even when they are not actionable implementation targets.
            if require_complete and path in context_paths:
                continue

            issues.append(
                f"Out-of-scope file returned by implementation: {path}"
            )
            continue

        entry = planned[path]

        planned_action = str(entry.action)

        # ---------------------------------------------------------------
        # Preserve
        # ---------------------------------------------------------------

        if planned_action == "preserve":
            if require_complete and path in context_paths:
                continue

            issues.append(
                f"Preserved file was returned as a change: {path}"
            )
            continue

        # ---------------------------------------------------------------
        # Read-only
        # ---------------------------------------------------------------

        if planned_action == "read":
            if require_complete and path in context_paths:
                continue

            issues.append(
                f"Read-only file was returned as a change: {path}"
            )
            continue

        # ---------------------------------------------------------------
        # Delete
        # ---------------------------------------------------------------

        if planned_action == "delete":
            if change.operation != "delete":
                issues.append(
                    f"Planned delete must use delete operation: {path}"
                )
            continue

        # ---------------------------------------------------------------
        # Create / modify
        # ---------------------------------------------------------------

        if planned_action in {"create", "modify"}:
            if change.operation == "delete":
                issues.append(
                    f"Planned {planned_action} file cannot be deleted: {path}"
                )
                continue

            if planned_action == "create" and path in context_paths:
                issues.append(
                    f"Create action targets an existing context file: {path}"
                )
                continue

            continue

        # ---------------------------------------------------------------
        # Unknown action
        # ---------------------------------------------------------------

        issues.append(
            f"Unsupported file plan action for {path}: {planned_action}"
        )

    # -------------------------------------------------------------------
    # Complete snapshot validation
    # -------------------------------------------------------------------

    if require_complete:
        returned_paths = {
            str(change.path).strip()
            for change in changes.files
        }

        for path, entry in planned.items():
            action = str(entry.action)

            if action in {"create", "modify"}:
                if path not in returned_paths:
                    issues.append(
                        f"Planned file missing from implementation output: {path}"
                    )

            elif action == "delete":
                if path in returned_paths:
                    delete_change = next(
                        (
                            change
                            for change in changes.files
                            if str(change.path).strip() == path
                        ),
                        None,
                    )

                    if (
                        delete_change is None
                        or delete_change.operation != "delete"
                    ):
                        issues.append(
                            f"Planned deleted file still exists in output: {path}"
                        )

            elif action in {"preserve", "read"}:
                # Existing context files are expected to remain in the
                # complete assembled snapshot.
                if path in context_paths and path not in returned_paths:
                    issues.append(
                        f"Preserved context file missing from snapshot: {path}"
                    )

    return issues


# ============================================================================
# IMPLEMENTATION CONTEXT
# ============================================================================

def implementation_context(
    context_files: list[FileChange],
    plan: GenerationPlan,
    *,
    max_files: int = 40,
    max_chars_per_file: int = 12_000,
) -> list[FileChange]:
    """
    Select only relevant implementation context.

    Important:
    - lockfiles are NOT sent to implementation context
    - explicitly preserved unrelated files are NOT sent
    - files directly being modified/read/deleted are sent
    - core project files are sent when useful
    """

    if not context_files:
        return []

    planned = {
        entry.path: entry
        for entry in plan.file_plan
    }

    ranked: list[
        tuple[int, FileChange]
    ] = []

    for file in context_files:
        path = file.path

        # ---------------------------------------------------------------
        # Never send protected lockfiles to the implementation agent.
        # ---------------------------------------------------------------

        if path in ALWAYS_PRESERVE:
            continue

        entry = planned.get(path)

        # ---------------------------------------------------------------
        # Explicitly preserved files are not implementation context.
        # ---------------------------------------------------------------

        if entry is not None:
            if entry.action == "preserve":
                continue

            if entry.action == "read":
                rank = 1

            elif entry.action in {
                "modify",
                "delete",
            }:
                rank = 0

            else:
                rank = 3

        # ---------------------------------------------------------------
        # Core project files
        # ---------------------------------------------------------------

        elif path in CONTEXT_NAMES:
            rank = 2

        # ---------------------------------------------------------------
        # Other source files are lower priority and are not automatically
        # included unless needed by the plan.
        # ---------------------------------------------------------------

        else:
            continue

        ranked.append(
            (
                rank,
                file,
            )
        )

    ranked.sort(
        key=lambda item: (
            item[0],
            item[1].path,
        )
    )

    result: list[FileChange] = []

    for _, file in ranked[:max_files]:
        content = _change_content(file)

        if len(content) > max_chars_per_file:
            content = (
                content[:max_chars_per_file]
                + "\n\n"
                "/* [ICOGON CONTEXT TRUNCATED] */\n"
            )

        result.append(
            file.model_copy(
                update={
                    "content": content
                }
            )
        )

    return result


# ============================================================================
# SNAPSHOT ASSEMBLY
# ============================================================================

def assemble_snapshot(
    context_files: list[FileChange],
    generated: ChangeSet,
    plan: GenerationPlan,
) -> tuple[
    ChangeSet,
    dict[str, object],
]:
    """
    Merge generated changes into the existing project snapshot.

    Untouched files are preserved byte-for-byte.
    """

    planned = _plan_map(plan)

    context_by_path = {
        file.path: file.model_copy(
            deep=True
        )
        for file in context_files
        if file.operation == "upsert"
    }

    files_by_path = dict(
        context_by_path
    )

    generated_paths: set[str] = set()

    for change in generated.files:
        path = change.path

        generated_paths.add(path)

        entry = planned.get(path)

        if entry is None:
            raise ChangeScopeError(
                f"Cannot assemble out-of-scope generated file: {path}"
            )

        action = str(
            entry.action
        ).lower()

        operation = _normalize_operation(
            getattr(
                change,
                "operation",
                "",
            )
        )

        # ---------------------------------------------------------------
        # Protected files
        # ---------------------------------------------------------------

        if path in ALWAYS_PRESERVE:
            raise ChangeScopeError(
                f"Protected file cannot be changed: {path}"
            )

        # ---------------------------------------------------------------
        # Delete
        # ---------------------------------------------------------------

        if action == "delete":
            if operation != "delete":
                raise ChangeScopeError(
                    f"Planned delete must use delete operation: {path}"
                )

            files_by_path.pop(
                path,
                None,
            )

            continue

        if operation == "delete":
            raise ChangeScopeError(
                f"Delete operation was not approved for {path}"
            )

        # ---------------------------------------------------------------
        # Create / modify
        # ---------------------------------------------------------------

        if action not in {
            "create",
            "modify",
        }:
            raise ChangeScopeError(
                f"File {path} is not mutable: {action}"
            )

        files_by_path[path] = change.model_copy(
            update={
                "operation": "upsert"
            }
        )

    # -------------------------------------------------------------------
    # Explicitly preserved files remain untouched.
    # -------------------------------------------------------------------

    for path, entry in planned.items():
        if entry.action == "preserve":
            if path in context_by_path:
                files_by_path[path] = (
                    context_by_path[path]
                )

    ordered_paths = sorted(
        files_by_path
    )

    merged_files = [
        files_by_path[path]
        for path in ordered_paths
    ]

    result = generated.model_copy(
        update={
            "files": merged_files
        }
    )

    reused_paths = [
        path
        for path in context_by_path
        if path not in generated_paths
    ]

    return (
        result,
        {
            "generated": len(
                generated_paths
            ),
            "reused": len(
                reused_paths
            ),
            "reused_paths": sorted(
                reused_paths
            ),
            "total_files": len(
                merged_files
            ),
        },
    )


# ============================================================================
# IMPLEMENTATION SCOPE
# ============================================================================

def implementation_scope(
    plan: GenerationPlan,
) -> set[str]:
    return {
        path
        for path, entry in _plan_map(plan).items()
        if entry.action in {
            "create",
            "modify",
            "delete",
        }
    }


def preserve_paths(
    plan: GenerationPlan,
    context_files: list[FileChange] | None = None,
) -> set[str]:
    """
    Return all paths that must remain untouched.
    """

    result = set(
        ALWAYS_PRESERVE
    )

    for entry in plan.file_plan:
        if entry.action == "preserve":
            result.add(
                entry.path
            )

    for file in context_files or []:
        if file.path in ALWAYS_PRESERVE:
            result.add(
                file.path
            )

    return result


def changed_paths(
    changes: ChangeSet,
) -> set[str]:
    return {
        file.path
        for file in changes.files
    }


# ============================================================================
# CONTENT VALIDATION
# ============================================================================

def validate_file_contents(
    changes: ChangeSet,
) -> list[str]:
    """
    Lightweight deterministic content checks.

    Docker/build verification remains authoritative for syntax and
    dependency correctness.
    """

    issues: list[str] = []

    for file in changes.files:
        path = file.path
        operation = getattr(
            file,
            "operation",
            "",
        )

        if operation == "delete":
            continue

        content = _change_content(file)

        if not content.strip():
            issues.append(
                f"Empty file content: {path}"
            )

        if "```" in content:
            issues.append(
                "Markdown code fences detected "
                f"in generated source: {path}"
            )

        if not _is_binary_asset(path):
            if re.search(
                r"(?im)^\s*"
                r"(here(?:'s| is)|sure|explanation:)"
                r"\s*",
                content,
            ):
                issues.append(
                    "Natural-language preamble detected "
                    f"in source: {path}"
                )

    return issues