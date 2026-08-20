from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory

from app.orchestrator.models import ChangeSet


class MaterializedChangeSet:
    def __init__(self, changes: ChangeSet, max_total_bytes: int = 10_000_000) -> None:
        self._changes = changes
        self._max_total_bytes = max_total_bytes
        self._temporary_directory: TemporaryDirectory[str] | None = None

    def __enter__(self) -> Path:
        self._temporary_directory = TemporaryDirectory(prefix="icogon-sandbox-")
        root = Path(self._temporary_directory.name).resolve()
        try:
            total_bytes = 0
            for change in self._changes.files:
                if change.operation == "delete":
                    continue
                destination = (root / change.path).resolve()
                if not destination.is_relative_to(root):
                    raise ValueError(
                        f"Change path escapes the workspace: {change.path}"
                    )
                encoded = change.content.encode("utf-8")
                total_bytes += len(encoded)
                if total_bytes > self._max_total_bytes:
                    raise ValueError(
                        "Change set exceeds the materialization size limit"
                    )
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(encoded)
        except Exception:
            self._temporary_directory.cleanup()
            self._temporary_directory = None
            raise
        return root

    def __exit__(self, *args: object) -> None:
        if self._temporary_directory is not None:
            self._temporary_directory.cleanup()
