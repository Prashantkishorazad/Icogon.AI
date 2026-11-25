"""Authenticated AI generation routes for ICOGON.

The durable PostgreSQL worker owns run execution in production. The API
submits jobs, verifies project/run ownership and exposes resumable run events.
"""

from __future__ import annotations

import asyncio
import re
from typing import Annotated, Any, Literal

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    Header,
    HTTPException,
    Query,
    Request,
    status,
)
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.middleware.jwtauth import get_current_user, get_supabase
from app.orchestrator.models import AgentRun, RunBudget, RunEvent, RunRequest
from app.orchestrator.provider import provider_settings
from app.orchestrator.runtime import get_orchestrator_service, runtime
from app.orchestrator.service import OrchestratorService
from app.sandbox.preview import PreviewError, compile_preview

router = APIRouter(prefix="/orchestrator", tags=["Orchestrator"])
CurrentUser = Annotated[Any, Depends(get_current_user)]
Orchestrator = Annotated[OrchestratorService, Depends(get_orchestrator_service)]

# JavaScript cursors must remain exactly representable by Number.
_MAX_EVENT_SEQUENCE = 9_007_199_254_740_991
_EventCursor = Annotated[int, Query(ge=0, le=_MAX_EVENT_SEQUENCE)]
_SSE_POLL_SECONDS = 0.5
_SSE_HEARTBEAT_SECONDS = 12.0
_SSE_TERMINAL_QUIET_POLLS = 3
_SSE_EVENT_NAME = re.compile(r"^[A-Za-z0-9_.-]+$")


class SubmitRunRequest(BaseModel):
    project_id: str = Field(min_length=1)
    prompt: str = Field(min_length=3, max_length=20_000)
    idempotency_key: str = Field(min_length=8, max_length=200)
    budget: RunBudget = Field(default_factory=RunBudget)
    base_run_id: str | None = None
    quality: Literal["fast", "balanced", "polished"] = "balanced"


async def _owned_run(
    run_id: str,
    user_id: str,
    orchestrator: OrchestratorService,
) -> AgentRun:
    """Never disclose the existence of another user's run."""
    run = await orchestrator.get(run_id)
    if run is None or run.user_id != user_id:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


def _replay_cursor(after: int, last_event_id: str | None) -> int:
    """Honor EventSource reconnects while retaining the existing ?after API."""
    if last_event_id:
        raw = last_event_id.strip()
        if raw.isascii() and raw.isdecimal() and len(raw) <= 16:
            previous_id = int(raw)
            if previous_id <= _MAX_EVENT_SEQUENCE:
                return max(after, previous_id)
    return after


def _sse_event(event: RunEvent) -> str:
    """Serialize a complete single-line JSON SSE event.

    Event names are limited to SSE-safe characters. The frontend primarily
    uses the event's JSON payload, including its authoritative sequence.
    """
    event_name = (
        event.event_type
        if _SSE_EVENT_NAME.fullmatch(event.event_type)
        else "message"
    )
    return (
        f"id: {event.sequence}\n"
        f"event: {event_name}\n"
        f"data: {event.model_dump_json()}\n\n"
    )


@router.get("/capabilities")
async def capabilities(current_user: CurrentUser):
    return provider_settings()


@router.post("/runs", response_model=AgentRun, status_code=status.HTTP_202_ACCEPTED)
async def submit_run(
    payload: SubmitRunRequest,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser,
    orchestrator: Orchestrator,
    supabase: Annotated[Any, Depends(get_supabase)],
):
    user_id = str(current_user.id)
    project = await asyncio.to_thread(
        lambda: (
            supabase.table("projects")
            .select("id")
            .eq("id", payload.project_id)
            .eq("user_id", user_id)
            .execute()
        )
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    context_files = []
    if payload.base_run_id:
        base = await _owned_run(payload.base_run_id, user_id, orchestrator)
        if base.project_id != payload.project_id:
            raise HTTPException(status_code=404, detail="Base run not found")
        if base.status.value != "completed" or base.changes is None:
            raise HTTPException(status_code=409, detail="Base run must be completed")
        context_files = [file for file in base.changes.files if file.operation == "upsert"]

    request = RunRequest(
        user_id=user_id,
        project_id=payload.project_id,
        prompt=payload.prompt,
        idempotency_key=payload.idempotency_key,
        budget=payload.budget,
        base_run_id=payload.base_run_id,
        context_files=context_files,
        quality=payload.quality,
    )
    run = await orchestrator.submit(request)

    # The repository guarantees idempotency by (user, key), even if the caller
    # mistakenly reuses that key for a different request. Surface a conflict
    # instead of showing another project's code or a stale generation result.
    if (
        run.user_id != user_id
        or run.project_id != request.project_id
        or run.prompt != request.prompt
        or run.base_run_id != request.base_run_id
        or run.quality != request.quality
        or run.budget != request.budget
    ):
        raise HTTPException(
            status_code=409,
            detail="Idempotency key was already used for a different generation request",
        )

    # In-memory development only. The service's per-run lock and lease guard
    # against duplicate inline execution on retried submissions.
    if not run.is_terminal and runtime.inline_execution_enabled:
        background_tasks.add_task(orchestrator.execute, run.id)
    return run


@router.get("/runs/{run_id}", response_model=AgentRun)
async def get_run(
    run_id: str,
    current_user: CurrentUser,
    orchestrator: Orchestrator,
):
    return await _owned_run(run_id, str(current_user.id), orchestrator)


@router.get("/runs/{run_id}/preview")
async def get_preview(
    run_id: str,
    current_user: CurrentUser,
    orchestrator: Orchestrator,
):
    run = await _owned_run(run_id, str(current_user.id), orchestrator)
    if run.status.value != "completed" or run.changes is None:
        raise HTTPException(status_code=409, detail="Preview requires a completed run")
    try:
        return await compile_preview(run.changes)
    except PreviewError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from None


@router.get("/runs/{run_id}/events", response_model=list[RunEvent])
async def get_run_events(
    run_id: str,
    current_user: CurrentUser,
    orchestrator: Orchestrator,
    after: _EventCursor = 0,
):
    await _owned_run(run_id, str(current_user.id), orchestrator)
    return await orchestrator.list_events(run_id, after)


@router.post("/runs/{run_id}/cancel", response_model=AgentRun)
async def cancel_run(
    run_id: str,
    current_user: CurrentUser,
    orchestrator: Orchestrator,
):
    await _owned_run(run_id, str(current_user.id), orchestrator)
    return await orchestrator.request_cancel(run_id)


@router.get("/runs/{run_id}/events/stream")
async def stream_run_events(
    run_id: str,
    request: Request,
    current_user: CurrentUser,
    orchestrator: Orchestrator,
    after: _EventCursor = 0,
    last_event_id: Annotated[str | None, Header(alias="Last-Event-ID")] = None,
):
    user_id = str(current_user.id)
    await _owned_run(run_id, user_id, orchestrator)
    cursor = _replay_cursor(after, last_event_id)

    async def event_stream():
        nonlocal cursor
        elapsed_idle = 0.0
        terminal_quiet_polls = 0

        # Useful to proxies without introducing an artificial run event.
        yield ": connected\n\n"

        while True:
            if await request.is_disconnected():
                return

            events = await orchestrator.list_events(run_id, cursor)
            delivered = False
            for event in events:
                if event.sequence <= cursor:
                    continue
                if await request.is_disconnected():
                    return
                yield _sse_event(event)
                cursor = event.sequence
                delivered = True

            if delivered:
                terminal_quiet_polls = 0
                elapsed_idle = 0.0

            current = await orchestrator.get(run_id)
            if current is None or current.user_id != user_id:
                return

            # Some terminal status updates are persisted just before the final
            # event is appended; leave a short quiet interval to flush it.
            if current.is_terminal:
                terminal_quiet_polls = 0 if delivered else terminal_quiet_polls + 1
                if terminal_quiet_polls >= _SSE_TERMINAL_QUIET_POLLS:
                    return
            else:
                terminal_quiet_polls = 0

            await asyncio.sleep(_SSE_POLL_SECONDS)
            elapsed_idle += _SSE_POLL_SECONDS
            if elapsed_idle >= _SSE_HEARTBEAT_SECONDS:
                if await request.is_disconnected():
                    return
                yield ": heartbeat\n\n"
                elapsed_idle = 0.0

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )