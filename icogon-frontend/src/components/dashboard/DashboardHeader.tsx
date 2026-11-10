
import React from "react";
import {
  Grid2X2,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  title?: string;
  collapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileMenu?: () => void;
}

const DashboardHeader: React.FC<Props> = ({
  title = "Dashboard",
  collapsed = false,
  onToggleSidebar,
  onOpenMobileMenu,
}) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const buttonStyle = isDark
    ? "border-[#303030] bg-[#111111] text-[#999] hover:border-[#444] hover:bg-[#1b1b1b] hover:text-white"
    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

  return (
    <header
      className={`
        sticky top-0 z-30 flex h-[54px] shrink-0
        items-center justify-between border-b px-4
        backdrop-blur-xl transition-colors duration-200
        ${
          isDark
            ? "border-[#242424] bg-[#0b0b0b]/95"
            : "border-slate-200 bg-white/95"
        }
      `}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile navigation */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation"
            className={`
              flex h-8 w-8 items-center justify-center
              rounded-lg border md:hidden
              ${buttonStyle}
            `}
          >
            <PanelLeft size={15} strokeWidth={1.8} />
          </button>
        )}

        {/* Desktop sidebar toggle */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`
              hidden h-8 w-8 items-center justify-center
              rounded-lg border transition-colors md:flex
              ${buttonStyle}
            `}
          >
            {collapsed ? (
              <PanelLeft size={15} strokeWidth={1.8} />
            ) : (
              <PanelLeftClose size={15} strokeWidth={1.8} />
            )}
          </button>
        )}

        <h2
          className={`text-[13px] font-semibold tracking-[-0.1px] ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {title}
        </h2>
      </div>

      {/* Right */}
      {title !== "Projects" && (
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className={`
            flex h-8 items-center gap-2 rounded-lg
            border px-3 text-[11px] font-medium
            shadow-sm transition
            ${buttonStyle}
          `}
        >
          <Grid2X2 size={14} strokeWidth={1.8} />
          <span>My Projects</span>
        </button>
      )}
    </header>
  );
};

export default DashboardHeader;
