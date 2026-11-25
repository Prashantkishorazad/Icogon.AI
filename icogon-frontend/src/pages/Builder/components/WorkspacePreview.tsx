import React, { useState, useMemo, useRef, useEffect } from "react";

import {

  ExternalLink,

  Laptop,

  Lock,

  Monitor,

  Moon,

  RefreshCw,

  Smartphone,

  Sun,

  Tablet,

  Terminal,

  Zap,

} from "lucide-react";

import type { DeviceMode, GeneratedFile, PreviewState, ProjectResponse } from "../types";



interface WorkspacePreviewProps {

  project: ProjectResponse | null;

  previewState: PreviewState;

  deviceMode: DeviceMode;

  setDeviceMode: (mode: DeviceMode) => void;

  isRefreshing: boolean;

  onRefreshPreview: () => void;

  isRunning: boolean;

  onQuickPrompt: (prompt: string) => void;

  files?: GeneratedFile[];

}



// Keep generated documents in an opaque-origin iframe, including detached previews.
const CSP_POLICY = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https: data: blob:; style-src 'unsafe-inline' https: data:; font-src https: data:; img-src data: blob: https:; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'">`;

const SANDBOX_PERMISSIONS = "allow-scripts allow-forms allow-modals";
const EMPTY_FILES: GeneratedFile[] = [];
type ThemeMode = "dark" | "light" | "system";

/** A policy must precede any generated executable content. A second policy
 * can only restrict the first; never trust a policy supplied by generated HTML.
 * The leading doctype keeps standards mode, even for fragment previews.
 */
const applyPreviewPolicy = (html: string): string => {
  const source = html.replace(/^\uFEFF?\s*<!doctype[^>]*>/i, "");
  return `<!doctype html>\n${CSP_POLICY}\n${source}`;
};

const nonEmptyHtml = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const previewData = (state: PreviewState): Record<string, unknown> =>
  typeof state.data === "object" && state.data !== null
    ? state.data as Record<string, unknown>
    : {};

const getPreviewError = (state: PreviewState): string | undefined => {
  const error = state.error || previewData(state).error;
  return typeof error === "string" && error.trim()
    ? error
    : error instanceof Error ? error.message : undefined;
};

// Only inline explicitly referenced local assets for static HTML projects.
// React/TypeScript and module graphs must use the real backend compiler.
const localAssetPath = (value: string): string | undefined => {
  const path = value.trim();
  if (!path || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return undefined;
  const parts: string[] = [];
  for (const segment of path.split(/[?#]/, 1)[0].split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (!parts.length) return undefined;
      parts.pop();
    } else parts.push(segment);
  }
  return parts.join("/") || undefined;
};

const readAttribute = (tag: string, name: string): string | undefined => {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return match ? match[1] ?? match[2] ?? match[3] : undefined;
};

const getStaticPreview = (files: GeneratedFile[]): { html?: string; error?: string } => {
  const assets = new Map(files.filter(file => file.operation !== "delete" && typeof file.content === "string")
    .map(file => [localAssetPath(file.path), file.content as string]));
  const entry = nonEmptyHtml(assets.get("index.html"));
  if (!entry) return {};
  let unresolved = false;
  const html = entry.replace(/<link\b[^>]*>|<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, tag => {
    if (/^<link\b/i.test(tag)) {
      if (readAttribute(tag, "rel")?.toLowerCase() !== "stylesheet") return tag;
      const href = readAttribute(tag, "href");
      const path = href && localAssetPath(href);
      if (!path) return tag;
      const css = assets.get(path);
      if (css === undefined) { unresolved = true; return tag; }
      // Local media qualifiers and relative CSS dependencies need a compiler.
      if (readAttribute(tag, "media") || /@import\b|url\(\s*["']?(?!["']|data:|https?:|#)/i.test(css)) {
        unresolved = true; return tag;
      }
      return `<style>\n${css.replace(/<\/style/gi, "<\\/style")}\n</style>`;
    }
    const source = readAttribute(tag.split(">")[0], "src");
    const type = readAttribute(tag.split(">")[0], "type")?.toLowerCase();
    if (type === "module") { unresolved = true; return tag; }
    if (!source) return tag;
    const path = localAssetPath(source);
    if (!path) return tag;
    const js = assets.get(path);
    if (js === undefined || !/\.js$/i.test(path) || /\b(?:import|export)\s|import\s*\(/.test(js)) {
      unresolved = true; return tag;
    }
    return `<script>\n${js.replace(/<\/script/gi, "<\\/script")}\n</script>`;
  });
  return unresolved
    ? { error: "This project needs the backend compiler to resolve its source files. Retry the generated preview." }
    : { html };
};

// The compiler already bundles dependencies; never append source JS/CSS to
// compiled HTML, since doing so can execute scripts twice or corrupt a build.
const resolvePreview = (state: PreviewState, files: GeneratedFile[]) => {
  const html = nonEmptyHtml(state.html) || nonEmptyHtml(previewData(state).html);
  const error = getPreviewError(state);
  if (html) return { html, error, staticFallback: false };
  if (error) return { html: undefined, error, staticFallback: false };
  const fallback = getStaticPreview(files);
  return { ...fallback, staticFallback: Boolean(fallback.html) };
};

const escapeAttribute = (value: string): string => value
  .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
  .replace(/</g, "&lt;").replace(/>/g, "&gt;");

const createDetachedPreview = (srcDoc: string): string =>
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICOGON Sandbox Preview</title><style>html,body{margin:0;width:100%;height:100%;background:#090a0f}iframe{display:block;width:100%;height:100%;border:0}</style></head><body><iframe title="Generated application" sandbox="${SANDBOX_PERMISSIONS}" referrerpolicy="no-referrer" srcdoc="${escapeAttribute(srcDoc)}"></iframe></body></html>`;


export const WorkspacePreview: React.FC<WorkspacePreviewProps> = ({

  project,

  previewState,

  deviceMode,

  setDeviceMode,

  isRefreshing,

  onRefreshPreview,

  isRunning,

  onQuickPrompt,

  files = EMPTY_FILES,

}) => {

  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");

  const iframeRef = useRef<HTMLIFrameElement | null>(null);



  const getContainerWidth = () => {

    switch (deviceMode) {

      case "mobile":

        return "w-full max-w-[375px]";

      case "tablet":

        return "w-full max-w-[768px]";

      default:

        return "w-full";

    }

  };



  // Derive from the controller's restored build rather than creating a second
  // persistence cache. A stable srcDoc does not reload for unrelated UI updates.
  const { html: htmlContent, error: previewError, staticFallback } = useMemo(
    () => resolvePreview(previewState, files),
    [previewState, files],
  );
  const sandboxHtml = useMemo(() => htmlContent ? applyPreviewPolicy(htmlContent) : undefined, [htmlContent]);
  const rawWarnings = previewState.warnings ?? previewData(previewState).warnings;
  const warnings = Array.isArray(rawWarnings)
    ? rawWarnings.filter((warning): warning is string => typeof warning === "string")
    : [];

  // Explicit retry reloads the current iframe. Ordinary renders and device
  // changes leave its document untouched. Server refresh may replace srcDoc.
  const [reloadRevision, setReloadRevision] = useState(0);
  const [frameLoadedSource, setFrameLoadedSource] = useState<string | undefined>();
  const [externalError, setExternalError] = useState("");
  const frameLoaded = sandboxHtml !== undefined && frameLoadedSource === `${reloadRevision}:${sandboxHtml}`;

  const handleRefresh = () => {
    if (isRefreshing || isRunning) return;
    setExternalError("");
    setReloadRevision(value => value + 1);
    onRefreshPreview();
  };

  // Sync theme with iframe content (generated apps may opt into this message).
  const sendTheme = (mode: ThemeMode) => {
    // A sandbox without allow-same-origin has an opaque origin. Only a theme
    // preference is sent; never pass credentials or project data here.
    iframeRef.current?.contentWindow?.postMessage({ type: "SET_THEME", theme: mode }, "*");
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  useEffect(() => {
    sendTheme(themeMode);
  }, [themeMode, sandboxHtml, reloadRevision]);

  const handleOpenNewWindow = () => {
    if (!sandboxHtml) return;
    setExternalError("");
    let url: string | undefined;
    try {
      // Do NOT navigate directly to a blob containing generated scripts:
      // it inherits the application origin and loses iframe isolation.
      const blob = new Blob([createDetachedPreview(sandboxHtml)], { type: "text/html" });
      url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
      const openedUrl = url;
      // Allow the new document to load before releasing the temporary URL.
      window.setTimeout(() => URL.revokeObjectURL(openedUrl), 60_000);
    } catch {
      if (url) URL.revokeObjectURL(url);
      setExternalError("Unable to open the detached preview. Try again or check your browser settings.");
    }
  };


  return (

    <div className="flex h-full w-full flex-col bg-[#090a0f] text-slate-200 overflow-hidden">

      {/* BROWSER CHROME TOOLBAR */}

      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#1b1e2a] bg-[#0f1118] px-3">

        {/* Window controls & simulated address bar */}

        <div className="flex items-center gap-2.5 min-w-0 flex-1 max-w-xl">

          <div className="flex items-center gap-1.5 shrink-0">

            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />

            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />

          </div>



          <div className="flex h-6 flex-1 items-center gap-1.5 rounded-md border border-[#212535] bg-[#0a0b10] px-2.5 text-[11px] text-slate-400">

            <Lock size={10} className="text-emerald-400" aria-label="Isolated sandbox" />

            <span className="truncate font-mono text-[10px] text-slate-400">

              Sandbox / {project?.id?.slice(0, 8) || "local"}

            </span>

          </div>

        </div>



        {/* Viewport Toggles, Theme Mode and Quick Actions */}

        <div className="flex items-center gap-1.5">

          {/* Device viewport toggle */}

          <div className="flex items-center rounded-md border border-[#212535] bg-[#0a0b10] p-0.5">

            <button

              type="button"

              onClick={() => setDeviceMode("desktop")}
              aria-pressed={deviceMode === "desktop"}

              title="Desktop"

              className={`p-1 rounded transition ${

                deviceMode === "desktop" ? "bg-[#1f2334] text-indigo-300" : "text-slate-400 hover:text-white"

              }`}

            >

              <Laptop size={12} />

            </button>

            <button

              type="button"

              onClick={() => setDeviceMode("tablet")}
              aria-pressed={deviceMode === "tablet"}

              title="Tablet (768px)"

              className={`p-1 rounded transition ${

                deviceMode === "tablet" ? "bg-[#1f2334] text-indigo-300" : "text-slate-400 hover:text-white"

              }`}

            >

              <Tablet size={12} />

            </button>

            <button

              type="button"

              onClick={() => setDeviceMode("mobile")}
              aria-pressed={deviceMode === "mobile"}

              title="Mobile (375px)"

              className={`p-1 rounded transition ${

                deviceMode === "mobile" ? "bg-[#1f2334] text-indigo-300" : "text-slate-400 hover:text-white"

              }`}

            >

              <Smartphone size={12} />

            </button>

          </div>



          {/* Theme switcher toggle */}

          <div className="flex items-center rounded-md border border-[#212535] bg-[#0a0b10] p-0.5" title="Preview Theme Mode">

            <button

              type="button"

              onClick={() => handleThemeChange("dark")}
              aria-pressed={themeMode === "dark"}

              title="Dark Mode"

              className={`p-1 rounded transition ${

                themeMode === "dark" ? "bg-[#1f2334] text-indigo-300" : "text-slate-400 hover:text-white"

              }`}

            >

              <Moon size={12} />

            </button>

            <button

              type="button"

              onClick={() => handleThemeChange("light")}
              aria-pressed={themeMode === "light"}

              title="Light Mode"

              className={`p-1 rounded transition ${

                themeMode === "light" ? "bg-[#1f2334] text-amber-300" : "text-slate-400 hover:text-white"

              }`}

            >

              <Sun size={12} />

            </button>

            <button

              type="button"

              onClick={() => handleThemeChange("system")}
              aria-pressed={themeMode === "system"}

              title="System Theme"

              className={`p-1 rounded transition ${

                themeMode === "system" ? "bg-[#1f2334] text-cyan-300" : "text-slate-400 hover:text-white"

              }`}

            >

              <Monitor size={12} />

            </button>

          </div>



          <button

            type="button"

            onClick={handleRefresh}

            disabled={isRefreshing || isRunning}

            title="Refresh Sandbox"
            aria-label="Refresh sandbox"

            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-[#1b1f2d] hover:text-white transition disabled:opacity-40"

          >

            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-indigo-400" : ""} />

          </button>



          {htmlContent && (

            <button

              type="button"

              onClick={handleOpenNewWindow}

              title="Open in new window"
              aria-label="Open isolated preview in new window"

              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-[#1b1f2d] hover:text-white transition"

            >

              <ExternalLink size={12} />

            </button>

          )}

        </div>

      </div>



      {/* Retained preview stays visible during generation or refresh. */}
      {htmlContent && (isRunning || isRefreshing || staticFallback || previewError || !frameLoaded) && (
        <div role="status" className="shrink-0 border-b border-[#1b1e2a] bg-[#12141e] px-3 py-1.5 text-[11px] text-slate-300">
          {previewError
            ? `Preview warning: ${previewError}`
            : isRunning ? "Generating changes · showing the current preview"
            : isRefreshing ? "Refreshing · showing the current preview"
            : staticFallback ? "Static HTML preview · not a verified build"
            : "Loading preview document…"}
        </div>
      )}
      {externalError && <p role="alert" className="px-3 py-1.5 text-xs text-rose-300">{externalError}</p>}

      {/* COMPILER WARNINGS (if any) */}

      {warnings && warnings.length > 0 && (

        <div className="border-b border-amber-900/40 bg-amber-950/20 px-3 py-1.5 text-[11px] text-amber-300">

          <p className="font-semibold">Compiler Warnings ({warnings.length}):</p>

          <ul className="list-disc pl-4 text-[10px] space-y-0.5">

            {warnings.map((w, i) => (

              <li key={i}>{w}</li>

            ))}

          </ul>

        </div>

      )}



      {/* VIEWPORT CANVAS */}

      <div className="relative flex-1 overflow-auto bg-[#07080c] p-2 flex items-center justify-center">

        {/* Subtle grid pattern background */}

        <div className="absolute inset-0 bg-[radial-gradient(#1a1d29_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />



        {htmlContent ? (

          <div

            className={`h-full ${getContainerWidth()} mx-auto transition-all duration-300 flex flex-col rounded-lg overflow-hidden border border-[#212435] ${

              themeMode === "light" ? "bg-white" : "bg-[#07080d]"

            } shadow-2xl`}

          >

            <iframe

              ref={iframeRef}

              title="ICOGON Generated App Preview"

              key={`${project?.id ?? "sandbox"}:${reloadRevision}`}
              srcDoc={sandboxHtml}
              onLoad={() => {
                setFrameLoadedSource(`${reloadRevision}:${sandboxHtml}`);
                sendTheme(themeMode);
              }}
              referrerPolicy="no-referrer"

              sandbox={SANDBOX_PERMISSIONS}

              className={`h-full w-full border-none ${

                themeMode === "light" ? "bg-white" : "bg-[#07080d]"

              }`}

            />

          </div>

        ) : (

          /* Preview state and actionable build feedback */

          <div className="relative z-10 max-w-lg w-full rounded-2xl border border-[#1f2231] bg-[#0e1017]/90 p-8 shadow-2xl backdrop-blur-md text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#232738] bg-[#121420] p-2 shadow-xl shadow-indigo-500/10">

              <img src="/logo.png" alt="ICOGON" className="h-10 w-10 object-contain drop-shadow" />

            </div>



            <h2 className="mt-5 text-base font-semibold text-white tracking-tight">

              {previewError ? "Preview failed to load" : project?.name || "Developer Workspace"}

            </h2>



            <p className={`mt-2 text-xs leading-relaxed ${previewError ? "text-rose-300" : "text-slate-400"}`} role={previewError ? "alert" : undefined}>

              {previewError

                ? previewError

                : isRunning

                  ? "ICOGON AI is generating your application. The interactive preview will appear here when the build is ready."

                  : project?.description ||

                    "Describe the app, dashboard, or website you want to build in the AI Assistant on the left."}

            </p>

            {previewError && (

              <button

                type="button"

                onClick={handleRefresh}

                disabled={isRefreshing || isRunning}

                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-500/15 disabled:opacity-50"

              >

                <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />

                Retry preview

              </button>

            )}



            <div className="mt-6 grid grid-cols-2 gap-2 text-left text-[11px]">

              <div className="rounded-lg border border-[#1f2231] bg-[#141622] p-3">

                <div className="flex items-center gap-1.5 font-medium text-slate-200">

                  <Zap size={12} className="text-indigo-400" />

                  <span>Instant Sandboxing</span>

                </div>

                <p className="mt-1 text-[10px] text-slate-400 leading-normal">

                  Compiled React and TypeScript previews, with static HTML fallback.

                </p>

              </div>



              <div className="rounded-lg border border-[#1f2231] bg-[#141622] p-3">

                <div className="flex items-center gap-1.5 font-medium text-slate-200">

                  <Terminal size={12} className="text-violet-400" />

                  <span>Multi-Agent Stack</span>

                </div>

                <p className="mt-1 text-[10px] text-slate-400 leading-normal">

                  Architect, Planner, Coder, and Verifier agents in tandem.

                </p>

              </div>

            </div>



            {!isRunning && (

              <div className="mt-6 border-t border-[#1d202e] pt-4">

                <p className="text-[10px] font-medium text-slate-400 mb-2">Try a starter prompt:</p>

                <div className="flex flex-wrap justify-center gap-1.5">

                  {[

                    "Create modern SaaS dashboard",

                    "Build an AI landing page with pricing",

                    "Add task manager with categories",

                  ].map((starter) => (

                    <button

                      key={starter}

                      type="button"

                      onClick={() => onQuickPrompt(starter)}

                      className="rounded-lg border border-[#232738] bg-[#141622] px-2.5 py-1 text-[10px] text-indigo-300 hover:border-indigo-500/50 hover:bg-[#1a1d2e] transition"

                    >

                      {starter}

                    </button>

                  ))}

                </div>

              </div>

            )}

          </div>

        )}

      </div>

    </div>

  );

};

export default WorkspacePreview;