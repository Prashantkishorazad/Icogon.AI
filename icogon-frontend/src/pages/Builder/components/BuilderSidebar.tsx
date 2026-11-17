import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
  Search,
  X,
  FileText,
  FileJson,
  FileImage,
  File,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WorkspaceFile = {
  path: string;
  operation?: string;
  content?: string | null;
};

type Props = {
  files: WorkspaceFile[];
  selectedPath: string;
  onSelect: (path: string) => void;
  projectName?: string;
  collapsed?: boolean;
  onToggle?: () => void;
};

type TreeNode = {
  name: string;
  path: string;
  isDirectory: boolean;
  file?: WorkspaceFile;
  children: Map<string, TreeNode>;
};

const normalizePath = (path: string) =>
  path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");

function createTree(files: WorkspaceFile[]): TreeNode {
  const root: TreeNode = {
    name: "",
    path: "",
    isDirectory: true,
    children: new Map(),
  };

  for (const file of files) {
    const path = normalizePath(file.path);
    if (!path || file.operation?.toLowerCase() === "delete") continue;

    const segments = path.split("/").filter(Boolean);
    let current = root;
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isFile = index === segments.length - 1;
      let node = current.children.get(segment);

      if (!node) {
        node = {
          name: segment,
          path: currentPath,
          isDirectory: !isFile,
          file: isFile ? file : undefined,
          children: new Map(),
        };
        current.children.set(segment, node);
      } else if (isFile) {
        node.isDirectory = false;
        node.file = file;
      }

      current = node;
    });
  }

  return root;
}

function sortTree(node: TreeNode): TreeNode[] {
  return Array.from(node.children.values()).sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function collectMatchingPaths(
  node: TreeNode,
  query: string,
  result: Set<string>,
): boolean {
  let found = false;

  for (const child of node.children.values()) {
    const ownMatch = child.name.toLowerCase().includes(query);
    const descendantMatch = child.isDirectory
      ? collectMatchingPaths(child, query, result)
      : false;

    if (ownMatch || descendantMatch) {
      result.add(child.path);
      found = true;
    }
  }

  return found;
}

function getAncestorPaths(path: string): string[] {
  const segments = normalizePath(path).split("/").filter(Boolean);
  return segments.slice(0, -1).map((_, index) =>
    segments.slice(0, index + 1).join("/"),
  );
}

function FileIcon({ name, selected }: { name: string; selected: boolean }) {
  const extension = name.split(".").pop()?.toLowerCase();
  const className = selected
    ? "text-violet-500 dark:text-violet-300"
    : "text-[var(--builder-muted)]";

  if (["json", "jsonc"].includes(extension || "")) {
    return <FileJson size={14} className={className} />;
  }
  if (["png", "jpg", "jpeg", "svg", "webp", "gif"].includes(extension || "")) {
    return <FileImage size={14} className={className} />;
  }
  if (["md", "txt", "mdx"].includes(extension || "")) {
    return <FileText size={14} className={className} />;
  }
  if (["ts", "tsx", "js", "jsx", "css", "html", "py"].includes(extension || "")) {
    return <FileCode2 size={14} className={className} />;
  }
  return <File size={14} className={className} />;
}

export default function BuilderSidebar({
  files,
  selectedPath,
  onSelect,
  projectName = "Project",
  collapsed = false,
  onToggle,
}: Props) {
  const [query, setQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(),
  );

  const visibleFiles = useMemo(
    () => files.filter((file) => file.path.trim() && file.operation?.toLowerCase() !== "delete"),
    [files],
  );
  const tree = useMemo(() => createTree(visibleFiles), [visibleFiles]);
  const normalizedQuery = query.trim().toLowerCase();
  const selectedAncestors = useMemo(
    () => new Set(getAncestorPaths(selectedPath)),
    [selectedPath],
  );
  const effectiveExpandedFolders = useMemo(
    () => new Set([...expandedFolders, ...selectedAncestors]),
    [expandedFolders, selectedAncestors],
  );

  const matchingPaths = useMemo(() => {
    const result = new Set<string>();
    if (normalizedQuery) collectMatchingPaths(tree, normalizedQuery, result);
    return result;
  }, [tree, normalizedQuery]);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((previous) => {
      const next = new Set(previous);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const renderTree = (node: TreeNode, depth = 0): ReactNode[] =>
    sortTree(node).flatMap((child) => {
      const isExpanded =
        normalizedQuery.length > 0 || effectiveExpandedFolders.has(child.path);
      const isVisible =
        !normalizedQuery ||
        matchingPaths.has(child.path) ||
        child.name.toLowerCase().includes(normalizedQuery);

      if (!isVisible) return [];

      const isSelected =
        !child.isDirectory &&
        normalizePath(selectedPath) === normalizePath(child.path);

      const row = (
        <button
          key={child.path}
          type="button"
          onClick={() =>
            child.isDirectory ? toggleFolder(child.path) : onSelect(child.path)
          }
          title={child.path}
          aria-expanded={child.isDirectory ? isExpanded : undefined}
          aria-current={isSelected ? "page" : undefined}
          className={`group flex min-h-8 w-full min-w-0 items-center gap-2 rounded-md py-1.5 pr-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
            isSelected
              ? "bg-[var(--builder-active)] font-medium text-[var(--builder-active-text)]"
              : "text-[var(--builder-text)] hover:bg-[var(--builder-hover)]"
          }`}
          style={{ paddingLeft: 9 + depth * 14 }}
        >
          {child.isDirectory ? (
            <>
              {isExpanded ? (
                <ChevronDown size={12} className="shrink-0 opacity-60" />
              ) : (
                <ChevronRight size={12} className="shrink-0 opacity-60" />
              )}
              {isExpanded ? (
                <FolderOpen size={14} className="shrink-0 text-amber-500" />
              ) : (
                <Folder size={14} className="shrink-0 text-amber-500" />
              )}
            </>
          ) : (
            <>
              <span className="w-3 shrink-0" />
              <FileIcon name={child.name} selected={isSelected} />
            </>
          )}

          <span className="min-w-0 flex-1 truncate">{child.name}</span>
          {!child.isDirectory && child.file?.operation === "upsert" ? (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
              title="Generated or updated"
              aria-label="Generated or updated"
            />
          ) : null}
        </button>
      );

      return child.isDirectory && isExpanded
        ? [row, ...renderTree(child, depth + 1)]
        : [row];
    });

  if (collapsed) {
    return (
      <aside className="flex h-full w-12 shrink-0 flex-col items-center border-r border-[var(--builder-border)] bg-[var(--builder-panel)] py-3 text-[var(--builder-muted)]">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Expand file explorer"
          title="Expand file explorer"
          className="rounded-lg p-2 transition hover:bg-[var(--builder-hover)] hover:text-[var(--builder-text)]"
        >
          <ChevronRight size={16} />
        </button>
        <Folder size={17} className="mt-4" />
        <span className="mt-2 text-[9px] tabular-nums">{visibleFiles.length}</span>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-full min-w-0 max-w-full flex-col border-r border-[var(--builder-border)] bg-[var(--builder-panel)] text-[var(--builder-text)] sm:w-[260px] sm:min-w-[220px] sm:shrink-0">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--builder-border)] px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Folder size={15} className="shrink-0 text-amber-500" />
          <span className="truncate text-xs font-semibold">{projectName}</span>
          <span className="rounded-md bg-[var(--builder-hover)] px-1.5 py-0.5 text-[10px] tabular-nums text-[var(--builder-muted)]">
            {visibleFiles.length}
          </span>
        </div>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse file explorer"
            title="Collapse file explorer"
            className="rounded-lg p-1.5 text-[var(--builder-muted)] transition hover:bg-[var(--builder-hover)] hover:text-[var(--builder-text)]"
          >
            <ChevronDown size={15} />
          </button>
        ) : null}
      </div>

      <div className="shrink-0 px-3 py-3">
        <label className="flex items-center gap-2 rounded-lg border border-[var(--builder-border)] bg-[var(--builder-surface)] px-2.5 py-2 transition focus-within:border-violet-500">
          <Search size={14} className="shrink-0 text-[var(--builder-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search files..."
            aria-label="Search project files"
            className="min-w-0 flex-1 bg-transparent text-xs text-[var(--builder-text)] outline-none placeholder:text-[var(--builder-muted)]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear file search"
              className="rounded p-0.5 text-[var(--builder-muted)] hover:text-[var(--builder-text)]"
            >
              <X size={12} />
            </button>
          ) : null}
        </label>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 pb-3">
        <div className="flex h-7 items-center justify-between px-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--builder-muted)]">
            Explorer
          </span>
          <span className="text-[10px] text-[var(--builder-muted)]">
            {visibleFiles.length} files
          </span>
        </div>

        {visibleFiles.length ? (
          <div className="flex min-w-0 flex-col gap-0.5">
            {renderTree(tree)}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-[var(--builder-border)] bg-[var(--builder-surface)] text-[var(--builder-muted)]">
              <Folder size={18} />
            </div>
            <p className="text-xs font-medium text-[var(--builder-text)]">
              No files yet
            </p>
            <p className="mt-1 max-w-[190px] text-[11px] leading-5 text-[var(--builder-muted)]">
              Generated project files will appear here when ICOGON creates your application.
            </p>
          </div>
        )}

        {normalizedQuery && visibleFiles.length > 0 && matchingPaths.size === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-[var(--builder-muted)]">
            No files match “{query}”.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
