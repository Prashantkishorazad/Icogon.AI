
import React from "react";

import {
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Command,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface SearchFooterProps {
  isDark: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

/* =========================================================
   COMPONENT
========================================================= */

const SearchFooter: React.FC<SearchFooterProps> = ({
  isDark,
  actionLabel,
  onAction,
}) => {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/i.test(navigator.platform);

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        background: "bg-[#222222]",
        border: "border-white/[0.09]",
        muted: "text-[#a3a3a3]",
        key: "border-[#444444] bg-[#303030] text-[#bdbdbd]",
        action:
          "text-[#ededed] hover:bg-[#343434] hover:text-white",
      }
    : {
        background: "bg-[#f8fafc]",
        border: "border-slate-200",
        muted: "text-slate-500",
        key: "border-slate-200 bg-white text-slate-600",
        action:
          "text-slate-700 hover:bg-slate-200 hover:text-slate-900",
      };

  const keyClass = `
    inline-flex
    h-[23px]
    min-w-[23px]
    shrink-0
    items-center
    justify-center
    rounded-[6px]
    border
    px-1.5
    text-[11px]
    font-medium
    leading-none

    ${colors.key}
  `;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <footer
      aria-label="Search shortcuts and actions"
      className={`
        flex
        h-[50px]
        w-full
        shrink-0
        items-center
        gap-2
        border-t
        px-3
        text-[11px]
        font-medium
        sm:h-[54px]
        sm:gap-4
        sm:px-5

        ${colors.background}
        ${colors.border}
        ${colors.muted}
      `}
    >
      {/* =================================================
          KEYBOARD NAVIGATION
      ================================================= */}

      <div
        className="
          hidden
          items-center
          gap-1
          md:flex
        "
      >
        <kbd className={keyClass}>
          <ArrowUp
            size={12}
            strokeWidth={1.8}
            aria-label="Up arrow"
          />
        </kbd>

        <kbd className={keyClass}>
          <ArrowDown
            size={12}
            strokeWidth={1.8}
            aria-label="Down arrow"
          />
        </kbd>

        <span className="ml-1">
          Navigate
        </span>
      </div>

      {/* =================================================
          CLOSE SHORTCUT
      ================================================= */}

      <div
        className="
          hidden
          items-center
          gap-1.5
          sm:flex
        "
      >
        <kbd className={keyClass}>
          Esc
        </kbd>

        <span>Close</span>
      </div>

      {/* =================================================
          PLATFORM-AWARE SEARCH SHORTCUT
      ================================================= */}

      <div
        className="
          flex
          shrink-0
          items-center
          gap-1
        "
        aria-label={
          isMac
            ? "Command K"
            : "Control K"
        }
      >
        <kbd className={keyClass}>
          {isMac ? (
            <Command
              size={12}
              strokeWidth={1.8}
            />
          ) : (
            "Ctrl"
          )}
        </kbd>

        <kbd className={keyClass}>
          K
        </kbd>
      </div>

      {/* =================================================
          FLEXIBLE SPACING
      ================================================= */}

      <div className="flex-1" />

      {/* =================================================
          CONTEXTUAL ACTION
      ================================================= */}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-keyshortcuts="Enter"
          className={`
            group
            flex
            h-9
            min-w-0
            cursor-pointer
            items-center
            justify-end
            gap-2
            rounded-lg
            px-2.5
            text-[12px]
            font-medium
            transition-colors
            duration-150
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#3978ff]
            active:scale-[0.98]
            motion-reduce:transition-none
            sm:text-[13px]

            ${colors.action}
          `}
        >
          <span className="truncate">
            {actionLabel}
          </span>

          <kbd
            aria-hidden="true"
            className={keyClass}
          >
            <CornerDownLeft
              size={13}
              strokeWidth={1.8}
            />
          </kbd>
        </button>
      )}
    </footer>
  );
};

export default SearchFooter;