import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Code2, Eye, Send, Square, Download } from "lucide-react";
import { getProjectApi, type ProjectResponse } from "../../api/projectApi";
import {
  apiError,
  cancelRunApi,
  createOrchestratorRunApi,
  getCapabilitiesApi,
  getRunApi,
  isTerminalRun,
  type BuildQuality,
  type Capabilities,
  type CreateRunRequest,
  type RunResponse,
} from "../../api/orchestratorApi";
import GeneratedPreview from "./GeneratedPreview";
import "./workspace.css";

const stages = [
  "requirements",
  "architecture",
  "planning",
  "implementation",
  "review",
  "security_policy",
  "verification",
];
const labels: Record<string, string> = {
  requirements: "Understand requirements",
  architecture: "Design architecture",
  planning: "Plan the work",
  implementation: "Write the application",
  review: "Review changes",
  security_policy: "Check security policy",
  verification: "Verify output",
  repair: "Repair issues",
};

export default function BuilderWorkspacePage() {
  const { projectId = "" } = useParams();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [run, setRun] = useState<RunResponse | null>(null);
  const [baseRunId, setBaseRunId] = useState<string>();
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState<BuildQuality>("polished");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState("preview");
  const [selectedFile, setSelectedFile] = useState("");
  const [retryPayload, setRetryPayload] = useState<CreateRunRequest | null>(
    null,
  );
  const submitLock = useRef(false);
  const active = !!run && !isTerminalRun(run.status);
  const runId = run?.id;
  const files =
    run?.changes?.files.filter((file) => file.operation === "upsert") || [];
  const file = files.find((item) => item.path === selectedFile) || files[0];
  const storageKey = `icogon:run:v1:${projectId}`;

  useEffect(() => {
    let disposed = false;
    async function load() {
      try {
        const [data, config] = await Promise.all([
          getProjectApi(projectId),
          getCapabilitiesApi(),
        ]);
        if (disposed) return;
        setProject(data);
        setCapabilities(config);
        setPrompt(data.description || "");
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const restored = await getRunApi(saved);
            if (!disposed && restored.project_id === projectId) {
              setRun(restored);
              setBaseRunId(
                restored.status === "completed"
                  ? restored.id
                  : restored.base_run_id,
              );
            }
          } catch {
            if (!disposed)
              setError(
                "The previous run could not be restored. Memory-mode runs disappear after a server restart.",
              );
          }
        }
      } catch (e) {
        if (!disposed) setError(apiError(e));
      } finally {
        if (!disposed) setLoading(false);
      }
    }
    void load();
    return () => {
      disposed = true;
    };
  }, [projectId, storageKey]);

  useEffect(() => {
    if (!runId || !active) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    const id = runId;
    async function poll() {
      try {
        const next = await getRunApi(id);
        if (disposed) return;
        setRun(next);
        setError((previous) =>
          previous.startsWith("Connection interrupted:") ? "" : previous,
        );
        if (next.status === "completed") setBaseRunId(next.id);
        if (isTerminalRun(next.status)) return;
      } catch (e) {
        if (!disposed)
          setError(`Connection interrupted: ${apiError(e)} Reconnecting…`);
      }
      if (!disposed) timer = setTimeout(poll, 1200);
    }
    timer = setTimeout(poll, 300);
    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [runId, active]);

  async function submit(retry = false) {
    if (submitLock.current || active || (!retry && prompt.trim().length < 3))
      return;
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    const payload =
      retry && retryPayload
        ? retryPayload
        : {
            project_id: projectId,
            prompt: prompt.trim(),
            idempotency_key: crypto.randomUUID(),
            base_run_id: baseRunId,
            quality,
          };
    setRetryPayload(payload);
    try {
      const next = await createOrchestratorRunApi(payload);
      setRun(next);
      setPrompt("");
      setRetryPayload(null);
      localStorage.setItem(storageKey, next.id);
    } catch (e) {
      setError(apiError(e));
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }
  async function cancel() {
    if (!run) return;
    try {
      setRun(await cancelRunApi(run.id));
    } catch (e) {
      setError(apiError(e));
    }
  }
  function download() {
    if (!run?.changes) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(run.changes, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `icogon-${run.id}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <main className="builder-workspace">
      <header className="builder-header">
        <Link to="/projects" aria-label="Back to projects">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <strong>{project?.name || "Project workspace"}</strong>
          <span>ICOGON / Build</span>
        </div>
        <span className="builder-mode">
          {capabilities?.provider === "mock"
            ? "Demo provider"
            : capabilities?.model || "Connecting"}
        </span>
      </header>
      <div className="builder-panels">
        <section
          className="builder-conversation"
          aria-label="Build instructions and progress"
        >
          <div className="builder-history">
            <p className="builder-eyebrow">YOUR BUILD PARTNER</p>
            <h1>From an idea to a working first version.</h1>
            <p className="builder-muted">
              Describe the experience you want. Follow the plan, inspect the
              files, then ask for changes.
            </p>
            {capabilities?.provider === "mock" && (
              <p className="builder-notice">
                Demo mode uses a fixed sample to test the pipeline. Connect a
                model in the server configuration for prompt-driven generation.
              </p>
            )}
            {capabilities && !capabilities.configured && (
              <p className="builder-notice">
                The model API key is missing. Add it to the server environment
                and restart to enable generation.
              </p>
            )}
            {loading && <p role="status">Loading workspace…</p>}
            {run && (
              <>
                <div className="builder-request">
                  <span>Your request</span>
                  <p>{run.prompt}</p>
                </div>
                <div className="builder-run-heading">
                  <h2>Agent activity</h2>
                  <span role="status">{run.status}</span>
                </div>
                <ol className="builder-stages">
                  {stages.map((stage) => {
                    const step = run.steps
                      .filter((item) => item.name === stage)
                      .at(-1);
                    return (
                      <li key={stage} data-status={step?.status || "pending"}>
                        <span className="builder-dot" />
                        <span>{labels[stage]}</span>
                        <small>{step?.status || "pending"}</small>
                      </li>
                    );
                  })}
                </ol>
                {run.repair_attempts > 0 && (
                  <p className="builder-muted">
                    Repair attempts: {run.repair_attempts}
                  </p>
                )}
                {run.steps
                  .filter((step) => step.name === "quality_review")
                  .map((step) => (
                    <p key={step.id} className="builder-muted">
                      Quality review: {step.status}
                    </p>
                  ))}
                {run.plan?.blueprint && (
                  <details open>
                    <summary>
                      Design direction / {run.plan.blueprint.template}
                    </summary>
                    <p>{run.plan.blueprint.visual_direction}</p>
                    <p>For: {run.plan.blueprint.audience}</p>
                    <ul>
                      {run.plan.blueprint.interactions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <strong>Acceptance criteria</strong>
                    <ul>
                      {run.plan.blueprint.acceptance_criteria.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {run.plan.blueprint.limitations.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </details>
                )}
                {run.plan && (
                  <details open>
                    <summary>Implementation plan</summary>
                    <p>{run.plan.summary}</p>
                    <ol>
                      {run.plan.tasks.map((task) => (
                        <li key={task.id}>
                          <strong>{task.title}</strong>
                          <p>{task.description}</p>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
                {run.failure && (
                  <p className="builder-error" role="alert">
                    {run.failure.message}
                  </p>
                )}
                {run.verification && (
                  <div className="builder-checks">
                    <h2>Verification</h2>
                    {Object.entries(run.verification.checks).map(
                      ([name, passed]) => (
                        <p key={name}>
                          {passed ? "Pass:" : "Failed:"} {name.replaceAll("_", " ")}
                        </p>
                      ),
                    )}
                  </div>
                )}
                <p className="builder-muted">
                  {run.model_calls} model calls ·{" "}
                  {run.output_tokens.toLocaleString()} output tokens
                </p>
              </>
            )}
          </div>
          <form
            className="builder-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div className="builder-quality">
              <label htmlFor="build-quality">Build quality</label>
              <select
                id="build-quality"
                value={quality}
                disabled={active || submitting}
                onChange={(event) =>
                  setQuality(event.target.value as BuildQuality)
                }
              >
                <option value="fast">Fast / compact first draft</option>
                <option value="balanced">Balanced / design + build</option>
                <option value="polished">
                  Polished / extra quality review
                </option>
              </select>
            </div>
            {error && (
              <div role="alert" className="builder-error">
                {error}
                {retryPayload && (
                  <button
                    type="button"
                    onClick={() => void submit(true)}
                    disabled={submitting || active}
                  >
                    Retry submission
                  </button>
                )}
              </div>
            )}
            <label htmlFor="build-prompt">
              {baseRunId
                ? "What should we change?"
                : "What would you like to build?"}
            </label>
            <textarea
              id="build-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              maxLength={20000}
              rows={4}
              placeholder="A task board for my team, with priorities and a completed view…"
              disabled={loading || submitting || active}
            />
            <div className="builder-composer-actions">
              <small>
                {baseRunId
                  ? "Uses your last completed build"
                  : "Start with one clear user flow"}
              </small>
              {active ? (
                <button type="button" onClick={() => void cancel()}>
                  <Square size={14} /> Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !project ||
                    !capabilities?.configured ||
                    submitting ||
                    prompt.trim().length < 3
                  }
                >
                  <Send size={15} />
                  {submitting ? "Starting…" : "Build"}
                </button>
              )}
            </div>
          </form>
        </section>
        <section className="builder-output" aria-label="Generated application">
          <div className="builder-toolbar">
            <div role="tablist" aria-label="Output view">
              <button
                role="tab"
                aria-selected={tab === "preview"}
                onClick={() => setTab("preview")}
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                role="tab"
                aria-selected={tab === "code"}
                onClick={() => setTab("code")}
              >
                <Code2 size={16} />
                Code{files.length > 0 && ` (${files.length})`}
              </button>
            </div>
            <button onClick={download} disabled={!files.length}>
              <Download size={16} />
              Export files
            </button>
          </div>
          {tab === "preview" ? (
            <div className="builder-preview" role="tabpanel">
              {run?.status === "completed" && files.length ? (
                <GeneratedPreview key={run.id} run={run} />
              ) : (
                <div className="builder-empty">
                  <Eye size={30} />
                  <h2>
                    {active
                      ? "Your build is taking shape"
                      : "A place for your next idea"}
                  </h2>
                  <p>
                    Build a website, dashboard, store, interactive game or 3D
                    experience. The preview appears after checks pass.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="builder-code" role="tabpanel">
              {files.length ? (
                <>
                  <label htmlFor="generated-file">Project files</label>
                  <select
                    id="generated-file"
                    value={file?.path || ""}
                    onChange={(event) => setSelectedFile(event.target.value)}
                  >
                    {files.map((item) => (
                      <option key={item.path}>{item.path}</option>
                    ))}
                  </select>
                  <pre>
                    <code>{file?.content}</code>
                  </pre>
                </>
              ) : (
                <div className="builder-empty">
                  <Code2 size={30} />
                  <h2>No files yet</h2>
                  <p>
                    Source files appear when the implementation agent finishes.
                  </p>
                </div>
              )}
            </div>
          )}
          <footer className="builder-footer">
            {run?.verification?.checks.preview_bundle
              ? "Preview bundle passed / runtime behavior still needs review"
              : capabilities?.verification === "docker"
              ? "Docker verification configured"
              : "Static policy checks only · compilation has not been tested"}
            <span>
              {capabilities?.persistence === "memory"
                ? "Local memory · runs reset on restart"
                : "Persistent run history"}
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
