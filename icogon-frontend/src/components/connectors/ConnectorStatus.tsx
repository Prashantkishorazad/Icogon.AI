import {
  CheckCircle2,
  Circle,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

interface ConnectorStatusProps {
  connected: boolean;
  email?: string | null;
}

const ConnectorStatus = ({
  connected,
  email,
}: ConnectorStatusProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (connected) {
    return (
      <div
        className={`inline-flex max-w-[260px] items-center gap-1.5 rounded-full border px-2.5 py-1 ${
          isDark
            ? "border-emerald-500/20 bg-emerald-500/[0.07]"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <CheckCircle2
          size={12}
          className={
            isDark
              ? "text-emerald-400"
              : "text-emerald-600"
          }
          strokeWidth={2}
        />

        <span
          className={`text-[10px] font-medium ${
            isDark
              ? "text-emerald-300"
              : "text-emerald-700"
          }`}
        >
          Connected
        </span>

        {email && (
          <>
            <span
              className={
                isDark
                  ? "text-emerald-500/40"
                  : "text-emerald-300"
              }
            >
              ·
            </span>

            <span
              className={`max-w-[150px] truncate text-[9px] ${
                isDark
                  ? "text-emerald-400/70"
                  : "text-emerald-600"
              }`}
            >
              {email}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 ${
        isDark
          ? "border-white/[0.08] bg-white/[0.03]"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <Circle
        size={10}
        className={
          isDark
            ? "text-zinc-600"
            : "text-slate-400"
        }
        strokeWidth={1.8}
      />

      <span
        className={`text-[10px] font-medium ${
          isDark
            ? "text-zinc-500"
            : "text-slate-500"
        }`}
      >
        Not connected
      </span>
    </div>
  );
};

export default ConnectorStatus;