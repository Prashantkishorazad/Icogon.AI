
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Info,
  ListFilter,
  Terminal,
  TriangleAlert,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type ConsoleEvent = {
  id?: string | number;
  message?: string;
  type?: string;
  timestamp?: string | number;
};

type Props = {
  runStatus: string;
  error?: string | null;
  warnings?: string[];
  events?: ConsoleEvent[];
};

type LogLevel = "error" | "warning" | "info" | "success";

type ConsoleMessage = {
  id: string;
  level: LogLevel;
  message: string;
  timestamp?: string | number;
};

const normalizeLevel = (type?: string): LogLevel => {
  switch (type?.toLowerCase()) {
    case "error":
    case "failed":
      return "error";

    case "warning":
    case "warn":
      return "warning";

    case "success":
    case "completed":
      return "success";

    default:
      return "info";
  }
};

const formatTimestamp = (value?: string | number) => {
  if (value === undefined || value === null) return null;

  const date =
    typeof value === "number"
      ? new Date(value < 1e12 ? value * 1000 : value)
      : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const levelConfig: Record<
  LogLevel,
  {
    label: string;
    color: string;
    Icon: typeof AlertCircle;
  }
> = {
  error: {
    label: "ERROR",
    color: "text-red-300",
    Icon: AlertCircle,
  },
  warning: {
    label: "WARN",
    color: "text-amber-200",
    Icon: TriangleAlert,
  },
  info: {
    label: "INFO",
    color: "text-slate-300",
    Icon: Info,
  },
  success: {
    label: "SUCCESS",
    color: "text-emerald-300",
    Icon: CheckCircle2,
  },
};

export default function ConsolePanel({
  runStatus,
  error,
  warnings = [],
  events = [],
}: Props) {
  const [filter, setFilter] = useState<"all" | LogLevel>("all");
  const [search, setSearch] = useState("");
  const [showTimestamps, setShowTimestamps] = useState(true);

  const messages = useMemo<ConsoleMessage[]>(() => {
    const result: ConsoleMessage[] = [];

    if (error) {
      result.push({
        id: "preview-error",
        level: "error",
        message: error,
      });
    }

    warnings.forEach((warning, index) => {
      result.push({
        id: `warning-${index}`,
        level: "warning",
        message: warning,
      });
    });

    events.forEach((event, index) => {
      result.push({
        id: String(event.id ?? `event-${index}`),
        level: normalizeLevel(event.type),
        message: event.message || "Run event",
        timestamp: event.timestamp,
      });
    });

    return result;
  }, [error, warnings, events]);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesLevel =
        filter === "all" || message.level === filter;

      const matchesSearch =
        !query || message.message.toLowerCase().includes(query);

      return matchesLevel && matchesSearch;
    });
  }, [messages, filter, search]);

  const counts = useMemo(
    () => ({
      error: messages.filter((message) => message.level === "error").length,
      warning: messages.filter((message) => message.level === "warning").length,
      info: messages.filter((message) => message.level === "info").length,
      success: messages.filter((message) => message.level === "success").length,
    }),
    [messages],
  );

  const filters: Array<"all" | LogLevel> = [
    "all",
    "error",
    "warning",
    "info",
    "success",
  ];

  return (
    <section
      className="flex h-full min-h-0 flex-col bg-[#101318] text-slate-200"
      aria-label="Developer console"
    >
      {/* Header */}
      <header className="flex min-h-11 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-slate-400" />

          <span className="text-xs font-semibold">Console</span>

          <span className="rounded-md bg-white/0.06 px-1.5 py-0.5 text-[9px] text-slate-400">
            {messages.length}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="hidden sm:inline">Run status:</span>
          <span className="rounded-md bg-white/0.06 px-2 py-1 text-slate-300">
            {runStatus}
          </span>
        </div>
      </header>

      {/* Message summary */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-white/10 px-4 py-2">
        <span className="flex items-center gap-1.5 text-[10px] text-red-300">
          <AlertCircle size={11} />
          {counts.error} errors
        </span>

        <span className="flex items-center gap-1.5 text-[10px] text-amber-200">
          <TriangleAlert size={11} />
          {counts.warning} warnings
        </span>

        <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <Info size={11} />
          {counts.info} info
        </span>

        <span className="flex items-center gap-1.5 text-[10px] text-emerald-300">
          <CheckCircle2 size={11} />
          {counts.success} success
        </span>
      </div>

      {/* Filters */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/0.03 px-2 py-1.5">
          <ListFilter size={12} className="shrink-0 text-slate-500" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter console messages..."
            aria-label="Search console messages"
            className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-200 outline-none placeholder:text-slate-500"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-slate-500 hover:text-slate-200"
            >
              <X size={11} />
            </button>
          )}
        </div>

        <label className="flex shrink-0 items-center gap-1.5 text-[10px] text-slate-400">
          <input
            type="checkbox"
            checked={showTimestamps}
            onChange={(event) =>
              setShowTimestamps(event.target.checked)
            }
            className="accent-violet-500"
          />
          Time
        </label>
      </div>

      {/* Level filters */}
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-3 py-2">
        {filters.map((level) => {
          const label =
            level === "all"
              ? "All"
              : levelConfig[level].label;

          return (
            <button
              key={level}
              type="button"
              onClick={() => setFilter(level)}
              aria-pressed={filter === level}
              className={`shrink-0 rounded-md px-2.5 py-1 text-[9px] font-medium transition ${
                filter === level
                  ? "bg-violet-500/20 text-violet-200"
                  : "text-slate-400 hover:bg-white/0.06 hover:text-slate-200"
              }`}
            >
              {label}
              {level !== "all" && (
                <span className="ml-1 opacity-70">
                  {counts[level]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logs */}
      <div
        className="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-[11px] leading-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {filteredMessages.length > 0 ? (
          <div className="space-y-2">
            {filteredMessages.map((message) => {
              const config = levelConfig[message.level];
              const Icon = config.Icon;
              const timestamp = formatTimestamp(message.timestamp);

              return (
                <article
                  key={message.id}
                  className="flex min-w-0 items-start gap-2 border-b border-white/4 pb-2 last:border-0"
                >
                  <Icon
                    size={13}
                    className={`mt-1 shrink-0 ${config.color}`}
                  />

                  <span
                    className={`mt-0.5 w-52px shrink-0 text-[9px] font-semibold ${config.color}`}
                  >
                    {config.label}
                  </span>

                  <p className="min-w-0 flex-1 whitespace-pre-wrap wrap-words text-slate-300">
                    {message.message}
                  </p>

                  {showTimestamps && timestamp && (
                    <time className="shrink-0 pt-0.5 text-[9px] text-slate-600">
                      {timestamp}
                    </time>
                  )}
                </article>
              );
            })}
          </div>
        ) : messages.length > 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
            <ChevronDown size={19} className="mb-2 -rotate-90" />
            <p className="text-xs">No matching messages</p>
            <p className="mt-1 text-[10px]">
              Try changing the filters or search query.
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 size={19} />
            </div>

            <p className="text-xs font-medium text-emerald-300">
              No preview issues reported
            </p>

            <p className="mt-1 text-[10px] text-slate-500">
              Errors, warnings, and generation events will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
