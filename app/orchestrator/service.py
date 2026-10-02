

from __future__ import annotations

import asyncio
from contextvars import ContextVar
from typing import Literal
from uuid import uuid4

from app.agents.context import (
    ALWAYS_PRESERVE,
    _is_safe_relative_path,
    assemble_snapshot,
    implementation_context,
    validate_file_plan,
    validate_implementation_contract,
)

from app.orchestrator.provider import (
    ProviderError,
)
from app.agents.pipeline import AgentPipeline
from app.orchestrator.models import (
    AgentMessage,
    AgentRun,
    ChangeResponse,
    ChangeSet,
    ReviewResponse,
    ProviderUsage,
    RunEvent,
    RunFailure,
    RunRequest,
    RunStatus,
    RunStep,
    utc_now,
)
from app.orchestrator.ports import AgentProvider, ChangeVerifier, RunRepository


class BudgetExceededError(RuntimeError):
    pass


def _merge_repair_snapshot(current, repair):
    """
    Merge a repair delta into the current complete implementation snapshot.

    The current implementation snapshot remains authoritative for files
    that the repair agent does not touch.

    Repair files:
      - upsert/other operations replace the matching current file
      - delete explicitly removes the matching file

    This prevents a partial repair response from accidentally deleting
    unrelated files from the current implementation.
    """
    files_by_path = {
        file.path: file.model_copy(deep=True)
        for file in current.files
    }

    repaired_paths = set()

    for file in repair.files:
        repaired_paths.add(file.path)

        if file.operation == "delete":
            files_by_path.pop(file.path, None)
        else:
            files_by_path[file.path] = file.model_copy(deep=True)

    merged_files = list(files_by_path.values())

    reused_paths = [
        file.path
        for file in current.files
        if file.path not in repaired_paths
    ]

    return current.model_copy(
        update={
            "summary": repair.summary or current.summary,
            "files": merged_files,
        }
    ), {
        "generated": len(repair.files),
        "reused": len(reused_paths),
        "reused_paths": reused_paths,
    }


def _require_changes(run: AgentRun) -> ChangeSet:
    """Return the current complete change snapshot or fail clearly."""
    changes = run.changes
    if changes is None:
        raise RuntimeError("Run has no implementation change set")
    return changes


class OrchestratorService:
    """Durable orchestration engine for product-aware project generation.

    The service owns the lifecycle and checkpoints; agents own decisions and
    artifacts. A generated implementation is treated as a complete snapshot,
    while repair responses are treated as deltas and merged into that snapshot.
    """

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
            await self._emit(
                created,
                "run.created",
                {"status": created.status.value},
            )

        return created

    async def get(self, run_id: str) -> AgentRun | None:
        return await self._repository.get(run_id)

    async def list_events(
        self,
        run_id: str,
        after: int = 0,
    ) -> list[RunEvent]:
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

            if (
                previous == RunStatus.QUEUED
                and run.status == RunStatus.CANCELLED
            ):
                await self._emit(
                    run,
                    "run.status_changed",
                    {
                        "from": previous.value,
                        "to": RunStatus.CANCELLED.value,
                    },
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

        return await self.execute(
            run_id,
            worker_id,
            lease_seconds,
        )

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
                self._heartbeat_loop(
                    lease.token,
                    lease_seconds,
                    stop_heartbeat,
                )
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

                await self._execute_claimed_run(
                    run,
                    lease.recovered,
                )

            finally:
                stop_heartbeat.set()

                await asyncio.gather(
                    heartbeat_task,
                    return_exceptions=True,
                )

                released = False

                try:
                    released = await self._repository.release(
                        lease.token
                    )
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

    async def _execute_claimed_run(
        self,
        run: AgentRun,
        recovered: bool,
    ) -> None:
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
            await self._fail(
                run,
                "budget_exceeded",
                str(exc),
                retryable=False,
            )

        except ProviderError as exc:
            await self._fail(
                run,
                exc.code,
                str(exc),
                retryable=exc.retryable,
            )

        except Exception as exc:
            await self._fail(
                run,
                "orchestration_error",
                str(exc),
                retryable=True,
            )

    async def _requirements_step(
        self,
        run: AgentRun,
        request: RunRequest,
    ) -> None:
        await self._change_status(
            run,
            RunStatus.ANALYZING,
        )

        step = await self._start_step(
            run,
            "requirements",
        )

        try:
            run.brief = await self._agents.requirements.analyze(
                request
            )

            await self._handoff(
                run,
                "requirements",
                "architecture",
                "artifact",
                (
                    f"Brief prepared with "
                    f"{len(run.brief.requirements)} requirements "
                    f"and "
                    f"{len(run.brief.open_questions)} open questions."
                ),
                "brief",
            )

            await self._finish_step(
                run,
                step,
                {
                    "requirements": len(run.brief.requirements),
                    "open_questions": len(run.brief.open_questions),
                },
            )

        except Exception as exc:
            await self._finish_step(
                run,
                step,
                error=str(exc),
            )
            raise

    async def _architecture_step(
        self,
        run: AgentRun,
        request: RunRequest,
    ) -> None:
        if run.brief is None:
            raise RuntimeError(
                "Cannot design architecture without a project brief"
            )

        if await self._stop_if_cancelled(run):
            return

        await self._change_status(
            run,
            RunStatus.DESIGNING,
        )

        step = await self._start_step(
            run,
            "architecture",
        )

        try:
            run.architecture = await self._agents.architecture.design(
                request,
                run.brief,
            )

            await self._handoff(
                run,
                "architecture",
                "planner",
                "artifact",
                (
                    f"Architecture prepared with "
                    f"{len(run.architecture.modules)} modules "
                    f"and "
                    f"{len(run.architecture.required_checks)} "
                    f"required checks."
                ),
                "architecture",
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
            await self._finish_step(
                run,
                step,
                error=str(exc),
            )
            raise

    async def _heartbeat_loop(
        self,
        lease_token: str,
        lease_seconds: int,
        stop: asyncio.Event,
    ) -> None:
        interval = max(
            0.25,
            lease_seconds / 3,
        )

        while not stop.is_set():
            try:
                await asyncio.wait_for(
                    stop.wait(),
                    timeout=interval,
                )

            except TimeoutError:
                renewed = await self._repository.heartbeat(
                    lease_token,
                    max(1, lease_seconds),
                )

                if renewed is None:
                    return

    async def _planning_step(
        self,
        run: AgentRun,
        request: RunRequest,
    ) -> None:
        if run.brief is None or run.architecture is None:
            raise RuntimeError(
                "Cannot plan without requirements and architecture"
            )

        if await self._stop_if_cancelled(run):
            return

        await self._change_status(
            run,
            RunStatus.PLANNING,
        )

        step = await self._start_step(
            run,
            "planning",
        )

        try:
            await self._reserve_model_call(run)

            response = await self._agents.planning.plan(
                self._remaining_request(run, request),
                run.brief,
                run.architecture,
            )

            self._record_usage(
                run,
                response.usage,
            )

            run.plan = response.plan

            validate_file_plan(
                run.plan.file_plan,
                {
                    file.path
                    for file in request.context_files
                },
            )

            await self._handoff(
                run,
                "planner",
                "implementation",
                "artifact",
                (
                    f"Plan approved with "
                    f"{len(response.plan.tasks)} tasks "
                    f"and "
                    f"{len(response.plan.file_plan)} "
                    f"file decisions."
                ),
                "plan",
            )

            await self._finish_step(
                run,
                step,
                {
                    "task_count": len(response.plan.tasks),
                },
            )

        except Exception as exc:
            await self._finish_step(
                run,
                step,
                error=str(exc),
            )
            raise

    async def _generation_step(
            self,
            run: AgentRun,
            request: RunRequest,
    ) -> None:
        if (
                run.brief is None
                or run.architecture is None
                or run.plan is None
        ):
            raise RuntimeError(
                "Cannot implement changes without approved planning context"
            )

        if await self._stop_if_cancelled(run):
            return

        await self._change_status(
            run,
            RunStatus.GENERATING,
        )

        step = await self._start_step(
            run,
            "implementation",
        )

        try:
            await self._reserve_model_call(run)

            implementation_request = (
                self._remaining_request(
                    run,
                    request,
                ).model_copy(
                    update={
                        "context_files": implementation_context(
                            request.context_files,
                            run.plan,
                        )
                    }
                )
            )

            response = await self._agents.implementation.implement(
                implementation_request,
                run.brief,
                run.architecture,
                run.plan,
            )

            self._record_usage(
                run,
                response.usage,
            )

            generated_changes: ChangeSet = response.changes

            # ============================================================
            # INITIAL IMPLEMENTATION CONTRACT
            # ============================================================
            #
            # The first implementation is allowed to be incomplete,
            # but it must not be allowed to poison the authoritative
            # project snapshot with unsafe/out-of-scope files.
            #
            # Examples of invalid output:
            #   - duplicate path
            #   - .env modification
            #   - out-of-scope path
            #   - invalid operation
            #
            # We therefore validate the complete response first.
            # ============================================================

            implementation_scope_issues = (
                validate_implementation_contract(
                    run.plan,
                    generated_changes,
                    context_files=request.context_files,
                    require_complete=False,
                )
            )

            if implementation_scope_issues:
                # --------------------------------------------------------
                # Build a safe candidate snapshot.
                #
                # Only files that individually satisfy the implementation
                # contract are retained. Invalid files must NOT become part
                # of run.changes, otherwise the repair stage would preserve
                # them forever.
                # --------------------------------------------------------

                # ================================================================
                # INITIAL CONTRACT VIOLATION
                # ================================================================
                #
                # We intentionally do NOT sanitize every contract violation away.
                #
                # Some violations must remain visible to the verification/repair
                # pipeline. In particular:
                #
                #   - duplicate paths
                #   - plan/scope mismatches
                #   - operation mismatches
                #
                # If we silently remove those files here, the repair agent never sees
                # the problem and repair_attempts stays at zero.
                #
                # Truly dangerous files such as protected paths are removed from the
                # authoritative snapshot because they must never survive into the
                # assembled project.
                # ================================================================

                safe_files = []

                seen_paths: set[str] = set()

                for file in generated_changes.files:
                    path = str(file.path).strip()

                    # ------------------------------------------------------------
                    # Never carry unsafe/protected files into the authoritative
                    # snapshot.
                    # ------------------------------------------------------------

                    if not _is_safe_relative_path(path):
                        continue

                    if path in ALWAYS_PRESERVE:
                        continue

                    # ------------------------------------------------------------
                    # Keep duplicate files intentionally.
                    #
                    # The complete ChangeSet validator must see the duplicate so
                    # that the repair loop can fix it.
                    # ------------------------------------------------------------

                    if path in seen_paths:
                        safe_files.append(
                            file.model_copy(deep=True)
                        )
                        continue

                    seen_paths.add(path)

                    # ------------------------------------------------------------
                    # Validate the individual file.
                    #
                    # If the file itself is valid, keep it.
                    # If it is invalid, drop it only when it is an unsafe/protected
                    # file. Other contract violations must remain visible to the
                    # repair loop.
                    # ------------------------------------------------------------

                    candidate = generated_changes.model_copy(
                        deep=True,
                        update={
                            "files": [
                                file.model_copy(deep=True),
                            ],
                        },
                    )

                    candidate_issues = validate_implementation_contract(
                        run.plan,
                        candidate,
                        context_files=request.context_files,
                        require_complete=False,
                    )

                    if candidate_issues:
                        # Keep non-protected contract violations so the verification
                        # loop can produce repair feedback.
                        safe_files.append(
                            file.model_copy(deep=True)
                        )
                        continue

                    safe_files.append(
                        file.model_copy(deep=True)
                    )

                safe_changes = generated_changes.model_copy(
                    deep=True,
                    update={
                        "files": safe_files,
                    },
                )

                run.changes = safe_changes

                run.changes = safe_changes

                await self._save(run)

                await self._handoff(
                    run,
                    "implementation",
                    "review",
                    "artifact",
                    (
                            "Initial implementation contained contract "
                            "violations. Unsafe or invalid files were excluded "
                            "from the authoritative snapshot and the run was "
                            "sent to the repair pipeline. Issues: "
                            + " | ".join(
                        implementation_scope_issues[:10]
                    )
                    ),
                    "changes",
                )

                await self._finish_step(
                    run,
                    step,
                    {
                        "file_count": len(safe_changes.files),
                        "raw_file_count": len(generated_changes.files),
                        "contract_valid": False,
                        "contract_issues": (
                            implementation_scope_issues[:30]
                        ),
                        "repair_required": True,
                    },
                )

                # Continue into _verification_loop().
                #
                # The loop will see the missing/invalid contract state
                # and invoke the implementation repair agent.
                return

            # ============================================================
            # VALID INITIAL IMPLEMENTATION
            # ============================================================

            if request.context_files:
                assembled_changes, reuse = assemble_snapshot(
                    request.context_files,
                    generated_changes,
                    run.plan,
                )
                run.changes = assembled_changes
            else:
                run.changes = generated_changes

                reuse = {
                    "generated": len(generated_changes.files),
                    "reused": 0,
                    "reused_paths": [],
                }

            current_changes = _require_changes(run)

            await self._save(run)

            await self._handoff(
                run,
                "implementation",
                "review",
                "artifact",
                (
                    f"Generated {reuse['generated']} files "
                    f"and reused {reuse['reused']} "
                    f"unchanged files."
                ),
                "changes",
            )

            await self._finish_step(
                run,
                step,
                {
                    "file_count": len(current_changes.files),
                    **reuse,
                },
            )

        except Exception as exc:
            await self._finish_step(
                run,
                step,
                error=str(exc),
            )
            raise

    async def _verification_loop(
        self,
        run: AgentRun,
        request: RunRequest,
    ) -> None:
        if (
            run.brief is None
            or run.architecture is None
            or run.plan is None
            or run.changes is None
        ):
            raise RuntimeError(
                "Cannot verify an empty plan or change set"
            )

        while True:
            if await self._stop_if_cancelled(run):
                return

            current_changes = _require_changes(run)

            # ============================================================
            # HARD IMPLEMENTATION CONTRACT
            # ============================================================
            contract_issues = validate_implementation_contract(
                run.plan,
                current_changes,
                context_files=request.context_files,
                require_complete=True,
            )

            if contract_issues:
                feedback = [
                    "Implementation contract failure: " + issue
                    for issue in contract_issues[:30]
                ]

                if (
                    run.repair_attempts
                    >= run.budget.max_repair_attempts
                ):
                    await self._fail(
                        run,
                        "quality_gate_failed",
                        (
                            "Implementation contract remained invalid "
                            "after the repair budget was exhausted. "
                            + " | ".join(contract_issues[:10])
                        ),
                        retryable=False,
                    )
                    return

                await self._change_status(
                    run,
                    RunStatus.REPAIRING,
                )

                run.repair_attempts += 1
                await self._save(run)

                repair_step = await self._start_step(
                    run,
                    "repair",
                )

                try:
                    await self._reserve_model_call(run)

                    response: ChangeResponse = (
                        await self._agents.implementation.repair(
                            self._remaining_request(
                                run,
                                request,
                            ),
                            run.brief,
                            run.architecture,
                            run.plan,
                            current_changes,
                            feedback,
                        )
                    )

                    self._record_usage(
                        run,
                        response.usage,
                    )

                    # A repair response is a DELTA.
                    # It does not have to contain every planned file.
                    repair_issues = (
                        validate_implementation_contract(
                            run.plan,
                            response.changes,
                            context_files=request.context_files,
                            require_complete=False,
                        )
                    )

                    if repair_issues:
                        feedback = [
                            "Repair output contract failure: " + issue
                            for issue in repair_issues[:30]
                        ]

                        await self._finish_step(
                            run,
                            repair_step,
                            {
                                "attempt": run.repair_attempts,
                                "contract_valid": False,
                                "contract_issues": repair_issues[:30],
                            },
                        )

                        # IMPORTANT:
                        # Never replace the current valid implementation
                        # with an invalid repair response.
                        continue

                    previous_snapshot = current_changes.model_copy(
                        deep=True
                    )

                    merged_changes, reuse = _merge_repair_snapshot(
                        previous_snapshot,
                        response.changes,
                    )
                    run.changes = merged_changes
                    current_changes = merged_changes

                    await self._handoff(
                        run,
                        "repair",
                        "review",
                        "artifact",
                        (
                            f"Contract repair changed "
                            f"{reuse['generated']} files "
                            f"while reusing "
                            f"{reuse['reused']} files."
                        ),
                        "changes",
                    )

                    await self._finish_step(
                        run,
                        repair_step,
                        {
                            "attempt": run.repair_attempts,
                            "contract_valid": True,
                            **reuse,
                        },
                    )

                    continue

                except Exception as exc:
                    await self._finish_step(
                        run,
                        repair_step,
                        error=str(exc),
                    )
                    raise

            # ============================================================
            # STRUCTURAL REVIEW
            # ============================================================
            await self._change_status(
                run,
                RunStatus.REVIEWING,
            )

            review_step = await self._start_step(
                run,
                "review",
            )

            try:
                run.review = await self._agents.review.review(
                    run.plan,
                    current_changes,
                )

                await self._handoff(
                    run,
                    "review",
                    (
                        "security"
                        if run.review.approved
                        else "repair"
                    ),
                    (
                        "decision"
                        if run.review.approved
                        else "feedback"
                    ),
                    (
                        f"Structural review "
                        f"{'approved' if run.review.approved else 'rejected'} "
                        f"with "
                        f"{len(run.review.findings)} findings."
                    ),
                    "review",
                )

                await self._finish_step(
                    run,
                    review_step,
                    {
                        "approved": run.review.approved,
                        "findings": len(run.review.findings),
                    },
                )

            except Exception as exc:
                await self._finish_step(
                    run,
                    review_step,
                    error=str(exc),
                )
                raise

            # ============================================================
            # SECURITY POLICY
            # ============================================================
            if run.review.approved:
                security_step = await self._start_step(
                    run,
                    "security_policy",
                )

                try:
                    assessment = await self._agents.security.assess(
                        current_changes,
                    )

                    run.review.findings.extend(
                        assessment.findings
                    )

                    run.review.approved = assessment.approved

                    await self._handoff(
                        run,
                        "security",
                        (
                            "quality_review"
                            if (
                                assessment.approved
                                and request.quality == "polished"
                            )
                            else "verification"
                            if assessment.approved
                            else "repair"
                        ),
                        (
                            "decision"
                            if assessment.approved
                            else "feedback"
                        ),
                        (
                            f"Security policy "
                            f"{'approved' if assessment.approved else 'rejected'} "
                            f"with "
                            f"{len(assessment.findings)} findings."
                        ),
                        "review",
                    )

                    await self._finish_step(
                        run,
                        security_step,
                        {
                            "approved": assessment.approved,
                            "findings": len(
                                assessment.findings
                            ),
                        },
                    )

                except Exception as exc:
                    await self._finish_step(
                        run,
                        security_step,
                        error=str(exc),
                    )
                    raise

            # ============================================================
            # SEMANTIC / LLM QUALITY REVIEW
            # ============================================================
            if run.review.approved:
                semantic_review = getattr(
                    self._provider,
                    "review_changes",
                    None,
                )

                if (
                    request.quality == "polished"
                    and callable(semantic_review)
                ):
                    quality_step = await self._start_step(
                        run,
                        "quality_review",
                    )

                    try:
                        await self._reserve_model_call(run)

                        response: ReviewResponse = await semantic_review(
                            self._remaining_request(
                                run,
                                request,
                            ),
                            run.plan,
                            current_changes,
                        )

                        self._record_usage(
                            run,
                            response.usage,
                        )

                        run.review.findings.extend(
                            response.review.findings
                        )

                        run.review.approved = (
                            response.review.approved
                        )

                        await self._handoff(
                            run,
                            "quality_review",
                            (
                                "verification"
                                if run.review.approved
                                else "repair"
                            ),
                            "decision",
                            (
                                "Source quality review "
                                f"{'approved' if run.review.approved else 'requested repair'}."
                            ),
                            "review",
                        )

                        await self._finish_step(
                            run,
                            quality_step,
                            {
                                "approved": run.review.approved,
                                "findings": len(
                                    response.review.findings
                                ),
                            },
                        )

                    except Exception as exc:
                        await self._finish_step(
                            run,
                            quality_step,
                            error=str(exc),
                        )
                        raise

            # ============================================================
            # VERIFICATION
            # ============================================================
            if run.review.approved:
                await self._change_status(
                    run,
                    RunStatus.VERIFYING,
                )

                verification_step = await self._start_step(
                    run,
                    "verification",
                )

                try:
                    result = await self._agents.verification.verify(
                        run.project_id,
                        current_changes,
                    )

                    run.verification = result

                    await self._handoff(
                        run,
                        "verification",
                        (
                            "orchestrator"
                            if result.passed
                            else "repair"
                        ),
                        (
                            "decision"
                            if result.passed
                            else "feedback"
                        ),
                        (
                            f"Verification "
                            f"{'passed' if result.passed else 'failed'} "
                            f"across "
                            f"{len(result.checks)} checks."
                        ),
                        "verification",
                    )

                    await self._finish_step(
                        run,
                        verification_step,
                        {
                            "checks": result.checks,
                            "passed": result.passed,
                        },
                    )

                except Exception as exc:
                    await self._finish_step(
                        run,
                        verification_step,
                        error=str(exc),
                    )
                    raise

                if result.passed:
                    if await self._stop_if_cancelled(run):
                        return

                    await self._change_status(
                        run,
                        RunStatus.COMPLETED,
                    )
                    return

                feedback = result.feedback

            else:
                feedback = [
                    finding.message
                    for finding in run.review.findings
                ]

            # ============================================================
            # REPAIR AFTER REVIEW / SECURITY / QUALITY / VERIFICATION
            # ============================================================
            if (
                run.repair_attempts
                >= run.budget.max_repair_attempts
            ):
                await self._fail(
                    run,
                    "quality_gate_failed",
                    (
                        "The change set did not pass review "
                        "and verification within the repair budget."
                    ),
                    retryable=False,
                )
                return

            await self._change_status(
                run,
                RunStatus.REPAIRING,
            )

            run.repair_attempts += 1
            await self._save(run)

            repair_step = await self._start_step(
                run,
                "repair",
            )

            try:
                await self._reserve_model_call(run)

                response: ChangeResponse = (
                    await self._agents.implementation.repair(
                        self._remaining_request(
                            run,
                            request,
                        ),
                        run.brief,
                        run.architecture,
                        run.plan,
                        current_changes,
                        feedback,
                    )
                )

                self._record_usage(
                    run,
                    response.usage,
                )

                # ========================================================
                # REPAIR OUTPUT IS A DELTA
                # ========================================================
                repair_contract_issues = (
                    validate_implementation_contract(
                        run.plan,
                        response.changes,
                        context_files=request.context_files,
                        require_complete=False,
                    )
                )

                if repair_contract_issues:
                    feedback = [
                        "Repair output contract failure: " + issue
                        for issue in repair_contract_issues[:30]
                    ]

                    await self._finish_step(
                        run,
                        repair_step,
                        {
                            "attempt": run.repair_attempts,
                            "contract_valid": False,
                            "contract_issues": (
                                repair_contract_issues[:30]
                            ),
                        },
                    )

                    # Preserve the complete current snapshot.
                    continue

                # ========================================================
                # IMPORTANT:
                #
                # DO NOT reconstruct the baseline only from
                # original_paths/planned_paths.
                #
                # The current current_changes is already the complete,
                # validated project snapshot.
                #
                # Repair response is only a delta.
                # Merge delta into the complete current snapshot.
                # ========================================================
                previous_snapshot = current_changes.model_copy(
                    deep=True
                )

                merged_changes, reuse = _merge_repair_snapshot(
                    previous_snapshot,
                    response.changes,
                )
                run.changes = merged_changes
                current_changes = merged_changes

                await self._handoff(
                    run,
                    "repair",
                    "review",
                    "artifact",
                    (
                        f"Repair changed "
                        f"{reuse['generated']} files "
                        f"while reusing "
                        f"{reuse['reused']} files."
                    ),
                    "changes",
                )

                await self._finish_step(
                    run,
                    repair_step,
                    {
                        "attempt": run.repair_attempts,
                        "feedback": feedback,
                        **reuse,
                    },
                )

                # IMPORTANT:
                # A successful repair produces a delta that has been
                # merged into the complete project snapshot.
                #
                # The repaired snapshot MUST go through the complete
                # quality pipeline again:
                #
                # repair
                #   -> structural review
                #   -> security policy
                #   -> optional semantic review
                #   -> verification
                #
                # Do not exit _verification_loop after a repair.
                continue

            except Exception as exc:
                await self._finish_step(
                    run,
                    repair_step,
                    error=str(exc),
                )
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
            await self._change_status(
                run,
                RunStatus.FAILED,
            )

        run.failure = RunFailure(
            code=code,
            message=message,
            retryable=retryable,
        )

        await self._save(run)

        await self._emit(
            run,
            "run.failed",
            {
                "code": code,
                "retryable": retryable,
            },
        )

    async def _require_run(
        self,
        run_id: str,
    ) -> AgentRun:
        run = await self._repository.get(run_id)

        if run is None:
            raise KeyError(
                f"Run not found: {run_id}"
            )

        return run

    async def _recover_interrupted_run(
        self,
        run: AgentRun,
    ) -> None:
        # Recovery is checkpoint-based: completed artifacts remain authoritative
        # and only the missing stage is resumed. This keeps long generations
        # idempotent when a worker dies or a lease expires.
        previous = run.status

        for step in reversed(run.steps):
            if step.status == "running":
                step.status = "interrupted"
                step.finished_at = utc_now()
                step.error = (
                    "Worker lease expired before the step completed"
                )
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
            {
                "from": previous.value,
                "checkpoint": checkpoint.value,
            },
        )

    async def _change_status(
        self,
        run: AgentRun,
        target: RunStatus,
    ) -> None:
        previous = run.status

        run.transition_to(target)

        await self._save(run)

        await self._emit(
            run,
            "run.status_changed",
            {
                "from": previous.value,
                "to": target.value,
            },
        )

    async def _stop_if_cancelled(
        self,
        run: AgentRun,
    ) -> bool:
        current = await self._require_run(run.id)

        run.cancel_requested_at = (
            current.cancel_requested_at
        )

        if run.cancel_requested_at is None:
            return False

        if not run.is_terminal:
            await self._change_status(
                run,
                RunStatus.CANCELLED,
            )

        return True

    async def _start_step(
        self,
        run: AgentRun,
        name: str,
    ) -> RunStep:
        step = RunStep(name=name)

        run.steps.append(step)

        await self._save(run)

        await self._emit(
            run,
            "step.started",
            {
                "step_id": step.id,
                "name": name,
            },
        )

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
        step.status = (
            "failed"
            if error
            else "completed"
        )

        await self._save(run)

        await self._emit(
            run,
            (
                "step.failed"
                if error
                else "step.completed"
            ),
            {
                "step_id": step.id,
                "name": step.name,
                "details": step.details,
            },
        )

    async def _emit(
        self,
        run: AgentRun,
        event_type: str,
        payload: dict | None = None,
    ) -> RunEvent:
        return await self._repository.append_event(
            RunEvent(
                run_id=run.id,
                event_type=event_type,
                payload=payload or {},
            ),
            self._lease_token.get(),
        )

    async def _handoff(
        self,
        run: AgentRun,
        sender: str,
        recipient: str,
        kind: Literal["request", "artifact", "feedback", "decision"],
        summary: str,
        artifact: str | None = None,
    ) -> None:
        message = AgentMessage(
            sender=sender,
            recipient=recipient,
            kind=kind,
            summary=summary,
            artifact=artifact,
        )

        run.handoffs.append(message)

        await self._save(run)

        await self._emit(
            run,
            "agent.handoff",
            message.model_dump(mode="json"),
        )

    async def _save(
        self,
        run: AgentRun,
    ) -> AgentRun:
        return await self._repository.save(
            run,
            self._lease_token.get(),
        )

    async def _reserve_model_call(
        self,
        run: AgentRun,
    ) -> None:
        if (
            run.output_tokens
            >= run.budget.max_output_tokens
        ):
            raise BudgetExceededError(
                "Maximum output token budget reached"
            )

        if (
            run.model_calls
            >= run.budget.max_model_calls
        ):
            raise BudgetExceededError(
                "Maximum model call budget reached"
            )

        run.model_calls += 1

        await self._save(run)

        await self._emit(
            run,
            "budget.model_call_reserved",
            {
                "model_calls": run.model_calls,
                "limit": run.budget.max_model_calls,
            },
        )

    @staticmethod
    def _remaining_request(
        run: AgentRun,
        request: RunRequest,
    ) -> RunRequest:
        return request.model_copy(
            update={
                "budget": request.budget.model_copy(
                    update={
                        "max_output_tokens": (
                            run.budget.max_output_tokens
                            - run.output_tokens
                        ),
                    }
                )
            }
        )

    @staticmethod
    def _record_usage(
        run: AgentRun,
        usage: ProviderUsage,
    ) -> None:
        next_output_total = (
            run.output_tokens
            + usage.output_tokens
        )

        run.input_tokens += usage.input_tokens
        run.output_tokens = next_output_total

        if (
            next_output_total
            > run.budget.max_output_tokens
        ):
            raise BudgetExceededError(
                "Maximum output token budget reached"
            )



