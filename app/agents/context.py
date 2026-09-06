"""Content-addressed project context and deterministic incremental change assembly."""

from __future__ import annotations

import hashlib
from pathlib import PurePosixPath

from app.orchestrator.models import ChangeSet, FileChange, FilePlanEntry, GenerationPlan

ALWAYS_PRESERVE = {
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lock",
    "bun.lockb",
}
CONTEXT_NAMES = {
    "package.json",
    "src/styles.css",
    "src/index.css",
    "src/main.tsx",
    "src/main.jsx",
    "src/main.js",
    "index.html",
}


class ChangeScopeError(ValueError):
    pass


def content_hash(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()


def file_manifest(files: list[FileChange]) -> list[dict]:
    return [
        {
            "path": file.path,
            "sha256": content_hash(file.content),
            "bytes": len(file.content.encode()),
            "stable": file.path in ALWAYS_PRESERVE or _is_binary_asset(file.path),
        }
        for file in sorted(files, key=lambda item: item.path)
        if file.operation == "upsert"
    ]


def implementation_context(
    files: list[FileChange], plan: GenerationPlan
) -> list[FileChange]:
    """Send only files the plan says must be read or changed, plus core entry/theme files."""
    selected = {
        entry.path
        for entry in plan.file_plan
        if entry.action in {"read", "modify", "delete"}
    }
    selected.update(
        path for path in CONTEXT_NAMES if any(f.path == path for f in files)
    )
    return [
        file for file in files if file.path in selected and file.operation == "upsert"
    ]


def assemble_snapshot(
    base_files: list[FileChange],
    delta: ChangeSet,
    plan: GenerationPlan,
    original_paths: set[str] | None = None,
) -> tuple[ChangeSet, dict]:
    """Apply a scoped delta while preserving every untouched base file byte-for-byte."""
    baseline = {file.path: file for file in base_files if file.operation == "upsert"}
    allowed = {
        entry.path: entry.action
        for entry in plan.file_plan
        if entry.action in {"create", "modify", "delete"}
    }
    if baseline and not allowed and delta.files:
        raise ChangeScopeError("Incremental plans must declare every changed file")
    seen: set[str] = set()
    for change in delta.files:
        if change.path in seen:
            raise ChangeScopeError(f"Duplicate generated path: {change.path}")
        seen.add(change.path)
        expected = allowed.get(change.path)
        existed_before_run = change.path in (
            original_paths if original_paths is not None else baseline
        )
        actual = (
            "delete"
            if change.operation == "delete"
            else ("modify" if existed_before_run else "create")
        )
        if baseline and expected != actual:
            raise ChangeScopeError(
                f"Out-of-scope change {change.path}: planned {expected or 'preserve'}, received {actual}"
            )
        if change.path in ALWAYS_PRESERVE:
            raise ChangeScopeError(
                f"Lockfile is preserved by the orchestrator: {change.path}"
            )
        if change.operation == "delete":
            baseline.pop(change.path, None)
        else:
            baseline[change.path] = change.model_copy(update={"operation": "upsert"})
    if not base_files:
        baseline = {
            change.path: change.model_copy(update={"operation": "upsert"})
            for change in delta.files
            if change.operation == "upsert"
        }
    reused = [
        path
        for path, file in baseline.items()
        if path not in seen and file in base_files
    ]
    return (
        ChangeSet(summary=delta.summary, files=list(baseline.values())),
        {
            "generated": len(delta.files),
            "reused": len(reused),
            "reused_paths": sorted(reused),
        },
    )


def validate_file_plan(entries: list[FilePlanEntry], existing_paths: set[str]) -> None:
    seen: set[str] = set()
    for entry in entries:
        if entry.path in seen:
            raise ValueError("File plan paths must be unique")
        seen.add(entry.path)
        if entry.path in ALWAYS_PRESERVE and entry.action != "preserve":
            raise ValueError("Dependency lockfiles must be preserved")
        exists = entry.path in existing_paths
        if entry.action in {"modify", "delete", "read", "preserve"} and not exists:
            raise ValueError(f"Cannot {entry.action} missing file: {entry.path}")
        if entry.action == "create" and exists:
            raise ValueError(f"Cannot create existing file: {entry.path}")


def _is_binary_asset(path: str) -> bool:
    return PurePosixPath(path).suffix.lower() in {
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".avif",
        ".ico",
        ".woff",
        ".woff2",
        ".mp3",
        ".mp4",
        ".glb",
        ".gltf",
    }
