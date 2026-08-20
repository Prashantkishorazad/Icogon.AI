# Orchestrator Operations

## Runtime modes

The API supports two execution modes:

| Mode | Intended use | Execution |
| --- | --- | --- |
| `memory` | local development and tests | FastAPI background task |
| `postgres` | shared or production environments | dedicated worker process |

Memory mode is deliberately non-durable. Do not run more than one API instance in
that mode.

## PostgreSQL setup

1. Apply migrations from `infra/migrations` in filename order.
2. Set the backend API and worker environment:

```dotenv
ORCHESTRATOR_BACKEND=postgres
DATABASE_URL=postgresql://...
ORCHESTRATOR_LEASE_SECONDS=30
ORCHESTRATOR_POLL_INTERVAL_SECONDS=1
```

Use a server-side database credential. Never expose `DATABASE_URL` to the browser
or inject it into generated-code sandboxes.

## Processes

Start the API:

```powershell
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Start at least one worker:

```powershell
python -m app.orchestrator.worker
```

The API process never executes generated code. Configure sandbox verification only
on the worker deployment. See `docs/sandbox-execution.md` for required isolation and
resource settings.

Multiple workers may run concurrently. Database claims and lease fencing ensure a
run has one active owner. A worker that loses its lease cannot persist late state
or events. Transient worker failures use capped exponential backoff; the process
continues polling instead of exiting on the first provider or database failure.

## Operational signals

Alert on:

- queued runs older than five minutes;
- repeated `run.recovered` events;
- `verification_failed` and `budget_exceeded` rates;
- leases expiring while a worker is still alive;
- queue depth increasing for more than ten minutes.

For an incident, inspect ordered `agent_run_events` first. Do not manually change a
run status without also recording an audit event.

## Deployment order

1. Apply the database migration.
2. Deploy the API with PostgreSQL mode enabled.
3. Start workers.
4. Submit a smoke-test run and verify ordered events through the SSE endpoint.
5. Scale workers only after queue latency indicates a need.

Rollback application code before rolling back the schema. The migration is
additive and should remain in place while older application instances drain.
