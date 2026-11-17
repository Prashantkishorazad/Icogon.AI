import {
  Braces,
  ChevronDown,
  ChevronRight,
  // Code2,
  File,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { WorkspaceFile } from "./BuilderSidebar";

type Props = {
  files: WorkspaceFile[];
  selectedPath: string;
  onSelect: (path: string) => void;
};

type FileKind = "code" | "json" | "text" | "other";

function getFileKind(path: string): FileKind {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "json") return "json";
  if (["md", "mdx", "txt", "yml", "yaml", "toml"].includes(extension)) {
    return "text";
  }
  if (
    [
      "tsx",
      "ts",
      "jsx",
      "js",
      "mjs",
      "cjs",
      "css",
      "scss",
      "html",
      "htm",
      "py",
      "go",
      "rs",
      "java",
      "sql",
      "sh",
      "vue",
      "svelte",
    ].includes(extension)
  ) {
    return "code";
  }

  return "other";
}

function FileIcon({ path }: { path: string }) {
  const kind = getFileKind(path);
  const props = { size: 15, "aria-hidden": true as const };

  if (kind === "json") return <FileJson {...props} />;
  if (kind === "text") return <FileText {...props} />;
  if (kind === "code") return <FileCode2 {...props} />;
  if (path.endsWith(".env") || path.includes(".env.")) {
    return <Braces {...props} />;
  }
  return <File {...props} />;
}

function getFileName(path: string): string {
  return path.split("/").filter(Boolean).at(-1) || path;
}

export default function FileExplorer({
  files,
  selectedPath,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const rows = useMemo(() => {
    return [...files]
      .filter((file) =>
        file.path.toLowerCase().includes(normalizedSearch),
      )
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [files, normalizedSearch]);

  const folders = useMemo(() => {
    if (normalizedSearch) return [];

    const uniqueFolders = new Set<string>();

    files.forEach(({ path }) => {
      const segments = path.split("/").filter(Boolean);
      for (let index = 1; index < segments.length; index += 1) {
        uniqueFolders.add(segments.slice(0, index).join("/"));
      }
    });

    return [...uniqueFolders].sort((a, b) => a.localeCompare(b));
  }, [files, normalizedSearch]);

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();

    folders.forEach((folder) => {
      counts.set(
        folder,
        files.filter((file) => file.path.startsWith(`${folder}/`)).length,
      );
    });

    return counts;
  }, [files, folders]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleFolder = (folder: string) => {
    setExpandedFolders((current) => {
      const next = new Set(current);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  const visibleFolders = folders.filter((folder) => {
    const parent = folder.split("/").slice(0, -1).join("/");
    return !parent || expandedFolders.has(parent);
  });

  const visibleFiles = rows.filter((file) => {
    if (normalizedSearch) return true;

    const segments = file.path.split("/").filter(Boolean);
    if (segments.length < 2) return true;

    for (let index = 1; index < segments.length; index += 1) {
      const parent = segments.slice(0, index).join("/");
      if (!expandedFolders.has(parent)) return false;
    }
    return true;
  });

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col bg-white text-slate-800">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800">
            Project files
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Browse generated source files
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium tabular-nums text-slate-500">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </header>

      <div className="shrink-0 px-3 pt-3 sm:px-4">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 transition focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-100">
          <Search
            size={14}
            className="shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <span className="sr-only">Search project files</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search files and folders"
            className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            type="search"
            autoComplete="off"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              aria-label="Clear file search"
            >
              <X size={12} />
            </button>
          ) : null}
        </label>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-2 py-3 sm:px-3"
        role="tree"
        aria-label="Project file tree"
      >
        {files.length === 0 ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center px-5 py-8 text-center">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-500">
              <Folder size={20} />
            </div>
            <p className="text-xs font-medium text-slate-600">
              No generated files yet
            </p>
            <p className="mt-1 max-w-52 text-[11px] leading-5 text-slate-400">
              Ask ICOGON AI to build your project. Generated source files will
              appear here.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <Search size={20} className="mb-2 text-slate-300" />
            <p className="text-xs font-medium text-slate-600">
              No matching files
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Try another file name or folder.
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-3 rounded-lg px-3 py-1.5 text-[11px] font-medium text-violet-600 transition hover:bg-violet-50"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {!normalizedSearch
              ? visibleFolders.map((folder) => {
                  const depth = folder.split("/").length - 1;
                  const expanded = expandedFolders.has(folder);
                  const isNested = depth > 0;

                  return (
                    <button
                      key={`folder-${folder}`}
                      type="button"
                      role="treeitem"
                      aria-expanded={expanded}
                      onClick={() => toggleFolder(folder)}
                      title={folder}
                      className="flex min-h-8 w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-xs text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      style={{ paddingLeft: 9 + depth * 15 }}
                    >
                      {expanded ? (
                        <ChevronDown
                          size={13}
                          className="shrink-0 text-slate-400"
                        />
                      ) : (
                        <ChevronRight
                          size={13}
                          className="shrink-0 text-slate-400"
                        />
                      )}
                      {expanded ? (
                        <FolderOpen
                          size={14}
                          className="shrink-0 text-amber-500"
                        />
                      ) : (
                        <Folder
                          size={14}
                          className="shrink-0 text-amber-500"
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {folder.split("/").at(-1)}
                      </span>
                      <span className="text-[9px] tabular-nums text-slate-400">
                        {folderCounts.get(folder)}
                      </span>
                      {isNested ? (
                        <span className="sr-only">Nested folder</span>
                      ) : null}
                    </button>
                  );
                })
              : null}

            {visibleFiles.map((file) => {
              const selected = selectedPath === file.path;
              const depth = normalizedSearch
                ? 0
                : Math.max(0, file.path.split("/").length - 1);

              return (
                <button
                  key={file.path}
                  type="button"
                  role="treeitem"
                  aria-selected={selected}
                  onClick={() => onSelect(file.path)}
                  title={file.path}
                  className={`flex min-h-8 w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-xs transition ${
                    selected
                      ? "bg-violet-50 font-medium text-violet-700 ring-1 ring-inset ring-violet-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  style={{ paddingLeft: 9 + depth * 15 }}
                >
                  {!normalizedSearch && depth > 0 ? (
                    <span className="w-5 shrink-0" aria-hidden="true" />
                  ) : null}
                  <FileIcon path={file.path} />
                  <span className="min-w-0 flex-1 truncate">
                    {normalizedSearch ? file.path : getFileName(file.path)}
                  </span>
                  {file.operation ? (
                    <span className="max-w-16 shrink-0 truncate rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400">
                      {file.operation}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[10px] text-slate-400">
        <span>
          {rows.length} of {files.length} {files.length === 1 ? "file" : "files"}
        </span>
        <span className="truncate pl-3">
          {selectedPath ? getFileName(selectedPath) : "No file selected"}
        </span>
      </footer>
    </section>
  );
}
