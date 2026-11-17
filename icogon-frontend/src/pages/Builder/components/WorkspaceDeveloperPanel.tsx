import { useMemo, useState, type ReactNode } from "react";
import {
  Code2,
  FileText,
  MoreHorizontal,
  Terminal,
  X,
} from "lucide-react";

export type DeveloperTab = "files" | "code" | "terminal" | "console";

export interface WorkspaceDeveloperPanelProps {
  files?: ReactNode;
  code?: ReactNode;
  terminal?: ReactNode;
  console?: ReactNode;
  defaultTab?: DeveloperTab;
  onClose?: () => void;
  onTabChange?: (tab: DeveloperTab) => void;
}

type TabDefinition = {
  id: DeveloperTab;
  label: string;
  icon: typeof FileText;
};

const TABS: TabDefinition[] = [
  { id: "files", label: "Files", icon: FileText },
  { id: "code", label: "Code", icon: Code2 },
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "console", label: "Console", icon: MoreHorizontal },
];

const PANEL_STYLE = `
.workspace-developer-panel {
  --dev-border: var(--border, rgba(148, 163, 184, .2));
  --dev-muted: var(--muted-foreground, #8b93a5);
  --dev-surface: var(--card, var(--background, #fff));
  --dev-text: var(--foreground, #202533);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--dev-text);
  background: var(--dev-surface);
  border-top: 1px solid var(--dev-border);
  font: inherit;
}
.workspace-developer-panel * { box-sizing: border-box; }
.workspace-developer-panel__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 43px;
  padding: 0 12px;
  border-bottom: 1px solid var(--dev-border);
}
.workspace-developer-panel__tabs {
  display: flex;
  align-items: stretch;
  align-self: stretch;
  gap: 3px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.workspace-developer-panel__tabs::-webkit-scrollbar { display: none; }
.workspace-developer-panel__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex: 0 0 auto;
  padding: 0 11px;
  border: 0;
  border-radius: 0;
  color: var(--dev-muted);
  background: transparent;
  font: inherit;
  font-size: 12px;
  font-weight: 550;
  cursor: pointer;
  transition: color .15s ease, background .15s ease;
}
.workspace-developer-panel__tab:hover:not(:disabled) {
  color: var(--dev-text);
  background: color-mix(in srgb, var(--dev-text) 5%, transparent);
}
.workspace-developer-panel__tab[aria-selected="true"] {
  color: var(--dev-text);
}
.workspace-developer-panel__tab[aria-selected="true"]::after {
  position: absolute;
  right: 9px;
  bottom: -1px;
  left: 9px;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--primary, #7867f5);
  content: "";
}
.workspace-developer-panel__tab:disabled {
  opacity: .38;
  cursor: not-allowed;
}
.workspace-developer-panel__tab:focus-visible,
.workspace-developer-panel__close:focus-visible {
  outline: 2px solid var(--ring, #7867f5);
  outline-offset: -2px;
}
.workspace-developer-panel__tab-icon {
  width: 14px;
  height: 14px;
}
.workspace-developer-panel__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 7px;
  color: var(--dev-muted);
  background: transparent;
  cursor: pointer;
}
.workspace-developer-panel__close:hover {
  color: var(--dev-text);
  background: color-mix(in srgb, var(--dev-text) 7%, transparent);
}
.workspace-developer-panel__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--dev-surface);
}
.workspace-developer-panel__empty {
  display: grid;
  min-height: 100%;
  place-content: center;
  justify-items: center;
  gap: 8px;
  padding: 24px;
  color: var(--dev-muted);
  text-align: center;
}
.workspace-developer-panel__empty-icon {
  width: 25px;
  height: 25px;
  opacity: .65;
}
.workspace-developer-panel__empty-title {
  color: var(--dev-text);
  font-size: 12px;
  font-weight: 600;
}
.workspace-developer-panel__empty-copy {
  max-width: 270px;
  font-size: 11px;
  line-height: 1.55;
}
@media (max-width: 560px) {
  .workspace-developer-panel__top { padding: 0 7px; }
  .workspace-developer-panel__tab { gap: 5px; padding: 0 8px; }
  .workspace-developer-panel__tab-label { display: none; }
}
`;

export default function WorkspaceDeveloperPanel({
  files,
  code,
  terminal,
  console: consoleContent,
  defaultTab = "files",
  onClose,
  onTabChange,
}: WorkspaceDeveloperPanelProps) {
  const [tabState, setTabState] = useState({ defaultTab, activeTab: defaultTab });
  if (tabState.defaultTab !== defaultTab) {
    setTabState({ defaultTab, activeTab: defaultTab });
  }
  const activeTab = tabState.activeTab;

  const contentByTab = useMemo<Record<DeveloperTab, ReactNode | undefined>>(
    () => ({
      files,
      code,
      terminal,
      console: consoleContent,
    }),
    [files, code, terminal, consoleContent],
  );

  const selectTab = (tab: DeveloperTab) => {
    setTabState((current) => ({ ...current, activeTab: tab }));
    onTabChange?.(tab);
  };

  const activeContent = contentByTab[activeTab];

  return (
    <section className="workspace-developer-panel" aria-label="Developer panel">
      <style>{PANEL_STYLE}</style>

      <div className="workspace-developer-panel__top">
        <div className="workspace-developer-panel__tabs" role="tablist" aria-label="Developer tools">
          {TABS.map(({ id, label, icon: Icon }) => {
            const disabled = id !== "files" && id !== "code" && contentByTab[id] == null;

            return (
              <button
                key={id}
                id={`developer-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                aria-controls="developer-panel-content"
                tabIndex={activeTab === id ? 0 : -1}
                disabled={disabled}
                className="workspace-developer-panel__tab"
                onClick={() => selectTab(id)}
                title={label}
              >
                <Icon className="workspace-developer-panel__tab-icon" aria-hidden="true" />
                <span className="workspace-developer-panel__tab-label">{label}</span>
              </button>
            );
          })}
        </div>

        {onClose && (
          <button
            type="button"
            className="workspace-developer-panel__close"
            onClick={onClose}
            aria-label="Close developer panel"
            title="Close panel"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      <div
        id="developer-panel-content"
        className="workspace-developer-panel__body"
        role="tabpanel"
        aria-labelledby={`developer-tab-${activeTab}`}
        tabIndex={0}
      >
        {activeContent != null ? (
          activeContent
        ) : activeTab === "code" ? (
          <div className="workspace-developer-panel__empty">
            <Code2 className="workspace-developer-panel__empty-icon" aria-hidden="true" />
            <div className="workspace-developer-panel__empty-title">Code editor is in the main workspace</div>
            <div className="workspace-developer-panel__empty-copy">
              Choose a file from the Files tab to open it in the central code editor.
            </div>
          </div>
        ) : activeTab === "files" ? (
          <div className="workspace-developer-panel__empty">
            <FileText className="workspace-developer-panel__empty-icon" aria-hidden="true" />
            <div className="workspace-developer-panel__empty-title">No project files yet</div>
            <div className="workspace-developer-panel__empty-copy">
              Files will appear here when they are available in this workspace.
            </div>
          </div>
        ) : (
          <div className="workspace-developer-panel__empty">
            <Terminal className="workspace-developer-panel__empty-icon" aria-hidden="true" />
            <div className="workspace-developer-panel__empty-title">
              {activeTab === "terminal" ? "Terminal is not connected" : "Console is not connected"}
            </div>
            <div className="workspace-developer-panel__empty-copy">
              This tool will be available when its workspace integration is connected.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
