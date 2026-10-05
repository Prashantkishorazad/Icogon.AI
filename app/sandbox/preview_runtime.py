from __future__ import annotations

import asyncio
import socket
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from app.orchestrator.models import ChangeSet
from app.sandbox.models import ResourceLimits
from app.sandbox.ports import PortAllocator
from app.sandbox.workspace import WorkspaceProvider


class PreviewRuntimeError(RuntimeError):
    """Raised when a live preview cannot be started or managed."""


@dataclass(frozen=True)
class PreviewRuntimeConfig:
    image: str = "node:22-alpine"

    # Runtime preview must remain isolated.
    network: str = "bridge"

    # Dependency installation needs package registry access.
    install_network: str = "bridge"

    install_command: tuple[str, ...] = (
        "npm",
        "install",
        "--ignore-scripts",
    )

    command: tuple[str, ...] = (
        "npm",
        "run",
        "dev",
        "--",
        "--host",
        "0.0.0.0",
    )

    working_directory: str = "/workspace"

    start_port: int = 5173
    end_port: int = 5273

    startup_timeout_seconds: int = 45
    healthcheck_timeout_seconds: int = 5

    install_timeout_seconds: int = 180

    docker_executable: str = "docker"

    def __post_init__(self) -> None:
        if not self.image.strip():
            raise ValueError("Preview image must not be empty")

        if not self.network.strip():
            raise ValueError("Preview network must not be empty")

        if not self.install_network.strip():
            raise ValueError("Install network must not be empty")

        if not self.install_command:
            raise ValueError("Install command must not be empty")

        if not self.command:
            raise ValueError("Preview command must not be empty")

        if not self.working_directory.startswith("/workspace"):
            raise ValueError(
                "Preview working directory must be inside /workspace"
            )

        if self.start_port < 1024:
            raise ValueError("Preview start port must be >= 1024")

        if self.end_port < self.start_port:
            raise ValueError(
                "Preview end port must be >= start port"
            )

        if self.startup_timeout_seconds < 1:
            raise ValueError(
                "Preview startup timeout must be >= 1 second"
            )

        if self.healthcheck_timeout_seconds < 1:
            raise ValueError(
                "Preview healthcheck timeout must be >= 1 second"
            )

        if self.install_timeout_seconds < 1:
            raise ValueError(
                "Install timeout must be >= 1 second"
            )


@dataclass(frozen=True)
class PreviewRuntime:
    preview_id: str
    url: str
    port: int
    container_name: str


class DockerPreviewRuntime:
    """
    Runs generated projects through a two-phase Docker lifecycle.

    Phase 1:
        npm install using a temporary bridge-network container.

    Phase 2:
        npm run dev using a restricted bridge-network container
        with host access limited to the published localhost port.

    The dependency installation and preview server share the same
    materialized workspace.
    """

    def __init__(
        self,
        workspace_provider: WorkspaceProvider,
        config: PreviewRuntimeConfig | None = None,
        port_allocator: PortAllocator | None = None,
        limits: ResourceLimits | None = None,
    ) -> None:
        self._workspace_provider = workspace_provider
        self._config = config or PreviewRuntimeConfig()

        self._port_allocator = port_allocator or PortAllocator(
            start_port=self._config.start_port,
            end_port=self._config.end_port,
        )

        self._limits = limits or ResourceLimits(
            cpus=1.0,
            memory_mb=2048,
            pids=256,
            timeout_seconds=180,
            output_bytes=2_000_000,
        )

        self._processes: dict[str, asyncio.subprocess.Process] = {}
        self._workspaces: dict[str, object] = {}
        self._ports: dict[str, int] = {}
        self._containers: dict[str, str] = {}

    async def start(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> PreviewRuntime:
        """
        Materialize, install dependencies, and start the preview server.
        """

        preview_id = uuid4().hex
        container_name = f"icogon-preview-{preview_id}"

        allocated = self._port_allocator.allocate()
        host_port = allocated.port

        workspace_context = self._workspace_provider.materialize(
            project_id,
            changes,
        )

        try:
            workspace = workspace_context.__enter__()

            if not isinstance(workspace, Path):
                raise PreviewRuntimeError(
                    "Workspace provider returned an invalid workspace"
                )

            # ---------------------------------------------------------
            # Phase 1: dependency installation
            # ---------------------------------------------------------
            await self._install_dependencies(workspace)

            # ---------------------------------------------------------
            # Phase 2: isolated preview runtime
            # ---------------------------------------------------------
            command = self._build_docker_command(
                workspace=workspace,
                host_port=host_port,
                container_name=container_name,
            )

            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            self._processes[preview_id] = process
            self._workspaces[preview_id] = workspace_context
            self._ports[preview_id] = host_port
            self._containers[preview_id] = container_name

            await self._wait_for_preview(
                preview_id=preview_id,
                host_port=host_port,
                process=process,
            )

            return PreviewRuntime(
                preview_id=preview_id,
                url=f"http://127.0.0.1:{host_port}",
                port=host_port,
                container_name=container_name,
            )

        except Exception:
            await self.stop(preview_id)

            # Workspace may not have been registered yet.
            try:
                workspace_context.__exit__(
                    None,
                    None,
                    None,
                )
            except Exception:
                pass

            raise

    async def stop(
        self,
        preview_id: str,
    ) -> None:
        """
        Stop and remove a running preview.
        """

        process = self._processes.pop(
            preview_id,
            None,
        )

        container_name = self._containers.pop(
            preview_id,
            None,
        )

        self._ports.pop(
            preview_id,
            None,
        )

        if process is not None:
            if process.returncode is None:
                process.terminate()

                try:
                    await asyncio.wait_for(
                        process.wait(),
                        timeout=5,
                    )
                except asyncio.TimeoutError:
                    process.kill()

                    try:
                        await process.wait()
                    except ProcessLookupError:
                        pass

        if container_name:
            await self._docker_remove(
                container_name,
            )

        workspace_context = self._workspaces.pop(
            preview_id,
            None,
        )

        if workspace_context is not None:
            try:
                workspace_context.__exit__(
                    None,
                    None,
                    None,
                )
            except Exception:
                pass

    async def stop_all(self) -> None:
        """
        Stop every active preview owned by this runtime.
        """

        preview_ids = list(
            self._processes,
        )

        for preview_id in preview_ids:
            await self.stop(preview_id)

    def active_previews(self) -> list[str]:
        """
        Return active preview IDs.
        """

        return list(
            self._processes,
        )

    async def _install_dependencies(
        self,
        workspace: Path,
    ) -> None:
        """
        Install npm dependencies in a short-lived container.

        This phase is the only preview-runtime phase that receives
        external network access.
        """

        package_json = workspace / "package.json"

        if not package_json.is_file():
            return

        root = workspace.resolve(strict=True)

        container_name = (
            f"icogon-install-{uuid4().hex}"
        )

        tmpfs_mb = max(
            16,
            min(
                256,
                self._limits.memory_mb // 2,
            ),
        )

        command = [
            self._config.docker_executable,
            "run",
            "--rm",
            "--name",
            container_name,

            # Dependency installation is allowed external access.
            "--network",
            self._config.install_network,

            # Security hardening.
            "--read-only",
            "--cap-drop",
            "ALL",
            "--security-opt",
            "no-new-privileges",

            # Resource limits.
            "--pids-limit",
            str(self._limits.pids),
            "--memory",
            f"{self._limits.memory_mb}m",
            "--cpus",
            str(self._limits.cpus),

            # Writable temporary filesystem.
            "--tmpfs",
            (
                f"/tmp:rw,noexec,nosuid,"
                f"size={tmpfs_mb}m"
            ),

            # Non-root numeric user.
            "--user",
            "65532:65532",

            "--env",
            "HOME=/tmp/icogon-home",

            "--env",
            "NPM_CONFIG_CACHE=/tmp/icogon-npm-cache",

            # Same workspace used by preview container.
            "--volume",
            f"{root}:/workspace:rw",

            "--workdir",
            self._config.working_directory,

            self._config.image,
            *self._config.install_command,
        ]

        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=self._config.install_timeout_seconds,
            )
        except asyncio.TimeoutError:
            process.kill()

            try:
                await process.wait()
            except ProcessLookupError:
                pass

            await self._docker_remove(
                container_name,
            )

            raise PreviewRuntimeError(
                "Dependency installation timed out after "
                f"{self._config.install_timeout_seconds} seconds"
            )

        if process.returncode != 0:
            output = self._decode_output(
                stderr or stdout,
            )

            await self._docker_remove(
                container_name,
            )

            raise PreviewRuntimeError(
                "Dependency installation failed"
                + (
                    f": {output}"
                    if output
                    else ""
                )
            )

    def _build_docker_command(
        self,
        workspace: Path,
        host_port: int,
        container_name: str,
    ) -> list[str]:
        root = workspace.resolve(strict=True)

        tmpfs_mb = max(
            16,
            min(
                256,
                self._limits.memory_mb // 2,
            ),
        )

        return [
            self._config.docker_executable,
            "run",
            "--rm",
            "--name",
            container_name,

            # Runtime remains isolated.
            "--network",
            self._config.network,

            # Security hardening.
            "--read-only",
            "--cap-drop",
            "ALL",
            "--security-opt",
            "no-new-privileges",

            # Resource limits.
            "--pids-limit",
            str(self._limits.pids),
            "--memory",
            f"{self._limits.memory_mb}m",
            "--cpus",
            str(self._limits.cpus),

            # Writable temporary filesystem.
            "--tmpfs",
            (
                f"/tmp:rw,noexec,nosuid,"
                f"size={tmpfs_mb}m"
            ),

            # Non-root runtime.
            "--user",
            "65532:65532",

            "--env",
            "HOME=/tmp/icogon-home",

            "--env",
            "NPM_CONFIG_CACHE=/tmp/icogon-npm-cache",

            # Host exposes only localhost.
            "--publish",
            f"127.0.0.1:{host_port}:5173",

            # Generated project only.
            "--volume",
            f"{root}:/workspace:rw",

            "--workdir",
            self._config.working_directory,

            self._config.image,
            *self._config.command,
        ]

    async def _wait_for_preview(
        self,
        preview_id: str,
        host_port: int,
        process: asyncio.subprocess.Process,
    ) -> None:
        del preview_id

        deadline = (
            time.monotonic()
            + self._config.startup_timeout_seconds
        )

        while time.monotonic() < deadline:
            if process.returncode is not None:
                stderr = await self._read_process_stderr(
                    process,
                )

                raise PreviewRuntimeError(
                    "Preview container exited before becoming ready"
                    + (
                        f": {stderr}"
                        if stderr
                        else ""
                    )
                )

            if await asyncio.to_thread(
                self._is_port_open,
                host_port,
            ):
                if await asyncio.to_thread(
                    self._http_healthcheck,
                    host_port,
                ):
                    return

            await asyncio.sleep(0.25)

        raise PreviewRuntimeError(
            "Preview did not become ready within "
            f"{self._config.startup_timeout_seconds} seconds"
        )

    async def _read_process_stderr(
        self,
        process: asyncio.subprocess.Process,
    ) -> str:
        if process.stderr is None:
            return ""

        try:
            data = await asyncio.wait_for(
                process.stderr.read(200_000),
                timeout=2,
            )
        except asyncio.TimeoutError:
            return ""

        return self._decode_output(
            data,
        )

    @staticmethod
    def _decode_output(
        data: bytes,
    ) -> str:
        return data.decode(
            "utf-8",
            errors="replace",
        ).strip()

    @staticmethod
    def _is_port_open(
        port: int,
    ) -> bool:
        with socket.socket(
            socket.AF_INET,
            socket.SOCK_STREAM,
        ) as sock:
            sock.settimeout(0.5)

            try:
                return (
                    sock.connect_ex(
                        ("127.0.0.1", port),
                    )
                    == 0
                )
            except OSError:
                return False

    def _http_healthcheck(
        self,
        port: int,
    ) -> bool:
        url = (
            f"http://127.0.0.1:{port}/"
        )

        request = Request(
            url,
            method="GET",
            headers={
                "User-Agent": (
                    "ICOGON-Preview-Healthcheck"
                ),
            },
        )

        try:
            with urlopen(
                request,
                timeout=(
                    self._config
                    .healthcheck_timeout_seconds
                ),
            ) as response:
                return (
                    200
                    <= response.status
                    < 500
                )
        except (
            OSError,
            URLError,
        ):
            return False

    async def _docker_remove(
        self,
        container_name: str,
    ) -> None:
        process = await asyncio.create_subprocess_exec(
            self._config.docker_executable,
            "rm",
            "-f",
            container_name,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )

        try:
            await asyncio.wait_for(
                process.wait(),
                timeout=10,
            )
        except asyncio.TimeoutError:
            process.kill()

            try:
                await process.wait()
            except ProcessLookupError:
                pass