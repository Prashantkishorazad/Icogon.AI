from __future__ import annotations

import os
import re
import shutil
import stat
from contextlib import AbstractContextManager
from pathlib import Path, PurePosixPath
from tempfile import TemporaryDirectory
from typing import ClassVar, Protocol

from app.orchestrator.models import ChangeSet


class WorkspaceProvider(Protocol):
    def materialize(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> AbstractContextManager[Path]: ...


class EmptyWorkspaceProvider:
    def materialize(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> AbstractContextManager[Path]:
        return MaterializedChangeSet(changes)


class DirectoryWorkspaceProvider:
    _project_id_pattern = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$")

    def __init__(
        self,
        projects_root: Path,
        max_snapshot_files: int = 10_000,
        max_snapshot_bytes: int = 100_000_000,
    ) -> None:
        self._projects_root = projects_root.resolve(strict=True)
        if not self._projects_root.is_dir():
            raise ValueError("Projects root must be a directory")
        self._max_snapshot_files = max_snapshot_files
        self._max_snapshot_bytes = max_snapshot_bytes

    def materialize(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> AbstractContextManager[Path]:
        if not self._project_id_pattern.fullmatch(project_id):
            raise ValueError("Project ID contains unsupported characters")
        candidate = self._projects_root / project_id
        if candidate.is_symlink():
            raise ValueError("Project workspace cannot be a symbolic link")
        source = candidate.resolve(strict=True)
        if not source.is_relative_to(self._projects_root) or not source.is_dir():
            raise ValueError("Project workspace is outside the configured root")
        return MaterializedChangeSet(
            changes,
            source=source,
            max_snapshot_files=self._max_snapshot_files,
            max_snapshot_bytes=self._max_snapshot_bytes,
        )


class MaterializedChangeSet:
    _excluded_directories: ClassVar[set[str]] = {
        ".git",
        ".next",
        ".venv",
        "__pycache__",
        "build",
        "dist",
        "node_modules",
    }
    _excluded_files: ClassVar[set[str]] = {
        ".git",
        ".env",
        ".env.local",
        ".envrc",
        ".npmrc",
        ".pypirc",
        "credentials.json",
        "id_ed25519",
        "id_rsa",
    }

    def __init__(
        self,
        changes: ChangeSet,
        source: Path | None = None,
        max_change_bytes: int = 10_000_000,
        max_snapshot_files: int = 10_000,
        max_snapshot_bytes: int = 100_000_000,
    ) -> None:
        self._changes = changes
        self._source = source
        self._max_change_bytes = max_change_bytes
        self._max_snapshot_files = max_snapshot_files
        self._max_snapshot_bytes = max_snapshot_bytes
        self._temporary_directory: TemporaryDirectory[str] | None = None

    def __enter__(self) -> Path:
        self._temporary_directory = TemporaryDirectory(prefix="icogon-sandbox-")
        root = Path(self._temporary_directory.name).resolve()
        try:
            if self._source is not None:
                self._copy_snapshot(self._source, root)
            self._apply_changes(root)
        except Exception:
            self._temporary_directory.cleanup()
            self._temporary_directory = None
            raise
        return root

    def __exit__(self, *args: object) -> None:
        if self._temporary_directory is not None:
            self._temporary_directory.cleanup()

    def _copy_snapshot(self, source: Path, root: Path) -> None:
        file_count = 0
        total_bytes = 0
        for current, directories, files in os.walk(source, topdown=True):
            current_path = Path(current)
            for directory in directories:
                if (current_path / directory).is_symlink():
                    raise ValueError("Project snapshots cannot contain symbolic links")
            directories[:] = [
                name for name in directories if name not in self._excluded_directories
            ]
            for filename in files:
                candidate = current_path / filename
                if candidate.is_symlink():
                    raise ValueError("Project snapshots cannot contain symbolic links")
                if self._is_excluded_file(filename):
                    continue
                metadata = candidate.stat()
                if not stat.S_ISREG(metadata.st_mode):
                    raise ValueError("Project snapshots can contain regular files only")
                file_count += 1
                total_bytes += metadata.st_size
                if file_count > self._max_snapshot_files:
                    raise ValueError("Project snapshot exceeds the file-count limit")
                if total_bytes > self._max_snapshot_bytes:
                    raise ValueError("Project snapshot exceeds the size limit")

        shutil.copytree(
            source,
            root,
            dirs_exist_ok=True,
            ignore=self._ignored_names,
        )

    def _apply_changes(self, root: Path) -> None:
        total_bytes = 0
        for change in self._changes.files:
            relative = self._safe_relative_path(change.path)
            if self._targets_excluded_path(relative):
                raise ValueError(f"Change targets a protected path: {change.path}")
            destination = (root / relative).resolve()
            if not destination.is_relative_to(root):
                raise ValueError(f"Change path escapes the workspace: {change.path}")
            if change.operation == "delete":
                if destination.is_dir():
                    raise ValueError("Directory deletion is not supported")
                destination.unlink(missing_ok=True)
                continue

            encoded = change.content.encode("utf-8")
            total_bytes += len(encoded)
            if total_bytes > self._max_change_bytes:
                raise ValueError("Change set exceeds the materialization size limit")
            if destination.is_dir():
                raise ValueError("A generated file cannot replace a directory")
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(encoded)

    def _ignored_names(self, _: str, names: list[str]) -> set[str]:
        return {
            name
            for name in names
            if name in self._excluded_directories or self._is_excluded_file(name)
        }

    def _targets_excluded_path(self, path: Path) -> bool:
        return any(
            part in self._excluded_directories for part in path.parts[:-1]
        ) or self._is_excluded_file(path.name)

    def _is_excluded_file(self, name: str) -> bool:
        return name in self._excluded_files or (
            name.startswith(".env.") and name != ".env.example"
        )

    @staticmethod
    def _safe_relative_path(path: str) -> Path:
        if not path or "\\" in path or "\x00" in path:
            raise ValueError(f"Invalid project-relative path: {path}")
        candidate = PurePosixPath(path)
        if (
            candidate.is_absolute()
            or candidate.parts in {(), (".",)}
            or ".." in candidate.parts
            or ":" in candidate.parts[0]
        ):
            raise ValueError(f"Invalid project-relative path: {path}")
        return Path(*candidate.parts)
