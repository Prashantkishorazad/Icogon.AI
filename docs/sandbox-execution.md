# Isolated Agent Execution

## Decision

The control plane and execution plane are separate boundaries. The FastAPI API,
orchestrator worker, database, and model adapters form the control plane. Generated
code is materialized and executed only in an ephemeral sandbox in the execution
plane.

```text
prompt -> durable run -> specialist agents -> policy gate -> sandbox -> result
             |                                      |             |
          Postgres                            fixed limits      logs/checks
```

Development defaults to static verification so contributors do not need Docker.
Production must use a remote microVM sandbox or the Docker verifier on a dedicated
Linux worker pool. The API host must never execute generated code directly.

## Agent topology

The initial topology is a deterministic workflow with specialist roles:

1. Requirements analyst creates a traceable brief.
2. Solution architect defines modules, risks, and required checks.
3. Planner produces ordered tasks.
4. Implementation agent returns structured file operations.
5. Reviewer checks structural quality and bounded change size.
6. Security policy agent rejects protected files and credential material.
7. Verification agent materializes the change set and runs fixed checks.
8. Failed gates feed a bounded repair loop.

The orchestrator owns state transitions, retry budgets, leases, and persistence.
Agents do not call each other or mutate shared state. Parallel fan-out can be added
later for independent research or test shards without changing this ownership rule.

This follows the workflow-versus-agent distinction in Anthropic's production
guidance: deterministic code controls repeatable stages while models handle tasks
that need interpretation. The repair loop applies feedback in the style evaluated
by Reflexion, but completion still depends on external test results.
The centralized state machine also avoids the inter-agent misalignment and task
verification failure classes documented by the MAST multi-agent failure taxonomy.

## Docker verifier guarantees

Every command is passed as an argument vector without a shell. The runner applies:

- no network access;
- read-only container root filesystem;
- all Linux capabilities dropped;
- `no-new-privileges`;
- a non-root user;
- CPU, memory, PID, wall-time, and captured-output limits;
- an ephemeral workspace deleted after verification.

Docker containers share a host kernel and are not the final multi-tenant boundary.
Use them on a dedicated worker pool for internal development. For public untrusted
workloads, use a managed microVM provider or a hardened Firecracker-based execution
service. Firecracker combines KVM isolation with low startup and memory overhead,
but operating its host, images, jailer, patching, and resource accounting is a
separate infrastructure product and is deferred.

## Configuration

Static verification is the safe local default:

```env
CHANGE_VERIFIER_BACKEND=static
```

Docker verification is opt-in:

```env
CHANGE_VERIFIER_BACKEND=docker
SANDBOX_IMAGE=node:22-alpine
SANDBOX_COMMANDS_JSON=[["npm","run","lint"],["npm","test"],["npm","run","build"]]
SANDBOX_CPUS=1
SANDBOX_MEMORY_MB=1024
SANDBOX_PIDS=256
SANDBOX_TIMEOUT_SECONDS=120
SANDBOX_OUTPUT_BYTES=1000000
```

Pin the production image by digest. Prebuild dependencies into the image because
network access stays disabled during verification. Do not mount the Docker socket,
cloud credentials, repository credentials, or host secret directories.

The current materializer supports self-contained upserts. It rejects deletions
because verifying a deletion correctly requires a trusted repository snapshot.
Repository checkout and artifact publishing are the next execution-plane increment.

## Hosting phases

### Phase 1: development and private alpha

- Host API and worker as two processes from the same backend image.
- Use managed Postgres for durable runs and events.
- Run the Docker verifier only on a separate Linux worker VM.
- Keep concurrency low and enforce per-user model and execution quotas.

### Phase 2: public beta

- Replace the Docker adapter with a managed microVM sandbox adapter.
- Keep the same `Sandbox` port and verification contract.
- Queue execution jobs, autoscale workers, and collect per-run CPU seconds.
- Add artifact storage with signed URLs and automatic expiry.

### Phase 3: proven scale

- Evaluate a self-hosted Firecracker fleet only if managed sandbox spend or product
  constraints justify a dedicated infrastructure team.
- Add warm pools, image signing, admission policy, egress proxying, tenant-aware
  scheduling, and host recycling.

## Research basis

- Agache et al., *Firecracker: Lightweight Virtualization for Serverless
  Applications*, NSDI 2020.
- Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models*, 2022.
- Shinn et al., *Reflexion: Language Agents with Verbal Reinforcement Learning*,
  2023.
- Yang et al., *SWE-agent: Agent-Computer Interfaces Enable Automated Software
  Engineering*, 2024.
- Cemri et al., *Why Do Multi-Agent LLM Systems Fail?*, 2025.
- Anthropic, *Building Effective Agents*, 2024.

Research informs the boundaries and workflow; it does not replace threat modeling,
load testing, or provider-specific security review before public execution.
