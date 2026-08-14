# AI Orchestrator Architecture

## Scope

The orchestration core is backend-only and does not require a model API key in
local development. Agent roles, model providers, verification, and persistence
are replaceable interfaces. PostgreSQL mode uses a dedicated worker; memory mode
executes inline for local development and tests.

## Research decisions

- **Plan, act, observe:** ReAct shows the value of interleaving decisions with
  environment feedback. Runs therefore preserve explicit planning, generation,
  verification, and repair steps instead of hiding work inside one model call.
- **Feedback-based repair:** Reflexion demonstrates that environment feedback can
  improve later attempts without model fine-tuning. Verification feedback is fed
  into a bounded repair loop.
- **Purpose-built coding tools:** SWE-agent shows that the agent-computer interface
  materially affects coding performance. File changes are structured artifacts;
  direct shell and filesystem access are deliberately not part of Phase 1.
- **Workflow before autonomy:** Anthropic's production guidance recommends simple,
  composable workflows before dynamic multi-agent systems. The orchestrator is a
  deterministic state machine; planner/coder/verifier are roles behind ports.
- **Durable worker semantics:** Temporal's activity guidance treats retries as
  potentially repeated execution and recommends idempotency, heartbeats, and
  timeouts. Worker leases and fencing tokens enforce those constraints here.
- **Queue concurrency:** PostgreSQL documents `SKIP LOCKED` as appropriate for
  queue-like multi-consumer access. The migration uses it only for claiming work,
  not for general reads.
- **Controlled multi-agent growth:** Published multi-agent failure analysis groups
  common failures around specification, inter-agent alignment, verification, and
  termination. Specialized workers remain behind explicit contracts and budgets.

Primary sources:

- ReAct: https://arxiv.org/abs/2210.03629
- Reflexion: https://arxiv.org/abs/2303.11366
- SWE-agent: https://arxiv.org/abs/2405.15793
- Building effective agents: https://www.anthropic.com/engineering/building-effective-agents
- Temporal activity semantics: https://docs.temporal.io/activity-definition
- PostgreSQL locking: https://www.postgresql.org/docs/current/sql-select.html
- Why Do Multi-Agent LLM Systems Fail?: https://arxiv.org/abs/2503.13657
- AgentBench: https://arxiv.org/abs/2308.03688

## State machine

```text
queued
  -> analyzing
  -> designing
  -> planning
  -> generating
  -> reviewing
       -> verifying -> completed
       -> repairing -> reviewing
       -> failed
```

Every transition is validated. Terminal runs cannot be executed twice. Each run
stores immutable step history, token counters, model-call counters, repair count,
failure classification, timestamps, and a version number.

Every status and step change also produces an ordered event. Consumers request
events after the last sequence they observed, which supports polling now and SSE
or a broker-backed stream later without changing the event contract.

Workers claim runs with expiring leases. The opaque lease token prevents a stale
worker from releasing a newer worker's lease. If a lease expires during a step,
the next worker marks that step interrupted and rewinds to the last persisted
plan/change-set checkpoint before continuing.

## API

Authenticated endpoints:

- `POST /orchestrator/runs` submits an idempotent run and returns `202`.
- `GET /orchestrator/runs/{run_id}` returns the run only to its owner.
- `GET /orchestrator/runs/{run_id}/events?after=N` returns ordered run events.
- `GET /orchestrator/runs/{run_id}/events/stream?after=N` streams SSE events.
- `POST /orchestrator/runs/{run_id}/cancel` requests cooperative cancellation.

Example request:

```json
{
  "project_id": "project-123",
  "prompt": "Create a task management application",
  "idempotency_key": "project-123-request-001",
  "budget": {
    "max_model_calls": 6,
    "max_repair_attempts": 2,
    "max_output_tokens": 20000
  }
}
```

## Safety and reliability boundaries

- Generated paths must be relative and cannot escape the project workspace.
- Model calls, output tokens, and repair attempts have hard per-run limits.
- Repeated submission with the same user/idempotency key returns the original run.
- Per-process run locks prevent duplicate concurrent execution in development.
- Expiring worker leases prevent concurrent processing across worker identities.
- Interrupted runs recover from persisted planning or generation checkpoints.
- Provider output is validated through typed Pydantic schemas.
- The mock provider is deterministic, so orchestration tests need no network or key.

## Current limitations

- Memory mode is non-durable and must remain single-instance.
- PostgreSQL migrations must be applied before enabling production mode.
- Verification checks policy and artifact shape, not compilation in a sandbox.
- Generated changes are returned as artifacts and are not written to the repository.
- A real model gateway and provider routing are not connected yet.
- Human approval and sandbox execution are deferred.

The PostgreSQL contract for durable runs, events, RLS, and queue claiming lives in
`infra/migrations/001_agent_orchestrator.sql`. `PostgresRunRepository` implements
the same repository port as memory mode, including lease-fenced state and event
writes. Production mode leaves execution to `python -m app.orchestrator.worker`;
the API process only submits and observes runs.
