import {
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  FileCode2,
  Folder,
  ListChecks,
  Terminal,
  X,
  GripHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type GeneratedFile = {
  path: string;
  operation?: string;
  content?: string | null;
};

type DockTab = "files" | "code" | "terminal" | "console";

type Props = {
  open: boolean;
  onToggle: () => void;
  activeTab: DockTab;
  onTabChange: (tab: DockTab) => void;
  height: number;
  onHeightChange: (height: number) => void;
  files: GeneratedFile[];
  selectedFilePath: string;
  onSelectFile: (path: string) => void;
  code: string;
  previewError: string | null;
  previewWarnings: string[];
  runStatus: string;
};

const MIN_HEIGHT = 150;
const MAX_HEIGHT = 480;

const tabs: { id: DockTab; label: string; Icon: typeof Folder }[] = [
  { id: "files", label: "Files", Icon: Folder },
  { id: "code", label: "Code", Icon: Code2 },
  { id: "terminal", label: "Terminal", Icon: Terminal },
  { id: "console", label: "Console", Icon: ListChecks },
];

const humanize = (value: string) =>
  value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Idle";

export default function BuilderDeveloperDock(p: Props) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const files = useMemo(
    () =>
      p.files
        .filter((file) => file.path.trim() && file.operation?.toLowerCase() !== "delete")
        .slice()
        .sort((a, b) => a.path.localeCompare(b.path)),
    [p.files],
  );

  const height = Math.min(
    MAX_HEIGHT,
    Math.max(MIN_HEIGHT, Number.isFinite(p.height) ? p.height : 260),
  );

  useEffect(() => {
    setCopied(false);
    setCopyError(false);
  }, [p.code, p.selectedFilePath]);

  const activateTab = (tab: DockTab) => {
    if (!p.open) p.onToggle();
    p.onTabChange(tab);
  };

  const copyCode = async () => {
    if (!p.code || !navigator.clipboard?.writeText) {
      setCopyError(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(p.code);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  const issueCount = p.previewWarnings.length + (p.previewError ? 1 : 0);

  return (
    <section
      className={`icogon-dev-dock ${p.open ? "is-open" : "is-closed"}`}
      aria-label="Developer workspace"
    >
      <header className="icogon-dev-dock-bar">
        <button
          type="button"
          className="icogon-dev-dock-toggle"
          onClick={p.onToggle}
          aria-expanded={p.open}
          aria-controls="icogon-developer-dock-content"
        >
          {p.open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>Developer workspace</span>
          <span className="icogon-dev-dock-count">
            {files.length} {files.length === 1 ? "file" : "files"}
          </span>
        </button>

        <nav className="icogon-dev-dock-tabs" role="tablist" aria-label="Developer tools">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`icogon-dock-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={p.activeTab === id}
              aria-controls="icogon-developer-dock-panel"
              tabIndex={p.activeTab === id ? 0 : -1}
              className={p.activeTab === id ? "is-active" : ""}
              onClick={() => activateTab(id)}
            >
              <Icon size={13} aria-hidden="true" />
              <span>{label}</span>
              {id === "console" && issueCount > 0 ? (
                <span className="icogon-dev-dock-count">{issueCount}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="icogon-dev-dock-close"
          onClick={p.onToggle}
          aria-label={p.open ? "Collapse developer workspace" : "Expand developer workspace"}
          title={p.open ? "Collapse panel" : "Expand panel"}
        >
          <X size={14} />
        </button>
      </header>

      {p.open ? (
        <>
          <div className="icogon-dev-dock-resize">
            <GripHorizontal size={13} aria-hidden="true" />
            <label htmlFor="icogon-dock-height">Panel height</label>
            <input
              id="icogon-dock-height"
              type="range"
              min={MIN_HEIGHT}
              max={MAX_HEIGHT}
              step={10}
              value={height}
              onChange={(event) => p.onHeightChange(Number(event.currentTarget.value))}
              aria-valuetext={`${height} pixels`}
            />
            <span>{height}px</span>
          </div>

          <div
            id="icogon-developer-dock-content"
            className="icogon-dev-dock-content"
            style={{ height }}
          >
            <div
              id="icogon-developer-dock-panel"
              role="tabpanel"
              aria-labelledby={`icogon-dock-tab-${p.activeTab}`}
              className="h-full min-h-0"
            >
              {p.activeTab === "files" ? (
                <div className="icogon-dev-file-list" role="list">
                  {files.length ? files.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      role="listitem"
                      className={p.selectedFilePath === file.path ? "is-selected" : ""}
                      onClick={() => p.onSelectFile(file.path)}
                      title={file.path}
                      aria-current={p.selectedFilePath === file.path ? "true" : undefined}
                    >
                      <FileCode2 size={14} aria-hidden="true" />
                      <span>{file.path}</span>
                      <small>{file.operation || "file"}</small>
                    </button>
                  )) : (
                    <div className="icogon-dev-empty">
                      <Folder size={22} />
                      <strong>No project files yet</strong>
                      <span>Generated files will appear here after ICOGON creates your application.</span>
                    </div>
                  )}
                </div>
              ) : null}

              {p.activeTab === "code" ? (
                <div className="icogon-dev-code">
                  <div className="icogon-dev-code-header">
                    <span title={p.selectedFilePath || undefined}>
                      <FileCode2 size={13} />
                      {p.selectedFilePath || "No file selected"}
                    </span>
                    <button type="button" disabled={!p.code} onClick={() => void copyCode()}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  {p.code ? (
                    <pre><code>{p.code}</code></pre>
                  ) : (
                    <div className="icogon-dev-empty">
                      <Code2 size={22} />
                      <strong>No source selected</strong>
                      <span>Select a file to inspect its generated source.</span>
                    </div>
                  )}
                  {copyError ? (
                    <p className="icogon-dev-copy-error" role="status">
                      Clipboard access failed. Check browser permissions.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {p.activeTab === "terminal" ? (
                <div className="icogon-dev-terminal">
                  <div className="icogon-dev-terminal-header">
                    <Terminal size={13} />
                    <span>Project terminal</span>
                    <small>Runtime not connected</small>
                  </div>
                  <div className="icogon-dev-terminal-body">
                    <p>icogon / project workspace</p>
                    <p className="muted">
                      Command execution is not connected to an isolated project runtime yet.
                    </p>
                  </div>
                </div>
              ) : null}

              {p.activeTab === "console" ? (
                <div className="icogon-dev-console">
                  <div className="icogon-dev-console-summary">
                    <span>Run status: <b>{humanize(p.runStatus)}</b></span>
                    <span>{issueCount} {issueCount === 1 ? "message" : "messages"}</span>
                  </div>
                  {p.previewError ? (
                    <p className="error"><strong>Error</strong><span> · </span>{p.previewError}</p>
                  ) : null}
                  {p.previewWarnings.map((warning, index) => (
                    <p className="warning" key={`${index}-${warning}`}>
                      <strong>Warning</strong><span> · </span>{warning}
                    </p>
                  ))}
                  {!issueCount ? (
                    <div className="icogon-dev-empty">
                      <ListChecks size={22} />
                      <strong>No preview issues reported</strong>
                      <span>Preview errors and warnings will appear here when available.</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
