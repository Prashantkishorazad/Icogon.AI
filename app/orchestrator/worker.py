"""Dedicated worker for durable ICOGON orchestration runs.

Claiming, lease heartbeat, checkpointing, and recovery belong to
OrchestratorService and its repository. This module supervises that service,
handles retryable *worker-loop* failures, and drains safely on shutdown.

Run with ``python -m app.orchestrator.worker`` and
``ORCHESTRATOR_BACKEND=postgres``. The memory backend is intentionally
unsupported for a separate worker process.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from dataclasses import dataclass
import logging
import math
import os
import random
import signal
import socket
import threading
from typing import Any
from uuid import uuid4

from app.orchestrator.runtime import runtime

logger = logging.getLogger("icogon.orchestrator.worker")


def _environment_float(name: str, default: float, minimum: float) -> float:
    raw = os.getenv(name, str(default)).strip()
    try:
        value = float(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be a number; received {raw!r}") from exc
    if not math.isfinite(value) or value < minimum:
        raise ValueError(f"{name} must be a finite number >= {minimum}")
    return value


def _environment_int(name: str, default: int, minimum: int) -> int:
    raw = os.getenv(name, str(default)).strip()
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer; received {raw!r}") from exc
    if value < minimum:
        raise ValueError(f"{name} must be >= {minimum}")
    return value


@dataclass(frozen=True, slots=True)
class WorkerSettings:
    worker_id: str
    poll_interval_seconds: float
    lease_seconds: int
    shutdown_grace_seconds: float
    max_backoff_seconds: float

    @classmethod
    def from_environment(cls) -> WorkerSettings:
        poll_interval = _environment_float(
            "ORCHESTRATOR_POLL_INTERVAL_SECONDS", 1.0, 0.1
        )
        max_backoff = _environment_float(
            "ORCHESTRATOR_MAX_BACKOFF_SECONDS", 30.0, 0.1
        )
        return cls(
            worker_id=(
                os.getenv("ORCHESTRATOR_WORKER_ID", "").strip()
                or f"{socket.gethostname()}-{uuid4()}"
            ),
            poll_interval_seconds=poll_interval,
            lease_seconds=_environment_int("ORCHESTRATOR_LEASE_SECONDS", 30, 5),
            shutdown_grace_seconds=_environment_float(
                "ORCHESTRATOR_SHUTDOWN_GRACE_SECONDS", 120.0, 0.0
            ),
            max_backoff_seconds=max(max_backoff, poll_interval),
        )


def _install_shutdown_handlers(stop: asyncio.Event) -> Callable[[], None]:
    """Register SIGINT/SIGTERM where possible, including Windows fallback.

    Tests may pass their own stop event to :func:`run_worker` to avoid
    modifying process signal handlers.
    """
    loop = asyncio.get_running_loop()
    loop_signals: list[signal.Signals] = []
    python_signals: list[tuple[signal.Signals, Any]] = []

    for signum in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(signum, stop.set)
            loop_signals.append(signum)
        except (NotImplementedError, RuntimeError, ValueError):
            if threading.current_thread() is not threading.main_thread():
                continue
            previous = signal.getsignal(signum)

            def handle_signal(_signum: int, _frame: Any) -> None:
                loop.call_soon_threadsafe(stop.set)

            try:
                signal.signal(signum, handle_signal)
            except (OSError, ValueError):
                continue
            python_signals.append((signum, previous))

    def uninstall() -> None:
        for signum in loop_signals:
            loop.remove_signal_handler(signum)
        for signum, previous in python_signals:
            try:
                signal.signal(signum, previous)
            except (OSError, ValueError):
                pass

    return uninstall


async def _sleep_or_stop(stop: asyncio.Event, seconds: float) -> None:
    """Sleep in a way that wakes immediately on graceful shutdown."""
    if stop.is_set():
        return
    try:
        await asyncio.wait_for(stop.wait(), timeout=seconds)
    except TimeoutError:
        pass


async def _process_or_drain(
    service: Any,
    settings: WorkerSettings,
    stop: asyncio.Event,
) -> tuple[Any | None, bool]:
    """Run one claim/process operation; drain or cancel safely on shutdown.

    Returning ``draining=True`` indicates the shutdown signal was received
    while work was in flight. The service's execute() finally block owns
    lease release. If cancellation interrupts a run, the repository retains
    its checkpoint and a future worker can recover the unfinished work.
    """
    active = asyncio.create_task(
        service.process_next(settings.worker_id, settings.lease_seconds),
        name="icogon-orchestrator-run",
    )
    shutdown_watch = asyncio.create_task(
        stop.wait(), name="icogon-worker-shutdown-watch"
    )
    try:
        finished, _ = await asyncio.wait(
            (active, shutdown_watch),
            return_when=asyncio.FIRST_COMPLETED,
        )
        if active in finished:
            return await active, stop.is_set()

        logger.info(
            "worker shutdown requested; waiting for active run",
            extra={"worker_id": settings.worker_id},
        )
        try:
            # Shield prevents wait_for's timeout from cancelling the active
            # run before we can log and explicitly perform cleanup.
            result = await asyncio.wait_for(
                asyncio.shield(active), timeout=settings.shutdown_grace_seconds
            )
            return result, True
        except TimeoutError:
            logger.warning(
                "worker shutdown grace expired; interrupting run for recovery",
                extra={"worker_id": settings.worker_id},
            )
            active.cancel()
            await asyncio.gather(active, return_exceptions=True)
            return None, True
    except asyncio.CancelledError:
        active.cancel()
        await asyncio.gather(active, return_exceptions=True)
        raise
    finally:
        shutdown_watch.cancel()
        await asyncio.gather(shutdown_watch, return_exceptions=True)


async def run_worker(stop_event: asyncio.Event | None = None) -> None:
    """Process durable runs until SIGINT/SIGTERM (or an injected stop event).

    Transient loop failures back off exponentially with jitter. Model-level
    retries and terminal run outcomes remain the responsibility of the
    provider/service; this loop never resubmits a finished or failed run.
    """
    if runtime.inline_execution_enabled:
        raise RuntimeError(
            "Dedicated workers require ORCHESTRATOR_BACKEND=postgres"
        )

    settings = WorkerSettings.from_environment()
    stopping = stop_event if stop_event is not None else asyncio.Event()
    uninstall_signals = (
        _install_shutdown_handlers(stopping)
        if stop_event is None
        else lambda: None
    )

    try:
        # Keep initialization inside the try: a failed provider or database
        # startup must still close resources allocated by the runtime.
        service = await runtime.get_service()
        logger.info(
            "orchestrator worker started",
            extra={
                "worker_id": settings.worker_id,
                "lease_seconds": settings.lease_seconds,
                "poll_interval_seconds": settings.poll_interval_seconds,
            },
        )

        failure_delay = settings.poll_interval_seconds
        while not stopping.is_set():
            try:
                run, draining = await _process_or_drain(
                    service, settings, stopping
                )
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception(
                    "orchestrator worker iteration failed",
                    extra={"worker_id": settings.worker_id},
                )
                delay = min(
                    settings.max_backoff_seconds,
                    failure_delay * random.uniform(0.8, 1.2),
                )
                await _sleep_or_stop(stopping, delay)
                failure_delay = min(
                    settings.max_backoff_seconds,
                    max(settings.poll_interval_seconds, failure_delay * 2),
                )
                continue

            failure_delay = settings.poll_interval_seconds
            if run is not None:
                # Default console formatters do not print `extra` fields.
                # Include the terminal outcome and safe failure code in the
                # visible message so generation failures can be diagnosed.
                failure_code = run.failure.code if run.failure else "none"
                logger.info(
                    "orchestrator run processed: run_id=%s status=%s failure_code=%s",
                    run.id,
                    run.status.value,
                    failure_code,
                    extra={
                        "worker_id": settings.worker_id,
                        "run_id": run.id,
                        "status": run.status.value,
                        "failure_code": failure_code,
                    },
                )

            if draining or stopping.is_set():
                break
            if run is None:
                await _sleep_or_stop(stopping, settings.poll_interval_seconds)
    finally:
        try:
            await runtime.close()
        finally:
            uninstall_signals()
            logger.info(
                "orchestrator worker stopped",
                extra={"worker_id": settings.worker_id},
            )


def main() -> None:
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    asyncio.run(run_worker())


if __name__ == "__main__":
    main()
