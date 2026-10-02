import React from "react";
import {
  Grid2X2,
  PanelLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  userName?: string;
  onToggleSidebar?: () => void;
  collapsed?: boolean;
}

const DashboardHeader: React.FC<Props> = ({
  onToggleSidebar,
  collapsed = false,
}) => {
  const navigate = useNavigate();

  const {
    resolvedTheme,
  } = useTheme();

  const isDark =
    resolvedTheme === "dark";

  return (
    <header
      className={`
        sticky
        top-0
        z-30
        flex
        h-[54px]
        items-center
        justify-between
        border-b
        px-4
        backdrop-blur-xl
        transition-colors
        duration-200
        ${
          isDark
            ? "border-[#242424] bg-[#0b0b0b]/95"
            : "border-slate-200 bg-white/95"
        }
      `}
    >
      {/* =====================================================
          LEFT
      ===================================================== */}

      <div className="flex items-center gap-3">
        {/* SIDEBAR TOGGLE */}

        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              transition
              ${
                isDark
                  ? "border-[#303030] bg-[#111111] text-[#999] hover:bg-[#1b1b1b] hover:text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >
            <PanelLeft
              size={15}
              strokeWidth={1.8}
            />
          </button>
        )}

        {/* TITLE */}

        <div className="flex flex-col">
          <h2
            className={`
              text-[13px]
              font-semibold
              leading-tight
              tracking-[-0.1px]
              ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }
            `}
          >
            Dashboard
          </h2>

          <p
            className={`
              mt-0.5
              text-[10px]
              leading-tight
              ${
                isDark
                  ? "text-[#777]"
                  : "text-slate-500"
              }
            `}
          >
            Build with ICOGON AI
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          navigate("/projects")
        }
        className={`
          flex
          h-8
          items-center
          gap-2
          rounded-lg
          border
          px-3
          text-[11px]
          font-medium
          shadow-sm
          transition
          ${
            isDark
              ? "border-[#303030] bg-[#111111] text-[#aaa] hover:border-[#444] hover:bg-[#1b1b1b] hover:text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        <Grid2X2
          size={14}
          strokeWidth={1.8}
        />

        <span>
          My Projects
        </span>
      </button>
    </header>
  );
};

export default DashboardHeader;