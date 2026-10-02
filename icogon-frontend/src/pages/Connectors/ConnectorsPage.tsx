import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CheckCircle2,
  Loader2,
  Unplug,
} from "lucide-react";
import {
  useSearchParams,
} from "react-router-dom";

import ConnectorCard from "../../components/connectors/ConnectorCard";
import GmailConnectionModal from "../../components/connectors/GmailConnectionModal";
import GmailConnectorPanel from "../../components/connectors/GmailConnectorPanel";
import { useTheme } from "../../context/ThemeContext";

interface GmailStatus {
  connected: boolean;
  email: string | null;
}

interface GmailStatusResponse {
  connected?: boolean;
  email?: string | null;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";

const GMAIL_STATUS_ENDPOINT =
  `${API_BASE_URL}/api/connectors/gmail/status`;

const getGmailStatus =
  async (): Promise<GmailStatusResponse> => {
    const response = await fetch(
      GMAIL_STATUS_ENDPOINT,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Gmail status request failed: ${response.status}`
      );
    }

    return response.json();
  };

const ConnectorsPage = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    gmailStatus,
    setGmailStatus,
  ] = useState<GmailStatus>({
    connected: false,
    email: null,
  });

  const [loading, setLoading] =
    useState(true);

  const [modalOpen, setModalOpen] =
    useState(false);

  const loadGmailStatus =
    useCallback(async () => {
      try {
        setLoading(true);

        const status =
          await getGmailStatus();

        setGmailStatus({
          connected: Boolean(
            status.connected
          ),
          email: status.email || null,
        });
      } catch (error) {
        console.error(
          "GMAIL STATUS ERROR:",
          error
        );

        setGmailStatus({
          connected: false,
          email: null,
        });
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadGmailStatus();
  }, [loadGmailStatus]);

  useEffect(() => {
    const result =
      searchParams.get("gmail");

    if (!result) {
      return;
    }

    if (result === "connected") {
      void loadGmailStatus();
    }

    const nextParams =
      new URLSearchParams(searchParams);

    nextParams.delete("gmail");
    nextParams.delete("email");
    nextParams.delete("message");

    setSearchParams(nextParams, {
      replace: true,
    });
  }, [
    searchParams,
    setSearchParams,
    loadGmailStatus,
  ]);

  const handleDisconnected =
    useCallback(() => {
      setGmailStatus({
        connected: false,
        email: null,
      });
    }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center font-sans ${
          isDark
            ? "bg-[#0b0d10] text-white"
            : "bg-[#fafafa] text-slate-900"
        }`}
      >
        <div
          className={`flex items-center gap-2.5 text-[12px] ${
            isDark
              ? "text-zinc-500"
              : "text-slate-500"
          }`}
        >
          <Loader2
            size={16}
            className="animate-spin"
          />

          Loading connectors...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans ${
        isDark
          ? "bg-[#0b0d10] text-white"
          : "bg-[#fafafa] text-slate-900"
      }`}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
          isDark
            ? "border-white/[0.07] bg-[#0b0d10]/90"
            : "border-slate-200/80 bg-[#fafafa]/90"
        }`}
      >
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          <div className="flex h-[56px] items-center gap-3">
            {/* ICON */}

            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isDark
                  ? "bg-white text-black"
                  : "bg-slate-900 text-white"
              }`}
            >
              <Unplug
                size={15}
                strokeWidth={1.8}
              />
            </div>

            {/* TITLE */}

            <div className="min-w-0">
              <h1
                className={`text-[14px] font-semibold tracking-[-0.02em] ${
                  isDark
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                Connectors
              </h1>

              <p
                className={`hidden text-[10px] sm:block ${
                  isDark
                    ? "text-zinc-500"
                    : "text-slate-500"
                }`}
              >
                Connect your tools with
                ICOGON AI
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-[1080px] px-4 pb-14 pt-6 sm:px-6">
        {/* SUCCESS */}

        {gmailStatus.connected && (
          <div
            className={`mb-5 flex items-start gap-3 rounded-xl border px-3.5 py-3 ${
              isDark
                ? "border-emerald-500/20 bg-emerald-500/[0.07]"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <CheckCircle2
              size={16}
              className={`mt-0.5 shrink-0 ${
                isDark
                  ? "text-emerald-400"
                  : "text-emerald-600"
              }`}
            />

            <div className="min-w-0">
              <p
                className={`text-[11px] font-medium ${
                  isDark
                    ? "text-emerald-300"
                    : "text-emerald-800"
                }`}
              >
                Gmail connected successfully
              </p>

              {gmailStatus.email && (
                <p
                  className={`mt-0.5 truncate text-[10px] ${
                    isDark
                      ? "text-emerald-400/70"
                      : "text-emerald-600"
                  }`}
                >
                  {gmailStatus.email}
                </p>
              )}
            </div>
          </div>
        )}

        {/* PAGE INTRO */}

        <div className="mb-5">
          <h2
            className={`text-[18px] font-semibold tracking-[-0.025em] ${
              isDark
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            Available connectors
          </h2>

          <p
            className={`mt-1 text-[11px] ${
              isDark
                ? "text-zinc-500"
                : "text-slate-500"
            }`}
          >
            Connect external services to power
            your ICOGON workflows.
          </p>
        </div>

        {/* CONNECTOR GRID */}

        <div
          className={`rounded-2xl border p-3 sm:p-4 ${
            isDark
              ? "border-white/[0.08] bg-[#111418]"
              : "border-slate-200 bg-white"
          }`}
        >
          {!gmailStatus.connected ? (
            <ConnectorCard
              connected={false}
              email={null}
              onConnect={() =>
                setModalOpen(true)
              }
            />
          ) : (
            <GmailConnectorPanel
              email={
                gmailStatus.email ||
                "Gmail account"
              }
              onDisconnected={
                handleDisconnected
              }
            />
          )}
        </div>

        {/* EMPTY / FUTURE CONNECTORS */}

        <div
          className={`mt-4 flex items-center justify-between rounded-xl border px-4 py-3 ${
            isDark
              ? "border-white/[0.06] bg-white/[0.015]"
              : "border-slate-200/80 bg-white/60"
          }`}
        >
          <div>
            <p
              className={`text-[11px] font-medium ${
                isDark
                  ? "text-zinc-300"
                  : "text-slate-700"
              }`}
            >
              More connectors coming soon
            </p>

            <p
              className={`mt-0.5 text-[9px] ${
                isDark
                  ? "text-zinc-600"
                  : "text-slate-400"
              }`}
            >
              More services will be available
              for your AI workflows.
            </p>
          </div>

          <div
            className={`rounded-full border px-2.5 py-1 text-[8px] font-medium ${
              isDark
                ? "border-white/[0.08] text-zinc-500"
                : "border-slate-200 text-slate-400"
            }`}
          >
            Coming soon
          </div>
        </div>
      </main>

      {/* =====================================================
          GMAIL MODAL
      ===================================================== */}

      <GmailConnectionModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
      />
    </div>
  );
};

export default ConnectorsPage;