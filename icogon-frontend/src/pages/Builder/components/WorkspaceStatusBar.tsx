import React from "react";
import { Activity, FileCode2 } from "lucide-react";
import type { OrchestratorRun, RunStage } from "../types";
import { stageLabel } from "../types";

interface WorkspaceStatusBarProps {
  runStage: RunStage;
  isRunning: boolean;
  activeRun: OrchestratorRun | null;
  fileCount: number;
  eventCount: number;
}

const STATUS_STYLE = `
.workspace-status-bar {
  --status-border: var(--border, rgba(148, 163, 184, .2));
  --status-muted: var(--muted-foreground, #8992a5);
  --status-text: var(--foreground, #202533);
  display: flex;
  min-height: 29px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border-top: 1px solid var(--status-border);
  color: var(--status-muted);
  background: var(--card, var(--background, #fff));
  font: inherit;
  font-size: 10px;
  user-select: none;
}
.workspace-status-bar__left,
.workspace-status-bar__right {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
}
.workspace-status-bar__left { overflow: hidden; }
.workspace-status-bar__state {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  color: var(--status-text);
  font-weight: 600;
}
.workspace-status-bar__dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #9299a8;
}
.workspace-status-bar__dot[data-state="running"] {
  background: #22c7a5;
  box-shadow: 0 0 0 3px color-mix(in srgb, #22c7a5 14%, transparent);
  animation: workspace-status-pulse 1.6s ease-in-out infinite;
}
.workspace-status-bar__dot[data-state="completed"] { background: #22a879; }
.workspace-status-bar__dot[data-state="failed"] { background: #e05c67; }
.workspace-status-bar__dot[data-state="cancelled"] { background: #d69a39; }
.workspace-status-bar__run-id {
  overflow: hidden;
  max-width: 150px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.workspace-status-bar__divider {
  width: 1px;
  height: 12px;
  flex: 0 0 auto;
  background: var(--status-border);
}
.workspace-status-bar__metric {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.workspace-status-bar__metric svg { opacity: .75; }
.workspace-status-bar__engine {
  overflow: hidden;
  max-width: 210px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  opacity: .8;
}
@keyframes workspace-status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .48; }
}
@media (max-width: 640px) {
  .workspace-status-bar { padding: 0 8px; }
  .workspace-status-bar__right { gap: 8px; }
  .workspace-status-bar__engine,
  .workspace-status-bar__run-id,
  .workspace-status-bar__events { display: none; }
}
`;

export const WorkspaceStatusBar: React.FC<WorkspaceStatusBarProps> = ({
  runStage,
  isRunning,
  activeRun,
  fileCount,
  eventCount,
}) => {
  const state =
    runStage === "completed"
      ? "completed"
      : runStage === "failed"
        ? "failed"
        : runStage === "cancelled"
          ? "cancelled"
          : isRunning
            ? "running"
            : "idle";



  return (
    <footer className="workspace-status-bar" aria-label="Workspace status">
      <style>{STATUS_STYLE}</style>

      <div className="workspace-status-bar__left">
        <span className="workspace-status-bar__state">
          <span className="workspace-status-bar__dot" data-state={state} aria-hidden="true" />
          <span>{stageLabel(runStage)}</span>
        </span>

        {activeRun?.id && (
          <>
            <span className="workspace-status-bar__divider" aria-hidden="true" />
            <span className="workspace-status-bar__run-id" title={`Run ID: ${activeRun.id}`}>
              Run {activeRun.id.slice(0, 8)}
            </span>
          </>
        )}
      </div>

      <div className="workspace-status-bar__right">
        {fileCount > 0 && (
          <span className="workspace-status-bar__metric" title={`${fileCount} generated files`}>
            <FileCode2 size={12} aria-hidden="true" />
            {fileCount} {fileCount === 1 ? "file" : "files"}
          </span>
        )}
        {eventCount > 0 && (
          <span className="workspace-status-bar__metric workspace-status-bar__events" title={`${eventCount} run events`}>
            <Activity size={12} aria-hidden="true" />
            {eventCount} {eventCount === 1 ? "event" : "events"}
          </span>
        )}
        <span className="workspace-status-bar__divider" aria-hidden="true" />
        <span className="workspace-status-bar__engine">ICOGON Engine · React 19 + Vite</span>
      </div>
    </footer>
  );
};

export default WorkspaceStatusBar;
