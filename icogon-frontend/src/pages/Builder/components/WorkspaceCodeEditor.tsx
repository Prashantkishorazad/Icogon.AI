import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {

  Check,

  Copy,

  Download,

  FileCode2,

  FileJson,

  FileText,

  FileType,

  Folder,

  Search,

} from "lucide-react";

import type { GeneratedFile } from "../types";

import { getFileContent } from "../types";



// The editor is a read-only view of the parent-owned workspace snapshot.
// The last operation for a path wins. Deleted files are not downloadable.
const getVisibleWorkspaceFiles = (files: GeneratedFile[]): GeneratedFile[] => {
  const byPath = new Map<string, GeneratedFile>();
  for (const file of files) {
    if (!file || typeof file.path !== "string" || !file.path.trim()) continue;
    if (file.operation?.toLowerCase() === "delete") byPath.delete(file.path);
    else byPath.set(file.path, file);
  }
  return Array.from(byPath.values());
};

const getLanguage = (path: string): string => {
  const extension = path.split(".").pop()?.toLowerCase();
  const languages: Record<string, string> = {
    tsx: "TypeScript React", ts: "TypeScript", jsx: "JavaScript React",
    js: "JavaScript", mjs: "JavaScript", cjs: "JavaScript", css: "CSS",
    scss: "SCSS", html: "HTML", htm: "HTML", json: "JSON", md: "Markdown",
    py: "Python", sql: "SQL", svg: "SVG", yaml: "YAML", yml: "YAML",
  };
  return extension && Object.hasOwn(languages, extension) ? languages[extension] : "Plain text";
};

type CopyFeedback = { path: string; code: string; success: boolean; message: string };
type ScrollPosition = { top: number; left: number };

interface WorkspaceCodeEditorProps {

  files: GeneratedFile[];

  selectedFilePath: string;

  onSelectFile: (path: string) => void;

}



export const WorkspaceCodeEditor: React.FC<WorkspaceCodeEditorProps> = ({

  files,

  selectedFilePath,

  onSelectFile,

}) => {

  const [search, setSearch] = useState("");

  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const copyRequestRef = useRef(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionsRef = useRef(new Map<string, ScrollPosition>());

  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  useEffect(() => {

    return () => {
      copyRequestRef.current += 1;

      if (copiedTimeoutRef.current) {

        clearTimeout(copiedTimeoutRef.current);

      }

    };

  }, []);



  // The parent owns the file state. Never fabricate files in this component.
  const visibleFiles = useMemo(() => getVisibleWorkspaceFiles(files), [files]);

  const filteredFiles = useMemo(() => {

    const query = search.trim().toLowerCase();

    if (!query) return visibleFiles;

    return visibleFiles.filter((file) => file.path.toLowerCase().includes(query));

  }, [visibleFiles, search]);



  const activeFile = useMemo(

    () =>

      visibleFiles.find((file) => file.path === selectedFilePath) ??

      visibleFiles[0] ??

      null,

    [visibleFiles, selectedFilePath],

  );



  const activePath = activeFile?.path ?? "";
  const hasContent = typeof activeFile?.content === "string";
  const code = activeFile ? getFileContent(activeFile) : "";
  const codeLines = useMemo(() => hasContent ? code.split(/\r\n|\n|\r/) : [], [code, hasContent]);
  const codeBytes = useMemo(() => new TextEncoder().encode(code).length, [code]);
  const currentFeedback = copyFeedback?.path === activePath && copyFeedback.code === code ? copyFeedback : null;
  const copied = currentFeedback?.success === true;

  // Reconcile the restored selection if the chosen file was removed by a run.
  useEffect(() => {
    if (activePath && activePath !== selectedFilePath) onSelectFile(activePath);
  }, [activePath, selectedFilePath, onSelectFile]);

  // Scroll positions are UI-only and scoped to the mounted workspace.
  // Durable file selection and generated content remain owned by the parent.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !activePath) return;
    const saved = scrollPositionsRef.current.get(activePath);
    viewport.scrollTop = saved?.top ?? 0;
    viewport.scrollLeft = saved?.left ?? 0;
  }, [activePath, hasContent]);

  const rememberScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!activePath) return;
    const positions = scrollPositionsRef.current;
    positions.delete(activePath);
    positions.set(activePath, { top: event.currentTarget.scrollTop, left: event.currentTarget.scrollLeft });
    if (positions.size > 100) {
      const first = positions.keys().next().value;
      if (first !== undefined) positions.delete(first);
    }
  };

  const handleCopy = async () => {
    if (!activeFile || !hasContent) return;
    const request = ++copyRequestRef.current;
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard is unavailable. Select the code and copy it manually.");
      }
      await navigator.clipboard.writeText(code);
      if (request !== copyRequestRef.current) return;
      setCopyFeedback({ path: activePath, code, success: true, message: "File copied." });
      copiedTimeoutRef.current = setTimeout(() => {
        if (request === copyRequestRef.current) setCopyFeedback(null);
      }, 1800);
    } catch (error) {
      if (request !== copyRequestRef.current) return;
      console.error("Unable to copy file contents:", error);
      setCopyFeedback({ path: activePath, code, success: false, message: "Could not copy. Select the code and copy it manually." });
    }
  };

  const handleDownload = () => {

    if (!activeFile || !hasContent) return;



    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;

    anchor.download = activeFile.path.split(/[\\/]/).pop() || "generated-file.txt";

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

  };



  const getFileIcon = (path: string) => {

    if (/\.(tsx|jsx)$/i.test(path)) {

      return <FileCode2 size={13} className="shrink-0 text-indigo-400" />;

    }

    if (/\.(ts|js)$/i.test(path)) {

      return <FileType size={13} className="shrink-0 text-cyan-400" />;

    }

    if (/\.json$/i.test(path)) {

      return <FileJson size={13} className="shrink-0 text-amber-400" />;

    }

    if (/\.css$/i.test(path)) {

      return <FileType size={13} className="shrink-0 text-sky-400" />;

    }

    return <FileText size={13} className="shrink-0 text-slate-400" />;

  };



  return (

    <div className="flex h-full min-h-0 w-full overflow-hidden bg-[#0d0f17] text-slate-200">

      {/* File explorer */}

      <aside className="flex w-64 min-w-0 shrink-0 flex-col border-r border-[#1e2230] bg-[#0c0e15] max-sm:w-44">

        <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#1e2230] px-3">

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">

            <Folder size={13} className="text-indigo-400" />

            <span>Files</span>

          </div>

          <span className="rounded border border-[#232738] bg-[#181a26] px-1.5 py-0.5 text-[10px] font-mono text-slate-400">

            {visibleFiles.length}

          </span>

        </div>



        <div className="shrink-0 border-b border-[#1e2230] p-2">

          <label className="flex items-center gap-1.5 rounded-md border border-[#232738] bg-[#141622] px-2 py-1.5">

            <Search size={11} className="shrink-0 text-slate-400" />

            <input

              type="search"

              value={search}

              onChange={(event) => setSearch(event.target.value)}

              placeholder="Filter files..."

              aria-label="Filter generated files"

              className="w-full min-w-0 bg-transparent text-[11px] text-slate-200 outline-none placeholder:text-slate-500"

            />

          </label>

        </div>



        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">

          {filteredFiles.length > 0 ? (

            filteredFiles.map((file) => {

              const isActive = file.path === activeFile?.path;

              return (

                <button

                  type="button"

                  key={file.path}

                  onClick={() => onSelectFile(file.path)}

                  aria-current={isActive ? "true" : undefined}

                  title={file.path}

                  className={`flex w-full min-w-0 items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition ${

                    isActive

                      ? "border-[#2f354c] bg-[#1f2334] font-medium text-white shadow-sm"

                      : "border-transparent text-slate-400 hover:bg-[#151722] hover:text-slate-200"

                  }`}

                >

                  {getFileIcon(file.path)}

                  <span className="min-w-0 flex-1 truncate font-mono text-[11px]">

                    {file.path}

                  </span>

                  {file.operation && (

                    <span className="shrink-0 text-[9px] font-mono uppercase text-emerald-400 opacity-80">

                      {file.operation === "upsert" ? "+" : file.operation}

                    </span>

                  )}

                </button>

              );

            })

          ) : (

            <p className="px-2 py-5 text-center text-[11px] text-slate-500">

              {visibleFiles.length === 0

                ? "Generated files will appear here after a build."

                : "No files match your search."}

            </p>

          )}

        </div>

      </aside>



      {/* Editor viewport */}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#090b10]">

        {activeFile ? (

          <>

            <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-[#1e2230] bg-[#0c0e15] px-3">

              <div className="flex min-w-0 items-center gap-2">

                <div className="flex min-w-0 items-center gap-1.5 rounded-t-md border-x border-t border-[#232738] bg-[#090b10] px-2 py-1.5 text-xs text-white sm:px-3">

                  {getFileIcon(activeFile.path)}

                  <span className="truncate font-mono text-[11px] font-medium text-slate-200">

                    {activeFile.path}

                  </span>

                </div>

                <span className="hidden shrink-0 text-[10px] text-slate-500 md:inline">

                  {getLanguage(activeFile.path)} · {codeLines.length} lines · {(codeBytes / 1024).toFixed(1)} KB

                </span>

              </div>



              <div className="flex shrink-0 items-center gap-1">

                <button

                  type="button"

                  onClick={handleCopy}
                  disabled={!hasContent}
                  aria-label="Copy file contents"

                  title="Copy file contents"

                  className="flex h-7 items-center gap-1 rounded-md border border-[#232738] bg-[#141622] px-2 text-[11px] text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"

                >

                  {copied ? (

                    <Check size={11} className="text-emerald-400" />

                  ) : (

                    <Copy size={11} />

                  )}

                  <span>{copied ? "Copied" : "Copy"}</span>

                </button>

                <button

                  type="button"

                  onClick={handleDownload}
                  disabled={!hasContent}

                  title="Download file"

                  aria-label="Download current file"

                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#232738] bg-[#141622] text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"

                >

                  <Download size={11} />

                </button>

              </div>

            </div>



            {currentFeedback && (
              <p role={currentFeedback.success ? "status" : "alert"} className="px-3 py-1 text-[11px] text-slate-400">
                {currentFeedback.message}
              </p>
            )}
            {!hasContent ? (
              <div role="status" className="flex flex-1 items-center justify-center p-6 text-center text-xs text-slate-400">
                File contents are not available in this workspace snapshot. Restore the source from the generation run before copying or downloading.
              </div>
            ) : (
            <div ref={viewportRef} onScroll={rememberScroll} tabIndex={0} aria-label="Read-only source code" className="flex min-h-0 flex-1 overflow-auto py-4 font-mono text-xs leading-5">

              <div aria-hidden="true" className="shrink-0 select-none border-r border-[#1a1d29] px-3 text-right text-slate-600">

                {codeLines.map((_, index) => (

                  <div key={index} className="h-5">

                    {index + 1}

                  </div>

                ))}

              </div>

              <pre className="min-w-max flex-1 px-4 text-slate-200">

                <code>

                  {codeLines.map((line, index) => (

                    <div

                      key={index}

                      className="min-h-5 whitespace-pre rounded px-1 hover:bg-[#141624]/60"

                    >

                      {line || " "}

                    </div>

                  ))}

                </code>

              </pre>

            </div>
            )}

          </>

        ) : (

          <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-center">

            <div className="max-w-sm">

              <Folder size={28} className="mx-auto text-slate-600" />

              <h2 className="mt-3 text-sm font-medium text-slate-300">

                No generated files yet

              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">

                Files returned by the builder will appear here. This editor

                won't display placeholder code as if it were generated output.

              </p>

            </div>

          </div>

        )}

      </section>

    </div>

  );

};
