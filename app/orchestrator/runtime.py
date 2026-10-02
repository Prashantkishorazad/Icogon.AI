from __future__ import annotations

import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(
    Path(__file__).resolve().parents[2] / ".env"
)

from app.orchestrator.mock import (
    MockAgentProvider,
    StaticChangeVerifier,
)
from app.orchestrator.postgres_repository import (
    PostgresRunRepository,
)
from app.orchestrator.provider import build_provider
from app.orchestrator.repository import InMemoryRunRepository
from app.orchestrator.service import OrchestratorService
from app.sandbox.preview import PreviewBuildVerifier
from app.sandbox.runtime import build_change_verifier


class OrchestratorRuntime:
    """
    Application-level runtime responsible for constructing and reusing
    the orchestrator service and its infrastructure dependencies.

    Supported backends:

        memory
            Development/testing backend.
            Uses in-memory repository, mock provider and static verifier.

        postgres
            Production backend.
            Uses Postgres repository, configured AI provider and
            sandbox/preview verification pipeline.
    """

    def __init__(self) -> None:
        self._service: OrchestratorService | None = None
        self._postgres_repository: PostgresRunRepository | None = None
        self._lock = asyncio.Lock()
        self._closed = False

    # ------------------------------------------------------------------
    # CONFIGURATION
    # ------------------------------------------------------------------

    @property
    def backend(self) -> str:
        return (
            os.getenv(
                "ORCHESTRATOR_BACKEND",
                "memory",
            )
            .strip()
            .lower()
        )

    @property
    def inline_execution_enabled(self) -> bool:
        """
        Memory backend is intended for inline execution.

        Postgres backend is intended to be processed by a dedicated
        worker so that queued runs survive application restarts.
        """
        return self.backend == "memory"

    # ------------------------------------------------------------------
    # PUBLIC SERVICE ACCESS
    # ------------------------------------------------------------------

    async def get_service(self) -> OrchestratorService:
        """
        Lazily construct the orchestrator service.

        asyncio.Lock prevents multiple concurrent requests from creating
        duplicate repositories/providers/services during startup.
        """
        if self._service is not None:
            return self._service

        async with self._lock:
            if self._service is None:
                if self._closed:
                    self._closed = False

                self._service = await self._build_service()

        return self._service

    # ------------------------------------------------------------------
    # SERVICE CONSTRUCTION
    # ------------------------------------------------------------------

    async def _build_service(
        self,
    ) -> OrchestratorService:
        backend = self.backend

        if backend == "memory":
            return self._build_memory_service()

        if backend == "postgres":
            return await self._build_postgres_service()

        raise RuntimeError(
            "Unsupported orchestrator backend: "
            f"{backend!r}. "
            "Expected 'memory' or 'postgres'."
        )

    # ------------------------------------------------------------------
    # MEMORY BACKEND
    # ------------------------------------------------------------------

    def _build_memory_service(
        self,
    ) -> OrchestratorService:
        """
        Lightweight development/test runtime.

        No external database or AI provider is required.
        """
        repository = InMemoryRunRepository()

        return OrchestratorService(
            repository=repository,
            provider=MockAgentProvider(),
            verifier=StaticChangeVerifier(),
        )

    # ------------------------------------------------------------------
    # POSTGRES BACKEND
    # ------------------------------------------------------------------

    async def _build_postgres_service(
        self,
    ) -> OrchestratorService:
        """
        Production runtime.

        Infrastructure:

            Postgres repository
                    +
            configured AI provider
                    +
            sandbox/preview verifier
                    ↓
            OrchestratorService
        """
        database_url = (
            os.getenv(
                "DATABASE_URL",
                "",
            )
            .strip()
        )

        if not database_url:
            raise RuntimeError(
                "DATABASE_URL is required when "
                "ORCHESTRATOR_BACKEND=postgres"
            )

        repository = await PostgresRunRepository.connect(
            database_url
        )

        self._postgres_repository = repository

        try:
            provider = build_provider()

            change_verifier = build_change_verifier()

            verifier = PreviewBuildVerifier(
                change_verifier
            )

            return OrchestratorService(
                repository=repository,
                provider=provider,
                verifier=verifier,
            )

        except Exception:
            # If provider/verifier initialization fails after the
            # database connection succeeds, do not leak the connection.
            await repository.close()
            self._postgres_repository = None
            raise

    # ------------------------------------------------------------------
    # SHUTDOWN
    # ------------------------------------------------------------------

    async def close(self) -> None:
        """
        Close runtime-owned infrastructure safely.

        This is idempotent so FastAPI shutdown hooks, workers and tests
        can safely call it more than once.
        """
        async with self._lock:
            if self._postgres_repository is not None:
                await self._postgres_repository.close()

            self._postgres_repository = None
            self._service = None
            self._closed = True


runtime = OrchestratorRuntime()


async def get_orchestrator_service() -> OrchestratorService:
    """
    Application helper used by routers and other runtime consumers.
    """
    return await runtime.get_service()