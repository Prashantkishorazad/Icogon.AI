import React from "react";
import {
  ArrowLeft,
  Code2,
  Eye,
  Laptop,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  Share2,
  Smartphone,
  Tablet,
  Check,
  Menu,
  MessageSquare,
  // FileCode2,
  // Layers3,
  // ExternalLink,
  Rocket,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import type {
  DeviceMode,
  ProjectResponse,
  RunStage,
  WorkspaceTab,
} from "../types";

interface WorkspaceHeaderProps {
  project: ProjectResponse | null;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  runStage: RunStage;
  isRunning: boolean;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  isRefreshing: boolean;
  onRefreshPreview: () => void;
  onTriggerRun: () => void;
  fileCount: number;
  onToggleNavigation?: () => void;
  navigationOpen?: boolean;
  onToggleChat?: () => void;
  chatOpen?: boolean;
}

const statusLabel = (stage: RunStage) =>
  stage === "idle" ? "Ready" : stage.replace(/-/g, " ");

const statusTone = (stage: RunStage) => {
  if (stage === "completed") return "is-success";
  if (stage === "failed") return "is-error";
  if (stage === "cancelled") return "is-warning";
  if (stage === "idle") return "is-idle";
  return "is-active";
};

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  project,
  activeTab,
  setActiveTab,
  deviceMode,
  setDeviceMode,
  runStage,
  isRunning,
  isFullscreen,
  setIsFullscreen,
  isRefreshing,
  onRefreshPreview,
  onTriggerRun,
  fileCount,
  onToggleNavigation,
  navigationOpen = true,
  onToggleChat,
  chatOpen = true,
}) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [shareState, setShareState] = React.useState<"idle" | "copied" | "error">("idle");
  const shareTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (shareTimer.current) clearTimeout(shareTimer.current);
    },
    [],
  );

  React.useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, setIsFullscreen]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = url;
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();
        const copied = document.execCommand("copy");
        temporary.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      setShareState("copied");
    } catch {
      setShareState("error");
    }
    if (shareTimer.current) clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(() => setShareState("idle"), 2200);
  };

  const openPreview = () => setActiveTab("preview");
  const openCode = () => setActiveTab("code");

  return (
    <header className="icogon-builder-header" aria-label="Builder toolbar">
      <style>{`
        .icogon-builder-header {
          --header-bg: var(--builder-header, var(--builder-panel, #11131a));
          --header-border: var(--builder-border, #262a36);
          --header-text: var(--builder-text, #e5e7eb);
          --header-muted: var(--builder-muted, #9299aa);
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 12px;
          width: 100%;
          min-width: 0;
          min-height: 58px;
          padding: 0 14px;
          color: var(--header-text);
          background: var(--header-bg);
          border-bottom: 1px solid var(--header-border);
          user-select: none;
        }
        .icogon-builder-header button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-width: 0;
          height: 34px;
          padding: 0 10px;
          border: 1px solid var(--header-border);
          border-radius: 9px;
          color: var(--header-muted);
          background: color-mix(in srgb, var(--header-bg) 78%, white 4%);
          font: inherit;
          font-size: 12px;
          font-weight: 550;
          white-space: nowrap;
          transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
        }
        .icogon-builder-header button:hover:not(:disabled) {
          color: var(--header-text);
          border-color: color-mix(in srgb, var(--header-border), var(--header-text) 24%);
          background: color-mix(in srgb, var(--header-bg) 82%, white 8%);
        }
        .icogon-builder-header button:focus-visible {
          outline: 2px solid #7188f5;
          outline-offset: 2px;
        }
        .icogon-builder-header button:disabled { opacity: .48; cursor: not-allowed; }
        .icogon-header-left, .icogon-header-right, .icogon-header-center {
          display: flex;
          align-items: center;
          min-width: 0;
          gap: 7px;
        }
        .icogon-header-left { justify-content: flex-start; }
        .icogon-header-center { justify-content: center; }
        .icogon-header-right { justify-content: flex-end; }
        .icogon-header-icon { width: 34px; padding: 0 !important; flex: 0 0 34px; }
        .icogon-header-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          margin-left: 2px;
        }
        .icogon-header-logo {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          overflow: hidden;
          border: 1px solid var(--header-border);
          border-radius: 9px;
          background: color-mix(in srgb, var(--header-bg), white 5%);
        }
        .icogon-header-logo img { width: 25px; height: 25px; object-fit: contain; }
        .icogon-header-project { min-width: 0; }
        .icogon-header-project-name {
          overflow: hidden;
          color: var(--header-text);
          font-size: 12px;
          font-weight: 650;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 190px;
        }
        .icogon-header-project-subtitle {
          margin-top: 2px;
          color: var(--header-muted);
          font-size: 10px;
          white-space: nowrap;
        }
        .icogon-header-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border: 1px solid var(--header-border);
          border-radius: 999px;
          color: var(--header-muted);
          background: color-mix(in srgb, var(--header-bg), white 4%);
          font-size: 10px;
          text-transform: capitalize;
        }
        .icogon-header-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; }
        .icogon-header-status.is-active .icogon-header-status-dot { background: #38bdf8; animation: icogon-pulse 1.5s infinite; }
        .icogon-header-status.is-success .icogon-header-status-dot { background: #34d399; }
        .icogon-header-status.is-error .icogon-header-status-dot { background: #fb7185; }
        .icogon-header-status.is-warning .icogon-header-status-dot { background: #fbbf24; }
        @keyframes icogon-pulse { 50% { opacity: .35; } }
        .icogon-header-segment {
          display: inline-flex;
          gap: 3px;
          padding: 3px;
          border: 1px solid var(--header-border);
          border-radius: 11px;
          background: color-mix(in srgb, var(--header-bg), black 7%);
        }
        .icogon-builder-header .icogon-header-segment button {
          height: 30px;
          padding: 0 13px;
          border-color: transparent;
          background: transparent;
          border-radius: 8px;
        }
        .icogon-builder-header .icogon-header-segment button[aria-pressed="true"] {
          color: var(--header-text);
          border-color: var(--header-border);
          background: color-mix(in srgb, var(--header-bg), white 10%);
          box-shadow: 0 1px 2px rgb(0 0 0 / .14);
        }
        .icogon-builder-header .icogon-header-primary {
          color: white;
          border-color: #5869dc;
          background: linear-gradient(110deg, #5268e8, #7651df);
        }
        .icogon-builder-header .icogon-header-primary:hover:not(:disabled) {
          color: white;
          border-color: #8794ff;
          background: linear-gradient(110deg, #6077f4, #865fe9);
        }
        .icogon-builder-header .icogon-header-publish {
          color: white;
          border-color: #315de5;
          background: #315de5;
        }
        .icogon-builder-header .icogon-header-publish:hover:not(:disabled) {
          color: white;
          background: #416df2;
        }
        .icogon-header-theme {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 34px;
          padding: 0 8px;
          border: 1px solid var(--header-border);
          border-radius: 9px;
          color: var(--header-muted);
          background: color-mix(in srgb, var(--header-bg) 78%, white 4%);
        }
        .icogon-header-theme select {
          max-width: 76px;
          border: 0;
          outline: 0;
          color: var(--header-text);
          background: transparent;
          font: inherit;
          font-size: 11px;
          cursor: pointer;
        }
        .icogon-header-theme select option { color: #202536; background: #fff; }
        .icogon-header-device { display: flex; gap: 2px; }
        .icogon-builder-header .icogon-header-device button {
          width: 30px; height: 30px; padding: 0; border-color: transparent; background: transparent;
        }
        .icogon-builder-header .icogon-header-device button[aria-pressed="true"] {
          color: #91a4ff; background: color-mix(in srgb, var(--header-bg), #6478e8 20%);
        }
        @media (max-width: 1100px) {
          .icogon-builder-header { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 7px; padding: 0 9px; }
          .icogon-header-project-subtitle { display: none; }
          .icogon-header-project-name { max-width: 130px; }
          .icogon-header-device { display: none; }
        }
        @media (max-width: 760px) {
          .icogon-builder-header { grid-template-columns: minmax(0, 1fr) auto; min-height: 54px; }
          .icogon-header-center { grid-column: 2; grid-row: 1; }
          .icogon-header-right { grid-column: 1 / -1; grid-row: 2; justify-content: flex-end; padding: 0 0 8px; }
          .icogon-header-left { grid-column: 1; grid-row: 1; }
          .icogon-header-brand { gap: 6px; }
          .icogon-header-logo { display: none; }
          .icogon-header-project-name { max-width: 110px; }
          .icogon-builder-header button { height: 32px; }
          .icogon-header-right .icogon-header-secondary-label { display: none; }
          .icogon-header-theme { height: 32px; padding-inline: 6px; }
          .icogon-header-theme select { max-width: 62px; }
        }
        @media (max-width: 420px) {
          .icogon-header-status { display: none; }
          .icogon-builder-header { padding-inline: 7px; }
          .icogon-builder-header .icogon-header-segment button { padding-inline: 9px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .icogon-header-status.is-active .icogon-header-status-dot { animation: none; }
          .icogon-builder-header button { transition: none; }
        }
      `}</style>

      <div className="icogon-header-left">
        {onToggleNavigation && (
          <button
            type="button"
            className="icogon-header-icon"
            onClick={onToggleNavigation}
            aria-label={navigationOpen ? "Collapse navigation" : "Expand navigation"}
            aria-pressed={navigationOpen}
            title={navigationOpen ? "Collapse navigation" : "Expand navigation"}
          >
            <Menu size={16} />
          </button>
        )}
        {onToggleChat && (
          <button
            type="button"
            className="icogon-header-icon"
            onClick={onToggleChat}
            aria-label={chatOpen ? "Hide AI chat" : "Show AI chat"}
            aria-pressed={chatOpen}
            title={chatOpen ? "Hide AI chat" : "Show AI chat"}
          >
            <MessageSquare size={16} />
          </button>
        )}
        <button
          type="button"
          className="icogon-header-icon"
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
          title="Back to dashboard"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="icogon-header-brand">
          <div className="icogon-header-logo">
            <img src="/logo.png" alt="ICOGON" />
          </div>
          <div className="icogon-header-project">
            <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
              <div className="icogon-header-project-name">
                {project?.name || "ICOGON Project"}
              </div>
              <span className={`icogon-header-status ${statusTone(runStage)}`}>
                <span className="icogon-header-status-dot" />
                {statusLabel(runStage)}
              </span>
            </div>
            <div className="icogon-header-project-subtitle">
              ICOGON AI Builder{fileCount > 0 ? ` · ${fileCount} files` : ""}
            </div>
          </div>
        </div>
      </div>

      <nav className="icogon-header-center" aria-label="Workspace views">
        <div className="icogon-header-segment">
          <button
            type="button"
            onClick={openPreview}
            aria-pressed={activeTab === "preview"}
            title="Preview"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={openCode}
            aria-pressed={activeTab === "code"}
            title="View source code"
          >
            <Code2 size={14} />
            <span>Code</span>
            {fileCount > 0 && <span>{fileCount}</span>}
          </button>
        </div>
      </nav>

      <div className="icogon-header-right">
        {activeTab === "preview" && (
          <>
            <div className="icogon-header-device" role="group" aria-label="Preview viewport">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                aria-pressed={deviceMode === "desktop"}
                title="Desktop viewport"
              >
                <Laptop size={15} />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("tablet")}
                aria-pressed={deviceMode === "tablet"}
                title="Tablet viewport"
              >
                <Tablet size={15} />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                aria-pressed={deviceMode === "mobile"}
                title="Mobile viewport"
              >
                <Smartphone size={15} />
              </button>
            </div>
            <button
              type="button"
              className="icogon-header-icon"
              onClick={onRefreshPreview}
              disabled={isRefreshing}
              aria-label="Refresh preview"
              title="Refresh preview"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </>
        )}

        <label className="icogon-header-theme" title="Workspace appearance">
          <span className="sr-only">Workspace appearance</span>
          {theme === "light" ? <Sun size={14} /> : theme === "dark" ? <Moon size={14} /> : <Monitor size={14} />}
          <select
            aria-label="Workspace appearance"
            value={theme}
            onChange={(event) => setTheme(event.target.value as "light" | "dark" | "system")}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>

        <button
          type="button"
          className="icogon-header-icon"
          onClick={() => setIsFullscreen((previous) => !previous)}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-pressed={isFullscreen}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        <button
          type="button"
          onClick={handleShare}
          title="Copy workspace link"
          aria-label="Copy workspace link"
        >
          {shareState === "copied" ? <Check size={14} /> : <Share2 size={14} />}
          <span className="icogon-header-secondary-label">
            {shareState === "copied"
              ? "Copied"
              : shareState === "error"
                ? "Copy failed"
                : "Share"}
          </span>
        </button>

        <button
          type="button"
          className="icogon-header-primary"
          onClick={onTriggerRun}
          disabled={isRunning}
          title={isRunning ? "Build in progress" : "Start build"}
        >
          <Play size={13} />
          <span className="icogon-header-secondary-label">
            {isRunning ? "Building" : "Build"}
          </span>
        </button>

        <button
          type="button"
          className="icogon-header-publish"
          disabled
          title="Publishing will be available when deployment is connected"
          aria-label="Publish (not available yet)"
        >
          <Rocket size={14} />
          <span className="icogon-header-secondary-label">Publish</span>
        </button>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
