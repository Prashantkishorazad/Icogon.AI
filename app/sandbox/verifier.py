from __future__ import annotations

from app.orchestrator.models import ChangeSet, VerificationResult
from app.sandbox.models import ResourceLimits, SandboxCommand
from app.sandbox.ports import Sandbox
from app.sandbox.workspace import MaterializedChangeSet


class SandboxChangeVerifier:
    def __init__(
        self,
        sandbox: Sandbox,
        commands: list[SandboxCommand],
        limits: ResourceLimits | None = None,
    ) -> None:
        if not commands:
            raise ValueError("At least one verification command is required")
        self._sandbox = sandbox
        self._commands = commands
        self._limits = limits or ResourceLimits()

    async def verify(self, changes: ChangeSet) -> VerificationResult:
        checks: dict[str, bool] = {}
        feedback: list[str] = []
        if any(change.operation == "delete" for change in changes.files):
            return VerificationResult(
                passed=False,
                checks={"self_contained_change_set": False},
                feedback=[
                    "Deletion verification requires a repository-backed workspace snapshot."
                ],
            )
        with MaterializedChangeSet(changes) as workspace:
            for index, command in enumerate(self._commands, start=1):
                name = f"sandbox_command_{index}"
                result = await self._sandbox.execute(workspace, command, self._limits)
                passed = result.exit_code == 0 and not result.timed_out
                checks[name] = passed
                if not passed:
                    reason = (
                        "timed out"
                        if result.timed_out
                        else f"exited with {result.exit_code}"
                    )
                    feedback.append(
                        f"Verification command {index} {reason}: {result.stderr[-2000:]}"
                    )
                    break
        return VerificationResult(
            passed=bool(checks) and all(checks.values()),
            checks=checks,
            feedback=feedback,
        )
