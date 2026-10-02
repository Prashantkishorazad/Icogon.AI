import {
  Mail,
  ExternalLink,
} from "lucide-react";

import GmailConnectButton from "./GmailConnectButton";
import ConnectorStatus from "./ConnectorStatus";
import { useTheme } from "../../context/ThemeContext";

interface ConnectorCardProps {
  connected: boolean;
  email?: string | null;
  onConnect?: () => void;
  onOpen?: () => void;
}

const ConnectorCard = ({
  connected,
  email,
  onConnect,
  onOpen,
}: ConnectorCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`w-full rounded-xl border p-4 transition sm:p-5 ${
        isDark
          ? "border-white/[0.08] bg-[#111418] hover:border-white/[0.12]"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      {/* ====================================================
          TOP
      ==================================================== */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* GMAIL ICON */}

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
              isDark
                ? "border-white/[0.08] bg-white/[0.04]"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <Mail
              size={19}
              className="text-red-500"
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <h3
              className={`text-[13px] font-semibold tracking-[-0.01em] ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Gmail
            </h3>

            <p
              className={`mt-0.5 text-[10px] ${
                isDark
                  ? "text-zinc-500"
                  : "text-slate-500"
              }`}
            >
              Connect your Gmail account
            </p>
          </div>
        </div>

        <ConnectorStatus
          connected={connected}
          email={email}
        />
      </div>

      {/* ====================================================
          DESCRIPTION
      ==================================================== */}

      <p
        className={`mt-4 max-w-[620px] text-[11px] leading-5 ${
          isDark
            ? "text-zinc-500"
            : "text-slate-500"
        }`}
      >
        Connect Gmail with ICOGON AI to
        securely access your email data
        and use Gmail inside your
        AI-powered workflows.
      </p>

      {/* ====================================================
          CONNECTED ACCOUNT
      ==================================================== */}

      {connected && email && (
        <div
          className={`mt-4 rounded-lg border px-3 py-2.5 ${
            isDark
              ? "border-emerald-500/15 bg-emerald-500/[0.06]"
              : "border-emerald-200 bg-emerald-50/70"
          }`}
        >
          <p
            className={`text-[9px] ${
              isDark
                ? "text-emerald-400/70"
                : "text-emerald-600"
            }`}
          >
            Connected account
          </p>

          <p
            className={`mt-0.5 truncate text-[11px] font-medium ${
              isDark
                ? "text-emerald-300"
                : "text-emerald-800"
            }`}
          >
            {email}
          </p>
        </div>
      )}

      {/* ====================================================
          ACTION
      ==================================================== */}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!connected ? (
          <GmailConnectButton
            onConnectedStart={onConnect}
          />
        ) : (
          <button
            type="button"
            onClick={onOpen}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-medium transition ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Open Gmail

            <ExternalLink
              size={13}
              strokeWidth={1.8}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectorCard;