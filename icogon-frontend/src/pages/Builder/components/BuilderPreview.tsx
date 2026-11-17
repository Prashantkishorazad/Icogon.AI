import React, { useMemo } from "react";
import { AlertCircle, Code2, Loader2, Maximize2, Minimize2 } from "lucide-react";

export type BuilderDevice = "desktop" | "tablet" | "mobile";

type PreviewRunStatus =
  | "idle" | "queued" | "analyzing" | "designing" | "planning"
  | "generating" | "reviewing" | "repairing" | "verifying"
  | "completed" | "failed" | "cancelled";

type BuilderPreviewPanelProps = {
  projectName: string;
  preview: unknown | null;
  available: boolean;
  error?: string | null;
  runStatus: PreviewRunStatus;
  device?: BuilderDevice;
  isRefreshing?: boolean;
  isFullscreen?: boolean;
  onRefresh?: () => void;
  onToggleFullscreen?: () => void;
  onViewCode?: () => void;
};

type PreviewPayload = {
  html?: unknown;
  warnings?: unknown;
  errors?: unknown;
};

const getPayload = (value: unknown): PreviewPayload | null =>
  value && typeof value === "object" ? (value as PreviewPayload) : null;

const stringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const inProgress = (status: PreviewRunStatus) =>
  ["queued", "analyzing", "designing", "planning", "generating",
   "reviewing", "repairing", "verifying"].includes(status);

const statusMessage = (status: PreviewRunStatus) => {
  if (inProgress(status)) {
    return "ICOGON AI is building your application. The preview will update when generation is ready.";
  }
  if (status === "completed") {
    return "Generation completed, but no renderable HTML was returned. Check generated files and preview output.";
  }
  if (status === "failed") return "The last generation failed. Review the error and try another prompt.";
  if (status === "cancelled") return "Generation was cancelled. You can send another prompt when ready.";
  return "Describe the application you want to create to generate your first preview.";
};

const deviceWidth: Record<BuilderDevice, string> = {
  desktop: "100%",
  tablet: "min(768px, 100%)",
  mobile: "min(390px, 100%)",
};

const BuilderPreviewPanel: React.FC<BuilderPreviewPanelProps> = ({
  projectName,
  preview,
  available,
  error,
  runStatus,
  device = "desktop",
  isRefreshing = false,
  isFullscreen = false,
  onToggleFullscreen,
  onViewCode,
}) => {
  const payload = useMemo(() => getPayload(preview), [preview]);
  const html = typeof payload?.html === "string" ? payload.html : "";
  const warnings = stringArray(payload?.warnings);
  const compileErrors = stringArray(payload?.errors);
  const hasPreview = available && html.trim().length > 0;
  const hasError = Boolean(error || compileErrors.length);
  const busy = isRefreshing || inProgress(runStatus);

  return (
    <section
      className="icogon-preview-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      aria-label={`${projectName || "Project"} preview`}
    >
      <header className="flex min-h-11 shrink-0 items-center justify-between gap-2 border-b border-[var(--builder-border)] bg-[var(--builder-panel)] px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-semibold text-[var(--builder-text)]">
            {projectName || "Project preview"}
          </span>
          {hasPreview ? (
            <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-300 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live preview
            </span>
          ) : null}
          <span className="hidden text-[10px] text-[var(--builder-muted)] sm:inline">
            {device === "desktop" ? "Desktop" : device === "tablet" ? "Tablet · 768px" : "Mobile · 390px"}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleFullscreen}
          disabled={!onToggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen preview"}
          aria-pressed={isFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--builder-muted)] transition hover:bg-[var(--builder-hover)] hover:text-[var(--builder-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </header>

      <div
        className={`relative flex min-h-0 flex-1 items-stretch justify-center overflow-auto bg-[var(--builder-canvas)] ${
          device === "desktop" ? "p-0" : "p-2 sm:p-4"
        }`}
        data-preview-device={device}
      >
        {hasPreview ? (
          <div
            className={`flex min-h-[320px] max-w-full flex-col overflow-hidden bg-white transition-[width] duration-200 sm:min-h-[460px] ${
              device === "desktop"
                ? "w-full"
                : "mx-auto border-x border-[var(--builder-border)] shadow-[0_8px_30px_rgba(20,30,50,0.12)]"
            }`}
            style={{
              width: deviceWidth[device],
              flex: device === "desktop" ? "1 1 100%" : "0 0 auto",
            }}
          >
            <iframe
              title={`${projectName || "Project"} live preview`}
              srcDoc={html}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              loading="eager"
              className="block min-h-[320px] w-full flex-1 border-0 bg-white sm:min-h-[460px]"
            />
          </div>
        ) : (
          <div
            className={`flex min-h-[320px] max-w-full flex-col items-center justify-center px-6 py-12 text-center sm:min-h-[460px] ${
              device === "desktop"
                ? "w-full"
                : "mx-auto border-x border-[var(--builder-border)] bg-[var(--builder-panel)]"
            }`}
            style={{ width: deviceWidth[device] }}
            role="status"
            aria-live="polite"
          >
            <div className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl border ${
              busy
                ? "border-violet-500/20 bg-violet-500/10 text-violet-500"
                : hasError
                  ? "border-red-500/20 bg-red-500/10 text-red-500"
                  : "border-violet-500/20 bg-violet-500/10 text-violet-500"
            }`}>
              {busy ? <Loader2 size={25} className="animate-spin" /> :
               hasError ? <AlertCircle size={25} /> : <Code2 size={25} />}
            </div>

            <h2 className="text-base font-semibold text-[var(--builder-text)]">
              {busy ? "Building your preview" : hasError ? "Preview unavailable" : "Your workspace is ready"}
            </h2>
            <p className="mt-2 max-w-[440px] break-words text-xs leading-6 text-[var(--builder-muted)]">
              {error || compileErrors[0] || statusMessage(runStatus)}
            </p>

            {!busy && !hasError && onViewCode ? (
              <button
                type="button"
                onClick={onViewCode}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--builder-border)] bg-[var(--builder-panel)] px-3.5 py-2 text-xs font-medium text-[var(--builder-text)] shadow-sm transition hover:bg-[var(--builder-hover)]"
              >
                <Code2 size={13} />
                View generated code
              </button>
            ) : null}
          </div>
        )}
      </div>

      {compileErrors.length || warnings.length ? (
        <div className="flex max-h-28 shrink-0 flex-col gap-1 overflow-y-auto border-t border-amber-500/20 bg-amber-500/5 px-4 py-2" aria-label="Preview diagnostics">
          {compileErrors.map((item, index) => (
            <p key={`error-${index}`} className="break-words text-[10px] leading-4 text-red-500">
              {item}
            </p>
          ))}
          {warnings.map((item, index) => (
            <p key={`warning-${index}`} className="break-words text-[10px] leading-4 text-amber-600 dark:text-amber-300">
              {item}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default BuilderPreviewPanel;
