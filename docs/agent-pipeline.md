# Agent Pipeline

## Roles

| Role | Input | Output | Responsibility |
| --- | --- | --- | --- |
| Requirements analyst | run request | project brief | Normalize scope, constraints, and acceptance criteria |
| Solution architect | request and brief | architecture proposal | Define module boundaries, decisions, risks, and required checks |
| Planner | brief and architecture | ordered generation plan | Produce traceable tasks and dependencies |
| Implementation agent | planning context | structured file changes | Create or repair a bounded change set |
| Reviewer | plan and changes | review decision | Reject structurally unsafe or unreviewable changes |
| Verification agent | approved changes | verification result | Execute deterministic policy checks now and sandbox checks later |

These are logical roles inside one durable workflow. They are not independent
processes and do not write shared state directly. The orchestrator owns persistence,
budgets, cancellation, retries, leases, and status transitions.

## Handoff contracts

All handoffs use validated Pydantic models:

- `ProjectBrief`
- `ArchitectureProposal`
- `GenerationPlan`
- `ChangeSet`
- `ChangeReview`
- `VerificationResult`

The complete planning context is passed to provider-backed agents. A provider does
not reconstruct requirements or architecture from chat history.

## Quality gates

Implementation output must pass review before verification. A blocking review
finding enters the same bounded repair loop as a failed verification check:

```text
implementation -> review -> verification -> complete
                        \-> repair -> review
```

Review currently enforces:

- non-empty change sets;
- unique normalized file paths;
- a maximum number of changed files per run.

Path containment remains a verification rule. Build, typecheck, lint, browser
smoke tests, and dependency policy will be implemented by the sandbox verifier.

## Provider boundary

Local development uses deterministic requirements, architecture, and review
policies with a mock planning/implementation provider. A real provider adapter must:

1. accept the typed brief and architecture proposal;
2. request structured output for the target contract;
3. return token and model usage;
4. enforce request timeouts;
5. avoid writing files or executing commands directly.

Tool execution belongs to the sandbox layer, not the model adapter.
