from __future__ import annotations

import asyncio
from copy import deepcopy
from datetime import timedelta

from app.orchestrator.models import (
    TERMINAL_STATUSES,
    AgentRun,
    RunEvent,
    RunStatus,
    WorkerLease,
    utc_now,
)


class InMemoryRunRepository:
    """Development adapter. Replace with Postgres before multi-instance deployment."""

    def __init__(self) -> None:
        self._runs: dict[str, AgentRun] = {}
        self._idempotency_index: dict[tuple[str, str], str] = {}
        self._events: dict[str, list[RunEvent]] = {}
        self._lock = asyncio.Lock()

    async def create(self, run: AgentRun) -> AgentRun:
        async with self._lock:
            key = (run.user_id, run.idempotency_key)
            existing_id = self._idempotency_index.get(key)
            if existing_id:
                return deepcopy(self._runs[existing_id])
            self._runs[run.id] = deepcopy(run)
            self._idempotency_index[key] = run.id
            self._events[run.id] = []
            return deepcopy(run)

    async def get(self, run_id: str) -> AgentRun | None:
        async with self._lock:
            run = self._runs.get(run_id)
            return deepcopy(run) if run else None

    async def get_by_idempotency_key(
        self,
        user_id: str,
        idempotency_key: str,
    ) -> AgentRun | None:
        async with self._lock:
            run_id = self._idempotency_index.get((user_id, idempotency_key))
            return deepcopy(self._runs[run_id]) if run_id else None

    async def save(
        self,
        run: AgentRun,
        lease_token: str | None = None,
    ) -> AgentRun:
        async with self._lock:
            if run.id not in self._runs:
                raise KeyError(f"Run not found: {run.id}")
            stored = self._runs[run.id]
            if lease_token is not None:
                lease_is_current = stored.lease_token == lease_token
                lease_is_active = bool(
                    stored.lease_expires_at and stored.lease_expires_at > utc_now()
                )
                if not lease_is_current or not lease_is_active:
                    raise PermissionError("Worker lease is no longer active")
            saved = deepcopy(run)
            if lease_token is not None:
                saved.lease_owner = stored.lease_owner
                saved.lease_token = stored.lease_token
                saved.lease_expires_at = stored.lease_expires_at
                saved.last_heartbeat_at = stored.last_heartbeat_at
            self._runs[run.id] = saved
            return deepcopy(saved)

    async def append_event(
        self,
        event: RunEvent,
        lease_token: str | None = None,
    ) -> RunEvent:
        async with self._lock:
            events = self._events.get(event.run_id)
            if events is None:
                raise KeyError(f"Run not found: {event.run_id}")
            if lease_token is not None:
                run = self._runs[event.run_id]
                lease_is_current = run.lease_token == lease_token
                lease_is_active = bool(
                    run.lease_expires_at and run.lease_expires_at > utc_now()
                )
                if not lease_is_current or not lease_is_active:
                    raise PermissionError("Worker lease is no longer active")
            stored = event.model_copy(deep=True)
            stored.sequence = len(events) + 1
            events.append(stored)
            return deepcopy(stored)

    async def list_events(self, run_id: str, after: int = 0) -> list[RunEvent]:
        async with self._lock:
            events = self._events.get(run_id, [])
            return [deepcopy(event) for event in events if event.sequence > after]

    async def claim(
        self,
        run_id: str,
        worker_id: str,
        lease_seconds: int,
    ) -> WorkerLease | None:
        async with self._lock:
            run = self._runs.get(run_id)
            if run is None or run.status in TERMINAL_STATUSES:
                return None
            now = utc_now()
            if run.lease_expires_at and run.lease_expires_at > now:
                return None
            recovered = run.status.value != "queued"
            lease = WorkerLease(
                run_id=run.id,
                worker_id=worker_id,
                expires_at=now + timedelta(seconds=lease_seconds),
                recovered=recovered,
            )
            run.lease_owner = worker_id
            run.lease_token = lease.token
            run.lease_expires_at = lease.expires_at
            run.last_heartbeat_at = now
            run.execution_attempts += 1
            run.updated_at = now
            run.version += 1
            return lease

    async def heartbeat(self, token: str, lease_seconds: int) -> WorkerLease | None:
        async with self._lock:
            run = next(
                (item for item in self._runs.values() if item.lease_token == token),
                None,
            )
            if run is None:
                return None
            now = utc_now()
            if run.lease_expires_at is None or run.lease_expires_at <= now:
                return None
            run.last_heartbeat_at = now
            run.lease_expires_at = now + timedelta(seconds=lease_seconds)
            run.updated_at = now
            return WorkerLease(
                run_id=run.id,
                worker_id=run.lease_owner or "unknown",
                token=token,
                expires_at=run.lease_expires_at,
            )

    async def release(self, token: str) -> bool:
        async with self._lock:
            run = next(
                (item for item in self._runs.values() if item.lease_token == token),
                None,
            )
            if run is None:
                return False
            run.lease_owner = None
            run.lease_token = None
            run.lease_expires_at = None
            run.updated_at = utc_now()
            return True

    async def request_cancel(self, run_id: str) -> AgentRun | None:
        async with self._lock:
            run = self._runs.get(run_id)
            if run is None:
                return None
            if not run.status in TERMINAL_STATUSES and run.cancel_requested_at is None:
                run.cancel_requested_at = utc_now()
                if run.status == RunStatus.QUEUED:
                    run.status = RunStatus.CANCELLED
                run.updated_at = utc_now()
                run.version += 1
            return deepcopy(run)

    async def next_claimable_run_id(self) -> str | None:
        async with self._lock:
            now = utc_now()
            candidates = [
                run
                for run in self._runs.values()
                if run.status not in TERMINAL_STATUSES
                and (run.lease_expires_at is None or run.lease_expires_at <= now)
            ]
            if not candidates:
                return None
            return min(candidates, key=lambda run: (run.created_at, run.id)).id
