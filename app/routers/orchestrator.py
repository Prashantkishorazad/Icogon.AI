import asyncio
from typing import Annotated, Any, Literal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
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


class SubmitRunRequest(BaseModel):
    project_id: str = Field(min_length=1)
    prompt: str = Field(min_length=3, max_length=20_000)
    idempotency_key: str = Field(min_length=8, max_length=200)
    budget: RunBudget = Field(default_factory=RunBudget)
    base_run_id: str | None = None
    quality: Literal["fast", "balanced", "polished"] = "balanced"


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
    project = await asyncio.to_thread(
        lambda: (
            supabase.table("projects")
            .select("id")
            .eq("id", payload.project_id)
            .eq("user_id", str(current_user.id))
            .execute()
        )
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")
    context_files = []
    if payload.base_run_id:
        base = await orchestrator.get(payload.base_run_id)
        if (
            base is None
            or base.user_id != str(current_user.id)
            or base.project_id != payload.project_id
        ):
            raise HTTPException(status_code=404, detail="Base run not found")
        if base.status.value != "completed" or base.changes is None:
            raise HTTPException(status_code=409, detail="Base run must be completed")
        context_files = [f for f in base.changes.files if f.operation == "upsert"]
    run = await orchestrator.submit(
        RunRequest(
            user_id=str(current_user.id),
            project_id=payload.project_id,
            prompt=payload.prompt,
            idempotency_key=payload.idempotency_key,
            budget=payload.budget,
            base_run_id=payload.base_run_id,
            context_files=context_files,
            quality=payload.quality,
        )
    )
    if not run.is_terminal and runtime.inline_execution_enabled:
        background_tasks.add_task(orchestrator.execute, run.id)
    return run


@router.get("/runs/{run_id}", response_model=AgentRun)
async def get_run(
    run_id: str,
    current_user: CurrentUser,
    orchestrator: Orchestrator,
):
    run = await orchestrator.get(run_id)
    if run is None or run.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.get("/runs/{run_id}/preview")
async def get_preview(
    run_id: str, current_user: CurrentUser, orchestrator: Orchestrator
):
    run = await orchestrator.get(run_id)
    if run is None or run.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Run not found")
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
    after: int = 0,
):
    run = await orchestrator.get(run_id)
    if run is None or run.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Run not found")
    return await orchestrator.list_events(run_id, after=max(0, after))


@router.post("/runs/{run_id}/cancel", response_model=AgentRun)
async def cancel_run(
    run_id: str,
    current_user: CurrentUser,
    orchestrator: Orchestrator,
):
    run = await orchestrator.get(run_id)
    if run is None or run.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Run not found")
    return await orchestrator.request_cancel(run_id)


@router.get("/runs/{run_id}/events/stream")
async def stream_run_events(
    run_id: str,
    current_user: CurrentUser,
    orchestrator: Orchestrator,
    after: int = 0,
):
    run = await orchestrator.get(run_id)
    if run is None or run.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Run not found")

    async def event_stream():
        cursor = max(0, after)
        while True:
            events = await orchestrator.list_events(run_id, cursor)
            for event in events:
                cursor = event.sequence
                yield (
                    f"id: {event.sequence}\n"
                    f"event: {event.event_type}\n"
                    f"data: {event.model_dump_json()}\n\n"
                )

            current = await orchestrator.get(run_id)
            if current is None or (current.is_terminal and not events):
                return
            await asyncio.sleep(0.25)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
