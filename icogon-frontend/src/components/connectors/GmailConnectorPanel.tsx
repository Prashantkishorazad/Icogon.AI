import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Unplug,
} from "lucide-react";

import {
  disconnectGmail,
  getGmailMessages,
  getGmailProfile,
} from "../../api/connectorsApi";

import { useTheme } from "../../context/ThemeContext";

interface GmailConnectorPanelProps {
  email: string;
  onDisconnected?: () => void;
}

interface GmailMessage {
  id: string;
  threadId?: string;
}

interface GmailMessagesResponse {
  messages?: GmailMessage[];
}

const GmailConnectorPanel = ({
  email,
  onDisconnected,
}: GmailConnectorPanelProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [messages, setMessages] =
    useState<GmailMessage[]>([]);

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [disconnecting, setDisconnecting] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ==========================================================
     LOAD GMAIL MESSAGES
  ========================================================== */

  const loadMessages =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          (await getGmailMessages()) as GmailMessagesResponse;

        setMessages(
          result.messages ?? []
        );
      } catch (err: unknown) {
        console.error(
          "GMAIL LOAD ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Gmail."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    void loadMessages();

    void getGmailProfile().catch(
      (err: unknown) => {
        console.error(
          "GMAIL PROFILE ERROR:",
          err
        );
      }
    );
  }, [loadMessages]);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const result =
        (await getGmailMessages(
          query.trim()
        )) as GmailMessagesResponse;

      setMessages(
        result.messages ?? []
      );
    } catch (err: unknown) {
      console.error(
        "GMAIL SEARCH ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Search failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     DISCONNECT
  ========================================================== */

  const handleDisconnect =
    async () => {
      const confirmed =
        window.confirm(
          "Disconnect this Gmail account?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setDisconnecting(true);
        setError("");

        await disconnectGmail();

        setMessages([]);

        onDisconnected?.();
      } catch (err: unknown) {
        console.error(
          "GMAIL DISCONNECT ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to disconnect Gmail."
        );
      } finally {
        setDisconnecting(false);
      }
    };

  return (
    <div
      className={`w-full overflow-hidden rounded-xl border ${
        isDark
          ? "border-white/[0.08] bg-[#111418]"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between ${
          isDark
            ? "border-white/[0.07]"
            : "border-slate-200"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isDark
                ? "bg-red-500/[0.08]"
                : "bg-red-50"
            }`}
          >
            <Mail
              size={17}
              className="text-red-500"
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <p
              className={`text-[12px] font-semibold ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Gmail
            </p>

            <p
              className={`mt-0.5 max-w-[260px] truncate text-[10px] ${
                isDark
                  ? "text-zinc-500"
                  : "text-slate-500"
              }`}
            >
              {email}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              void loadMessages();
            }}
            disabled={loading}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-medium transition ${
              loading
                ? "cursor-not-allowed opacity-50"
                : ""
            } ${
              isDark
                ? "border-white/[0.08] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <RefreshCw
              size={12}
              strokeWidth={1.8}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              void handleDisconnect();
            }}
            disabled={disconnecting}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-medium transition ${
              disconnecting
                ? "cursor-not-allowed opacity-50"
                : ""
            } ${
              isDark
                ? "border-red-500/15 text-red-400 hover:bg-red-500/[0.06]"
                : "border-red-100 text-red-500 hover:bg-red-50"
            }`}
          >
            <Unplug
              size={12}
              strokeWidth={1.8}
            />

            {disconnecting
              ? "Disconnecting..."
              : "Disconnect"}
          </button>
        </div>
      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div
        className={`border-b p-3.5 ${
          isDark
            ? "border-white/[0.07]"
            : "border-slate-200"
        }`}
      >
        <div className="flex gap-2">
          <div
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 ${
              isDark
                ? "border-white/[0.08] bg-white/[0.03]"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <Search
              size={14}
              strokeWidth={1.8}
              className={
                isDark
                  ? "text-zinc-600"
                  : "text-slate-400"
              }
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  void handleSearch();
                }
              }}
              placeholder="Search Gmail..."
              className={`min-w-0 flex-1 bg-transparent py-2 text-[11px] outline-none ${
                isDark
                  ? "text-zinc-200 placeholder:text-zinc-600"
                  : "text-slate-700 placeholder:text-slate-400"
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              void handleSearch();
            }}
            disabled={loading}
            className={`rounded-lg px-3.5 text-[10px] font-medium transition ${
              loading
                ? "cursor-not-allowed opacity-50"
                : ""
            } ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Search
          </button>
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          className={`mx-3.5 mt-3 rounded-lg border px-3 py-2.5 ${
            isDark
              ? "border-red-500/15 bg-red-500/[0.06]"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p
            className={`text-[10px] leading-4 ${
              isDark
                ? "text-red-400"
                : "text-red-600"
            }`}
          >
            {error}
          </p>
        </div>
      )}

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      <div className="p-3.5">
        {loading ? (
          <div
            className={`flex items-center justify-center gap-2 py-12 text-[11px] ${
              isDark
                ? "text-zinc-600"
                : "text-slate-400"
            }`}
          >
            <Loader2
              size={16}
              className="animate-spin"
              strokeWidth={1.8}
            />

            Loading Gmail...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                isDark
                  ? "bg-white/[0.04]"
                  : "bg-slate-100"
              }`}
            >
              <Mail
                size={18}
                strokeWidth={1.7}
                className={
                  isDark
                    ? "text-zinc-600"
                    : "text-slate-300"
                }
              />
            </div>

            <p
              className={`mt-3 text-[11px] font-medium ${
                isDark
                  ? "text-zinc-300"
                  : "text-slate-600"
              }`}
            >
              No emails found
            </p>

            <p
              className={`mt-1 text-[10px] ${
                isDark
                  ? "text-zinc-600"
                  : "text-slate-400"
              }`}
            >
              Try another Gmail search.
            </p>
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-lg border ${
              isDark
                ? "divide-white/[0.06] border-white/[0.07]"
                : "divide-slate-100 border-slate-100"
            } divide-y`}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-center justify-between gap-4 px-3.5 py-3 transition ${
                  isDark
                    ? "hover:bg-white/[0.02]"
                    : "hover:bg-slate-50/70"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Mail
                    size={14}
                    strokeWidth={1.7}
                    className={`shrink-0 ${
                      isDark
                        ? "text-zinc-600"
                        : "text-slate-400"
                    }`}
                  />

                  <div className="min-w-0">
                    <p
                      className={`truncate text-[11px] font-medium ${
                        isDark
                          ? "text-zinc-300"
                          : "text-slate-700"
                      }`}
                    >
                      Gmail message
                    </p>

                    <p
                      className={`mt-0.5 truncate text-[9px] ${
                        isDark
                          ? "text-zinc-600"
                          : "text-slate-400"
                      }`}
                    >
                      ID: {message.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GmailConnectorPanel;