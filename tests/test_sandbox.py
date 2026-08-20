import tempfile
import unittest
from pathlib import Path

from app.orchestrator.models import ChangeSet, FileChange
from app.sandbox.docker import DockerSandbox
from app.sandbox.models import ResourceLimits, SandboxCommand, SandboxResult
from app.sandbox.verifier import SandboxChangeVerifier
from app.sandbox.workspace import MaterializedChangeSet


class RecordingSandbox:
    def __init__(self, results: list[SandboxResult]) -> None:
        self.results = results
        self.commands: list[SandboxCommand] = []

    async def execute(self, workspace, command, limits):
        self.commands.append(command)
        return self.results.pop(0)


class DockerSandboxTests(unittest.TestCase):
    def test_command_enforces_isolation_and_resource_limits(self):
        with tempfile.TemporaryDirectory() as directory:
            argv = DockerSandbox("node:22-alpine").build_argv(
                Path(directory),
                SandboxCommand(argv=["npm", "test"]),
                ResourceLimits(cpus=0.5, memory_mb=512, pids=64),
            )

        self.assertIn("none", argv)
        self.assertIn("no-new-privileges", argv)
        self.assertIn("ALL", argv)
        self.assertIn("512m", argv)
        self.assertIn("0.5", argv)
        self.assertEqual(argv[-2:], ["npm", "test"])
        self.assertNotIn("sh", argv)

    def test_materializer_rejects_workspace_escape(self):
        changes = ChangeSet(
            summary="Unsafe path",
            files=[FileChange(path="../outside.txt", content="value")],
        )

        with (
            self.assertRaisesRegex(ValueError, "escapes the workspace"),
            MaterializedChangeSet(changes),
        ):
            pass

    def test_command_rejects_working_directory_outside_workspace(self):
        with self.assertRaisesRegex(ValueError, "under /workspace"):
            SandboxCommand(argv=["npm", "test"], working_directory="/tmp")


class SandboxVerifierTests(unittest.IsolatedAsyncioTestCase):
    async def test_rejects_delete_without_repository_snapshot(self):
        sandbox = RecordingSandbox([])
        verifier = SandboxChangeVerifier(
            sandbox=sandbox,
            commands=[SandboxCommand(argv=["npm", "test"])],
        )
        changes = ChangeSet(
            summary="Delete obsolete module",
            files=[FileChange(path="src/old.ts", operation="delete", content="")],
        )

        result = await verifier.verify(changes)

        self.assertFalse(result.passed)
        self.assertEqual(result.checks, {"self_contained_change_set": False})
        self.assertEqual(sandbox.commands, [])

    async def test_stops_after_first_failed_command(self):
        sandbox = RecordingSandbox(
            [
                SandboxResult(exit_code=0, duration_ms=1),
                SandboxResult(exit_code=1, stderr="tests failed", duration_ms=2),
                SandboxResult(exit_code=0, duration_ms=1),
            ]
        )
        verifier = SandboxChangeVerifier(
            sandbox=sandbox,
            commands=[
                SandboxCommand(argv=["npm", "run", "lint"]),
                SandboxCommand(argv=["npm", "test"]),
                SandboxCommand(argv=["npm", "run", "build"]),
            ],
        )
        changes = ChangeSet(
            summary="Project",
            files=[FileChange(path="package.json", content="{}")],
        )

        result = await verifier.verify(changes)

        self.assertFalse(result.passed)
        self.assertEqual(len(sandbox.commands), 2)
        self.assertIn("tests failed", result.feedback[0])

    async def test_passes_when_all_commands_succeed(self):
        sandbox = RecordingSandbox([SandboxResult(exit_code=0, duration_ms=1)])
        verifier = SandboxChangeVerifier(
            sandbox=sandbox,
            commands=[SandboxCommand(argv=["npm", "test"])],
        )
        changes = ChangeSet(
            summary="Project",
            files=[FileChange(path="package.json", content="{}")],
        )

        result = await verifier.verify(changes)

        self.assertTrue(result.passed)
        self.assertEqual(result.checks, {"sandbox_command_1": True})
