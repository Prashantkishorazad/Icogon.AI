
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Terminal,
  Wifi,
  WifiOff,
} from "lucide-react";

type Props = {
  projectName?: string;
  connected?: boolean;
  message?: string;
  runtimeName?: string;
  runtimeStatus?: "idle" | "starting" | "ready" | "stopped" | "error";
  lastActivity?: string;
};

const runtimeStatusCopy = {
  idle: "Waiting for runtime",
  starting: "Starting runtime",
  ready: "Runtime ready",
  stopped: "Runtime stopped",
  error: "Runtime error",
} as const;

export default function TerminalPanel({
  projectName = "project",
  connected = false,
  message,
  runtimeName = "Isolated workspace",
  runtimeStatus,
  lastActivity,
}: Props) {
  const safeProjectName =
    projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-") ||
    "project";

  const effectiveStatus =
    runtimeStatus ?? (connected ? "ready" : "idle");

  const isConnected =
    connected && effectiveStatus === "ready";

  const isStarting = effectiveStatus === "starting";

  const hasError = effectiveStatus === "error";

  return (
    <section
      className="flex h-full min-h-240px flex-col overflow-hidden rounded-xl border border-[#252b35] bg-[#101318] font-mono text-xs text-slate-200"
      aria-label="Project terminal"
    >
      {/* Terminal toolbar */}
      <header className="flex min-h-11 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Terminal
            size={14}
            className="shrink-0 text-slate-300"
          />

          <span className="font-semibold text-slate-200">
            Terminal
          </span>

          <span className="hidden truncate text-[10px] text-slate-500 sm:inline">
            {runtimeName}
          </span>
        </div>

        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] ${
            isConnected
              ? "bg-emerald-400/10 text-emerald-300"
              : hasError
                ? "bg-red-400/10 text-red-300"
                : "bg-amber-400/10 text-amber-200"
          }`}
          role="status"
          aria-live="polite"
        >
          {isConnected ? (
            <Wifi size={11} />
          ) : hasError ? (
            <AlertCircle size={11} />
          ) : isStarting ? (
            <Clock3 size={11} className="animate-pulse" />
          ) : (
            <WifiOff size={11} />
          )}

          {runtimeStatusCopy[effectiveStatus]}
        </div>
      </header>

      {/* Terminal output */}
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-slate-400">
            <span className="text-emerald-300">
              icogon@{safeProjectName}
            </span>
            <span>:</span>
            <span className="text-sky-300">~</span>
            <span>$</span>
          </div>

          {message ? (
            <pre className="whitespace-pre-wrap wrap-words font-mono leading-6 text-slate-300">
              {message}
            </pre>
          ) : (
            <p className="leading-6 text-slate-500">
              {isConnected
                ? "Runtime connected. Command execution must be provided by the configured backend."
                : isStarting
                  ? "The isolated runtime is starting. Please wait..."
                  : hasError
                    ? "The runtime encountered an error. Check the runtime service logs."
                    : "Terminal execution is not enabled for this workspace yet."}
            </p>
          )}

          {!isConnected && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-white/10 bg-white/0.03 p-3 text-slate-400">
              <LockKeyhole
                size={14}
                className="mt-0.5 shrink-0 text-amber-300"
              />

              <div>
                <p className="font-semibold text-slate-300">
                  Command execution unavailable
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Commands remain disabled until ICOGON connects this
                  project to a secure, isolated runtime.
                </p>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="flex items-center gap-2 text-[11px] text-emerald-300">
              <CheckCircle2 size={13} />
              Runtime connection established
            </div>
          )}
        </div>
      </div>

      {/* Status footer */}
      <footer className="flex min-h-8 shrink-0 items-center justify-between gap-3 border-t border-white/10 px-4 text-[10px] text-slate-500">
        <span>
          {isConnected ? "Connected" : "Read-only"}
        </span>

        <span className="truncate">
          {lastActivity
            ? `Last activity: ${lastActivity}`
            : "No terminal activity"}
        </span>
      </footer>
    </section>
  );
}
