
import {
  useRef,
  type FC,
  type KeyboardEvent,
} from "react";

import {
  Search,
  ArrowRight,
} from "lucide-react";

import {
  DISCOVERY_TABS,
  type DiscoveryTab,
} from "./types";

/* =========================================================
   TYPES
========================================================= */

interface DiscoveryTabsProps {
  activeTab: DiscoveryTab;
  isDark: boolean;

  onTabChange: (
    tab: DiscoveryTab,
  ) => void;

  onSearch: () => void;

  onBrowseAll: (
    tab: DiscoveryTab,
  ) => void;

  className?: string;
}

/* =========================================================
   COMPONENT
========================================================= */

const DiscoveryTabs: FC<DiscoveryTabsProps> = ({
  activeTab,
  isDark,
  onTabChange,
  onSearch,
  onBrowseAll,
  className = "",
}) => {
  const tabRefs = useRef<
    Record<
      string,
      HTMLButtonElement | null
    >
  >({});

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        capsule:
          "border-[#484848] bg-[#262626]",

        active:
          "bg-[#414141] text-[#ffffff] shadow-sm",

        inactive:
          "text-[#a3a3a3] hover:bg-[#333333] hover:text-[#f5f5f5]",

        search:
          "text-[#b5b5b5] hover:bg-[#383838] hover:text-white",

        browse:
          "text-[#dedede] hover:bg-white/[0.06] hover:text-white",

        separator:
          "bg-[#444444]",
      }
    : {
        capsule:
          "border-slate-200 bg-[#f5f6f8]",

        active:
          "bg-white text-slate-900 shadow-sm",

        inactive:
          "text-slate-500 hover:bg-slate-200/70 hover:text-slate-900",

        search:
          "text-slate-500 hover:bg-slate-200 hover:text-slate-900",

        browse:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-950",

        separator:
          "bg-slate-300/70",
      };

  /* =======================================================
     KEYBOARD NAVIGATION
  ======================================================= */

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const lastIndex =
      DISCOVERY_TABS.length - 1;

    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex =
          currentIndex === lastIndex
            ? 0
            : currentIndex + 1;
        break;

      case "ArrowLeft":
        nextIndex =
          currentIndex === 0
            ? lastIndex
            : currentIndex - 1;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = lastIndex;
        break;

      default:
        return;
    }

    event.preventDefault();

    const nextTab =
      DISCOVERY_TABS[nextIndex];

    if (!nextTab) return;

    onTabChange(nextTab.id);

    tabRefs.current[nextTab.id]?.focus();
  };

  /* =======================================================
     BROWSE ALL ACCESSIBLE LABEL
  ======================================================= */

  const browseLabel =
    activeTab === "templates"
      ? "Browse all ICOGON templates"
      : activeTab === "recent"
        ? "Browse recently viewed projects"
        : "Browse all projects";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`
        flex
        w-full
        min-w-0
        flex-col
        items-start
        justify-between
        gap-3

        lg:flex-row
        lg:items-center

        ${className}
      `}
    >
      {/* =================================================
          DISCOVERY NAVIGATION CAPSULE
      ================================================= */}

      <div
        className={`
          flex
          max-w-full
          min-w-0
          shrink-0
          items-center
          gap-1
          overflow-x-auto
          rounded-full
          border
          p-1
          transition-colors
          duration-200

          scrollbar-width:none
          [&::-webkit-scrollbar]:hidden

          ${colors.capsule}
        `}
      >
        {/* ===============================================
            SEARCH BUTTON
        =============================================== */}

        <button
          type="button"
          aria-label="Search projects and templates"
          title="Search"
          onClick={onSearch}
          className={`
            group
            relative
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
            duration-200

            focus-visible:ring-2
            focus-visible:ring-[#3978ff]
            focus-visible:ring-inset

            ${colors.search}
          `}
        >
          <Search
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
            className="
              transition-transform
              duration-200
              group-hover:scale-105
              motion-reduce:transform-none
            "
          />
        </button>

        {/* ===============================================
            VERTICAL SEPARATOR
        =============================================== */}

        <span
          aria-hidden="true"
          className={`
            mx-0.5
            h-4
            w-px
            shrink-0

            ${colors.separator}
          `}
        />

        {/* ===============================================
            NAVIGATION TABS
        =============================================== */}

        <div
          role="tablist"
          aria-label="Project discovery"
          aria-orientation="horizontal"
          className="
            flex
            min-w-max
            items-center
            gap-0.5
            sm:gap-1
          "
        >
          {DISCOVERY_TABS.map(
            (tab, index) => {
              const selected =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[tab.id] =
                      element;
                  }}
                  id={`discovery-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`discovery-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => {
                    onTabChange(tab.id);
                  }}
                  onKeyDown={(event) => {
                    handleTabKeyDown(
                      event,
                      index,
                    );
                  }}
                  className={`
                    relative
                    isolate
                    flex
                    h-9
                    shrink-0
                    cursor-pointer
                    select-none
                    items-center
                    justify-center
                    whitespace-nowrap
                    rounded-full

                    px-2.5
                    text-[12px]
                    font-medium
                    leading-none
                    tracking-[-0.015em]

                    outline-none
                    transition-colors
                    duration-200
                    ease-out

                    focus-visible:ring-2
                    focus-visible:ring-inset
                    focus-visible:ring-[#3978ff]

                    motion-reduce:transition-none

                    sm:px-4
                    sm:text-[13px]

                    ${
                      selected
                        ? colors.active
                        : colors.inactive
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* =================================================
          BROWSE ALL
      ================================================= */}

      <button
        type="button"
        aria-label={browseLabel}
        onClick={() => {
          onBrowseAll(activeTab);
        }}
        className={`
          group
          ml-auto
          inline-flex
          h-10
          shrink-0
          cursor-pointer
          items-center
          justify-center
          gap-2
          whitespace-nowrap
          rounded-xl
          px-3

          text-[13px]
          font-medium
          tracking-[-0.015em]

          outline-none
          transition-colors
          duration-200

          focus-visible:ring-2
          focus-visible:ring-[#3978ff]

          ${colors.browse}
        `}
      >
        <span>Browse all</span>

        <ArrowRight
          size={16}
          strokeWidth={1.7}
          aria-hidden="true"
          className="
            transition-transform
            duration-200
            ease-out
            group-hover:translate-x-0.5
            motion-reduce:transform-none
          "
        />
      </button>
    </div>
  );
};

export default DiscoveryTabs;
