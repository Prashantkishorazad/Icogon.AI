# AI Orchestrator Architecture — Phase 1

## Scope

This phase introduces a backend-only orchestration core. It does not modify the
existing frontend and does not require a model API key. The implementation uses
a deterministic mock provider while keeping the provider, verifier, and run
repository behind replaceable interfaces.

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

Primary sources:

- ReAct: https://arxiv.org/abs/2210.03629
- Reflexion: https://arxiv.org/abs/2303.11366
- SWE-agent: https://arxiv.org/abs/2405.15793
- Building effective agents: https://www.anthropic.com/engineering/building-effective-agents

## State machine

```text
queued
  -> planning
  -> generating
  -> verifying
       -> completed
       -> repairing -> verifying
       -> failed
```

Every transition is validated. Terminal runs cannot be executed twice. Each run
stores immutable step history, token counters, model-call counters, repair count,
failure classification, timestamps, and a version number.

## API

Authenticated endpoints:

- `POST /orchestrator/runs` submits an idempotent run and returns `202`.
- `GET /orchestrator/runs/{run_id}` returns the run only to its owner.

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
- Provider output is validated through typed Pydantic schemas.
- The mock provider is deterministic, so orchestration tests need no network or key.

## Deliberate Phase 1 limitations

- Run state is in memory and is lost after process restart.
- FastAPI background tasks are not a durable job queue.
- Verification checks artifact shape and path safety, not compilation in a sandbox.
- Generated changes are returned as artifacts and are not written to the repository.
- Streaming run events, cancellation, approvals, and real model routing are deferred.

These limitations keep Phase 1 small while preserving stable ports. Phase 2 should
add Postgres persistence, a durable queue/worker, append-only run events, and SSE.
The sandbox adapter should follow after those durable foundations are in place.
