import {
  X,
  Mail,
  ShieldCheck,
} from "lucide-react";

import GmailConnectButton from "./GmailConnectButton";
import { useTheme } from "../../context/ThemeContext";

interface GmailConnectionModalProps {
  open: boolean;
  onClose: () => void;
}

const GmailConnectionModal = ({
  open,
  onClose,
}: GmailConnectionModalProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!open) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center px-4 backdrop-blur-sm ${
        isDark
          ? "bg-black/60"
          : "bg-slate-950/30"
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gmail-modal-title"
        className={`relative w-full max-w-[400px] rounded-2xl border p-5 shadow-2xl sm:p-6 ${
          isDark
            ? "border-white/[0.09] bg-[#111418] shadow-black/40"
            : "border-slate-200 bg-white shadow-slate-900/10"
        }`}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            CLOSE
        ================================================= */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Gmail connection dialog"
          className={`absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-lg transition ${
            isDark
              ? "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          }`}
        >
          <X
            size={15}
            strokeWidth={1.8}
          />
        </button>

        {/* =================================================
            ICON
        ================================================= */}

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isDark
              ? "bg-red-500/[0.09]"
              : "bg-red-50"
          }`}
        >
          <Mail
            size={20}
            className="text-red-500"
            strokeWidth={1.8}
          />
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          id="gmail-modal-title"
          className={`mt-4 text-[17px] font-semibold tracking-[-0.025em] ${
            isDark
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          Connect Gmail
        </h2>

        <p
          className={`mt-1.5 max-w-[330px] text-[11px] leading-5 ${
            isDark
              ? "text-zinc-500"
              : "text-slate-500"
          }`}
        >
          Connect your Gmail account to
          use Gmail with ICOGON AI.
        </p>

        {/* =================================================
            SECURITY
        ================================================= */}

        <div
          className={`mt-4 flex gap-2.5 rounded-xl border p-3 ${
            isDark
              ? "border-emerald-500/15 bg-emerald-500/[0.05]"
              : "border-emerald-100 bg-emerald-50/60"
          }`}
        >
          <ShieldCheck
            size={16}
            className={`mt-0.5 shrink-0 ${
              isDark
                ? "text-emerald-400"
                : "text-emerald-600"
            }`}
            strokeWidth={1.8}
          />

          <div className="min-w-0">
            <p
              className={`text-[11px] font-medium ${
                isDark
                  ? "text-emerald-300"
                  : "text-slate-800"
              }`}
            >
              Secure Google connection
            </p>

            <p
              className={`mt-0.5 text-[10px] leading-4 ${
                isDark
                  ? "text-zinc-500"
                  : "text-slate-500"
              }`}
            >
              You'll be redirected to Google
              to authorize access.
            </p>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg border px-3.5 py-2 text-[11px] font-medium transition ${
              isDark
                ? "border-white/[0.09] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Cancel
          </button>

          <GmailConnectButton />
        </div>
      </div>
    </div>
  );
};

export default GmailConnectionModal;