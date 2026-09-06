# ICOGON AI

A prompt-to-application builder with a FastAPI orchestration service and React workspace.

## What works

- Requirements → architecture → planning → implementation → review → security policy → verification, with bounded repair attempts.
- Explicit `mock`, `groq`, and compatible chat-completion provider modes. Planning and coding models can be configured separately.
- Authenticated project ownership checks, idempotent submission, cancellation, run events, persisted checkpoints and PostgreSQL workers.
- Structured design blueprints, project playbooks and Fast/Balanced/Polished generation modes. Polished adds a model source-quality review and bounded repair.
- Incremental follow-up builds: SHA-256 manifests, explicit preserve/read/modify/create/delete decisions, sparse model output and deterministic reuse of unchanged files.
- Typed, persisted agent handoffs with ordered events; the coordinator controls routing, budgets, retries and termination.
- Builder progress, implementation plan, source viewer, JSON source export, isolated HTML/React/Three.js previews, refresh recovery and follow-up generation from a completed run.
- Offline demo with no model key or Supabase account required for the **CLI**.

Requirements/architecture use deterministic policy scaffolds and routing hints. The model planner must produce a validated design blueprint and acyclic task graph. Planning, implementation and repair call the configured model; Polished adds source review. Review/security policies are not a complete security audit or visual browser evaluation.

## Try the pipeline without any keys

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
.venv/Scripts/python.exe -m app.orchestrator.demo
```

The command prints the completed run, steps, usage and generated demo HTML. Default mock mode is an explicitly labelled task-board sample, not prompt-driven AI generation. For the curated interactive 3D demo, install frontend dependencies and run:

```powershell
cd icogon-frontend
npm ci
cd ..
.venv/Scripts/python.exe -m app.orchestrator.demo --prompt "Build a 3D material explorer"
```

React source is compiled, never executed, on the host. The browser executes its bundle inside the preview iframe. Arbitrary custom generation still requires a model key.

## Run the application

Copy `.env.example` to `.env`, and `icogon-frontend/.env.example` to `icogon-frontend/.env`. Fill in the Supabase URL and publishable key on both sides. The existing login/project application needs Supabase even when model generation uses mock mode. Keep model keys exclusively in the root server `.env`.

The existing Supabase `projects` table must have `id`, `user_id`, `name`, `description`, `prompt` and timestamps, with owner RLS policies. Apply `infra/migrations/001_agent_orchestrator.sql` and `002_agent_pipeline_statuses.sql` for durable orchestration. These migrations do not bootstrap the existing auth/project/storage product schema.

```powershell
.venv/Scripts/python.exe -m uvicorn app.main:app --reload
# In a second terminal:
cd icogon-frontend
npm ci
npm run dev
```

Sign in, create a project, open its workspace and press **Build**. A completed build becomes context for the next prompt. Export downloads a JSON file containing paths and full source contents. In-memory runs disappear on restart; the browser stores only the latest run ID.

## Connect a model later

```dotenv
ORCHESTRATOR_PROVIDER=groq
GROQ_API_KEY=your-server-key
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
LLM_PLANNING_MODEL=
LLM_REVIEW_MODEL=
LLM_TIMEOUT_SECONDS=90
LLM_MAX_OUTPUT_TOKENS=8000
```

Restart API and workers after changing configuration. For another compatible service use `ORCHESTRATOR_PROVIDER=compatible`, `LLM_API_KEY`, its base URL and a model supporting JSON-object chat completions. Compatibility is not guaranteed for every provider. Missing keys fail explicitly; real mode never silently falls back to mock.

One HTTP attempt is one reserved model call. There are no hidden network retries. Rate limits/timeouts are classified; a new user-submitted run can retry failed work. Repair calls consume the same per-run call/token budget. Process crashes can repeat provider calls after lease recovery; set provider-side spend limits too.

## Verification and production boundaries

```powershell
.venv/Scripts/python.exe -m unittest discover -s tests -v
.venv/Scripts/python.exe -m ruff check app/agents app/orchestrator app/sandbox app/routers/orchestrator.py tests
.venv/Scripts/python.exe -m ruff format --check app/agents app/orchestrator app/sandbox app/routers/orchestrator.py tests
cd icogon-frontend
npm run build
```

Static mode validates paths and artifacts. React entrypoints additionally pass a real esbuild bundle check, with compilation failures sent into the repair loop. This transpiles TypeScript but does not type-check it or prove browser/business correctness. Configure Docker verification using [sandbox-execution.md](docs/sandbox-execution.md) for additional commands.

Browser previews allow inline scripts in an opaque-origin iframe, block network access and cannot access parent storage. React previews require Node.js plus `npm ci` in `icogon-frontend` on the API/worker host. The compiler resolves virtual project files and the installed allowlist: React, React DOM, Three.js and Lucide. It ignores generated package scripts/config, never installs generated dependencies and receives no application secrets. Imports outside the allowlist fail with actionable feedback. Preview compilation has a 1 MB source/100-file limit, two concurrent slots, a 20-second timeout and a four-bundle memory cache. The compiler is not an OS sandbox: public deployments should place it in a resource-isolated worker.

Choose **Fast** for a compact first draft, **Balanced** for design plus build, or **Polished** for an extra model review. Phase token caps and compact planner context reduce work; actual model latency/quality has not been benchmarked without credentials. Templates support websites, portfolios, dashboards, commerce prototypes, browser games and procedural 3D experiences. Native apps and connected backends are not executed in this browser runtime.

Before public launch: provision and test PostgreSQL workers, project RLS and backups; add tenant quotas/rate limits, real-provider evaluations, billing, deployment/rollback and resource-isolated preview workers. No public deployment or API purchase is performed by this change.

Research and next-stage architecture: [builder-research.md](docs/builder-research.md). Existing worker operations: [orchestrator-operations.md](docs/orchestrator-operations.md).
