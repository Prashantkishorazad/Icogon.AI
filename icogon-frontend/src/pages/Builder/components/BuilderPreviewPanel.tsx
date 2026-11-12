import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Code2,
  Loader2,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  Maximize2,
  Minimize2,
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
      return "ICOGON AI is building your application. Your live preview will appear here when generation is complete.";
    case "completed":
      return "Generation completed, but the preview response did not contain renderable HTML. Check the preview endpoint response.";
    case "failed":
      return "The last generation did not complete. Review the error in the AI panel and try again.";
    case "cancelled":
      return "Generation was cancelled. You can send another prompt whenever you're ready.";
    default:
      return "Start by describing the application you want to create in the AI panel.";
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
  const payload = useMemo(() => getPreviewPayload(preview), [preview]);
  const html = typeof payload?.html === "string" ? payload.html : "";
  const warnings = getStringArray(payload?.warnings);
  const compileErrors = getStringArray(payload?.errors);
  const hasPreview = available && html.length > 0;
  const hasError = Boolean(error || compileErrors.length);

  const deviceWidth =
    device === "mobile"
      ? "min(390px, 100%)"
      : device === "tablet"
        ? "min(768px, 100%)"
        : "100%";

  return (
    <section className="icogon-preview-panel flex min-h-[520px] flex-1 flex-col bg-white">
      <header className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-[#e8ebf0] bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#ff817b]" />
            <span className="h-2 w-2 rounded-full bg-[#ffc44f]" />
            <span className="h-2 w-2 rounded-full bg-[#72c995]" />
          </div>
          <span className="max-w-[220px] truncate text-xs font-semibold text-[#3e4655]">
            {projectName || "Project preview"}
          </span>
          {hasPreview ? (
            <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-700 sm:inline-flex">
              Live preview
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex items-center rounded-xl border border-[#e6e9ef] bg-[#f8f9fb] p-0.5">
            <button
              type="button"
              aria-label="Desktop preview"
              aria-pressed={device === "desktop"}
              title="Desktop"
              onClick={() => setDevice("desktop")}
              className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                device === "desktop"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-[#8a94a5] hover:text-[#4b5565]"
              }`}
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              aria-label="Tablet preview"
              aria-pressed={device === "tablet"}
              title="Tablet"
              onClick={() => setDevice("tablet")}
              className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                device === "tablet"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-[#8a94a5] hover:text-[#4b5565]"
              }`}
            >
              <Tablet size={15} />
            </button>
            <button
              type="button"
              aria-label="Mobile preview"
              aria-pressed={device === "mobile"}
              title="Mobile"
              onClick={() => setDevice("mobile")}
              className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                device === "mobile"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-[#8a94a5] hover:text-[#4b5565]"
              }`}
            >
              <Smartphone size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={!onRefresh || isRefreshing || !hasPreview}
            aria-label="Refresh preview"
            title="Refresh preview"
            className="grid h-8 w-8 place-items-center rounded-lg text-[#8a94a5] transition hover:bg-[#f3f5f8] hover:text-[#4b5565] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            disabled={!onToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen preview"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#8a94a5] transition hover:bg-[#f3f5f8] hover:text-[#4b5565] disabled:opacity-35"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      <div className={`relative flex min-h-[460px] flex-1 items-stretch justify-center overflow-auto bg-[#f1f3f6] ${
          isFullscreen ? "p-0" : "p-0"
        }`}>
        {hasPreview ? (
          <div
            className={`flex min-h-[460px] max-w-full flex-col overflow-hidden bg-white transition-[width] duration-200 ${
              device === "desktop"
                ? "w-full"
                : "mx-auto border-x border-[#e2e6ed] shadow-[0_8px_30px_rgba(20,30,50,0.10)]"
            }`}
            style={{
              width: deviceWidth,
              flex: device === "desktop" ? "1 1 100%" : "0 1 auto",
            }}
          >
            <iframe
              key={`${device}-${html.length}`}
              title={`${projectName} live preview`}
              srcDoc={html}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              className="block h-full min-h-[460px] w-full border-0 bg-white"
            />
          </div>
        ) : (
          <div
            className={`flex min-h-[460px] max-w-full flex-col items-center justify-center px-6 py-16 text-center ${
              device === "desktop"
                ? "w-full"
                : "mx-auto border-x border-[#e2e6ed] bg-white shadow-[0_8px_30px_rgba(20,30,50,0.08)]"
            }`}
            style={{ width: deviceWidth }}
          >
            {isRefreshing || runStatus === "generating" || runStatus === "verifying" ? (
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600">
                <Loader2 size={25} className="animate-spin" />
              </div>
            ) : hasError ? (
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
                <AlertCircle size={25} />
              </div>
            ) : (
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600">
                <Code2 size={25} />
              </div>
            )}

            <h2 className="text-base font-semibold text-[#252d3b]">
              {hasError ? "Preview unavailable" : "Your workspace is ready"}
            </h2>
            <p className="mt-2 max-w-[440px] text-xs leading-6 text-[#7b879a]">
              {error || compileErrors[0] || statusCopy(runStatus)}
            </p>

            {hasError ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={!onRefresh || isRefreshing}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#e3e6ec] bg-white px-3.5 py-2 text-xs font-medium text-[#525d70] shadow-sm transition hover:bg-[#f8f9fb] disabled:opacity-40"
              >
                <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                Try again
              </button>
            ) : null}

            {!hasError && !isRefreshing ? (
              <button
                type="button"
                onClick={onViewCode}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#e3e6ec] bg-white px-3.5 py-2 text-xs font-medium text-[#525d70] shadow-sm transition hover:bg-[#f8f9fb]"
              >
                <Code2 size={13} />
                View generated code
              </button>
            ) : null}
          </div>
        )}
      </div>

      {(warnings.length > 0 || compileErrors.length > 0) && (
        <div className="flex shrink-0 flex-col gap-1 border-t border-amber-100 bg-amber-50/80 px-4 py-2">
          {compileErrors.map((item, index) => (
            <p key={`error-${index}`} className="text-[10px] leading-4 text-red-700">
              {item}
            </p>
          ))}
          {warnings.map((item, index) => (
            <p key={`warning-${index}`} className="text-[10px] leading-4 text-amber-800">
              {item}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};

export default BuilderPreviewPanel;
