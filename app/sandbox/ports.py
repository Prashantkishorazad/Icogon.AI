from pathlib import Path
from typing import Protocol

from app.sandbox.models import ResourceLimits, SandboxCommand, SandboxResult


class Sandbox(Protocol):
    async def execute(
        self,
        workspace: Path,
        command: SandboxCommand,
        limits: ResourceLimits,
    ) -> SandboxResult: ...
