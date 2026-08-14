from __future__ import annotations

import asyncio

from app.orchestrator.models import (
    AgentRun,
    ChangeResponse,
    ProviderUsage,
    RunFailure,
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
        return await self._repository.create(run)

    async def get(self, run_id: str) -> AgentRun | None:
        return await self._repository.get(run_id)

    async def execute(self, run_id: str) -> AgentRun:
        lock = self._run_locks.setdefault(run_id, asyncio.Lock())
        async with lock:
            run = await self._require_run(run_id)
            if run.is_terminal:
                return run
            if run.status != RunStatus.QUEUED:
                return run

            request = RunRequest(
                user_id=run.user_id,
                project_id=run.project_id,
                prompt=run.prompt,
                idempotency_key=run.idempotency_key,
                budget=run.budget,
            )
            try:
                await self._planning_step(run, request)
                await self._generation_step(run, request)
                await self._verification_loop(run, request)
            except BudgetExceededError as exc:
                await self._fail(run, "budget_exceeded", str(exc), retryable=False)
            except Exception as exc:
                await self._fail(run, "orchestration_error", str(exc), retryable=True)
            return await self._require_run(run_id)

    async def _planning_step(self, run: AgentRun, request: RunRequest) -> None:
        run.transition_to(RunStatus.PLANNING)
        step = self._start_step(run, "planning")
        await self._repository.save(run)
        try:
            self._reserve_model_call(run)
            response = await self._provider.create_plan(request)
            self._record_usage(run, response.usage)
            run.plan = response.plan
            self._finish_step(step, {"task_count": len(response.plan.tasks)})
            await self._repository.save(run)
        except Exception as exc:
            self._finish_step(step, error=str(exc))
            await self._repository.save(run)
            raise

    async def _generation_step(self, run: AgentRun, request: RunRequest) -> None:
        if run.plan is None:
            raise RuntimeError("Cannot generate changes without a plan")
        run.transition_to(RunStatus.GENERATING)
        step = self._start_step(run, "generating")
        await self._repository.save(run)
        try:
            self._reserve_model_call(run)
            response = await self._provider.generate_changes(request, run.plan)
            self._record_usage(run, response.usage)
            run.changes = response.changes
            self._finish_step(step, {"file_count": len(response.changes.files)})
            await self._repository.save(run)
        except Exception as exc:
            self._finish_step(step, error=str(exc))
            await self._repository.save(run)
            raise

    async def _verification_loop(self, run: AgentRun, request: RunRequest) -> None:
        if run.plan is None or run.changes is None:
            raise RuntimeError("Cannot verify an empty plan or change set")

        while True:
            run.transition_to(RunStatus.VERIFYING)
            step = self._start_step(run, "verifying")
            await self._repository.save(run)
            try:
                result = await self._verifier.verify(run.changes)
                run.verification = result
                self._finish_step(step, {"checks": result.checks, "passed": result.passed})
                await self._repository.save(run)
            except Exception as exc:
                self._finish_step(step, error=str(exc))
                await self._repository.save(run)
                raise


            if result.passed:
                run.transition_to(RunStatus.COMPLETED)
                await self._repository.save(run)
                return

            if run.repair_attempts >= run.budget.max_repair_attempts:
                await self._fail(
                    run,
                    "verification_failed",
                    "Generated changes failed verification after the allowed repair attempts.",
                    retryable=False,
                )
                return

            run.transition_to(RunStatus.REPAIRING)
            run.repair_attempts += 1
            repair_step = self._start_step(run, "repairing")
            await self._repository.save(run)
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
                self._finish_step(
                    repair_step,
                    {"attempt": run.repair_attempts, "feedback": result.feedback},
                )
                await self._repository.save(run)
            except Exception as exc:
                self._finish_step(repair_step, error=str(exc))
                await self._repository.save(run)
                raise

    async def _fail(
        self,
        run: AgentRun,
        code: str,
        message: str,
        retryable: bool,
    ) -> None:
        if not run.is_terminal:
            run.transition_to(RunStatus.FAILED)
        run.failure = RunFailure(code=code, message=message, retryable=retryable)
        await self._repository.save(run)

    async def _require_run(self, run_id: str) -> AgentRun:
        run = await self._repository.get(run_id)
        if run is None:
            raise KeyError(f"Run not found: {run_id}")
        return run

    @staticmethod
    def _start_step(run: AgentRun, name: str) -> RunStep:
        step = RunStep(name=name)
        run.steps.append(step)
        return step

    @staticmethod
    def _finish_step(
        step: RunStep,
        details: dict | None = None,
        error: str | None = None,
    ) -> None:
        step.finished_at = utc_now()
        step.details = details or {}
        step.error = error
        step.status = "failed" if error else "completed"

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
