from __future__ import annotations

import asyncio
import os

from app.orchestrator.mock import MockAgentProvider, StaticChangeVerifier
from app.orchestrator.postgres_repository import PostgresRunRepository
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.service import OrchestratorService


class OrchestratorRuntime:
    def __init__(self) -> None:
        self._service: OrchestratorService | None = None
        self._postgres_repository: PostgresRunRepository | None = None
        self._lock = asyncio.Lock()

    @property
    def backend(self) -> str:
        return os.getenv("ORCHESTRATOR_BACKEND", "memory").strip().lower()

    @property
    def inline_execution_enabled(self) -> bool:
        return self.backend == "memory"

    async def get_service(self) -> OrchestratorService:
        if self._service is not None:
            return self._service
        async with self._lock:
            if self._service is None:
                self._service = await self._build_service()
        return self._service

    async def close(self) -> None:
        if self._postgres_repository is not None:
            await self._postgres_repository.close()
        self._postgres_repository = None
        self._service = None

    async def _build_service(self) -> OrchestratorService:
        backend = self.backend
        if backend == "memory":
            repository = InMemoryRunRepository()
        elif backend == "postgres":
            database_url = os.getenv("DATABASE_URL", "").strip()
            if not database_url:
                raise RuntimeError(
                    "DATABASE_URL is required when ORCHESTRATOR_BACKEND=postgres"
                )
            repository = await PostgresRunRepository.connect(database_url)
            self._postgres_repository = repository
        else:
            raise RuntimeError(f"Unsupported orchestrator backend: {backend}")

        return OrchestratorService(
            repository=repository,
            provider=MockAgentProvider(),
            verifier=StaticChangeVerifier(),
        )


runtime = OrchestratorRuntime()


async def get_orchestrator_service() -> OrchestratorService:
    return await runtime.get_service()
