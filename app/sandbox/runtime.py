from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv

from app.orchestrator.mock import StaticChangeVerifier
from app.orchestrator.ports import ChangeVerifier
from app.sandbox.docker import DockerSandbox
from app.sandbox.models import ResourceLimits, SandboxCommand
from app.sandbox.verifier import SandboxChangeVerifier
from app.sandbox.workspace import DirectoryWorkspaceProvider

load_dotenv()


def build_change_verifier() -> ChangeVerifier:
    backend = os.getenv("CHANGE_VERIFIER_BACKEND", "static").strip().lower()

    if backend == "static":
        return StaticChangeVerifier()

    if backend != "docker":
        raise RuntimeError(
            f"Unsupported change verifier backend: {backend}"
        )

    image = os.getenv("SANDBOX_IMAGE", "").strip()

    if not image:
        raise RuntimeError(
            "SANDBOX_IMAGE is required for Docker verification"
        )

    network = os.getenv("SANDBOX_NETWORK", "none").strip()

    if not network:
        raise RuntimeError(
            "SANDBOX_NETWORK cannot be empty"
        )

    raw_commands = os.getenv(
        "SANDBOX_COMMANDS_JSON",
        "",
    ).strip()

    if not raw_commands:
        raise RuntimeError(
            "SANDBOX_COMMANDS_JSON is required for Docker verification"
        )

    try:
        command_values = json.loads(raw_commands)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "SANDBOX_COMMANDS_JSON must be valid JSON"
        ) from exc

    if not isinstance(command_values, list):
        raise RuntimeError(
            "SANDBOX_COMMANDS_JSON must be a JSON array"
        )

    commands: list[SandboxCommand] = []

    try:
        for value in command_values:
            # --------------------------------------------------
            # Backward-compatible format:
            #
            # [
            #   ["npm", "test"]
            # ]
            # --------------------------------------------------

            if isinstance(value, list):
                commands.append(
                    SandboxCommand(
                        argv=value,
                    )
                )
                continue

            # --------------------------------------------------
            # New format:
            #
            # [
            #   {
            #     "argv": ["npm", "install"],
            #     "network": "bridge"
            #   },
            #   {
            #     "argv": ["npm", "run", "build"],
            #     "network": "none"
            #   }
            # ]
            # --------------------------------------------------

            if isinstance(value, dict):
                argv = value.get("argv")

                if not isinstance(argv, list):
                    raise ValueError(
                        "Each command object must contain an argv list"
                    )

                commands.append(
                    SandboxCommand(
                        argv=argv,
                        network=value.get("network"),
                        working_directory=value.get(
                            "working_directory",
                            "/workspace",
                        ),
                    )
                )
                continue

            raise ValueError(
                "Each sandbox command must be either "
                "an argument array or a command object"
            )

    except (TypeError, ValueError) as exc:
        raise RuntimeError(
            "SANDBOX_COMMANDS_JSON must contain valid sandbox commands"
        ) from exc

    if not commands:
        raise RuntimeError(
            "SANDBOX_COMMANDS_JSON must define at least one command"
        )

    limits = ResourceLimits(
        cpus=float(
            os.getenv(
                "SANDBOX_CPUS",
                "1",
            )
        ),
        memory_mb=int(
            os.getenv(
                "SANDBOX_MEMORY_MB",
                "1024",
            )
        ),
        pids=int(
            os.getenv(
                "SANDBOX_PIDS",
                "256",
            )
        ),
        timeout_seconds=int(
            os.getenv(
                "SANDBOX_TIMEOUT_SECONDS",
                "120",
            )
        ),
        output_bytes=int(
            os.getenv(
                "SANDBOX_OUTPUT_BYTES",
                "1000000",
            )
        ),
    )

    projects_root = os.getenv(
        "SANDBOX_PROJECTS_ROOT",
        "",
    ).strip()

    workspaces = (
        DirectoryWorkspaceProvider(
            Path(projects_root)
        )
        if projects_root
        else None
    )

    return SandboxChangeVerifier(
        sandbox=DockerSandbox(
            image=image,
            network=network,
        ),
        commands=commands,
        limits=limits,
        workspaces=workspaces,
    )