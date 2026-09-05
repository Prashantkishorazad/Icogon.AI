from __future__ import annotations

import asyncio
from contextvars import ContextVar
from uuid import uuid4

from app.agents.pipeline import AgentPipeline
from app.orchestrator.models import (
    AgentRun,
    ChangeResponse,
    ProviderUsage,
    RunEvent,
    RunFailure,
    RunRequest,
    RunStatus,
    RunStep,
    utc_now,
)
from app.orchestrator.ports import AgentProvider, ChangeVerifier, RunRepository
from app.orchestrator.provider import ProviderError


class BudgetExceededError(RuntimeError):
    pass


class OrchestratorService:
    def __init__(
        self,
        repository: RunRepository,
        provider: AgentProvider,
        verifier: ChangeVerifier,
        pipeline: AgentPipeline | None = None,
    ) -> None:
        self._repository = repository
        self._provider = provider
        self._agents = pipeline or AgentPipeline.from_provider(provider, verifier)
        self._run_locks: dict[str, asyncio.Lock] = {}
        self._lease_token: ContextVar[str | None] = ContextVar(
            "orchestrator_lease_token",
            default=None,
        )

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
            previous = run.status
            updated = await self._repository.request_cancel(run_id)
            if updated is None:
                raise KeyError(f"Run not found: {run_id}")
            run = updated
            if run.cancel_requested_at is not None:
                await self._emit(run, "run.cancel_requested")
            if previous == RunStatus.QUEUED and run.status == RunStatus.CANCELLED:
                await self._emit(
                    run,
                    "run.status_changed",
                    {"from": previous.value, "to": RunStatus.CANCELLED.value},
                )
        return await self._require_run(run_id)

    async def process_next(
        self,
        worker_id: str,
        lease_seconds: int = 30,
    ) -> AgentRun | None:
        run_id = await self._repository.next_claimable_run_id()
        if run_id is None:
            return None
        return await self.execute(run_id, worker_id, lease_seconds)

    async def execute(
        self,
        run_id: str,
        worker_id: str | None = None,
        lease_seconds: int = 30,
    ) -> AgentRun:
        lock = self._run_locks.setdefault(run_id, asyncio.Lock())
        async with lock:
            run = await self._require_run(run_id)
            if run.is_terminal:
                return run
            lease = await self._repository.claim(
                run_id,
                worker_id or f"inline-{uuid4()}",
                max(1, lease_seconds),
            )
            if lease is None:
                return run
            token_context = self._lease_token.set(lease.token)
            stop_heartbeat = asyncio.Event()
            heartbeat_task = asyncio.create_task(
                self._heartbeat_loop(lease.token, lease_seconds, stop_heartbeat)
            )
            try:
                run = await self._require_run(run_id)
                await self._emit(
                    run,
                    "worker.claimed",
                    {
                        "worker_id": lease.worker_id,
                        "attempt": run.execution_attempts,
                        "recovered": lease.recovered,
                    },
                )
                await self._execute_claimed_run(run, lease.recovered)
            finally:
                stop_heartbeat.set()
                await asyncio.gather(heartbeat_task, return_exceptions=True)
                released = False
                try:
                    released = await self._repository.release(lease.token)
                finally:
                    self._lease_token.reset(token_context)
                if released:
                    current = await self._require_run(run_id)
                    await self._emit(
                        current,
                        "worker.released",
                        {"worker_id": lease.worker_id},
                    )
            return await self._require_run(run_id)

    async def _execute_claimed_run(self, run: AgentRun, recovered: bool) -> None:
        if recovered:
            await self._recover_interrupted_run(run)
        if await self._stop_if_cancelled(run):
            return

        request = RunRequest(
            user_id=run.user_id,
            project_id=run.project_id,
            prompt=run.prompt,
            idempotency_key=run.idempotency_key,
            budget=run.budget,
            context_files=run.context_files,
            base_run_id=run.base_run_id,
            quality=run.quality,
        )
        try:
            if run.brief is None:
                await self._requirements_step(run, request)
            if run.is_terminal:
                return
            if run.architecture is None:
                await self._architecture_step(run, request)
            if run.is_terminal:
                return
            if run.plan is None:
                await self._planning_step(run, request)
            if run.is_terminal:
                return
            if run.changes is None:
                await self._generation_step(run, request)
            if run.is_terminal:
                return
            await self._verification_loop(run, request)
        except BudgetExceededError as exc:
            await self._fail(run, "budget_exceeded", str(exc), retryable=False)
        except ProviderError as exc:
            await self._fail(run, exc.code, str(exc), retryable=exc.retryable)
        except Exception as exc:  # noqa: BLE001
            await self._fail(run, "orchestration_error", str(exc), retryable=True)

    async def _requirements_step(self, run: AgentRun, request: RunRequest) -> None:
        await self._change_status(run, RunStatus.ANALYZING)
        step = await self._start_step(run, "requirements")
        try:
            run.brief = await self._agents.requirements.analyze(request)
            await self._finish_step(
                run,
                step,
                {
                    "requirements": len(run.brief.requirements),
                    "open_questions": len(run.brief.open_questions),
                },
            )
        except Exception as exc:
            await self._finish_step(run, step, error=str(exc))
            raise

    async def _architecture_step(self, run: AgentRun, request: RunRequest) -> None:
        if run.brief is None:
            raise RuntimeError("Cannot design architecture without a project brief")
        if await self._stop_if_cancelled(run):
            return
        await self._change_status(run, RunStatus.DESIGNING)
        step = await self._start_step(run, "architecture")
        try:
            run.architecture = await self._agents.architecture.design(
                request,
                run.brief,
            )
            await self._finish_step(
                run,
                step,
                {
                    "modules": len(run.architecture.modules),
                    "decisions": len(run.architecture.decisions),
                },
            )
        except Exception as exc:
            await self._finish_step(run, step, error=str(exc))
            raise

    async def _heartbeat_loop(
        self,
        lease_token: str,
        lease_seconds: int,
        stop: asyncio.Event,
    ) -> None:
        interval = max(0.25, lease_seconds / 3)
        while not stop.is_set():
            try:
                await asyncio.wait_for(stop.wait(), timeout=interval)
            except TimeoutError:
                renewed = await self._repository.heartbeat(
                    lease_token,
                    max(1, lease_seconds),
                )
                if renewed is None:
                    return

    async def _planning_step(self, run: AgentRun, request: RunRequest) -> None:
        if run.brief is None or run.architecture is None:
            raise RuntimeError("Cannot plan without requirements and architecture")
        if await self._stop_if_cancelled(run):
            return
        await self._change_status(run, RunStatus.PLANNING)
        step = await self._start_step(run, "planning")
        try:
            await self._reserve_model_call(run)
            response = await self._agents.planning.plan(
                self._remaining_request(run, request),
                run.brief,
                run.architecture,
            )
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
        if run.brief is None or run.architecture is None or run.plan is None:
            raise RuntimeError(
                "Cannot implement changes without approved planning context"
            )
        if await self._stop_if_cancelled(run):
            return
        await self._change_status(run, RunStatus.GENERATING)
        step = await self._start_step(run, "implementation")
        try:
            await self._reserve_model_call(run)
            response = await self._agents.implementation.implement(
                self._remaining_request(run, request),
                run.brief,
                run.architecture,
                run.plan,
            )
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
        if (
            run.brief is None
            or run.architecture is None
            or run.plan is None
            or run.changes is None
        ):
            raise RuntimeError("Cannot verify an empty plan or change set")

        while True:
            if await self._stop_if_cancelled(run):
                return

            await self._change_status(run, RunStatus.REVIEWING)
            review_step = await self._start_step(run, "review")
            try:
                run.review = await self._agents.review.review(run.plan, run.changes)
                await self._finish_step(
                    run,
                    review_step,
                    {
                        "approved": run.review.approved,
                        "findings": len(run.review.findings),
                    },
                )
            except Exception as exc:
                await self._finish_step(run, review_step, error=str(exc))
                raise

            if run.review.approved:
                security_step = await self._start_step(run, "security_policy")
                try:
                    assessment = await self._agents.security.assess(run.changes)
                    run.review.findings.extend(assessment.findings)
                    run.review.approved = assessment.approved
                    await self._finish_step(
                        run,
                        security_step,
                        {
                            "approved": assessment.approved,
                            "findings": len(assessment.findings),
                        },
                    )
                except Exception as exc:
                    await self._finish_step(run, security_step, error=str(exc))
                    raise

            if run.review.approved:
                semantic_review = getattr(self._provider, "review_changes", None)
                if request.quality == "polished" and semantic_review is not None:
                    quality_step = await self._start_step(run, "quality_review")
                    try:
                        await self._reserve_model_call(run)
                        response = await semantic_review(
                            self._remaining_request(run, request), run.plan, run.changes
                        )
                        self._record_usage(run, response.usage)
                        run.review.findings.extend(response.review.findings)
                        run.review.approved = response.review.approved
                        await self._finish_step(
                            run, quality_step, {"approved": run.review.approved}
                        )
                    except Exception as exc:
                        await self._finish_step(run, quality_step, error=str(exc))
                        raise

            if run.review.approved:
                await self._change_status(run, RunStatus.VERIFYING)
                verification_step = await self._start_step(run, "verification")
                try:
                    result = await self._agents.verification.verify(
                        run.project_id,
                        run.changes,
                    )
                    run.verification = result
                    await self._finish_step(
                        run,
                        verification_step,
                        {"checks": result.checks, "passed": result.passed},
                    )
                except Exception as exc:
                    await self._finish_step(run, verification_step, error=str(exc))
                    raise

                if result.passed:
                    if await self._stop_if_cancelled(run):
                        return
                    await self._change_status(run, RunStatus.COMPLETED)
                    return
                feedback = result.feedback
            else:
                feedback = [finding.message for finding in run.review.findings]

            if run.repair_attempts >= run.budget.max_repair_attempts:
                await self._fail(
                    run,
                    "quality_gate_failed",
                    "The change set did not pass review and verification within the repair budget.",
                    retryable=False,
                )
                return

            await self._change_status(run, RunStatus.REPAIRING)
            run.repair_attempts += 1
            await self._save(run)
            repair_step = await self._start_step(run, "repair")
            try:
                await self._reserve_model_call(run)
                response: ChangeResponse = await self._agents.implementation.repair(
                    self._remaining_request(run, request),
                    run.brief,
                    run.architecture,
                    run.plan,
                    run.changes,
                    feedback,
                )
                self._record_usage(run, response.usage)
                run.changes = response.changes
                await self._finish_step(
                    run,
                    repair_step,
                    {"attempt": run.repair_attempts, "feedback": feedback},
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
        await self._save(run)
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

    async def _recover_interrupted_run(self, run: AgentRun) -> None:
        previous = run.status
        for step in reversed(run.steps):
            if step.status == "running":
                step.status = "interrupted"
                step.finished_at = utc_now()
                step.error = "Worker lease expired before the step completed"
                break

        if run.brief is None:
            checkpoint = RunStatus.QUEUED
        elif run.architecture is None:
            checkpoint = RunStatus.ANALYZING
        elif run.plan is None:
            checkpoint = RunStatus.DESIGNING
        elif run.changes is None:
            checkpoint = RunStatus.PLANNING
        else:
            checkpoint = RunStatus.GENERATING

        run.status = checkpoint
        run.updated_at = utc_now()
        run.version += 1
        await self._save(run)
        await self._emit(
            run,
            "run.recovered",
            {"from": previous.value, "checkpoint": checkpoint.value},
        )

    async def _change_status(self, run: AgentRun, target: RunStatus) -> None:
        previous = run.status
        run.transition_to(target)
        await self._save(run)
        await self._emit(
            run,
            "run.status_changed",
            {"from": previous.value, "to": target.value},
        )

    async def _stop_if_cancelled(self, run: AgentRun) -> bool:
        current = await self._require_run(run.id)
        run.cancel_requested_at = current.cancel_requested_at
        if run.cancel_requested_at is None:
            return False
        if not run.is_terminal:
            await self._change_status(run, RunStatus.CANCELLED)
        return True

    async def _start_step(self, run: AgentRun, name: str) -> RunStep:
        step = RunStep(name=name)
        run.steps.append(step)
        await self._save(run)
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
        await self._save(run)
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
            RunEvent(run_id=run.id, event_type=event_type, payload=payload or {}),
            self._lease_token.get(),
        )

    async def _save(self, run: AgentRun) -> AgentRun:
        return await self._repository.save(run, self._lease_token.get())

    async def _reserve_model_call(self, run: AgentRun) -> None:
        if run.output_tokens >= run.budget.max_output_tokens:
            raise BudgetExceededError("Maximum output token budget reached")
        if run.model_calls >= run.budget.max_model_calls:
            raise BudgetExceededError("Maximum model call budget reached")
        run.model_calls += 1
        await self._save(run)
        await self._emit(
            run,
            "budget.model_call_reserved",
            {"model_calls": run.model_calls, "limit": run.budget.max_model_calls},
        )

    @staticmethod
    def _remaining_request(run: AgentRun, request: RunRequest) -> RunRequest:
        return request.model_copy(
            update={
                "budget": request.budget.model_copy(
                    update={
                        "max_output_tokens": run.budget.max_output_tokens
                        - run.output_tokens,
                    }
                )
            }
        )

    @staticmethod
    def _record_usage(run: AgentRun, usage: ProviderUsage) -> None:
        next_output_total = run.output_tokens + usage.output_tokens
        run.input_tokens += usage.input_tokens
        run.output_tokens = next_output_total
        if next_output_total > run.budget.max_output_tokens:
            raise BudgetExceededError("Maximum output token budget reached")
