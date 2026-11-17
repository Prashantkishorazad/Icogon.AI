import { useMemo, type ReactNode } from "react";
import {
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
  LayoutDashboard,
  PanelLeftClose,
  Settings2,
} from "lucide-react";
import type { GeneratedFile } from "../types";

export interface WorkspaceNavigationProps {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  files?: GeneratedFile[];
  generatedFiles?: GeneratedFile[];
  selectedFilePath?: string;
  activeFilePath?: string;
  onSelectFile?: (file: GeneratedFile) => void;
  onFileSelect?: (file: GeneratedFile) => void;
  projectName?: string;
  project?: { name?: string; title?: string } | null;
  header?: ReactNode;
  footer?: ReactNode;
  [key: string]: unknown;
}

const NAV_STYLE = `
.workspace-navigation {
  --nav-border: var(--border, rgba(148, 163, 184, .2));
  --nav-muted: var(--muted-foreground, #8992a5);
  --nav-text: var(--foreground, #202533);
  --nav-hover: color-mix(in srgb, var(--nav-text) 6%, transparent);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--nav-text);
  background: var(--card, var(--background, #fff));
  font: inherit;
}
.workspace-navigation * { box-sizing: border-box; }
.workspace-navigation__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  gap: 8px;
  padding: 0 13px;
  border-bottom: 1px solid var(--nav-border);
}
.workspace-navigation__brand {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: -.01em;
}
.workspace-navigation__brand-mark {
  display: grid;
  width: 27px;
  height: 27px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  color: var(--primary, #7867f5);
  background: color-mix(in srgb, var(--primary, #7867f5) 9%, transparent);
}
.workspace-navigation__project {
  overflow: hidden;
  color: var(--nav-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workspace-navigation__icon-button {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 7px;
  color: var(--nav-muted);
  background: transparent;
  cursor: pointer;
}
.workspace-navigation__icon-button:hover { color: var(--nav-text); background: var(--nav-hover); }
.workspace-navigation__icon-button:focus-visible,
.workspace-navigation__file:focus-visible,
.workspace-navigation__action:focus-visible {
  outline: 2px solid var(--ring, #7867f5);
  outline-offset: 2px;
}
.workspace-navigation__section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 17px 12px 8px;
  color: var(--nav-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .075em;
  text-transform: uppercase;
}
.workspace-navigation__section-actions { display: flex; gap: 2px; }
.workspace-navigation__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 7px 12px;
}
.workspace-navigation__file-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.workspace-navigation__file {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border: 0;
  border-radius: 7px;
  color: var(--nav-muted);
  background: transparent;
  font: inherit;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}
.workspace-navigation__file:hover { color: var(--nav-text); background: var(--nav-hover); }
.workspace-navigation__file[aria-current="page"] {
  color: var(--nav-text);
  background: color-mix(in srgb, var(--primary, #7867f5) 11%, transparent);
}
.workspace-navigation__file-icon { flex: 0 0 auto; opacity: .8; }
.workspace-navigation__file-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workspace-navigation__empty {
  padding: 12px 10px;
  color: var(--nav-muted);
  font-size: 11px;
  line-height: 1.55;
}
.workspace-navigation__footer {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 7px;
  border-top: 1px solid var(--nav-border);
}
.workspace-navigation__action {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: 7px;
  color: var(--nav-muted);
  background: transparent;
  font: inherit;
  font-size: 11px;
  text-align: left;
}
.workspace-navigation__action:hover { color: var(--nav-text); background: var(--nav-hover); }
@media (max-width: 560px) {
  .workspace-navigation__header { padding: 0 9px; }
}
`;

function getFileName(path: string) {
  return path.split("/").filter(Boolean).at(-1) || path;
}

export default function WorkspaceNavigation({
  open,
  isOpen,
  onClose,
  onToggle,
  files,
  generatedFiles,
  selectedFilePath,
  activeFilePath,
  onSelectFile,
  onFileSelect,
  projectName,
  project,
  header,
  footer,
}: WorkspaceNavigationProps) {
  const fileList = useMemo(
    () => files ?? generatedFiles ?? [],
    [files, generatedFiles],
  );
  const selectedPath = selectedFilePath ?? activeFilePath ?? "";
  const title = projectName ?? project?.name ?? project?.title ?? "Workspace";
  const selectFile = onSelectFile ?? onFileSelect;
  const isVisible = open ?? isOpen ?? true;

  if (!isVisible) return null;

  return (
    <aside className="workspace-navigation" aria-label="Workspace navigation">
      <style>{NAV_STYLE}</style>

      <div className="workspace-navigation__header">
        {header ?? (
          <div className="workspace-navigation__brand">
            <span className="workspace-navigation__brand-mark">
              <LayoutDashboard size={14} aria-hidden="true" />
            </span>
            <span className="workspace-navigation__project" title={title}>{title}</span>
          </div>
        )}
        {(onClose || onToggle) && (
          <button
            type="button"
            className="workspace-navigation__icon-button"
            onClick={onClose ?? onToggle}
            aria-label="Close navigation"
            title="Close navigation"
          >
            <PanelLeftClose size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="workspace-navigation__section">
        <span>Project files</span>
        <span className="workspace-navigation__section-actions">
          <span title={`${fileList.length} files`} style={{ fontWeight: 500, letterSpacing: 0 }}>
            {fileList.length}
          </span>
          <Folder size={13} aria-hidden="true" />
        </span>
      </div>

      <div className="workspace-navigation__body">
        {fileList.length > 0 ? (
          <div className="workspace-navigation__file-list">
            {fileList.map((file) => {
              const isSelected = file.path === selectedPath;
              return (
                <button
                  key={file.path}
                  type="button"
                  className="workspace-navigation__file"
                  aria-current={isSelected ? "page" : undefined}
                  title={file.path}
                  onClick={() => selectFile?.(file)}
                >
                  {isSelected ? (
                    <FolderOpen className="workspace-navigation__file-icon" size={14} aria-hidden="true" />
                  ) : (
                    <FileCode2 className="workspace-navigation__file-icon" size={14} aria-hidden="true" />
                  )}
                  <span className="workspace-navigation__file-name">{getFileName(file.path)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="workspace-navigation__empty">
            Your generated project files will appear here. Start by describing what you want to build.
          </div>
        )}
      </div>

      <div className="workspace-navigation__footer">
        {footer ?? (
          <div className="workspace-navigation__action" aria-label="Workspace settings">
            <Settings2 size={14} aria-hidden="true" />
            <span>Workspace settings</span>
            <span style={{ marginLeft: "auto", opacity: .55 }}>
              <ChevronRight size={13} aria-hidden="true" />
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
