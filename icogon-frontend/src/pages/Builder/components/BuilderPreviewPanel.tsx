import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Code2,
  Loader2,
  Maximize2,
  Monitor,
  Minimize2,
  RefreshCw,
  Smartphone,
  Tablet,
} from "lucide-react";

type PreviewRunStatus =
  | "idle"
  | "queued"
  | "analyzing"
  | "designing"
  | "planning"
  | "generating"
  | "reviewing"
  | "repairing"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled";

type BuilderPreviewPanelProps = {
  projectName: string;
  preview: unknown | null;
  available: boolean;
  error?: string | null;
  runStatus: PreviewRunStatus;
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
  compiler?: unknown;
};

type DeviceMode = "desktop" | "tablet" | "mobile";

const getPreviewPayload = (value: unknown): PreviewPayload | null => {
  if (!value || typeof value !== "object") return null;
  return value as PreviewPayload;
};

const getStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const statusCopy = (status: PreviewRunStatus): string => {
  switch (status) {
    case "queued":
    case "analyzing":
    case "designing":
    case "planning":
    case "generating":
    case "reviewing":
    case "repairing":
    case "verifying":
      return "ICOGON AI is building your application. The preview will update when the latest generation is ready.";
    case "completed":
      return "Generation completed, but the preview response did not contain renderable HTML. Check the preview response or generated files.";
    case "failed":
      return "The last generation did not complete. Review the error in the AI panel and try again.";
    case "cancelled":
      return "Generation was cancelled. You can send another prompt whenever you're ready.";
    default:
      return "Describe the application you want to create in the AI panel to generate your first preview.";
  }
};

const BuilderPreviewPanel: React.FC<BuilderPreviewPanelProps> = ({
  projectName,
  preview,
  available,
  error,
  runStatus,
  isRefreshing = false,
  isFullscreen = false,
  onRefresh,
  onToggleFullscreen,
  onViewCode,
}) => {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [frameRevision, setFrameRevision] = useState(0);

  const payload = useMemo(() => getPreviewPayload(preview), [preview]);
  const html = typeof payload?.html === "string" ? payload.html : "";
  const warnings = getStringArray(payload?.warnings);
  const compileErrors = getStringArray(payload?.errors);
  const hasPreview = available && html.trim().length > 0;
  const hasError = Boolean(error || compileErrors.length > 0);
  const isGenerating = [
    "queued",
    "analyzing",
    "designing",
    "planning",
    "generating",
    "reviewing",
    "repairing",
    "verifying",
  ].includes(runStatus);
  const isBusy = isRefreshing || isGenerating;

  const deviceWidth =
    device === "mobile"
      ? "min(390px, 100%)"
      : device === "tablet"
        ? "min(768px, 100%)"
        : "100%";

  const refreshPreview = () => {
    if (!onRefresh || isRefreshing) return;
    setFrameRevision((current) => current + 1);
    onRefresh();
  };

  return (
    <section
      className="icogon-preview-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white"
      aria-label={`${projectName || "Project"} preview`}
    >
      <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#ff817b]" />
            <span className="h-2 w-2 rounded-full bg-[#ffc44f]" />
            <span className="h-2 w-2 rounded-full bg-[#72c995]" />
          </div>

          <span className="max-w-[160px] truncate text-xs font-semibold text-slate-700 sm:max-w-[220px]">
            {projectName || "Project preview"}
          </span>

          {hasPreview && (
            <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live preview
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div
            className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5"
            role="group"
            aria-label="Preview device size"
          >
            {([
              ["desktop", Monitor, "Desktop"],
              ["tablet", Tablet, "Tablet"],
              ["mobile", Smartphone, "Mobile"],
            ] as const).map(([mode, Icon, label]) => (
              <button
                key={mode}
                type="button"
                aria-label={`${label} preview`}
                aria-pressed={device === mode}
                title={label}
                onClick={() => setDevice(mode)}
                className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                  device === mode
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={refreshPreview}
            disabled={!onRefresh || isRefreshing || !hasPreview}
            aria-label="Refresh preview"
            title="Refresh preview"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            disabled={!onToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen preview"}
            aria-pressed={isFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      <div
        className={`relative flex min-h-0 flex-1 items-stretch justify-center overflow-auto bg-slate-100 ${
          device === "desktop" ? "p-0" : "p-2 sm:p-4"
        }`}
      >
        {hasPreview ? (
          <div
            className={`flex min-h-[320px] max-w-full flex-col overflow-hidden bg-white transition-[width] duration-200 sm:min-h-[460px] ${
              device === "desktop"
                ? "w-full"
                : "mx-auto border-x border-slate-200 shadow-[0_8px_30px_rgba(20,30,50,0.10)]"
            }`}
            style={{
              width: deviceWidth,
              flex: device === "desktop" ? "1 1 100%" : "0 1 auto",
            }}
          >
            <iframe
              key={`${device}-${frameRevision}-${html.length}`}
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
            className={`flex min-h-[320px] max-w-full flex-col items-center justify-center px-6 py-12 text-center sm:min-h-[460px] sm:py-16 ${
              device === "desktop"
                ? "w-full"
                : "mx-auto border-x border-slate-200 bg-white shadow-[0_8px_30px_rgba(20,30,50,0.08)]"
            }`}
            style={{ width: deviceWidth }}
            role="status"
            aria-live="polite"
          >
            <div
              className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl border ${
                isBusy
                  ? "border-violet-100 bg-violet-50 text-violet-600"
                  : hasError
                    ? "border-red-100 bg-red-50 text-red-500"
                    : "border-violet-100 bg-violet-50 text-violet-600"
              }`}
            >
              {isBusy ? (
                <Loader2 size={25} className="animate-spin" />
              ) : hasError ? (
                <AlertCircle size={25} />
              ) : (
                <Code2 size={25} />
              )}
            </div>

            <h2 className="text-base font-semibold text-slate-800">
              {isBusy
                ? "Building your preview"
                : hasError
                  ? "Preview unavailable"
                  : "Your workspace is ready"}
            </h2>

            <p className="mt-2 max-w-[440px] break-words text-xs leading-6 text-slate-500">
              {error || compileErrors[0] || statusCopy(runStatus)}
            </p>

            {hasError && (
              <button
                type="button"
                onClick={refreshPreview}
                disabled={!onRefresh || isRefreshing}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                Try again
              </button>
            )}

            {!hasError && !isBusy && onViewCode && (
              <button
                type="button"
                onClick={onViewCode}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <Code2 size={13} />
                View generated code
              </button>
            )}
          </div>
        )}
      </div>

      {(warnings.length > 0 || compileErrors.length > 0) && (
        <div
          className="flex max-h-28 shrink-0 flex-col gap-1 overflow-y-auto border-t border-amber-100 bg-amber-50/80 px-4 py-2"
          aria-label="Preview diagnostics"
        >
          {compileErrors.map((item, index) => (
            <p
              key={`error-${index}`}
              className="break-words text-[10px] leading-4 text-red-700"
            >
              {item}
            </p>
          ))}
          {warnings.map((item, index) => (
            <p
              key={`warning-${index}`}
              className="break-words text-[10px] leading-4 text-amber-800"
            >
              {item}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};

export default BuilderPreviewPanel;
