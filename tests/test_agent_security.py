import unittest

from app.agents.security import ChangeSecurityAgent
from app.orchestrator.models import ChangeSet, FileChange


class ChangeSecurityAgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_blocks_protected_paths(self):
        changes = ChangeSet(
            summary="Unsafe configuration change",
            files=[FileChange(path=".env", content="TOKEN=value")],
        )

        result = await ChangeSecurityAgent().assess(changes)

        self.assertFalse(result.approved)
        self.assertEqual(result.findings[0].code, "protected_path")

    async def test_blocks_private_keys(self):
        changes = ChangeSet(
            summary="Unsafe credential",
            files=[
                FileChange(
                    path="config/key.pem",
                    content="-----BEGIN PRIVATE KEY-----\nvalue",
                )
            ],
        )

        result = await ChangeSecurityAgent().assess(changes)

        self.assertFalse(result.approved)
        self.assertEqual(result.findings[0].code, "private_key")

    async def test_approves_ordinary_source_files(self):
        changes = ChangeSet(
            summary="Application change",
            files=[FileChange(path="src/app.ts", content="export const app = true")],
        )

        result = await ChangeSecurityAgent().assess(changes)

        self.assertTrue(result.approved)
        self.assertEqual(result.findings, [])
