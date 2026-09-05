"""Compile a virtual source snapshot; never run generated server code or npm scripts."""

import asyncio
import hashlib
import json
import os
import shutil
from collections import OrderedDict
from pathlib import Path

from app.orchestrator.mock import StaticChangeVerifier
from app.orchestrator.models import ChangeSet, VerificationResult

COMPILER = (
    Path(__file__).resolve().parents[2] / "icogon-frontend/scripts/compile-preview.mjs"
)
_cache: OrderedDict[str, dict] = OrderedDict()
_slots = asyncio.Semaphore(2)


class PreviewError(RuntimeError):
    pass


async def compile_preview(changes: ChangeSet) -> dict:
    policy = await StaticChangeVerifier().verify("preview", changes)
    if not policy.passed:
        raise PreviewError("Invalid source paths")
    payload = changes.model_dump_json().encode()
    if len(payload) > 1_000_000 or len(changes.files) > 100:
        raise PreviewError("Preview supports at most 100 files and 1 MB of source")
    paths = {f.path for f in changes.files if f.operation == "upsert"}
    if not paths.intersection({"src/main.tsx", "src/main.jsx", "src/main.js"}):
        html = next(
            (
                f.content
                for f in changes.files
                if f.path == "index.html" and f.operation == "upsert"
            ),
            None,
        )
        if html is None:
            raise PreviewError("Preview needs index.html or src/main.tsx")
        return {"html": html, "warnings": [], "compiler": "html"}
    key = hashlib.sha256(payload).hexdigest()
    async with _slots:
        if key in _cache:
            _cache.move_to_end(key)
            return _cache[key]
        node = shutil.which("node")
        if not node:
            raise PreviewError(
                "Install Node.js and run npm ci in icogon-frontend to enable React previews"
            )
        # Do not pass model, database or other application secrets to the compiler.
        environment = {
            k: v
            for k, v in os.environ.items()
            if k.upper() in {"PATH", "SYSTEMROOT", "WINDIR", "TEMP", "TMP"}
        }
        process = await asyncio.create_subprocess_exec(
            node,
            "--max-old-space-size=256",
            str(COMPILER),
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=environment,
        )
        try:
            stdout, _ = await asyncio.wait_for(process.communicate(payload), timeout=20)
        except (TimeoutError, asyncio.CancelledError) as exc:
            if process.returncode is None:
                process.kill()
            await process.communicate()
            if isinstance(exc, asyncio.CancelledError):
                raise
            raise PreviewError(
                "Preview compilation was interrupted or exceeded 20 seconds"
            ) from None
        try:
            result = json.loads(stdout)
        except (ValueError, UnicodeDecodeError):
            raise PreviewError(
                "Preview compiler unavailable. Run npm ci in icogon-frontend."
            ) from None
        if process.returncode or "errors" in result:
            raise PreviewError("\n".join(result.get("errors", ["Compilation failed"])))
        result["compiler"] = "esbuild"
        _cache[key] = result
        while len(_cache) > 4:
            _cache.popitem(last=False)
        return result


class PreviewBuildVerifier:
    def __init__(self, delegate):
        self.delegate = delegate

    async def verify(self, project_id: str, changes: ChangeSet) -> VerificationResult:
        result = await self.delegate.verify(project_id, changes)
        if not result.passed:
            return result
        if any(
            f.path in {"src/main.tsx", "src/main.jsx", "src/main.js"}
            for f in changes.files
        ):
            try:
                await compile_preview(changes)
                result.checks["preview_bundle"] = True
            except PreviewError as exc:
                result.passed = False
                result.checks["preview_bundle"] = False
                result.feedback.append(str(exc))
        return result
