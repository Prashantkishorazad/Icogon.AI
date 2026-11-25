from __future__ import annotations

from app.orchestrator.models import ChangeSet, VerificationResult
from app.sandbox.models import ResourceLimits, SandboxCommand
from app.sandbox.ports import Sandbox
from app.sandbox.workspace import EmptyWorkspaceProvider, WorkspaceProvider


class VerificationInfrastructureError(RuntimeError):
    """Verification could not run because its infrastructure is unavailable."""
    pass


class SandboxChangeVerifier:
    def __init__(
        self,
        sandbox: Sandbox,
        commands: list[SandboxCommand],
        limits: ResourceLimits | None = None,
        workspaces: WorkspaceProvider | None = None,
    ) -> None:
        if not commands:
            raise ValueError("At least one verification command is required")
        self._sandbox = sandbox
        self._commands = commands
        self._limits = limits or ResourceLimits()
        self._workspaces = workspaces or EmptyWorkspaceProvider()

    async def verify(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> VerificationResult:
        checks: dict[str, bool] = {}
        feedback: list[str] = []
        if any(change.operation == "delete" for change in changes.files) and isinstance(
            self._workspaces,
            EmptyWorkspaceProvider,
        ):
            return VerificationResult(
                passed=False,
                checks={"repository_snapshot_available": False},
                feedback=[
                    "Deletion verification requires a project workspace snapshot."
                ],
            )
        with self._workspaces.materialize(project_id, changes) as workspace:
            for index, command in enumerate(self._commands, start=1):
                name = f"sandbox_command_{index}"
                try:
                    result = await self._sandbox.execute(workspace, command, self._limits)
                except FileNotFoundError as exc:
                    raise VerificationInfrastructureError(
                        "Docker executable was not found. Check Docker Desktop installation and PATH."
                    ) from exc
                # A missing Docker daemon is not a problem in generated application code.
                output = (result.stderr + "\n" + result.stdout).lower()
                docker_unavailable = any(marker in output for marker in (
                    "dockerdesktoplinuxengine",
                    "cannot connect to the docker daemon",
                    "failed to connect to the docker api",
                    "is the docker daemon running",
                ))
                if result.exit_code != 0 and docker_unavailable:
                    raise VerificationInfrastructureError(
                        "Docker Engine is unavailable. Start Docker Desktop, confirm "
                        "`docker info` works, then submit a new run. "
                        "Generated code was not verified."
                    )
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
