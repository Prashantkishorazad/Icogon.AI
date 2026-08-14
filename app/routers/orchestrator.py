from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.middleware.jwtauth import get_current_user
from app.orchestrator.models import AgentRun, RunBudget, RunEvent, RunRequest
from app.orchestrator.runtime import service


router = APIRouter(prefix="/orchestrator", tags=["Orchestrator"])


class SubmitRunRequest(BaseModel):
    project_id: str = Field(min_length=1)
    prompt: str = Field(min_length=3, max_length=20_000)
    idempotency_key: str = Field(min_length=8, max_length=200)
    budget: RunBudget = Field(default_factory=RunBudget)


@router.post("/runs", response_model=AgentRun, status_code=status.HTTP_202_ACCEPTED)
async def submit_run(
    payload: SubmitRunRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
):
    run = await service.submit(
        RunRequest(
            user_id=str(current_user.id),
            project_id=payload.project_id,
            prompt=payload.prompt,
            idempotency_key=payload.idempotency_key,
            budget=payload.budget,
        )
    )
    if not run.is_terminal:
        background_tasks.add_task(service.execute, run.id)
    return run


@router.get("/runs/{run_id}", response_model=AgentRun)
async def get_run(run_id: str, current_user=Depends(get_current_user)):
    run = await service.get(run_id)
    if run is None or run.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.get("/runs/{run_id}/events", response_model=list[RunEvent])
async def get_run_events(
    run_id: str,
    after: int = 0,
    current_user=Depends(get_current_user),
):
    run = await service.get(run_id)
    if run is None or run.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Run not found")
    return await service.list_events(run_id, after=max(0, after))


@router.post("/runs/{run_id}/cancel", response_model=AgentRun)
async def cancel_run(run_id: str, current_user=Depends(get_current_user)):
    run = await service.get(run_id)
    if run is None or run.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Run not found")
    return await service.request_cancel(run_id)
