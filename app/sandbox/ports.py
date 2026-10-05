from __future__ import annotations

import socket
from contextlib import closing
from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Protocol

from app.sandbox.models import ResourceLimits, SandboxCommand, SandboxResult


class Sandbox(Protocol):
    async def execute(
        self,
        workspace: Path,
        command: SandboxCommand,
        limits: ResourceLimits,
    ) -> SandboxResult: ...


@dataclass(frozen=True)
class AllocatedPort:
    port: int


class PortAllocator:
    """
    Allocates currently available localhost TCP ports for preview containers.

    The returned port is a candidate allocation. The socket is released
    immediately, so the caller should start its container/listener promptly.
    """

    def __init__(
        self,
        start_port: int = 5173,
        end_port: int = 5273,
    ) -> None:
        if start_port < 1024:
            raise ValueError("start_port must be >= 1024")

        if end_port < start_port:
            raise ValueError("end_port must be >= start_port")

        self._start_port = start_port
        self._end_port = end_port
        self._lock = Lock()

    def allocate(self) -> AllocatedPort:
        """
        Return an available localhost TCP port.
        """
        with self._lock:
            for port in range(self._start_port, self._end_port + 1):
                if self._is_available(port):
                    return AllocatedPort(port=port)

        raise RuntimeError(
            f"No available preview port in range "
            f"{self._start_port}-{self._end_port}"
        )

    @staticmethod
    def _is_available(port: int) -> bool:
        with closing(
            socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        ) as sock:
            sock.setsockopt(
                socket.SOL_SOCKET,
                socket.SO_REUSEADDR,
                1,
            )

            try:
                sock.bind(("127.0.0.1", port))
            except OSError:
                return False

            return True