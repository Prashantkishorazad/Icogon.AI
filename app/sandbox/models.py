from __future__ import annotations

from pathlib import PurePosixPath

from pydantic import BaseModel, Field, field_validator


class ResourceLimits(BaseModel):
    cpus: float = Field(default=1.0, ge=0.1, le=8.0)
    memory_mb: int = Field(default=1024, ge=128, le=16_384)
    pids: int = Field(default=256, ge=16, le=4096)
    timeout_seconds: int = Field(default=120, ge=1, le=1800)
    output_bytes: int = Field(default=1_000_000, ge=1024, le=10_000_000)


class SandboxCommand(BaseModel):
    argv: list[str] = Field(min_length=1, max_length=64)
    working_directory: str = "/workspace"

    @field_validator("argv")
    @classmethod
    def reject_empty_arguments(cls, value: list[str]) -> list[str]:
        if any(not argument or "\x00" in argument for argument in value):
            raise ValueError(
                "command arguments must be non-empty and contain no null bytes"
            )
        return value

    @field_validator("working_directory")
    @classmethod
    def keep_working_directory_in_workspace(cls, value: str) -> str:
        path = PurePosixPath(value)
        if not path.is_absolute() or path.parts[:2] != ("/", "workspace"):
            raise ValueError("working directory must stay under /workspace")
        if ".." in path.parts:
            raise ValueError("working directory must stay under /workspace")
        return value


class SandboxResult(BaseModel):
    exit_code: int | None
    stdout: str = ""
    stderr: str = ""
    duration_ms: int = Field(ge=0)
    timed_out: bool = False
    output_truncated: bool = False
