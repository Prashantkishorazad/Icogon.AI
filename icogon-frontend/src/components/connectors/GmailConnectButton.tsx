import { useState } from "react";

import {
  Loader2,
  Mail,
} from "lucide-react";

import {
  connectGmail,
} from "../../api/connectorsApi";

import { useTheme } from "../../context/ThemeContext";

interface GmailConnectButtonProps {
  onConnectedStart?: () => void;
}

const GmailConnectButton = ({
  onConnectedStart,
}: GmailConnectButtonProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleConnect =
    async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        onConnectedStart?.();

        await connectGmail();
      } catch (err: unknown) {
        console.error(
          "GMAIL CONNECT ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect Gmail."
        );

        setLoading(false);
      }
    };

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => {
          void handleConnect();
        }}
        disabled={loading}
        aria-busy={loading}
        className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3.5 text-[11px] font-medium transition-all duration-150 ${
          loading
            ? "cursor-not-allowed opacity-60"
            : "active:scale-[0.98]"
        } ${
          isDark
            ? "border-white/[0.09] bg-white text-black hover:bg-zinc-200"
            : "border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        {loading ? (
          <Loader2
            size={13}
            className="animate-spin"
            strokeWidth={1.9}
          />
        ) : (
          <Mail
            size={13}
            strokeWidth={1.9}
          />
        )}

        <span>
          {loading
            ? "Connecting..."
            : "Connect Gmail"}
        </span>
      </button>

      {error && (
        <div
          className={`mt-2 max-w-[320px] rounded-lg border px-2.5 py-2 ${
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
    </div>
  );
};

export default GmailConnectButton;