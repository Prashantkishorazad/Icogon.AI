import { useEffect, useState } from "react";
import {
  apiError,
  getPreviewApi,
  type RunResponse,
} from "../../api/orchestratorApi";

const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">`;

export default function GeneratedPreview({ run }: { run: RunResponse }) {
  const files =
    run.changes?.files.filter((file) => file.operation === "upsert") || [];
  const bundled = files.some((file) =>
    ["src/main.tsx", "src/main.jsx", "src/main.js"].includes(file.path),
  );
  const inlineHtml = files.find((file) => file.path === "index.html")?.content;
  const [compiled, setCompiled] = useState<{
    html: string;
    warnings: string[];
  } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const id = run.id;
  useEffect(() => {
    if (!bundled) return;
    let disposed = false;
    getPreviewApi(id)
      .then((result) => {
        if (!disposed) setCompiled(result);
      })
      .catch((cause) => {
        if (!disposed) setError(apiError(cause));
      });
    return () => {
      disposed = true;
    };
  }, [id, bundled, attempt]);
  const html = bundled ? compiled?.html : inlineHtml;
  if (error)
    return (
      <div className="builder-empty" role="alert">
        <h2>Preview could not compile</h2>
        <p>{error}</p>
        <button
          onClick={() => {
            setError("");
            setAttempt((value) => value + 1);
          }}
        >
          Retry preview
        </button>
      </div>
    );
  if (!html)
    return (
      <div className="builder-empty" role="status">
        <h2>
          {bundled ? "Preparing your application" : "Source is ready to export"}
        </h2>
        <p>
          {bundled
            ? "Bundling React, styles and scene modules..."
            : "Preview supports self-contained HTML and React projects with src/main.tsx."}
        </p>
      </div>
    );
  return (
    <>
      {compiled?.warnings.length ? (
        <details className="builder-preview-warnings">
          <summary>Compiler notes ({compiled.warnings.length})</summary>
          {compiled.warnings.map((warning, index) => (
            <p key={index}>{warning}</p>
          ))}
        </details>
      ) : null}
      <iframe
        title="Generated application preview"
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        srcDoc={policy + html}
      />
    </>
  );
}
