from __future__ import annotations

import re
from pathlib import PurePosixPath
from typing import ClassVar

from app.agents.contracts import (
    ReviewFinding,
    ReviewSeverity,
    SecurityAssessment,
)
from app.orchestrator.models import ChangeSet


class ChangeSecurityAgent:
    _blocked_names: ClassVar[set[str]] = {
        ".env",
        ".git",
        ".npmrc",
        ".pypirc",
        "credentials.json",
        "id_rsa",
        "id_ed25519",
    }
    _secret_patterns: ClassVar[dict[str, re.Pattern[str]]] = {
        "private_key": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
        "aws_access_key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
        "github_token": re.compile(r"\bgh[oprsu]_[A-Za-z0-9_]{20,}\b"),
    }

    def __init__(self, max_file_bytes: int = 1_000_000) -> None:
        self._max_file_bytes = max_file_bytes

    async def assess(self, changes: ChangeSet) -> SecurityAssessment:
        findings: list[ReviewFinding] = []
        for change in changes.files:
            path = PurePosixPath(change.path)
            lowered_parts = {part.lower() for part in path.parts}
            blocked = lowered_parts.intersection(self._blocked_names)
            if blocked:
                findings.append(
                    ReviewFinding(
                        code="protected_path",
                        message=f"Generated changes cannot modify protected path: {change.path}",
                        severity=ReviewSeverity.BLOCKING,
                        path=change.path,
                    )
                )

            size = len(change.content.encode("utf-8"))
            if size > self._max_file_bytes:
                findings.append(
                    ReviewFinding(
                        code="file_too_large",
                        message=f"Generated file exceeds the {self._max_file_bytes}-byte limit.",
                        severity=ReviewSeverity.BLOCKING,
                        path=change.path,
                    )
                )

            for code, pattern in self._secret_patterns.items():
                if pattern.search(change.content):
                    findings.append(
                        ReviewFinding(
                            code=code,
                            message="Generated content appears to contain a credential.",
                            severity=ReviewSeverity.BLOCKING,
                            path=change.path,
                        )
                    )

        return SecurityAssessment(
            approved=not any(
                finding.severity == ReviewSeverity.BLOCKING for finding in findings
            ),
            findings=findings,
        )
