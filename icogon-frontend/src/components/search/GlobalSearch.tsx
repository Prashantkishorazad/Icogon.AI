import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  X,
  Clock3,
  Command,
  FolderKanban,
  Loader2,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Plus,
} from "lucide-react";

import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";

import {
  searchNavigation,
  type SearchNavigationItem,
} from "../../data/searchNavigation";

import { settingsNavigation } from "../../data/settingsNavigation";
import { connectorData } from "../../data/connectorData";

import {
  getProjectsApi,
  type ProjectResponse,
} from "../../api/projectApi";

import SearchResultItem from "./SearchResultItem";
import SearchPreviewPanel from "./SearchPreviewPanel";

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

type SearchItem = SearchNavigationItem & {
  project?: ProjectResponse;
};

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(
    null,
  );

  /* ======================================================
     LOAD PROJECTS
  ====================================================== */

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const resetTimer = window.setTimeout(() => {
      if (!cancelled) {
        setProjectsLoading(true);
        setProjectsError(null);
      }
    }, 0);

    const loadProjects = async () => {
      try {
        const data = await getProjectsApi();

        if (!cancelled) {
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Global search:", error);

        if (!cancelled) {
          setProjectsError("Unable to load recent projects.");
        }
      } finally {
        if (!cancelled) {
          setProjectsLoading(false);
        }
      }
    };

    void loadProjects();

    return () => {
      cancelled = true;
      window.clearTimeout(resetTimer);
    };
  }, [open]);

  /* ======================================================
     FOCUS AND RESET
  ====================================================== */

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement;

    const resetTimer = window.setTimeout(() => {
      setQuery("");
      setSelectedIndex(0);
    }, 0);

    const timer = window.setTimeout(() => {
      inputRef.current?.focus({
        preventScroll: true,
      });
    }, 30);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(timer);

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus({
          preventScroll: true,
        });
      }
    };
  }, [open]);

  /* ======================================================
     SEARCH DATA
  ====================================================== */

  const projectItems = useMemo<SearchItem[]>(
    () =>
      projects.slice(0, 8).map((project) => ({
        id: `project-${project.id}`,
        title: project.name,
        category: "Recent projects",
        type: "action",
        icon: FolderKanban,
        path: `/builder/${project.id}`,

        keywords: [
          project.name,
          project.description || "",
          project.prompt || "",
          "project",
          "recent",
        ],

        description:
          project.description || project.prompt || "",

        project,
      })),
    [projects],
  );

  const allItems = useMemo<SearchItem[]>(() => {
    const unique = new Map<string, SearchNavigationItem>();

    [
      ...searchNavigation,
      ...settingsNavigation,
      ...connectorData,
    ].forEach((item) => {
      if (!unique.has(item.id)) {
        unique.set(item.id, item);
      }
    });

    return [...projectItems, ...Array.from(unique.values())];
  }, [projectItems]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return allItems;

    const words = term.split(/\s+/);

    return allItems.filter((item) => {
      const searchableText = [
        item.title,
        item.category,
        item.description || "",
        ...(item.keywords || []),
      ]
        .join(" ")
        .toLowerCase();

      return words.every((word) =>
        searchableText.includes(word),
      );
    });
  }, [allItems, query]);

  const groupedItems = useMemo(
    () =>
      filteredItems.reduce<Record<string, SearchItem[]>>(
        (groups, item) => {
          (groups[item.category] ||= []).push(item);
          return groups;
        },
        {},
      ),
    [filteredItems],
  );

  const orderedItems = useMemo(
    () => Object.values(groupedItems).flat(),
    [groupedItems],
  );

  const activeSelectedIndex = Math.min(
    selectedIndex,
    Math.max(orderedItems.length - 1, 0),
  );

  const selectedItem = orderedItems[activeSelectedIndex];
  const selectedProject = selectedItem?.project;

  /* ======================================================
     ACTION HANDLER
  ====================================================== */

  const handleSelect = useCallback(
    (item: SearchItem) => {
      if (item.type === "theme") {
        if (item.id === "theme-light") setTheme("light");
        if (item.id === "theme-dark") setTheme("dark");
        if (item.id === "theme-system") setTheme("system");

        return;
      }

      if (item.path) {
        onClose();
        navigate(item.path);
      }
    },
    [navigate, onClose, setTheme],
  );

  /* ======================================================
     AUTOMATIC KEYBOARD SCROLL
  ====================================================== */

  const scrollToResult = useCallback((id: string) => {
    const element = document.getElementById(
      `icogon-search-${id}`,
    );

    element?.scrollIntoView({
      block: "nearest",
      behavior: "instant",
    });
  }, []);

  /* ======================================================
     KEYBOARD NAVIGATION
  ====================================================== */

  useEffect(() => {
    if (!open) return;

    const handleKeyboard = (event: KeyboardEvent) => {
      const commandK =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k";

      if (commandK || event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        const nextIndex = Math.min(
          activeSelectedIndex + 1,
          Math.max(orderedItems.length - 1, 0),
        );

        setSelectedIndex(nextIndex);

        const item = orderedItems[nextIndex];

        if (item) scrollToResult(item.id);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        const nextIndex = Math.max(
          activeSelectedIndex - 1,
          0,
        );

        setSelectedIndex(nextIndex);

        const item = orderedItems[nextIndex];

        if (item) scrollToResult(item.id);
        return;
      }

      if (event.key === "Enter") {
        if (
          event.target instanceof HTMLElement &&
          event.target.closest("button, a")
        ) {
          return;
        }

        const item = orderedItems[activeSelectedIndex];

        if (item) {
          event.preventDefault();
          handleSelect(item);
        }
      }

      /* Keep keyboard focus inside the dialog. */
      if (event.key === "Tab") {
        const focusableElements =
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]',
          );

        if (!focusableElements?.length) return;

        const visibleElements = Array.from(
          focusableElements,
        ).filter((element) => element.getClientRects().length);

        const first = visibleElements[0];
        const last = visibleElements[visibleElements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyboard);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyboard,
      );
    };
  }, [
    open,
    orderedItems,
    activeSelectedIndex,
    handleSelect,
    scrollToResult,
    onClose,
  ]);

  if (!open) return null;

  /* ======================================================
     THEME
  ====================================================== */

  const borderClass = isDark
    ? "border-white/[0.09]"
    : "border-slate-200";

  const mutedClass = isDark
    ? "text-[#a3a3a3]"
    : "text-slate-500";

  const headingClass = `
    mb-2
    flex items-center gap-2
    px-3
    text-[12px]
    font-medium
    ${mutedClass}
  `;

  const keyboardClass = `
    inline-flex
    min-h-[22px]
    min-w-[22px]
    items-center
    justify-center
    rounded-md
    border
    px-1.5
    text-[11px]
    font-medium
    ${
      isDark
        ? "border-white/10 bg-white/[0.05] text-[#b5b5b5]"
        : "border-slate-200 bg-slate-100 text-slate-500"
    }
  `;

  /* ======================================================
     RENDER RESULT
  ====================================================== */

  const renderResult = (item: SearchItem) => {
    const index = orderedItems.findIndex(
      (entry) => entry.id === item.id,
    );

    const selected = index === activeSelectedIndex;

    return (
      <div
        key={item.id}
        id={`icogon-search-${item.id}`}
        className={`
          icogon-search-result
          ${selected ? "is-selected" : ""}
        `}
      >
        <SearchResultItem
          item={item}
          isProject={Boolean(item.project)}
          selected={selected}
          activeTheme={
            item.type === "theme" ? theme : resolvedTheme
          }
          onMouseEnter={() => setSelectedIndex(index)}
          onClick={() => handleSelect(item)}
        />
      </div>
    );
  };

  /* ======================================================
     PORTAL
  ====================================================== */

  return createPortal(
    <>
      <style>{`
        @keyframes icogon-search-enter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .icogon-search-dialog {
          animation:
            icogon-search-enter
            180ms
            cubic-bezier(0.22, 1, 0.36, 1);

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .icogon-search-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--search-scrollbar) transparent;
          overscroll-behavior: contain;
        }

        .icogon-search-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .icogon-search-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .icogon-search-scroll::-webkit-scrollbar-thumb {
          background: var(--search-scrollbar);
          border-radius: 999px;
        }

        .icogon-search-result {
          border-radius: 9px;
          overflow: hidden;
        }

        .icogon-search-result button {
          cursor: pointer;
        }

        .icogon-search-dialog button {
          cursor: pointer;
        }

        .icogon-search-dialog button:focus-visible {
          outline: 2px solid #3978ff;
          outline-offset: -2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .icogon-search-dialog {
            animation: none;
          }
        }
      `}</style>

      {/* Transparent interaction layer.
          No blur, dimming or visible overlay. */}

      <div
        className="
          fixed inset-0 z-[9999]
          flex items-center justify-center
          bg-transparent
          p-3 sm:p-6
        "
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <section
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="ICOGON global search"
          className={`
            icogon-search-dialog
            relative isolate
            flex
            h-[min(680px,calc(100dvh-32px))]
            w-full max-w-[1000px]
            flex-col
            overflow-hidden
            rounded-[22px]
            border
            sm:h-[min(680px,calc(100dvh-64px))]
            ${
              isDark
                ? "border-[#484848] bg-[#252525] text-[#f5f5f5] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                : "border-slate-200 bg-white text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
            }
          `}
          style={
            {
              "--search-scrollbar": isDark
                ? "#626262"
                : "#cbd5e1",
            } as React.CSSProperties
          }
        >
          {/* ==========================================
              FULL WIDTH SEARCH HEADER
          ========================================== */}

          <header
            className={`
              flex h-[66px] shrink-0
              items-center gap-3
              border-b px-4 sm:px-5
              ${borderClass}
            `}
          >
            <Search
              size={21}
              strokeWidth={1.7}
              className={`shrink-0 ${mutedClass}`}
            />

            <input
              ref={inputRef}
              type="text"
              value={query}
              autoComplete="off"
              spellCheck={false}
              aria-label="Search anything in ICOGON"
              placeholder="Search anything..."
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIndex(0);

                resultsRef.current?.scrollTo({
                  top: 0,
                });
              }}
              className={`
                h-full min-w-0 flex-1
                bg-transparent
                text-[15px] font-normal
                tracking-[-0.015em]
                outline-none
                sm:text-[16px]
                ${
                  isDark
                    ? "text-white placeholder:text-[#979797]"
                    : "text-slate-900 placeholder:text-slate-400"
                }
              `}
            />

            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className={`
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-lg transition-colors
                  ${
                    isDark
                      ? "text-[#aaa] hover:bg-white/10 hover:text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }
                `}
              >
                <X size={16} />
              </button>
            )}

            <button
              type="button"
              aria-label="Close search"
              onClick={onClose}
              className={`
                ${keyboardClass}
                h-7 shrink-0
                transition-colors
                ${
                  isDark
                    ? "hover:bg-white/10 hover:text-white"
                    : "hover:bg-slate-200"
                }
              `}
            >
              Esc
            </button>
          </header>

          {/* ==========================================
              RESPONSIVE SEARCH BODY
          ========================================== */}

          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* LEFT: SEARCH RESULTS */}

            <div
              ref={resultsRef}
              className={`
                icogon-search-scroll
                min-h-0 min-w-0
                flex-1
                overflow-x-hidden
                overflow-y-auto
                px-2.5 py-4
                sm:px-3
                ${
                  selectedProject
                    ? "md:w-1/2 md:flex-[0_0_50%]"
                    : "w-full"
                }
              `}
            >
              <div className="space-y-5">
                {/* RECENT PROJECTS */}

                {!query.trim() && (
                  <section>
                    <div className={headingClass}>
                      <Clock3 size={14} strokeWidth={1.7} />
                      Recent projects
                    </div>

                    {projectsLoading ? (
                      <div
                        className={`
                          flex items-center gap-2
                          px-3 py-4 text-[13px]
                          ${mutedClass}
                        `}
                      >
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />

                        Loading projects...
                      </div>
                    ) : projectsError ? (
                      <p
                        className={`
                          px-3 py-3 text-[13px]
                          ${mutedClass}
                        `}
                      >
                        {projectsError}
                      </p>
                    ) : projectItems.length ? (
                      <div className="space-y-1">
                        {projectItems.map(renderResult)}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate("/builder");
                        }}
                        className={`
                          flex w-full items-center
                          gap-3 rounded-[9px]
                          px-3 py-3 text-left
                          text-[13px]
                          transition-colors
                          ${
                            isDark
                              ? "text-[#bbb] hover:bg-white/[0.06]"
                              : "text-slate-600 hover:bg-slate-100"
                          }
                        `}
                      >
                        <Plus size={18} />
                        Create your first project
                      </button>
                    )}
                  </section>
                )}

                {/* EMPTY SEARCH STATE */}

                {orderedItems.length === 0 &&
                  query.trim() && (
                    <div
                      className="
                        flex min-h-[300px]
                        flex-col items-center
                        justify-center px-5
                        text-center
                      "
                    >
                      <div
                        className={`
                          flex h-12 w-12
                          items-center justify-center
                          rounded-2xl border
                          ${
                            isDark
                              ? "border-white/10 bg-white/[0.04]"
                              : "border-slate-200 bg-slate-50"
                          }
                        `}
                      >
                        <Search
                          size={21}
                          className={mutedClass}
                        />
                      </div>

                      <p className="mt-4 text-sm font-semibold">
                        No results found
                      </p>

                      <p
                        className={`
                          mt-1 max-w-[280px]
                          text-[13px] leading-relaxed
                          ${mutedClass}
                        `}
                      >
                        Try searching for another project,
                        page, connector or setting.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setSelectedIndex(0);
                          inputRef.current?.focus();
                        }}
                        className="
                          mt-4 text-[13px]
                          font-medium text-[#528bff]
                          hover:underline
                        "
                      >
                        Clear search
                      </button>
                    </div>
                  )}

                {/* NAVIGATION GROUPS */}

                {Object.entries(groupedItems).map(
                  ([category, items]) => {
                    if (
                      !query.trim() &&
                      category === "Recent projects"
                    ) {
                      return null;
                    }

                    return (
                      <section key={category}>
                        <div className={headingClass}>
                          {category}
                        </div>

                        <div className="space-y-1">
                          {items.map(renderResult)}
                        </div>
                      </section>
                    );
                  },
                )}
              </div>
            </div>

            {/* RIGHT: PROJECT PREVIEW */}

            {selectedProject && (
              <SearchPreviewPanel
                project={selectedProject}
                isDark={isDark}
                onOpen={() => {
                  if (selectedItem) {
                    handleSelect(selectedItem);
                  }
                }}
              />
            )}
          </div>

          {/* ==========================================
              FULL WIDTH COMMAND FOOTER
          ========================================== */}

          <footer
            className={`
              flex h-[54px] shrink-0
              items-center gap-3
              border-t px-3 sm:px-4
              ${borderClass}
              ${isDark ? "bg-[#222222]" : "bg-slate-50"}
            `}
          >
            <div
              className={`
                hidden items-center gap-3
                text-[11px] sm:flex
                ${mutedClass}
              `}
            >
              <span className="flex items-center gap-1">
                <kbd className={keyboardClass}>
                  <ArrowUp size={12} />
                </kbd>

                <kbd className={keyboardClass}>
                  <ArrowDown size={12} />
                </kbd>

                <span className="ml-1">Navigate</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className={keyboardClass}>Esc</kbd>

                <span className="ml-1">Close</span>
              </span>
            </div>

            <span
              className={`
                flex items-center gap-1
                text-[11px] ${mutedClass}
              `}
            >
              <Command size={13} />
              K
            </span>

            <div className="ml-auto" />

            {selectedItem && (
              <button
                type="button"
                onClick={() => handleSelect(selectedItem)}
                className={`
                  flex items-center gap-2
                  rounded-lg px-2.5 py-1.5
                  text-[12px] font-medium
                  transition-colors
                  sm:text-[13px]
                  ${
                    isDark
                      ? "text-[#ededed] hover:bg-white/[0.07]"
                      : "text-slate-700 hover:bg-slate-200"
                  }
                `}
              >
                {selectedProject
                  ? "Open project"
                  : selectedItem.type === "theme"
                    ? "Apply theme"
                    : "Open"}

                <kbd className={keyboardClass}>
                  <CornerDownLeft size={13} />
                </kbd>
              </button>
            )}
          </footer>
        </section>
      </div>
    </>,
    document.body,
  );
};

export default GlobalSearch;