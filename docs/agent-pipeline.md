# Agent Pipeline

## Roles

| Role | Input | Output | Responsibility |
| --- | --- | --- | --- |
| Requirements analyst | run request | project brief | Normalize scope, constraints, and acceptance criteria |
| Solution architect | request and brief | architecture proposal | Define module boundaries, decisions, risks, and required checks |
| Planner | brief and architecture | ordered generation plan | Produce traceable tasks and dependencies |
| Implementation agent | planning context | structured file changes | Create or repair a bounded change set |
| Reviewer | plan and changes | review decision | Reject structurally unsafe or unreviewable changes |
| Security policy agent | generated changes | security assessment | Block protected paths, oversized files, and credential material |
| Verification agent | approved changes | verification result | Execute deployment-owned checks in an isolated runtime |

These are logical roles inside one durable workflow. They are not independent
processes and do not write shared state directly. The orchestrator owns persistence,
budgets, cancellation, retries, leases, and status transitions.

## Handoff contracts

All handoffs use validated Pydantic models:

- `ProjectBrief`
- `ArchitectureProposal`
- `GenerationPlan`
- `ChangeSet`
- `FilePlanEntry`
- `AgentMessage`
- `ChangeReview`
- `VerificationResult`

The complete planning context is passed to provider-backed agents. A provider does
not reconstruct requirements or architecture from chat history.

Verification also receives the immutable `project_id`. The workspace provider uses
that identifier to select a trusted snapshot; model output never supplies a host
filesystem path.

## Quality gates

Implementation output must pass review before verification. A blocking review
finding enters the same bounded repair loop as a failed verification check:

```text
implementation -> review -> security policy -> sandbox verification -> complete
                        \-------------------------> repair -> review
```

Review currently enforces:

- non-empty change sets;
- unique normalized file paths;
- a maximum number of changed files per run.

Path containment is enforced before materialization. When Docker verification is
enabled, build, typecheck, lint, and test commands run without network access in
a resource-limited container. Commands come from deployment configuration, never
from model output.

## Provider boundary

Local development uses deterministic requirements, architecture, and review
policies with a mock planning/implementation provider. A real provider adapter must:

1. accept the typed brief and architecture proposal;
2. request structured output for the target contract;
3. return token and model usage;
4. enforce request timeouts;
5. avoid writing files or executing commands directly.

Tool execution belongs to the sandbox layer, not the model adapter.

## Incremental file planning

The planner receives a sorted content-addressed manifest containing path, byte size,
SHA-256 and stability hints. Its `file_plan` classifies relevant files as
`preserve`, `read`, `modify`, `create` or `delete`. Lockfiles and binary assets are
preserved by policy. The implementation call receives only files required for
reading/modification plus core entry and theme context, then returns a sparse delta.

The orchestrator applies that delta to the previous snapshot. Files outside the
writable plan cannot change; omitted files are reused byte-for-byte. Repair uses the
same scope and drops unplanned artifacts before applying a correction. The final run
still stores a complete snapshot so preview, export and crash recovery stay simple.

## Agent communication

Agents do not share an unbounded chat transcript or select speakers dynamically.
The orchestrator writes typed `AgentMessage` handoffs into run state and emits a
matching ordered `agent.handoff` event. A handoff contains sender, recipient, kind,
a short summary and an artifact reference. The full artifact lives once in the run
checkpoint.

```text
planner --plan--> implementation --changes--> review --decision--> security
security --decision--> quality review (polished) --decision--> verification
verification --feedback--> repair --changes--> review
verification --decision--> orchestrator
```

The deterministic coordinator owns routing and termination. This avoids a paid model
call merely to select the next agent, prevents circular conversation, keeps workers
resumable and provides an auditable stream for the builder UI.
