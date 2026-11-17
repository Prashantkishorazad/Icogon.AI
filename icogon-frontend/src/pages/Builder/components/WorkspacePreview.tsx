import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Code2,
  ExternalLink,
  Eye,
  Laptop,
  Loader2,
  // Maximize2,
  Monitor,
  Moon,
  RefreshCw,
  Smartphone,
  Sun,
  Tablet,
} from "lucide-react";
import type { DeviceMode, PreviewState } from "../types";
import type { ProjectResponse } from "../../../api/projectApi";

interface WorkspacePreviewProps {
  project: ProjectResponse | null;
  previewState: PreviewState;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  isRefreshing: boolean;
  onRefreshPreview: () => void;
  isRunning: boolean;
  onQuickPrompt: (prompt: string) => void;
  files: Array<{ path: string; content?: string | null }>;
}

type PreviewTheme = "light" | "dark" | "system";

const STARTER_PROMPTS = [
  "Create a polished landing page for my product",
  "Build a modern SaaS dashboard",
  "Make this application responsive",
];

const getHtml = (previewState: PreviewState): string => {
  if (typeof previewState.html === "string" && previewState.html.trim()) {
    return previewState.html;
  }
  const data = previewState.data;
  if (data && typeof data === "object" && "html" in data) {
    const html = (data as { html?: unknown }).html;
    if (typeof html === "string" && html.trim()) return html;
  }
  return "";
};

const withBaseDocument = (html: string) => {
  if (!html.trim()) return "";
  if (/<html[\s>]/i.test(html)) return html;
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head><body>${html}</body></html>`;
};

export const WorkspacePreview: React.FC<WorkspacePreviewProps> = ({
  project,
  previewState,
  deviceMode,
  setDeviceMode,
  isRefreshing,
  onRefreshPreview,
  isRunning,
  onQuickPrompt,
  files,
}) => {
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("system");
  const html = useMemo(() => withBaseDocument(getHtml(previewState)), [previewState]);
  const hasPreview = Boolean(html.trim());
  const warnings = previewState.warnings || [];
  const viewportWidth =
    deviceMode === "mobile" ? 390 : deviceMode === "tablet" ? 820 : 1440;

  const openPreviewInNewTab = () => {
    if (!hasPreview) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      URL.revokeObjectURL(url);
      return;
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <section className="icogon-preview-workspace" aria-label="Application preview">
      <style>{`
        .icogon-preview-workspace {
          --preview-bg: var(--builder-bg, #f5f6fa);
          --preview-panel: var(--builder-panel, #fff);
          --preview-surface: var(--builder-surface, #f1f3f8);
          --preview-border: var(--builder-border, #e1e5ee);
          --preview-text: var(--builder-text, #202536);
          --preview-muted: var(--builder-muted, #697386);
          display: flex; flex: 1 1 auto; flex-direction: column;
          width: 100%; height: 100%; min-width: 0; min-height: 0;
          overflow: hidden; color: var(--preview-text); background: var(--preview-bg);
        }
        .icogon-preview-toolbar {
          display: flex; flex: 0 0 48px; align-items: center; justify-content: space-between;
          gap: 10px; min-width: 0; padding: 0 14px;
          border-bottom: 1px solid var(--preview-border); background: var(--preview-panel);
        }
        .icogon-preview-toolbar-group { display: flex; align-items: center; gap: 5px; min-width: 0; }
        .icogon-preview-label { display: flex; align-items: center; gap: 7px; color: var(--preview-muted); font-size: 11px; font-weight: 600; }
        .icogon-preview-label strong { color: var(--preview-text); font-weight: 650; }
        .icogon-preview-workspace button {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          height: 31px; min-width: 31px; padding: 0 9px; border: 1px solid transparent;
          border-radius: 8px; color: var(--preview-muted); background: transparent;
          font: inherit; font-size: 11px; cursor: pointer;
          transition: color 130ms ease, background 130ms ease, border-color 130ms ease;
        }
        .icogon-preview-workspace button:hover:not(:disabled) {
          color: var(--preview-text); background: var(--preview-surface); border-color: var(--preview-border);
        }
        .icogon-preview-workspace button:focus-visible { outline: 2px solid #7188e8; outline-offset: 2px; }
        .icogon-preview-workspace button:disabled { opacity: .4; cursor: not-allowed; }
        .icogon-preview-device-group, .icogon-preview-theme-group {
          display: inline-flex; align-items: center; gap: 2px; padding: 3px;
          border: 1px solid var(--preview-border); border-radius: 10px; background: var(--preview-surface);
        }
        .icogon-preview-workspace .icogon-preview-device-group button,
        .icogon-preview-workspace .icogon-preview-theme-group button {
          width: 29px; height: 27px; min-width: 29px; padding: 0; border: 0;
        }
        .icogon-preview-workspace .icogon-preview-device-group button[aria-pressed="true"],
        .icogon-preview-workspace .icogon-preview-theme-group button[aria-pressed="true"] {
          color: #647be8; background: var(--preview-panel); box-shadow: 0 1px 3px rgb(0 0 0 / .1);
        }
        .icogon-preview-stage {
          display: flex; flex: 1 1 auto; align-items: flex-start; justify-content: center;
          min-width: 0; min-height: 0; overflow: auto; padding: 22px;
          background-color: var(--preview-bg);
          background-image: radial-gradient(color-mix(in srgb, var(--preview-muted) 20%, transparent) .7px, transparent .7px);
          background-size: 16px 16px;
        }
        .icogon-preview-frame-shell {
          display: flex; flex-direction: column; flex: 0 0 auto;
          width: min(100%, var(--preview-width, 1440px)); min-height: min(100%, 720px);
          overflow: hidden; border: 1px solid var(--preview-border); border-radius: 13px;
          background: white; box-shadow: 0 12px 36px rgb(15 23 42 / .12);
          transition: width 180ms ease;
        }
        .icogon-preview-frame-top {
          display: flex; flex: 0 0 34px; align-items: center; gap: 7px; padding: 0 11px;
          border-bottom: 1px solid #e7e9ef; background: #fafbfc;
        }
        .icogon-preview-window-dot { width: 7px; height: 7px; border-radius: 50%; background: #d1d5df; }
        .icogon-preview-address {
          flex: 1; max-width: 420px; margin: 0 auto; padding: 4px 10px;
          overflow: hidden; border: 1px solid #e8eaf0; border-radius: 6px;
          color: #9299a8; background: white; font-size: 9px; text-align: center;
          text-overflow: ellipsis; white-space: nowrap;
        }
        .icogon-preview-iframe { display: block; flex: 1 1 auto; width: 100%; min-height: 600px; border: 0; background: white; }
        .icogon-preview-empty {
          display: flex; flex: 1 1 auto; align-items: center; justify-content: center;
          min-height: 420px; padding: 30px;
        }
        .icogon-preview-empty-card {
          width: min(100%, 560px); padding: 30px; border: 1px solid var(--preview-border);
          border-radius: 18px; background: var(--preview-panel); box-shadow: 0 12px 34px rgb(15 23 42 / .06);
          text-align: center;
        }
        .icogon-preview-empty-icon {
          display: grid; place-items: center; width: 48px; height: 48px; margin: 0 auto 15px;
          border: 1px solid var(--preview-border); border-radius: 15px;
          color: #7188e8; background: color-mix(in srgb, #7188e8 10%, var(--preview-panel));
        }
        .icogon-preview-empty-card h2 { margin: 0; color: var(--preview-text); font-size: 17px; font-weight: 700; letter-spacing: -.02em; }
        .icogon-preview-empty-card p { max-width: 410px; margin: 9px auto 19px; color: var(--preview-muted); font-size: 12px; line-height: 1.65; }
        .icogon-preview-prompts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
        .icogon-preview-workspace .icogon-preview-prompts button {
          justify-content: flex-start; height: auto; min-height: 39px; padding: 9px 10px;
          border: 1px solid var(--preview-border); background: var(--preview-surface);
          color: var(--preview-text); text-align: left; white-space: normal; line-height: 1.4;
        }
        .icogon-preview-workspace .icogon-preview-prompts button:hover { border-color: #7188e8; }
        .icogon-preview-warning {
          display: flex; align-items: flex-start; gap: 7px; padding: 9px 14px;
          border-bottom: 1px solid color-mix(in srgb, #d69b38 35%, var(--preview-border));
          color: #a97926; background: color-mix(in srgb, #e9b34c 9%, var(--preview-panel));
          font-size: 10px; line-height: 1.5;
        }
        @media (max-width: 700px) {
          .icogon-preview-toolbar { padding: 0 8px; gap: 5px; }
          .icogon-preview-stage { padding: 10px; }
          .icogon-preview-frame-shell { width: 100% !important; min-height: 100%; }
          .icogon-preview-iframe { min-height: 520px; }
          .icogon-preview-empty-card { padding: 22px 16px; }
          .icogon-preview-prompts { grid-template-columns: 1fr; }
          .icogon-preview-label span { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .icogon-preview-frame-shell, .icogon-preview-workspace button { transition: none; }
        }
      `}</style>

      <div className="icogon-preview-toolbar">
        <div className="icogon-preview-toolbar-group">
          <div className="icogon-preview-label">
            <Eye size={14} />
            <strong>Preview</strong>
            <span>· {project?.name || "Your application"}</span>
          </div>
        </div>

        <div className="icogon-preview-toolbar-group">
          <div className="icogon-preview-device-group" role="group" aria-label="Preview device size">
            <button type="button" onClick={() => setDeviceMode("desktop")} aria-pressed={deviceMode === "desktop"} title="Desktop">
              <Laptop size={14} />
            </button>
            <button type="button" onClick={() => setDeviceMode("tablet")} aria-pressed={deviceMode === "tablet"} title="Tablet">
              <Tablet size={14} />
            </button>
            <button type="button" onClick={() => setDeviceMode("mobile")} aria-pressed={deviceMode === "mobile"} title="Mobile">
              <Smartphone size={14} />
            </button>
          </div>
          <div className="icogon-preview-theme-group" role="group" aria-label="Preview appearance">
            {(["light", "dark", "system"] as PreviewTheme[]).map((theme) => (
              <button
                type="button"
                key={theme}
                onClick={() => setPreviewTheme(theme)}
                aria-pressed={previewTheme === theme}
                title={`${theme[0].toUpperCase()}${theme.slice(1)} preview`}
              >
                {theme === "light" ? <Sun size={13} /> : theme === "dark" ? <Moon size={13} /> : <Monitor size={13} />}
              </button>
            ))}
          </div>
          <button type="button" onClick={onRefreshPreview} disabled={isRefreshing || isRunning} title="Refresh preview" aria-label="Refresh preview">
            {isRefreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
          <button type="button" onClick={openPreviewInNewTab} disabled={!hasPreview} title="Open preview in new tab" aria-label="Open preview in new tab">
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="icogon-preview-warning" role="status">
          <AlertCircle size={13} />
          <div>{warnings.slice(0, 3).join(" · ")}</div>
        </div>
      )}

      {hasPreview ? (
        <div className="icogon-preview-stage">
          <div
            className="icogon-preview-frame-shell"
            style={{ "--preview-width": `${viewportWidth}px` } as React.CSSProperties}
          >
            <div className="icogon-preview-frame-top" aria-hidden="true">
              <span className="icogon-preview-window-dot" />
              <span className="icogon-preview-window-dot" />
              <span className="icogon-preview-window-dot" />
              <div className="icogon-preview-address">
                {project?.name || "localhost"} · Preview
              </div>
            </div>
            <iframe
              key={`${previewTheme}-${html.length}`}
              className="icogon-preview-iframe"
              title={`${project?.name || "Application"} preview`}
              srcDoc={html}
              sandbox="allow-scripts allow-forms allow-modals"
              referrerPolicy="no-referrer"
              loading="eager"
            />
          </div>
        </div>
      ) : (
        <div className="icogon-preview-empty">
          <div className="icogon-preview-empty-card">
            <div className="icogon-preview-empty-icon">
              {isRunning ? <Loader2 size={22} className="animate-spin" /> : <Code2 size={22} />}
            </div>
            <h2>{isRunning ? "Building your workspace" : "Your preview starts here"}</h2>
            <p>
              {isRunning
                ? "Your changes are being prepared. The preview will appear when compiled HTML is available."
                : files.length > 0
                  ? "Source files are available, but there is no compiled preview yet."
                  : "Describe what you want to build in the chat. ICOGON will prepare the application preview here."}
            </p>
            {!isRunning && (
              <div className="icogon-preview-prompts">
                {STARTER_PROMPTS.map((prompt) => (
                  <button type="button" key={prompt} onClick={() => onQuickPrompt(prompt)}>
                    <span>{prompt}</span>
                    <ArrowUpRight size={13} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default WorkspacePreview;
