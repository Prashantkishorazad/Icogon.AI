from __future__ import annotations

import asyncio

from app.orchestrator.models import (
    AgentRun,
    ChangeResponse,
    ProviderUsage,
    RunFailure,
    RunEvent,
    RunRequest,
    RunStatus,
    RunStep,
    utc_now,
)
from app.orchestrator.ports import AgentProvider, ChangeVerifier, RunRepository


class BudgetExceededError(RuntimeError):
    pass


class OrchestratorService:
    def __init__(
        self,
        repository: RunRepository,
        provider: AgentProvider,
        verifier: ChangeVerifier,
    ) -> None:
        self._repository = repository
        self._provider = provider
        self._verifier = verifier
        self._run_locks: dict[str, asyncio.Lock] = {}

    async def submit(self, request: RunRequest) -> AgentRun:
        existing = await self._repository.get_by_idempotency_key(
            request.user_id,
            request.idempotency_key,
        )
        if existing:
            return existing
        run = AgentRun(**request.model_dump())
        created = await self._repository.create(run)
        if created.id == run.id:
            await self._emit(created, "run.created", {"status": created.status.value})
        return created

    async def get(self, run_id: str) -> AgentRun | None:
        return await self._repository.get(run_id)

    async def list_events(self, run_id: str, after: int = 0) -> list[RunEvent]:
        return await self._repository.list_events(run_id, after)

    async def request_cancel(self, run_id: str) -> AgentRun:
        run = await self._require_run(run_id)
        if run.is_terminal:
            return run
        if run.cancel_requested_at is None:
            run.cancel_requested_at = utc_now()
            await self._repository.save(run)
            await self._emit(run, "run.cancel_requested")
        if run.status == RunStatus.QUEUED:
            await self._change_status(run, RunStatus.CANCELLED)
        return await self._require_run(run_id)

    async def execute(self, run_id: str) -> AgentRun:
        lock = self._run_locks.setdefault(run_id, asyncio.Lock())
        async with lock:
            run = await self._require_run(run_id)
            if run.is_terminal:
                return run
            if run.status != RunStatus.QUEUED:
                return run

            if await self._stop_if_cancelled(run):
                return await self._require_run(run_id)

            request = RunRequest(
                user_id=run.user_id,
                project_id=run.project_id,
                prompt=run.prompt,
                idempotency_key=run.idempotency_key,
                budget=run.budget,
            )
            try:
                await self._planning_step(run, request)
                if run.is_terminal:
                    return await self._require_run(run_id)
                await self._generation_step(run, request)
                if run.is_terminal:
                    return await self._require_run(run_id)
                await self._verification_loop(run, request)
            except BudgetExceededError as exc:
                await self._fail(run, "budget_exceeded", str(exc), retryable=False)
            except Exception as exc:
                await self._fail(run, "orchestration_error", str(exc), retryable=True)
            return await self._require_run(run_id)

    async def _planning_step(self, run: AgentRun, request: RunRequest) -> None:
        await self._change_status(run, RunStatus.PLANNING)
        step = await self._start_step(run, "planning")
        try:
            self._reserve_model_call(run)
            response = await self._provider.create_plan(request)
            self._record_usage(run, response.usage)
            run.plan = response.plan
            await self._finish_step(
                run,
                step,
                {"task_count": len(response.plan.tasks)},
            )
        except Exception as exc:
            await self._finish_step(run, step, error=str(exc))
            raise

    async def _generation_step(self, run: AgentRun, request: RunRequest) -> None:
        if run.plan is None:
            raise RuntimeError("Cannot generate changes without a plan")
        if await self._stop_if_cancelled(run):
            return
        await self._change_status(run, RunStatus.GENERATING)
        step = await self._start_step(run, "generating")
        try:
            self._reserve_model_call(run)
            response = await self._provider.generate_changes(request, run.plan)
            self._record_usage(run, response.usage)
            run.changes = response.changes
            await self._finish_step(
                run,
                step,
                {"file_count": len(response.changes.files)},
            )
        except Exception as exc:
            await self._finish_step(run, step, error=str(exc))
            raise

    async def _verification_loop(self, run: AgentRun, request: RunRequest) -> None:
        if run.plan is None or run.changes is None:
            raise RuntimeError("Cannot verify an empty plan or change set")

        while True:
            if await self._stop_if_cancelled(run):
                return
            await self._change_status(run, RunStatus.VERIFYING)
            step = await self._start_step(run, "verifying")
            try:
                result = await self._verifier.verify(run.changes)
                run.verification = result
                await self._finish_step(
                    run,
                    step,
                    {"checks": result.checks, "passed": result.passed},
                )
            except Exception as exc:
                await self._finish_step(run, step, error=str(exc))
                raise

            if result.passed:
                await self._change_status(run, RunStatus.COMPLETED)
                return

            if run.repair_attempts >= run.budget.max_repair_attempts:
                await self._fail(
                    run,
                    "verification_failed",
                    "Generated changes failed verification after the allowed repair attempts.",
                    retryable=False,
                )
                return

            await self._change_status(run, RunStatus.REPAIRING)
            run.repair_attempts += 1
            await self._repository.save(run)
            repair_step = await self._start_step(run, "repairing")
            try:
                self._reserve_model_call(run)
                response: ChangeResponse = await self._provider.repair_changes(
                    request,
                    run.plan,
                    run.changes,
                    result.feedback,
                )
                self._record_usage(run, response.usage)
                run.changes = response.changes
                await self._finish_step(
                    run,
                    repair_step,
                    {"attempt": run.repair_attempts, "feedback": result.feedback},
                )
            except Exception as exc:
                await self._finish_step(run, repair_step, error=str(exc))
                raise

    async def _fail(
        self,
        run: AgentRun,
        code: str,
        message: str,
        retryable: bool,
    ) -> None:
        if run.status == RunStatus.CANCELLED:
            return
        if not run.is_terminal:
            await self._change_status(run, RunStatus.FAILED)
        run.failure = RunFailure(code=code, message=message, retryable=retryable)
        await self._repository.save(run)
        await self._emit(
            run,
            "run.failed",
            {"code": code, "retryable": retryable},
        )

    async def _require_run(self, run_id: str) -> AgentRun:
        run = await self._repository.get(run_id)
        if run is None:
            raise KeyError(f"Run not found: {run_id}")
        return run

    async def _change_status(self, run: AgentRun, target: RunStatus) -> None:
        previous = run.status
        run.transition_to(target)
        await self._repository.save(run)
        await self._emit(
            run,
            "run.status_changed",
            {"from": previous.value, "to": target.value},
        )

    async def _stop_if_cancelled(self, run: AgentRun) -> bool:
        if run.cancel_requested_at is None:
            return False
        if not run.is_terminal:
            await self._change_status(run, RunStatus.CANCELLED)
        return True

    async def _start_step(self, run: AgentRun, name: str) -> RunStep:
        step = RunStep(name=name)
        run.steps.append(step)
        await self._repository.save(run)
        await self._emit(run, "step.started", {"step_id": step.id, "name": name})
        return step

    async def _finish_step(
        self,
        run: AgentRun,
        step: RunStep,
        details: dict | None = None,
        error: str | None = None,
    ) -> None:
        step.finished_at = utc_now()
        step.details = details or {}
        step.error = error
        step.status = "failed" if error else "completed"
        await self._repository.save(run)
        await self._emit(
            run,
            "step.failed" if error else "step.completed",
            {"step_id": step.id, "name": step.name, "details": step.details},
        )

    async def _emit(
        self,
        run: AgentRun,
        event_type: str,
        payload: dict | None = None,
    ) -> RunEvent:
        return await self._repository.append_event(
            RunEvent(run_id=run.id, event_type=event_type, payload=payload or {})
        )

    @staticmethod
    def _reserve_model_call(run: AgentRun) -> None:
        if run.model_calls >= run.budget.max_model_calls:
            raise BudgetExceededError("Maximum model call budget reached")
        run.model_calls += 1

    @staticmethod
    def _record_usage(run: AgentRun, usage: ProviderUsage) -> None:
        next_output_total = run.output_tokens + usage.output_tokens
        if next_output_total > run.budget.max_output_tokens:
            raise BudgetExceededError("Maximum output token budget reached")
        run.input_tokens += usage.input_tokens
        run.output_tokens = next_output_total
