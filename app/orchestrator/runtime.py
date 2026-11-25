from __future__ import annotations

import asyncio
import os
from pathlib import Path

def load_dotenv(dotenv_path: Path) -> None:
    """Load simple KEY=VALUE entries without requiring python-dotenv."""
    try:
        lines = dotenv_path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return

    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].lstrip()

        key, separator, value = line.partition("=")
        if not separator or not key.strip():
            continue

        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        os.environ.setdefault(key.strip(), value)

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
            Ephemeral development/testing backend. Uses the deterministic
            mock provider and static verifier by default. Real model runs
            require both ORCHESTRATOR_PROVIDER=groq/compatible and the
            explicit ORCHESTRATOR_ALLOW_EPHEMERAL_MODEL=1 opt-in. Memory
            runs are lost when the API process restarts.

        postgres
            Durable worker-backed backend. Uses Postgres repository,
            configured AI provider and sandbox/preview verification.
            Recommended for real generation outside local development.
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
        Build an ephemeral local service without silently substituting mocks.

        Default: deterministic mock provider and static verification.

        Local real-model opt-in: set ORCHESTRATOR_PROVIDER to ``groq`` or
        ``compatible`` and ORCHESTRATOR_ALLOW_EPHEMERAL_MODEL=1. The same
        preview/build verifier as the durable backend is then used. This
        mode is for development only: runs and event history disappear
        when the application process stops, and concurrent API workers
        must not be used for a shared in-memory run repository.
        """
        mode = os.getenv("ORCHESTRATOR_PROVIDER", "mock").strip().lower()

        if mode == "mock":
            provider = MockAgentProvider()
            verifier = StaticChangeVerifier()
        else:
            if mode not in {"groq", "compatible"}:
                raise RuntimeError(
                    "Unsupported ORCHESTRATOR_PROVIDER: "
                    f"{mode!r}. Expected 'mock', 'groq', or 'compatible'."
                )

            allow_ephemeral = os.getenv(
                "ORCHESTRATOR_ALLOW_EPHEMERAL_MODEL", ""
            ).strip().lower() in {"1", "true", "yes", "on"}

            if not allow_ephemeral:
                raise RuntimeError(
                    "ORCHESTRATOR_BACKEND=memory does not run real models "
                    "unless ORCHESTRATOR_ALLOW_EPHEMERAL_MODEL=1 is set. "
                    "Use ORCHESTRATOR_BACKEND=postgres and a dedicated "
                    "worker for durable generation."
                )

            # Do not downgrade to mock if the configured provider fails to
            # initialize. Missing keys and invalid provider settings must
            # surface as explicit startup/request errors.
            provider = build_provider()
            verifier = PreviewBuildVerifier(build_change_verifier())

        return OrchestratorService(
            repository=InMemoryRunRepository(),
            provider=provider,
            verifier=verifier,
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
                repository=repository,  # pyright: ignore[reportArgumentType]
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