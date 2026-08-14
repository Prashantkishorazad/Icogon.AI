from __future__ import annotations

import asyncio
from copy import deepcopy

from app.orchestrator.models import AgentRun, RunEvent


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

    async def save(self, run: AgentRun) -> AgentRun:
        async with self._lock:
            if run.id not in self._runs:
                raise KeyError(f"Run not found: {run.id}")
            self._runs[run.id] = deepcopy(run)
            return deepcopy(run)

    async def append_event(self, event: RunEvent) -> RunEvent:
        async with self._lock:
            events = self._events.get(event.run_id)
            if events is None:
                raise KeyError(f"Run not found: {event.run_id}")
            stored = event.model_copy(deep=True)
            stored.sequence = len(events) + 1
            events.append(stored)
            return deepcopy(stored)

    async def list_events(self, run_id: str, after: int = 0) -> list[RunEvent]:
        async with self._lock:
            events = self._events.get(run_id, [])
            return [deepcopy(event) for event in events if event.sequence > after]
