
import {
  Check,
  Clipboard,
  Code2,
  FileCode2,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Props = {
  path: string;
  code: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onSave?: () => void;
  saving?: boolean;
};

function detectLanguage(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase();

  const languages: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript React",
    js: "JavaScript",
    jsx: "JavaScript React",
    css: "CSS",
    scss: "SCSS",
    html: "HTML",
    json: "JSON",
    md: "Markdown",
    py: "Python",
    sql: "SQL",
    yaml: "YAML",
    yml: "YAML",
    xml: "XML",
    svg: "SVG",
    sh: "Shell",
    env: "Environment",
  };

  return languages[extension || ""] || "Plain text";
}

export default function CodeEditor({
  path,
  code,
  readOnly = true,
  onChange,
  onSave,
  saving = false,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const language = useMemo(() => detectLanguage(path), [path]);

  const lineCount = useMemo(
    () => Math.max(1, code.split("\n").length),
    [code],
  );

  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount],
  );

  const handleCopy = useCallback(async () => {
    if (!code || !navigator.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [code]);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 1600);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!saveFeedback) return;

    const timeout = window.setTimeout(() => setSaveFeedback(""), 2200);

    return () => window.clearTimeout(timeout);
  }, [saveFeedback]);

  const handleSave = useCallback(() => {
    if (!onSave || saving || readOnly) return;

    onSave();
    setSaveFeedback("Save requested");
  }, [onSave, saving, readOnly]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const isSaveShortcut =
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "s";

    if (isSaveShortcut) {
      event.preventDefault();
      handleSave();
      return;
    }

    // Preserve indentation when pressing Enter.
    if (event.key === "Enter" && !readOnly) {
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentLine = code.slice(0, start).split("\n").pop() || "";
      const indentation = currentLine.match(/^\s*/)?.[0] || "";

      if (indentation) {
        event.preventDefault();

        const nextValue =
          code.slice(0, start) +
          "\n" +
          indentation +
          code.slice(end);

        onChange?.(nextValue);

        requestAnimationFrame(() => {
          textarea.selectionStart = start + indentation.length + 1;
          textarea.selectionEnd = start + indentation.length + 1;
        });
      }
    }
  };

  if (!path) {
    return (
      <section className="flex h-full min-h-0 flex-col bg-white">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 px-4">
          <Code2 size={15} className="text-violet-500" />
          <span className="text-xs font-semibold text-slate-700">
            Code editor
          </span>
        </header>

        <div className="grid flex-1 place-items-center px-6 text-center">
          <div>
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-slate-400">
              <FileCode2 size={22} />
            </div>

            <h3 className="text-sm font-semibold text-slate-700">
              No file selected
            </h3>

            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
              Select a project file to inspect or edit its source code.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#fbfcfe] text-slate-800">
      {/* Editor toolbar */}
      <header className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-2">
          <FileCode2
            size={14}
            className="shrink-0 text-violet-500"
          />

          <span
            className="min-w-0 truncate text-xs font-medium text-slate-700"
            title={path}
          >
            {path}
          </span>

          <span className="hidden shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[9px] text-slate-500 sm:inline-flex">
            {language}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1 text-[10px] text-slate-400 md:inline-flex">
            {readOnly ? (
              <>
                <ShieldCheck size={11} />
                Read only
              </>
            ) : (
              "Editable"
            )}
          </span>

          <button
            type="button"
            onClick={() => void handleCopy()}
            disabled={!code}
            title="Copy source code"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? (
              <Check size={12} className="text-emerald-600" />
            ) : (
              <Clipboard size={12} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>

          {!readOnly && onSave && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              title="Save changes (Ctrl/Cmd + S)"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={12} />
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </header>

      {/* Source editor */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className="hidden shrink-0 select-none overflow-hidden border-r border-slate-100 bg-[#f7f8fa] px-3 pt-5 text-right font-mono text-[11px] leading-6 text-slate-400 sm:block"
          aria-hidden="true"
        >
          {lineNumbers.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>

        <textarea
          ref={editorRef}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          readOnly={readOnly}
          value={code}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={`Source code editor for ${path}`}
          className="min-h-0 min-w-0 flex-1 resize-none overflow-auto bg-[#fbfcfe] p-5 font-mono text-[12px] leading-6 text-slate-700 outline-none selection:bg-violet-100 read-only:cursor-text"
        />
      </div>

      {/* Editor status bar */}
      <footer className="flex min-h-8 shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 text-[10px] text-slate-400">
        <div className="flex min-w-0 items-center gap-3">
          <span>{language}</span>
          <span>{lineCount} lines</span>
          <span>{code.length} characters</span>
        </div>

        <span
          className={
            saveFeedback
              ? "shrink-0 text-emerald-600"
              : "shrink-0"
          }
          role="status"
          aria-live="polite"
        >
          {saveFeedback || (readOnly ? "Read only" : "Ready")}
        </span>
      </footer>
    </section>
  );
}
