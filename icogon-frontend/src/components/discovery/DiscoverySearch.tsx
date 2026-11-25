
import {
  useEffect,
  useRef,
  type FC,
  type KeyboardEvent,
} from "react";

import {
  Search,
  X,
} from "lucide-react";

import type { DiscoveryTab } from "./types";

/* =========================================================
   TYPES
========================================================= */

interface DiscoverySearchProps {
  query: string;
  isDark: boolean;

  activeTab?: DiscoveryTab;

  resultCount?: number;

  onQueryChange: (
    value: string,
  ) => void;

  onClose: () => void;

  className?: string;
}

/* =========================================================
   SEARCH PLACEHOLDERS
========================================================= */

const SEARCH_PLACEHOLDERS: Record<
  DiscoveryTab,
  string
> = {
  projects: "Search your projects...",
  recent: "Search recently viewed...",
  templates: "Search Icogon templates...",
};

/* =========================================================
   COMPONENT
========================================================= */

const DiscoverySearch: FC<DiscoverySearchProps> = ({
  query,
  isDark,
  activeTab = "projects",
  resultCount,
  onQueryChange,
  onClose,
  className = "",
}) => {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const hasQuery =
    query.trim().length > 0;

  /* =======================================================
     AUTOMATIC INPUT FOCUS
  ======================================================= */

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus({
        preventScroll: true,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        container: `
          border-[#484848]
          bg-[#262626]
          focus-within:border-[#707070]
        `,

        input: `
          text-[#f5f5f5]
          placeholder:text-[#929292]
        `,

        icon: "text-[#a3a3a3]",

        muted: "text-[#929292]",

        button: `
          text-[#b5b5b5]
          hover:bg-[#383838]
          hover:text-white
        `,

        separator: "bg-[#444444]",

        shortcut: `
          border-[#454545]
          bg-[#303030]
          text-[#a3a3a3]
        `,
      }
    : {
        container: `
          border-slate-200
          bg-white
          focus-within:border-slate-400
        `,

        input: `
          text-slate-900
          placeholder:text-slate-400
        `,

        icon: "text-slate-500",

        muted: "text-slate-500",

        button: `
          text-slate-500
          hover:bg-slate-100
          hover:text-slate-900
        `,

        separator: "bg-slate-200",

        shortcut: `
          border-slate-200
          bg-slate-100
          text-slate-500
        `,
      };

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  const handleClear = () => {
    onQueryChange("");

    inputRef.current?.focus({
      preventScroll: true,
    });
  };

  /* =======================================================
     CLOSE SEARCH
  ======================================================= */

  const handleClose = () => {
    onQueryChange("");
    onClose();
  };

  /* =======================================================
     KEYBOARD HANDLING
  ======================================================= */

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      handleClose();
    }
  };

  /* =======================================================
     BUTTON CLASS
  ======================================================= */

  const buttonClass = `
    flex
    h-9
    w-9
    shrink-0
    cursor-pointer
    items-center
    justify-center
    rounded-full

    outline-none
    transition-colors
    duration-150

    focus-visible:ring-2
    focus-visible:ring-[#3978ff]
    focus-visible:ring-inset

    motion-reduce:transition-none

    ${colors.button}
  `;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      onKeyDown={handleKeyDown}
      className={`
        flex
        w-full
        min-w-0
        flex-col
        gap-2

        ${className}
      `}
    >
      {/* ===============================================
          SEARCH ENTRANCE ANIMATION
      =============================================== */}

      <style>{`
        @keyframes icogon-discovery-search-enter {
          from {
            opacity: 0;
            transform: translateY(3px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .icogon-discovery-search {
          animation:
            icogon-discovery-search-enter
            180ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .icogon-discovery-search {
            animation: none;
          }
        }
      `}</style>

      {/* ===============================================
          SEARCH CAPSULE
      =============================================== */}

      <div
        role="search"
        aria-label="Project discovery search"
        className={`
          icogon-discovery-search

          relative
          flex
          min-h-46px
          w-full
          min-w-0
          items-center
          gap-2

          rounded-full
          border
          py-1
          pl-3
          pr-1

          transition-colors
          duration-200

          sm:gap-3
          sm:pl-4

          ${colors.container}
        `}
      >
        {/* =============================================
            SEARCH ICON
        ============================================= */}

        <Search
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
          className={`
            shrink-0
            ${colors.icon}
          `}
        />

        {/* =============================================
            SEARCH INPUT
        ============================================= */}

        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={
            SEARCH_PLACEHOLDERS[activeTab]
          }
          aria-label={
            SEARCH_PLACEHOLDERS[activeTab]
          }
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="search"
          onChange={(event) => {
            onQueryChange(
              event.target.value,
            );
          }}
          className={`
            h-9
            min-w-0
            flex-1

            appearance-none
            border-0
            bg-transparent
            p-0

            text-[16px]
            font-normal
            leading-6
            tracking-[-0.015em]

            outline-none
            ring-0

            focus:outline-none
            focus:ring-0

            [&::-webkit-search-cancel-button]:hidden

            sm:text-[14px]

            ${colors.input}
          `}
        />

        {/* =============================================
            RESULT COUNT
        ============================================= */}

        {hasQuery &&
          typeof resultCount === "number" && (
            <span
              aria-hidden="true"
              className={`
                hidden
                shrink-0
                whitespace-nowrap
                text-[11px]
                tabular-nums

                md:inline

                ${colors.muted}
              `}
            >
              {resultCount}{" "}
              {resultCount === 1
                ? "result"
                : "results"}
            </span>
          )}

        {/* =============================================
            CLEAR QUERY
        ============================================= */}

        {query.length > 0 && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className={buttonClass}
          >
            <X
              size={15}
              strokeWidth={1.8}
            />
          </button>
        )}

        {/* =============================================
            ESCAPE SHORTCUT
        ============================================= */}

        <kbd
          aria-hidden="true"
          className={`
            hidden
            h-6
            shrink-0
            items-center
            justify-center

            rounded-md
            border
            px-1.5

            text-[10px]
            font-medium

            sm:inline-flex

            ${colors.shortcut}
          `}
        >
          Esc
        </kbd>

        {/* =============================================
            SEPARATOR
        ============================================= */}

        <span
          aria-hidden="true"
          className={`
            h-4
            w-px
            shrink-0

            ${colors.separator}
          `}
        />

        {/* =============================================
            CLOSE SEARCH
        ============================================= */}

        <button
          type="button"
          aria-label="Close discovery search"
          aria-keyshortcuts="Escape"
          onClick={handleClose}
          className={buttonClass}
        >
          <X
            size={18}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* Accessible search result announcement */}

      <span
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {hasQuery &&
        typeof resultCount === "number"
          ? `${resultCount} matching ${
              resultCount === 1
                ? "result"
                : "results"
            }`
          : ""}
      </span>
    </div>
  );
};

export default DiscoverySearch;
