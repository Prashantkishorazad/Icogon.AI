import os
import unittest
from unittest.mock import patch

from app.orchestrator.mock import StaticChangeVerifier
from app.sandbox.runtime import build_change_verifier
from app.sandbox.verifier import SandboxChangeVerifier


class SandboxRuntimeTests(unittest.TestCase):
    def test_static_verifier_is_default(self):
        with patch.dict(os.environ, {}, clear=True):
            verifier = build_change_verifier()

        self.assertIsInstance(verifier, StaticChangeVerifier)

    def test_docker_verifier_requires_deployment_owned_commands(self):
        environment = {
            "CHANGE_VERIFIER_BACKEND": "docker",
            "SANDBOX_IMAGE": "node:22-alpine",
            "SANDBOX_COMMANDS_JSON": "",
        }
        with (
            patch.dict(os.environ, environment, clear=True),
            self.assertRaisesRegex(RuntimeError, "SANDBOX_COMMANDS_JSON"),
        ):
            build_change_verifier()

    def test_builds_docker_verifier_from_environment(self):
        environment = {
            "CHANGE_VERIFIER_BACKEND": "docker",
            "SANDBOX_IMAGE": "node:22-alpine",
            "SANDBOX_COMMANDS_JSON": '[["npm", "test"]]',
        }
        with patch.dict(os.environ, environment, clear=True):
            verifier = build_change_verifier()

        self.assertIsInstance(verifier, SandboxChangeVerifier)
