import tempfile
import unittest
from pathlib import Path

from app.orchestrator.models import ChangeSet, FileChange
from app.sandbox.docker import DockerSandbox
from app.sandbox.models import ResourceLimits, SandboxCommand, SandboxResult
from app.sandbox.verifier import SandboxChangeVerifier
from app.sandbox.workspace import DirectoryWorkspaceProvider, MaterializedChangeSet


class RecordingSandbox:
    def __init__(self, results: list[SandboxResult]) -> None:
        self.results = results
        self.commands: list[SandboxCommand] = []
        self.snapshots: list[dict[str, str]] = []

    async def execute(self, workspace, command, limits):
        self.commands.append(command)
        self.snapshots.append(
            {
                path.relative_to(workspace).as_posix(): path.read_text()
                for path in workspace.rglob("*")
                if path.is_file()
            }
        )
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
            self.assertRaisesRegex(ValueError, "project-relative path"),
            MaterializedChangeSet(changes),
        ):
            pass

    def test_command_rejects_working_directory_outside_workspace(self):
        with self.assertRaisesRegex(ValueError, "under /workspace"):
            SandboxCommand(argv=["npm", "test"], working_directory="/tmp")

    def test_materializer_rejects_protected_target(self):
        changes = ChangeSet(
            summary="Unsafe dependency change",
            files=[FileChange(path="node_modules/package/index.js", content="value")],
        )

        with (
            self.assertRaisesRegex(ValueError, "protected path"),
            MaterializedChangeSet(changes),
        ):
            pass

    def test_snapshot_size_limit_is_enforced_before_copy(self):
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory) / "project-1"
            project.mkdir()
            (project / "large.txt").write_text("1234")
            provider = DirectoryWorkspaceProvider(
                Path(directory),
                max_snapshot_bytes=3,
            )
            changes = ChangeSet(
                summary="No-op update",
                files=[FileChange(path="small.txt", content="ok")],
            )

            with (
                self.assertRaisesRegex(ValueError, "size limit"),
                provider.materialize("project-1", changes),
            ):
                pass


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

        result = await verifier.verify("project-1", changes)

        self.assertFalse(result.passed)
        self.assertEqual(result.checks, {"repository_snapshot_available": False})
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

        result = await verifier.verify("project-1", changes)

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

        result = await verifier.verify("project-1", changes)

        self.assertTrue(result.passed)
        self.assertEqual(result.checks, {"sandbox_command_1": True})

    async def test_verifies_changes_against_sanitized_project_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory) / "project-1"
            (project / "src").mkdir(parents=True)
            (project / "src" / "old.ts").write_text("old")
            (project / "src" / "keep.ts").write_text("before")
            (project / ".env").write_text("SECRET=value")
            (project / ".env.example").write_text("SECRET=")
            (project / "node_modules").mkdir()
            (project / "node_modules" / "cached.js").write_text("cache")
            sandbox = RecordingSandbox([SandboxResult(exit_code=0, duration_ms=1)])
            verifier = SandboxChangeVerifier(
                sandbox=sandbox,
                commands=[SandboxCommand(argv=["npm", "test"])],
                workspaces=DirectoryWorkspaceProvider(Path(directory)),
            )
            changes = ChangeSet(
                summary="Update existing project",
                files=[
                    FileChange(path="src/old.ts", operation="delete", content=""),
                    FileChange(path="src/keep.ts", content="after"),
                ],
            )

            result = await verifier.verify("project-1", changes)

            self.assertEqual((project / "src" / "old.ts").read_text(), "old")
            self.assertEqual((project / "src" / "keep.ts").read_text(), "before")

        self.assertTrue(result.passed)
        self.assertEqual(
            sandbox.snapshots,
            [{".env.example": "SECRET=", "src/keep.ts": "after"}],
        )

    async def test_rejects_project_id_path_traversal(self):
        with tempfile.TemporaryDirectory() as directory:
            verifier = SandboxChangeVerifier(
                sandbox=RecordingSandbox([]),
                commands=[SandboxCommand(argv=["npm", "test"])],
                workspaces=DirectoryWorkspaceProvider(Path(directory)),
            )
            changes = ChangeSet(
                summary="Unsafe project",
                files=[FileChange(path="src/app.ts", content="value")],
            )

            with self.assertRaisesRegex(ValueError, "Project ID"):
                await verifier.verify("../outside", changes)
