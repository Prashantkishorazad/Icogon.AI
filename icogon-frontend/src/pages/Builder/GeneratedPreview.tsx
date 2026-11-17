
import { useEffect, useMemo, useState } from "react";
import {
  apiError,
  getPreviewApi,
  type RunResponse,
} from "../../api/orchestratorApi";

type CompiledPreview = {
  html: string;
  warnings: string[];
  compiler: string;
};

type GeneratedPreviewProps = {
  run: RunResponse;
};

const ENTRY_FILES = [
  "src/main.tsx",
  "src/main.jsx",
  "src/main.js",
];

const SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline' 'unsafe-eval' data: blob:",
  "style-src 'unsafe-inline' data:",
  "img-src data: blob:",
  "font-src data:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "object-src 'none'",
].join("; ");

function injectSecurityPolicy(html: string): string {
  const policy = `<meta http-equiv="Content-Security-Policy" content="${SECURITY_POLICY}">`;

  // Replace an existing CSP meta tag so that the preview has one
  // predictable policy rather than conflicting policies.
  const existingPolicy =
    /<meta\b[^>]*http-equiv\s*=\s*["']?Content-Security-Policy["']?[^>]*>/i;

  if (existingPolicy.test(html)) {
    return html.replace(existingPolicy, policy);
  }

  // Insert the policy inside the document head when possible.
  if (/<head\b[^>]*>/i.test(html)) {
    return html.replace(/<head\b[^>]*>/i, (head) => `${head}${policy}`);
  }

  // Handle generated documents that omit an explicit head.
  if (/<html\b[^>]*>/i.test(html)) {
    return html.replace(/<html\b[^>]*>/i, (htmlTag) => {
      return `${htmlTag}<head>${policy}</head>`;
    });
  }

  // A fragment or incomplete HTML document.
  return `<!doctype html><html><head>${policy}</head><body>${html}</body></html>`;
}

export default function GeneratedPreview({
  run,
}: GeneratedPreviewProps) {
  const [compiled, setCompiled] = useState<CompiledPreview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    let disposed = false;

    setCompiled(null);
    setError("");

    if (!bundled) {
      setLoading(false);
      return () => {
        disposed = true;
      };
    }

    setLoading(true);

    getPreviewApi(runId)
      .then((result) => {
        if (disposed) return;

        if (!result.html?.trim()) {
          setError("The compiler returned an empty preview.");
          return;
        }

        setCompiled({
          html: result.html,
          warnings: result.warnings ?? [],
          compiler: result.compiler ?? "Unknown compiler",
        });
      })
      .catch((cause: unknown) => {
        if (!disposed) {
          setError(apiError(cause));
        }
      })
      .finally(() => {
        if (!disposed) {
          setLoading(false);
        }
      });

    return () => {
      disposed = true;
    };
  }, [runId, bundled, attempt]);

  const previewHtml = bundled ? compiled?.html : inlineHtml;

  const secureHtml = useMemo(
    () => (previewHtml ? injectSecurityPolicy(previewHtml) : ""),
    [previewHtml],
  );

  const retry = () => {
    setError("");
    setCompiled(null);
    setAttempt((current) => current + 1);
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="builder-empty" role="alert">
        <div className="builder-preview-error-icon" aria-hidden="true">
          !
        </div>

        <h2>Preview could not be generated</h2>

        <p>{error}</p>

        <button type="button" onClick={retry}>
          Retry preview
        </button>
      </div>
    );
  }

  if (!secureHtml) {
    const message = bundled
      ? "The application source is available, but the preview has not been compiled yet."
      : hasSourceFiles
        ? "Your project files are ready. Add an index.html file or a React entry file (src/main.tsx, src/main.jsx, or src/main.js) to enable the preview."
        : "No generated files are available for this run yet.";

    return (
      <div className="builder-empty" role="status">
        <h2>
          {bundled
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
          <span>Preview compiled</span>
          <span>{compiled.compiler}</span>
        </div>
      ) : null}

      <iframe
        key={`${runId}-${attempt}`}
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
