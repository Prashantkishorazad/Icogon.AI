from __future__ import annotations

import asyncio
from pathlib import Path
from time import monotonic
from uuid import uuid4

from app.sandbox.models import ResourceLimits, SandboxCommand, SandboxResult


class DockerSandbox:
    def __init__(
        self,
        image: str,
        executable: str = "docker",
        network: str = "none",
    ) -> None:
        if not image.strip():
            raise ValueError("A sandbox image is required")
        if not network.strip():
            raise ValueError("A sandbox network is required")

        self._image = image
        self._executable = executable
        self._network = network.strip()

    def build_argv(
        self,
        workspace: Path,
        command: SandboxCommand,
        limits: ResourceLimits,
        container_name: str | None = None,
    ) -> list[str]:
        root = workspace.resolve(strict=True)
        name = container_name or f"icogon-{uuid4().hex}"
        tmpfs_mb = max(16, min(256, limits.memory_mb // 2))
        return [
            self._executable,
            "run",
            "--rm",
            "--name",
            name,
            "--network",
            self._network,
            "--read-only",
            "--cap-drop",
            "ALL",
            "--security-opt",
            "no-new-privileges",
            "--pids-limit",
            str(limits.pids),
            "--memory",
            f"{limits.memory_mb}m",
            "--cpus",
            str(limits.cpus),
            "--tmpfs",
            f"/tmp:rw,noexec,nosuid,size={tmpfs_mb}m",
            "--user",
            "65532:65532",
            "--volume",
            f"{root}:/workspace:rw",
            "--workdir",
            command.working_directory,
            self._image,
            *command.argv,
        ]

    async def execute(
        self,
        workspace: Path,
        command: SandboxCommand,
        limits: ResourceLimits,
    ) -> SandboxResult:
        container_name = f"icogon-{uuid4().hex}"
        argv = self.build_argv(workspace, command, limits, container_name)
        started = monotonic()
        process = await asyncio.create_subprocess_exec(
            *argv,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout_task = asyncio.create_task(
            self._read_limited(process.stdout, limits.output_bytes)
        )
        stderr_task = asyncio.create_task(
            self._read_limited(process.stderr, limits.output_bytes)
        )
        timed_out = False
        try:
            await asyncio.wait_for(process.wait(), timeout=limits.timeout_seconds)
        except TimeoutError:
            timed_out = True
            process.kill()
            await process.wait()
            await self._remove_container(container_name)

        (stdout, stdout_truncated), (stderr, stderr_truncated) = await asyncio.gather(
            stdout_task,
            stderr_task,
        )
        return SandboxResult(
            exit_code=process.returncode,
            stdout=stdout.decode("utf-8", errors="replace"),
            stderr=stderr.decode("utf-8", errors="replace"),
            duration_ms=int((monotonic() - started) * 1000),
            timed_out=timed_out,
            output_truncated=stdout_truncated or stderr_truncated,
        )

    async def _remove_container(self, name: str) -> None:
        cleanup = await asyncio.create_subprocess_exec(
            self._executable,
            "rm",
            "--force",
            name,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        try:
            await asyncio.wait_for(cleanup.wait(), timeout=10)
        except TimeoutError:
            cleanup.kill()
            await cleanup.wait()

    @staticmethod
    async def _read_limited(
        stream: asyncio.StreamReader | None,
        limit: int,
    ) -> tuple[bytes, bool]:
        if stream is None:
            return b"", False
        captured = bytearray()
        truncated = False
        while chunk := await stream.read(64 * 1024):
            remaining = limit - len(captured)
            if remaining > 0:
                captured.extend(chunk[:remaining])
            if len(chunk) > remaining:
                truncated = True
        return bytes(captured), truncated
