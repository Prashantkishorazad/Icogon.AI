"""ICOGON API application entrypoint.

Core endpoints are always available. Optional project sharing and legacy
profile routes are explicitly gated because they need additional security and
migration checks before public rollout.

Set ICOGON_CORS_ORIGINS to a comma-separated list of trusted frontend origins
in production; never use '*' with authenticated browser requests.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from urllib.parse import urlsplit

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.orchestrator.runtime import runtime
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.gmail import router as gmail_router
from app.routers.orchestrator import router as orchestrator_router
from app.routers.project import router as project_router
from app.routers.project_publishing import router as project_publishing_router
from app.routers.upload import router as upload_router
from app.routers.user import router as user_router

logger = logging.getLogger("icogon.api")

# Original Vite ports remain supported for local development.
_DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
)


def _enabled(name: str) -> bool:
    """Feature flags must be explicitly enabled; never guess a deployment state."""
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


def _trusted_cors_origins() -> list[str]:
    """Allow only concrete HTTP(S) origins, never a wildcard or URL path.

    Production can set ICOGON_CORS_ORIGINS="https://app.example.com,...".
    CORS is a browser control, not API authentication or authorization.
    """
    configured = os.getenv("ICOGON_CORS_ORIGINS")
    if configured is None:
        configured = os.getenv("CORS_ORIGINS")
    candidates = (
        [item.strip() for item in configured.split(",")]
        if configured is not None
        else list(_DEFAULT_CORS_ORIGINS)
    )
    if not candidates or any(not item for item in candidates):
        raise ValueError("ICOGON_CORS_ORIGINS must contain nonempty HTTP(S) origins")

    result: list[str] = []
    for raw_origin in candidates:
        if raw_origin == "*" or raw_origin.lower() == "null":
            raise ValueError("Wildcard or null CORS origins are not allowed")
        parts = urlsplit(raw_origin)
        try:
            valid_port = parts.port is None or parts.port > 0
        except ValueError as exc:
            raise ValueError(f"Invalid CORS origin: {raw_origin!r}") from exc
        if (
            parts.scheme not in {"http", "https"}
            or not parts.hostname
            or not valid_port
            or parts.username is not None
            or parts.password is not None
            or parts.path not in {"", "/"}
            or parts.query
            or parts.fragment
            or any(character.isspace() for character in raw_origin)
        ):
            raise ValueError(f"Invalid CORS origin: {raw_origin!r}")
        # Preserve the exact origin string except an optional trailing slash.
        origin = raw_origin.rstrip("/")
        if origin not in result:
            result.append(origin)
    return result


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Always release runtime resources, including after server exceptions.

    The API does not create a dedicated run worker: PostgreSQL-backed runs are
    processed by `python -m app.orchestrator.worker` in a separate process.
    """
    try:
        yield
    finally:
        await runtime.close()
        logger.info("ICOGON API orchestrator runtime closed")


app = FastAPI(
    title="ICOGON AI API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_trusted_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core, existing endpoints. Preserve their original paths and behavior.
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(upload_router)
app.include_router(orchestrator_router)
app.include_router(project_router)
app.include_router(gmail_router)

# Expose the deliberately safe 501 response for unsupported deployments.
# This router checks project ownership and never performs an actual publish.
app.include_router(project_publishing_router)

# Sharing requires the project_shares migration and authorization review.
# Leave disabled by default; enabling only mounts routes, not public access.
if _enabled("ICOGON_ENABLE_PROJECT_SHARING"):
    from app.routers.project_sharing import router as project_sharing_router

    app.include_router(project_sharing_router)

# The legacy profile router overlaps the existing /user/* and /auth/* APIs.
# It is opt-in until its custom auth/logging behavior has been reviewed.
if _enabled("ICOGON_ENABLE_PROFILE_ROUTES"):
    from app.routers.profile import router as profile_router

    app.include_router(profile_router)


@app.get("/", tags=["System"])
async def home() -> dict[str, str]:
    return {"message": "ICOGON AI API Running 🚀"}


@app.get("/health", tags=["System"])
async def health() -> dict[str, str]:
    """Lightweight liveness check. Does not imply AI worker readiness."""
    return {"status": "ok"}


@app.get("/health/ready", tags=["System"])
async def readiness() -> dict[str, str]:
    """Verify API-side orchestration dependencies can initialize.

    For PostgreSQL deployments this verifies the API's connection/provider,
    but NOT whether a separate worker is alive or a model call succeeds.
    """
    try:
        await runtime.get_service()
    except Exception:
        logger.exception("ICOGON API orchestrator dependency readiness failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Orchestrator dependencies are unavailable",
        ) from None
    return {"status": "ready", "orchestrator_backend": runtime.backend}