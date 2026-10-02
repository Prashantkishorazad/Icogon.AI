from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any
from uuid import UUID

import asyncpg
from pydantic import BaseModel

from app.orchestrator.models import (
    AgentRun,
    RunEvent,
    RunStatus,
)


class WorkerLease(BaseModel):
    run_id: str
    worker_id: str
    token: str
    expires_at: datetime
    recovered: bool = False


class PostgresRunRepository:
    """
    Durable PostgreSQL repository for orchestrator runs.

    Responsibilities:
    - persist complete AgentRun state
    - enforce idempotent run creation
    - persist ordered run events
    - provide atomic worker leases
    - support lease heartbeats and recovery
    - persist cancellation requests
    """

    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    # ------------------------------------------------------------------
    # CONNECTION
    # ------------------------------------------------------------------

    @classmethod
    async def connect(
        cls,
        database_url: str,
    ) -> PostgresRunRepository:
        if not database_url.strip():
            raise ValueError("database_url must not be empty")

        min_size = max(
            1,
            int(os.getenv("ORCHESTRATOR_DB_MIN_POOL", "1")),
        )
        max_size = max(
            min_size,
            int(os.getenv("ORCHESTRATOR_DB_MAX_POOL", "10")),
        )
        command_timeout = max(
            1,
            int(os.getenv("ORCHESTRATOR_DB_COMMAND_TIMEOUT", "30")),
        )

        pool = await asyncpg.create_pool(
            database_url,
            min_size=min_size,
            max_size=max_size,
            command_timeout=command_timeout,
        )

        return cls(pool)

    async def close(self) -> None:
        await self._pool.close()

    # ------------------------------------------------------------------
    # CREATE / READ
    # ------------------------------------------------------------------

    async def create(
        self,
        run: AgentRun,
    ) -> AgentRun:
        row = await self._pool.fetchrow(
            """
            insert into public.agent_runs (
                id,
                user_id,
                project_id,
                idempotency_key,
                status,
                prompt,
                state,
                cancel_requested_at,
                version,
                created_at,
                updated_at
            )
            values (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7::jsonb,
                $8,
                $9,
                $10,
                $11
            )
            on conflict (user_id, idempotency_key)
            do nothing
            returning *
            """,
            UUID(run.id),
            UUID(run.user_id),
            run.project_id,
            run.idempotency_key,
            run.status.value,
            run.prompt,
            json.dumps(self._state(run)),
            run.cancel_requested_at,
            run.version,
            run.created_at,
            run.updated_at,
        )

        if row is None:
            row = await self._pool.fetchrow(
                """
                select *
                from public.agent_runs
                where user_id = $1
                  and idempotency_key = $2
                """,
                UUID(run.user_id),
                run.idempotency_key,
            )

        if row is None:
            raise RuntimeError(
                "Run creation failed and the idempotent record "
                "could not be recovered."
            )

        return self._from_row(row)

    async def get(
        self,
        run_id: str,
    ) -> AgentRun | None:
        row = await self._pool.fetchrow(
            """
            select *
            from public.agent_runs
            where id = $1
            """,
            UUID(run_id),
        )

        return self._from_row(row) if row else None

    async def get_by_idempotency_key(
        self,
        user_id: str,
        idempotency_key: str,
    ) -> AgentRun | None:
        row = await self._pool.fetchrow(
            """
            select *
            from public.agent_runs
            where user_id = $1
              and idempotency_key = $2
            """,
            UUID(user_id),
            idempotency_key,
        )

        return self._from_row(row) if row else None

    # ------------------------------------------------------------------
    # STATE PERSISTENCE
    # ------------------------------------------------------------------

    async def save(
        self,
        run: AgentRun,
        lease_token: str | None = None,
    ) -> AgentRun:
        arguments: list[Any] = [
            UUID(run.id),
            run.status.value,
            json.dumps(self._state(run)),
            run.cancel_requested_at,
            run.version,
            run.updated_at,
        ]

        lease_clause = ""

        if lease_token is not None:
            arguments.append(UUID(lease_token))
            lease_clause = """
                and lease_token = $7
                and lease_expires_at > now()
            """

        row = await self._pool.fetchrow(
            f"""
            update public.agent_runs
               set status = $2,
                   state = $3::jsonb,
                   cancel_requested_at =
                       coalesce(cancel_requested_at, $4),
                   version = $5,
                   updated_at = $6
             where id = $1
                   {lease_clause}
             returning *
            """,
            *arguments,
        )

        if row is None:
            if lease_token is not None:
                raise PermissionError(
                    "Run write was rejected because the worker lease "
                    "is missing or expired."
                )

            raise KeyError(
                f"Run not found: {run.id}"
            )

        return self._from_row(row)

    # ------------------------------------------------------------------
    # EVENTS
    # ------------------------------------------------------------------

    async def append_event(
        self,
        event: RunEvent,
        lease_token: str | None = None,
    ) -> RunEvent:
        async with (
            self._pool.acquire() as connection,
            connection.transaction(),
        ):
            arguments: list[Any] = [
                UUID(event.run_id),
            ]

            lease_clause = ""

            if lease_token is not None:
                arguments.append(UUID(lease_token))
                lease_clause = """
                    and lease_token = $2
                    and lease_expires_at > now()
                """

            sequence = await connection.fetchval(
                f"""
                update public.agent_runs
                   set next_event_sequence =
                       next_event_sequence + 1
                 where id = $1
                       {lease_clause}
                 returning next_event_sequence - 1
                """,
                *arguments,
            )

            if sequence is None:
                if lease_token is not None:
                    raise PermissionError(
                        "Event write was rejected because the worker "
                        "lease is missing or expired."
                    )

                raise KeyError(
                    f"Run not found: {event.run_id}"
                )

            row = await connection.fetchrow(
                """
                insert into public.agent_run_events (
                    id,
                    run_id,
                    sequence,
                    event_type,
                    payload,
                    created_at
                )
                values (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5::jsonb,
                    $6
                )
                returning *
                """,
                UUID(event.id),
                UUID(event.run_id),
                sequence,
                event.event_type,
                json.dumps(event.payload),
                event.created_at,
            )

        if row is None:
            raise RuntimeError(
                "Failed to persist orchestrator event."
            )

        return self._event_from_row(row)

    async def list_events(
        self,
        run_id: str,
        after: int = 0,
    ) -> list[RunEvent]:
        rows = await self._pool.fetch(
            """
            select *
            from public.agent_run_events
            where run_id = $1
              and sequence > $2
            order by sequence asc
            """,
            UUID(run_id),
            max(0, after),
        )

        return [
            self._event_from_row(row)
            for row in rows
        ]

    # ------------------------------------------------------------------
    # WORKER LEASES
    # ------------------------------------------------------------------

    async def claim(
        self,
        run_id: str,
        worker_id: str,
        lease_seconds: int,
    ) -> WorkerLease | None:
        lease_seconds = max(
            1,
            int(lease_seconds),
        )

        row = await self._pool.fetchrow(
            """
            update public.agent_runs
               set lease_owner = $2,
                   lease_token = gen_random_uuid(),
                   lease_expires_at =
                       now() +
                       make_interval(
                           secs => greatest(1, $3)
                       ),
                   last_heartbeat_at = now(),
                   execution_attempts =
                       execution_attempts + 1,
                   version = version + 1,
                   updated_at = now()
             where id = $1
               and status not in (
                   'completed',
                   'failed',
                   'cancelled'
               )
               and (
                   lease_expires_at is null
                   or lease_expires_at <= now()
               )
             returning
                 id,
                 status,
                 lease_owner,
                 lease_token,
                 lease_expires_at
            """,
            UUID(run_id),
            worker_id,
            lease_seconds,
        )

        if row is None:
            return None

        return WorkerLease(
            run_id=str(row["id"]),
            worker_id=row["lease_owner"],
            token=str(row["lease_token"]),
            expires_at=row["lease_expires_at"],
            recovered=(
                row["status"] != RunStatus.QUEUED.value
            ),
        )

    async def heartbeat(
        self,
        token: str,
        lease_seconds: int,
    ) -> WorkerLease | None:
        lease_seconds = max(
            1,
            int(lease_seconds),
        )

        row = await self._pool.fetchrow(
            """
            update public.agent_runs
               set lease_expires_at =
                       now() +
                       make_interval(
                           secs => greatest(1, $2)
                       ),
                   last_heartbeat_at = now(),
                   updated_at = now()
             where lease_token = $1
               and lease_expires_at > now()
             returning
                 id,
                 lease_owner,
                 lease_expires_at
            """,
            UUID(token),
            lease_seconds,
        )

        if row is None:
            return None

        return WorkerLease(
            run_id=str(row["id"]),
            worker_id=row["lease_owner"],
            token=token,
            expires_at=row["lease_expires_at"],
        )

    async def release(
        self,
        token: str,
    ) -> bool:
        result = await self._pool.execute(
            """
            update public.agent_runs
               set lease_owner = null,
                   lease_token = null,
                   lease_expires_at = null,
                   updated_at = now()
             where lease_token = $1
            """,
            UUID(token),
        )

        return result == "UPDATE 1"

    # ------------------------------------------------------------------
    # CANCELLATION / QUEUE
    # ------------------------------------------------------------------

    async def request_cancel(
        self,
        run_id: str,
    ) -> AgentRun | None:
        row = await self._pool.fetchrow(
            """
            update public.agent_runs
               set cancel_requested_at =
                       coalesce(
                           cancel_requested_at,
                           now()
                       ),
                   status = case
                       when status = 'queued'
                       then 'cancelled'
                       else status
                   end,
                   version = version + 1,
                   updated_at = now()
             where id = $1
             returning *
            """,
            UUID(run_id),
        )

        return self._from_row(row) if row else None

    async def next_claimable_run_id(
        self,
    ) -> str | None:
        value = await self._pool.fetchval(
            """
            select id
            from public.agent_runs
            where status not in (
                'completed',
                'failed',
                'cancelled'
            )
              and (
                  lease_expires_at is null
                  or lease_expires_at <= now()
              )
            order by created_at asc, id asc
            limit 1
            """
        )

        return str(value) if value else None

    # ------------------------------------------------------------------
    # SERIALIZATION
    # ------------------------------------------------------------------

    @staticmethod
    def _state(
        run: AgentRun,
    ) -> dict[str, Any]:
        """
        Store orchestration state in JSONB while keeping indexed
        lifecycle fields in dedicated PostgreSQL columns.
        """
        return run.model_dump(
            mode="json",
            exclude={
                "id",
                "user_id",
                "project_id",
                "prompt",
                "idempotency_key",
                "status",
                "cancel_requested_at",
                "lease_owner",
                "lease_token",
                "lease_expires_at",
                "last_heartbeat_at",
                "execution_attempts",
                "version",
                "created_at",
                "updated_at",
            },
        )

    @staticmethod
    def _from_row(
        row: Any,
    ) -> AgentRun:
        state = row["state"]

        if isinstance(state, str):
            state = json.loads(state)

        if state is None:
            state = {}

        return AgentRun(
            **state,
            id=str(row["id"]),
            user_id=str(row["user_id"]),
            project_id=row["project_id"],
            prompt=row["prompt"],
            idempotency_key=row["idempotency_key"],
            status=RunStatus(row["status"]),
            cancel_requested_at=row[
                "cancel_requested_at"
            ],
            lease_owner=row["lease_owner"],
            lease_token=(
                str(row["lease_token"])
                if row["lease_token"]
                else None
            ),
            lease_expires_at=row[
                "lease_expires_at"
            ],
            last_heartbeat_at=row[
                "last_heartbeat_at"
            ],
            execution_attempts=row[
                "execution_attempts"
            ],
            version=row["version"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    @staticmethod
    def _event_from_row(
        row: Any,
    ) -> RunEvent:
        payload = row["payload"]

        if isinstance(payload, str):
            payload = json.loads(payload)

        if payload is None:
            payload = {}

        return RunEvent(
            id=str(row["id"]),
            run_id=str(row["run_id"]),
            sequence=row["sequence"],
            event_type=row["event_type"],
            payload=payload,
            created_at=row["created_at"],
        )

