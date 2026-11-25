import { useEffect, useMemo, useState } from "react";
import {
  apiError,
  getPreviewApi,
  type RunResponse,
} from "../../api/orchestratorApi";
import { useAuthStore } from "../../store/authStore";

type CompiledPreview = {
  html: string;
  warnings: string[];
  compiler: string;
};

type GeneratedPreviewProps = {
  run: RunResponse;
};

// Store only the latest successful document for this mounted project. The
// workspace controller owns durable session storage; this is not another cache.
type SuccessfulPreview = CompiledPreview & {
  runId: string;
};

type PreviewRequestResult = {
  key: string;
  error: string;
};

type PreviewSession = {
  compiled: SuccessfulPreview | null;
  result: PreviewRequestResult | null;
};

const ENTRY_FILES = [
  "src/main.tsx",
  "src/main.jsx",
  "src/main.js",
];

const SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline' data: blob:",
  "style-src 'unsafe-inline' data:",
  "img-src data: blob:",
  "font-src data:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-src 'none'",
].join("; ");

function injectSecurityPolicy(html: string): string {
  const policy = `<meta http-equiv="Content-Security-Policy" content="${SECURITY_POLICY}">`;

  // Never trust or replace a policy supplied by generated code. Install our
  // own policy before any generated markup can execute. Additional policies
  // can restrict it further, but cannot relax it. The leading doctype keeps
  // standards mode. The browser creates the head for this initial meta tag.
  const source = html.replace(/^\uFEFF?\s*<!doctype[^>]*>/i, "");
  return `<!doctype html>\n${policy}\n${source}`;
}

function normalizeCompiledPreview(value: CompiledPreview): CompiledPreview {
  if (typeof value?.html !== "string" || !value.html.trim()) {
    throw new Error("The compiler returned an empty preview.");
  }

  return {
    html: value.html,
    warnings: Array.isArray(value.warnings)
      ? value.warnings.filter((warning): warning is string => typeof warning === "string")
      : [],
    compiler: typeof value.compiler === "string" && value.compiler.trim()
      ? value.compiler
      : "Unknown compiler",
  };
}

// React keys reset the entire preview session when the authenticated user or
// project changes, so a previous project's document cannot flash on screen.
export default function GeneratedPreview({
  run,
}: GeneratedPreviewProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const authLoading = useAuthStore((state) => state.isLoading);

  if (authLoading || !userId || run.user_id !== userId || !run.project_id) {
    return (
      <div className="builder-empty" role="status">
        <h2>{authLoading ? "Loading preview session" : "Preview unavailable"}</h2>
        <p>{authLoading ? "Checking your authenticated session." : "Open a project belonging to your signed-in account."}</p>
      </div>
    );
  }

  return (
    <GeneratedPreviewSession
      key={JSON.stringify([userId, run.project_id])}
      run={run}
    />
  );
}

function GeneratedPreviewSession({ run }: GeneratedPreviewProps) {
  const [session, setSession] = useState<PreviewSession>({
    compiled: null,
    result: null,
  });
  const [attempt, setAttempt] = useState(0);

  const files = useMemo(
    () => run.changes?.files ?? [],
    [run.changes?.files],
  );

  const upsertedFiles = useMemo(
    () => files.filter((file) => file.operation === "upsert"),
    [files],
  );

  const bundled = useMemo(
    () => upsertedFiles.some((file) => ENTRY_FILES.includes(file.path)),
    [upsertedFiles],
  );

  const inlineHtml = useMemo(
    () =>
      upsertedFiles.find((file) => file.path === "index.html")?.content ?? "",
    [upsertedFiles],
  );

  const hasSourceFiles = upsertedFiles.length > 0;
  const runId = run.id;
  const status = run.status.trim().toLowerCase();
  const completed = status === "completed";
  const failed = status === "failed";
  const cancelled = status === "cancelled";
  const terminal = completed || failed || cancelled;

  // A completed run has an immutable identifier. Ordinary status renders,
  // new object references and unrelated UI state must not request it again.
  // A manual retry changes the request key without removing the old document.
  const requestKey = JSON.stringify([runId, attempt]);
  const currentResult = session.result?.key === requestKey ? session.result : null;
  const compiled = session.compiled;
  const loading = completed && !currentResult;
  const error = completed ? currentResult?.error ?? "" : "";
  const retainingPrevious = Boolean(compiled && (compiled.runId !== runId || !completed));

  useEffect(() => {
    // The backend preview route requires a completed run, including for
    // static HTML. Do not compile incomplete changes or bypass the compiler
    // by rendering index.html alone: it may depend on other CSS/JS files.
    if (!completed || !runId) return;

    let disposed = false;
    const controller = new AbortController();

    getPreviewApi(runId, { signal: controller.signal })
      .then((result) => {
        if (disposed || controller.signal.aborted) return;

        const normalized = normalizeCompiledPreview(result);
        setSession({
          compiled: { ...normalized, runId },
          result: { key: requestKey, error: "" },
        });
      })
      .catch((cause: unknown) => {
        if (disposed || controller.signal.aborted) return;
        // Failed compilation must not replace a working preview.
        setSession((previous) => ({
          ...previous,
          result: { key: requestKey, error: apiError(cause) || "Unable to compile preview." },
        }));
      });

    return () => {
      disposed = true;
      controller.abort();
    };
  }, [runId, completed, requestKey]);

  // This string is intentionally independent of attempt and run status.
  // Changing the retry counter does not recreate the iframe; only a different
  // successful document changes its srcDoc. Keep iframe navigation isolated.
  const previewHtml = compiled?.html ?? "";

  const secureHtml = useMemo(
    () => (previewHtml ? injectSecurityPolicy(previewHtml) : ""),
    [previewHtml],
  );

  const retry = () => {
    if (!completed || loading) return;
    setAttempt((current) => current + 1);
  };

  if (loading && !secureHtml) {
    return (
      <div className="builder-empty" role="status" aria-live="polite">
        <div className="builder-preview-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <h2>Preparing your preview</h2>
        <p>
          Compiling your application, resolving modules, and preparing the
          live preview.
        </p>
      </div>
    );
  }

  if (error && !secureHtml) {
    return (
      <div className="builder-empty" role="alert">
        <div className="builder-preview-error-icon" aria-hidden="true">
          !
        </div>

        <h2>Preview could not be generated</h2>

        <p>{error}</p>

        <button type="button" onClick={retry} disabled={loading}>
          Retry preview
        </button>
      </div>
    );
  }

  if (!secureHtml) {
    const message = failed
      ? "This generation failed. No successful preview is available in this session."
      : cancelled
        ? "Generation was cancelled before a preview was available."
        : !terminal
          ? "ICOGON is generating your application. Preview compilation starts after the run completes."
          : bundled || inlineHtml
            ? "The application source is available, but the preview has not been compiled yet."
            : hasSourceFiles
              ? "Your project files are ready. Add an index.html file or a React entry file (src/main.tsx, src/main.jsx, or src/main.js) to enable the preview."
              : "No generated files are available for this run yet.";

    return (
      <div className="builder-empty" role="status">
        <h2>
          {failed
            ? "Generation failed"
            : cancelled
              ? "Generation cancelled"
              : !terminal
                ? "Waiting for generation"
                : bundled || inlineHtml
                  ? "Preview is not ready"
                  : hasSourceFiles
                    ? "Source is ready"
                    : "Nothing to preview yet"}
        </h2>

        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="generated-preview">
      {/* Keep the same iframe mounted when a later run is compiling or fails. */}
      {(loading || retainingPrevious || error) && (
        <div className="builder-preview-meta" role={error ? "alert" : "status"}>
          <span>
            {error
              ? `Preview update failed: ${error}`
              : loading
                ? "Compiling changes… showing the last successful preview."
                : failed
                  ? "Generation failed · showing the last successful preview."
                  : cancelled
                    ? "Generation cancelled · showing the last successful preview."
                    : "Showing the last successful preview while generation runs."}
          </span>
          {error && (
            <button type="button" onClick={retry} disabled={loading}>
              Retry preview
            </button>
          )}
        </div>
      )}

      {compiled?.warnings?.length ? (
        <details className="builder-preview-warnings">
          <summary>
            Compiler notes ({compiled.warnings.length})
          </summary>

          <div className="builder-preview-warning-list">
            {compiled.warnings.map((warning, index) => (
              <p key={`${index}-${warning}`}>{warning}</p>
            ))}
          </div>
        </details>
      ) : null}

      {compiled?.compiler ? (
        <div className="builder-preview-meta">
          <span>{retainingPrevious ? "Previous compiled preview" : "Preview compiled"}</span>
          <span>{compiled.compiler}</span>
        </div>
      ) : null}

      <iframe
        title="Generated application preview"
        className="generated-preview-frame"
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        loading="eager"
        srcDoc={secureHtml}
      />
    </div>
  );
}
