from __future__ import annotations

import asyncio
import json
import shutil
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

from app.orchestrator.models import ChangeSet, FileChange
from app.sandbox.models import ResourceLimits
from app.sandbox.ports import PortAllocator
from app.sandbox.preview_runtime import (
    DockerPreviewRuntime,
    PreviewRuntimeConfig,
)
from app.sandbox.workspace import EmptyWorkspaceProvider


def make_preview_project() -> ChangeSet:
    return ChangeSet(
        summary="Docker live preview smoke test",
        files=[
            FileChange(
                path="package.json",
                operation="upsert",
                content=json.dumps(
                    {
                        "name": "icogon-preview-smoke",
                        "private": True,
                        "version": "1.0.0",
                        "scripts": {
                            "dev": "vite",
                        },
                        "dependencies": {
                            "vite": "6.1.0",
                        },
                    }
                ),
            ),
            FileChange(
                path="index.html",
                operation="upsert",
                content="""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ICOGON Preview Smoke</title>
</head>
<body>
  <div id="app">
    <h1>ICOGON LIVE PREVIEW</h1>
    <p>Docker preview is working.</p>
  </div>
</body>
</html>
""",
            ),
        ],
    )


async def wait_for_docker() -> None:
    process = await asyncio.create_subprocess_exec(
        "docker",
        "info",
        stdout=asyncio.subprocess.DEVNULL,
        stderr=asyncio.subprocess.DEVNULL,
    )

    return_code = await process.wait()

    if return_code != 0:
        raise RuntimeError(
            "Docker Desktop is not running or Docker is unavailable."
        )


def fetch_preview(url: str) -> tuple[int, str]:
    request = urllib.request.Request(
        url,
        method="GET",
        headers={
            "User-Agent": "ICOGON-Docker-Preview-Smoke",
        },
    )

    with urllib.request.urlopen(
        request,
        timeout=10,
    ) as response:
        body = response.read(200_000).decode(
            "utf-8",
            errors="replace",
        )

        return response.status, body


async def main() -> None:
    print("Checking Docker...")
    await wait_for_docker()
    print("Docker: OK")

    project = make_preview_project()

    config = PreviewRuntimeConfig(
        image="node:22-alpine",
        network="bridge",
        command=(
            "npm",
            "run",
            "dev",
            "--",
            "--host",
            "0.0.0.0",
        ),
        working_directory="/workspace",
        start_port=5173,
        end_port=5273,
        startup_timeout_seconds=45,
        healthcheck_timeout_seconds=5,
    )

    limits = ResourceLimits(
        cpus=1.0,
        memory_mb=2048,
        pids=256,
        timeout_seconds=180,
        output_bytes=2_000_000,
    )

    runtime = DockerPreviewRuntime(
        workspace_provider=EmptyWorkspaceProvider(),
        config=config,
        port_allocator=PortAllocator(
            start_port=5173,
            end_port=5273,
        ),
        limits=limits,
    )

    preview = None

    try:
        print("Starting Docker preview...")

        preview = await runtime.start(
            project_id="docker-preview-smoke",
            changes=project,
        )

        print(f"Preview ID: {preview.preview_id}")
        print(f"Container:  {preview.container_name}")
        print(f"Port:       {preview.port}")
        print(f"URL:        {preview.url}")

        status, body = fetch_preview(preview.url)

        print(f"HTTP status: {status}")
        print(f"Response bytes: {len(body.encode('utf-8'))}")

        if status != 200:
            raise RuntimeError(
                f"Expected HTTP 200, received {status}"
            )

        if "ICOGON LIVE PREVIEW" not in body:
            raise RuntimeError(
                "Preview response does not contain expected content."
            )

        print("HTTP CONTENT: OK")
        print("DOCKER LIVE PREVIEW SUCCESS")

    finally:
        if preview is not None:
            print("Stopping preview...")
            await runtime.stop(preview.preview_id)
            print("Preview stopped.")

        await runtime.stop_all()


if __name__ == "__main__":
    asyncio.run(main())