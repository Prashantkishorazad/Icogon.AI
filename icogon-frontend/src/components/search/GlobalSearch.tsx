import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  X,
  ExternalLink,
  Clock3,
  Command,
  FolderKanban,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";

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

  const {
    theme,
    setTheme,
    resolvedTheme,
  } = useTheme();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const [projects, setProjects] = useState<
    ProjectResponse[]
  >([]);

  const [projectsLoading, setProjectsLoading] =
    useState(false);

  const [projectsError, setProjectsError] =
    useState<string | null>(null);

  const isDark =
    resolvedTheme === "dark";

  // =====================================================
  // LOAD REAL PROJECTS
  // =====================================================

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadProjects = async () => {
      try {
        setProjectsLoading(true);
        setProjectsError(null);

        const data =
          await getProjectsApi();

        if (!cancelled) {
          setProjects(data);
        }
      } catch (error) {
        console.error(
          "GLOBAL SEARCH PROJECT LOAD ERROR:",
          error
        );

        if (!cancelled) {
          setProjectsError(
            "Unable to load recent projects"
          );
        }
      } finally {
        if (!cancelled) {
          setProjectsLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // =====================================================
  // RESET + FOCUS
  // =====================================================

  useEffect(() => {
    if (!open) return;

    setQuery("");
    setSelectedIndex(0);

    const timer =
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

    return () =>
      window.clearTimeout(timer);
  }, [open]);

  // =====================================================
  // REAL PROJECT SEARCH ITEMS
  // =====================================================

  const projectItems = useMemo<
    SearchItem[]
  >(() => {
    return projects
      .slice(0, 8)
      .map((project) => ({
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
          project.description ||
          project.prompt ||
          "Open this project in the builder",
        project,
      }));
  }, [projects]);

  // =====================================================
  // ALL SEARCH ITEMS
  // =====================================================

const allItems = useMemo<SearchItem[]>(() => {
  return [
    ...projectItems,
    ...searchNavigation,
    ...settingsNavigation,
    ...connectorData,
  ];
}, [projectItems]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredItems = useMemo<
    SearchItem[]
  >(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    if (!normalizedQuery) {
      return allItems;
    }

    return allItems.filter((item) => {
      const searchableText = [
        item.title,
        item.category,
        item.description || "",
        ...(item.keywords || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedQuery
      );
    });
  }, [query, allItems]);

  // =====================================================
  // KEEP SELECTED INDEX VALID
  // =====================================================

  useEffect(() => {
    if (
      selectedIndex >=
      filteredItems.length
    ) {
      setSelectedIndex(
        Math.max(
          filteredItems.length - 1,
          0
        )
      );
    }
  }, [
    filteredItems.length,
    selectedIndex,
  ]);

  // =====================================================
  // GROUP RESULTS
  // =====================================================

  const groupedItems = useMemo(() => {
    const groups: Record<
      string,
      SearchItem[]
    > = {};

    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }

      groups[item.category].push(item);
    });

    return groups;
  }, [filteredItems]);

  // =====================================================
  // SELECT RESULT
  // =====================================================

  const handleSelect = (
    item: SearchItem
  ) => {
    // -------------------------------------------------
    // THEME
    // -------------------------------------------------

    if (item.type === "theme") {
      if (item.id === "theme-light") {
        setTheme("light");
      }

      if (item.id === "theme-dark") {
        setTheme("dark");
      }

      if (item.id === "theme-system") {
        setTheme("system");
      }

      return;
    }

    // -------------------------------------------------
    // PROJECT / NAVIGATION
    // -------------------------------------------------

    if (item.path) {
      onClose();

      navigate(item.path);
    }
  };

  // =====================================================
  // KEYBOARD NAVIGATION
  // =====================================================

  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent
    ) => {
      const isCommand =
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() === "k";

      // -------------------------------------------------
      // CMD K / CTRL K
      // -------------------------------------------------

      if (isCommand) {
        event.preventDefault();

        if (open) {
          onClose();
        }

        return;
      }

      if (!open) return;

      // -------------------------------------------------
      // ESC
      // -------------------------------------------------

      if (event.key === "Escape") {
        event.preventDefault();

        onClose();

        return;
      }

      // -------------------------------------------------
      // ARROW DOWN
      // -------------------------------------------------

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setSelectedIndex(
          (current) =>
            Math.min(
              current + 1,
              Math.max(
                filteredItems.length - 1,
                0
              )
            )
        );

        return;
      }

      // -------------------------------------------------
      // ARROW UP
      // -------------------------------------------------

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSelectedIndex(
          (current) =>
            Math.max(current - 1, 0)
        );

        return;
      }

      // -------------------------------------------------
      // ENTER
      // -------------------------------------------------

      if (event.key === "Enter") {
        event.preventDefault();

        const item =
          filteredItems[selectedIndex];

        if (item) {
          handleSelect(item);
        }
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [
    open,
    filteredItems,
    selectedIndex,
  ]);

  // =====================================================
  // SELECTED ITEM
  // =====================================================

  const selectedItem =
    filteredItems[selectedIndex] ||
    filteredItems[0];

  // =====================================================
  // RECENT PROJECTS
  // =====================================================

  const recentProjectItems =
    projectItems;

  // =====================================================
  // CLOSE
  // =====================================================

  if (!open) {
    return null;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className={`
        fixed
        inset-0
        z-[999]
        flex

        ${
          isDark
            ? "bg-black/80"
            : "bg-slate-900/20"
        }

        backdrop-blur-[2px]
      `}
    >
      {/* =================================================
          MAIN PANEL
      ================================================= */}

      <div
        className={`
          absolute
          left-1/2
          top-1/2
          flex
          h-[min(780px,calc(100vh-48px))]
          w-[min(1180px,calc(100vw-48px))]
          -translate-x-1/2
          -translate-y-1/2
          overflow-hidden
          rounded-2xl
          border
          shadow-[0_30px_100px_rgba(0,0,0,0.25)]

          ${
            isDark
              ? "border-[#292929] bg-[#101010] text-white"
              : "border-slate-200 bg-white text-slate-900"
          }
        `}
      >
        {/* =================================================
            LEFT
        ================================================= */}

        <div
          className={`
            flex
            w-[560px]
            shrink-0
            flex-col
            border-r

            ${
              isDark
                ? "border-[#252525]"
                : "border-slate-200"
            }
          `}
        >
          {/* =================================================
              SEARCH INPUT
          ================================================= */}

          <div
            className={`
              flex
              h-[64px]
              shrink-0
              items-center
              gap-3
              border-b
              px-5

              ${
                isDark
                  ? "border-[#252525]"
                  : "border-slate-200"
              }
            `}
          >
            <Search
              size={20}
              strokeWidth={1.8}
              className={
                isDark
                  ? "text-[#737373]"
                  : "text-slate-400"
              }
            />

            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(
                  event.target.value
                );

                setSelectedIndex(0);
              }}
              placeholder="Search..."
              className={`
                min-w-0
                flex-1
                bg-transparent
                text-[15px]
                outline-none
                placeholder:text-slate-400

                ${
                  isDark
                    ? "text-white placeholder:text-[#666]"
                    : "text-slate-900"
                }
              `}
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedIndex(0);

                  inputRef.current?.focus();
                }}
                className={`
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-md

                  ${
                    isDark
                      ? "text-[#888] hover:bg-[#222] hover:text-white"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }
                `}
              >
                <X size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`
                hidden
                h-7
                items-center
                gap-1
                rounded-md
                border
                px-2
                text-[10px]
                sm:flex

                ${
                  isDark
                    ? "border-[#333] text-[#777]"
                    : "border-slate-200 text-slate-400"
                }
              `}
            >
              ESC
            </button>
          </div>

          {/* =================================================
              RESULTS
          ================================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {filteredItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                <div
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl

                    ${
                      isDark
                        ? "bg-[#1d1d1d] text-[#666]"
                        : "bg-slate-100 text-slate-400"
                    }
                  `}
                >
                  <Search size={18} />
                </div>

                <p
                  className={`
                    mt-3
                    text-sm
                    font-medium

                    ${
                      isDark
                        ? "text-[#aaa]"
                        : "text-slate-600"
                    }
                  `}
                >
                  No results found
                </p>

                <p
                  className={`
                    mt-1
                    text-xs

                    ${
                      isDark
                        ? "text-[#666]"
                        : "text-slate-400"
                    }
                  `}
                >
                  Try another search term
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* =================================================
                    RECENT PROJECTS
                ================================================= */}

                {!query && (
                  <section>
                    <div
                      className={`
                        mb-2
                        flex
                        items-center
                        gap-2
                        px-3
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]

                        ${
                          isDark
                            ? "text-[#666]"
                            : "text-slate-400"
                        }
                      `}
                    >
                      <Clock3 size={12} />
                      Recent projects
                    </div>

                    {projectsLoading ? (
                      <div
                        className={`
                          flex
                          items-center
                          gap-3
                          rounded-lg
                          px-3
                          py-4
                          text-xs

                          ${
                            isDark
                              ? "text-[#777]"
                              : "text-slate-400"
                          }
                        `}
                      >
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />

                        Loading recent projects...
                      </div>
                    ) : projectsError ? (
                      <div
                        className={`
                          rounded-lg
                          px-3
                          py-4
                          text-xs

                          ${
                            isDark
                              ? "bg-[#141414] text-[#777]"
                              : "bg-slate-50 text-slate-400"
                          }
                        `}
                      >
                        {projectsError}
                      </div>
                    ) : recentProjectItems.length ===
                      0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate("/builder");
                        }}
                        className={`
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-lg
                          p-3
                          text-left
                          transition

                          ${
                            isDark
                              ? "bg-[#141414] text-[#aaa] hover:bg-[#202020]"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg

                            ${
                              isDark
                                ? "bg-[#242424]"
                                : "bg-white"
                            }
                          `}
                        >
                          <FolderKanban
                            size={16}
                          />
                        </div>

                        <div>
                          <p className="text-[13px] font-medium">
                            No recent projects
                          </p>

                          <p
                            className={`
                              mt-0.5
                              text-[10px]

                              ${
                                isDark
                                  ? "text-[#666]"
                                  : "text-slate-400"
                              }
                            `}
                          >
                            Create your first project
                          </p>
                        </div>
                      </button>
                    ) : (
                      <div className="space-y-0.5">
                        {recentProjectItems.map(
                          (item) => {
                            const globalIndex =
                              filteredItems.findIndex(
                                (current) =>
                                  current.id ===
                                  item.id
                              );

                            return (
                              <SearchResultItem
                                key={item.id}
                                item={item}
                                selected={
                                  globalIndex ===
                                  selectedIndex
                                }
                                activeTheme={
                                  resolvedTheme
                                }
                                onMouseEnter={() =>
                                  setSelectedIndex(
                                    globalIndex
                                  )
                                }
                                onClick={() =>
                                  handleSelect(
                                    item
                                  )
                                }
                              />
                            );
                          }
                        )}
                      </div>
                    )}
                  </section>
                )}

                {/* =================================================
                    ALL CATEGORIES
                ================================================= */}

                {Object.entries(
                  groupedItems
                ).map(
                  ([category, items]) => {
                    /*
                     * When there is no query,
                     * Recent projects have already
                     * been rendered above.
                     */
                    if (
                      !query &&
                      category ===
                        "Recent projects"
                    ) {
                      return null;
                    }

                    return (
                      <section
                        key={category}
                      >
                        <div
                          className={`
                            mb-2
                            px-3
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.08em]

                            ${
                              isDark
                                ? "text-[#666]"
                                : "text-slate-400"
                            }
                          `}
                        >
                          {category}
                        </div>

                        <div className="space-y-0.5">
                          {items.map(
                            (item) => {
                              const globalIndex =
                                filteredItems.findIndex(
                                  (current) =>
                                    current.id ===
                                    item.id
                                );

                              return (
                                <SearchResultItem
                                  key={item.id}
                                  item={item}
                                  selected={
                                    globalIndex ===
                                    selectedIndex
                                  }
                                  activeTheme={
                                    item.type ===
                                    "theme"
                                      ? theme
                                      : resolvedTheme
                                  }
                                  onMouseEnter={() =>
                                    setSelectedIndex(
                                      globalIndex
                                    )
                                  }
                                  onClick={() =>
                                    handleSelect(
                                      item
                                    )
                                  }
                                />
                              );
                            }
                          )}
                        </div>
                      </section>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className={`
              flex
              h-[48px]
              shrink-0
              items-center
              gap-4
              border-t
              px-4
              text-[10px]

              ${
                isDark
                  ? "border-[#252525] text-[#666]"
                  : "border-slate-200 text-slate-400"
              }
            `}
          >
            <span className="flex items-center gap-1.5">
              <kbd
                className={`
                  rounded
                  border
                  px-1.5
                  py-0.5

                  ${
                    isDark
                      ? "border-[#333]"
                      : "border-slate-200"
                  }
                `}
              >
                ↑
              </kbd>

              <kbd
                className={`
                  rounded
                  border
                  px-1.5
                  py-0.5

                  ${
                    isDark
                      ? "border-[#333]"
                      : "border-slate-200"
                  }
                `}
              >
                ↓
              </kbd>

              Navigate
            </span>

            <span className="flex items-center gap-1.5">
              <kbd
                className={`
                  rounded
                  border
                  px-1.5
                  py-0.5

                  ${
                    isDark
                      ? "border-[#333]"
                      : "border-slate-200"
                  }
                `}
              >
                ↵
              </kbd>

              Open
            </span>

            <span className="flex items-center gap-1.5">
              <kbd
                className={`
                  rounded
                  border
                  px-1.5
                  py-0.5

                  ${
                    isDark
                      ? "border-[#333]"
                      : "border-slate-200"
                  }
                `}
              >
                Esc
              </kbd>

              Close
            </span>
          </div>
        </div>

        {/* =================================================
            RIGHT PREVIEW
        ================================================= */}

        <div
          className={`
            hidden
            min-w-0
            flex-1
            flex-col
            md:flex

            ${
              isDark
                ? "bg-[#0c0c0c]"
                : "bg-[#fafafa]"
            }
          `}
        >
          {/* PREVIEW HEADER */}

          <div
            className={`
              flex
              h-[64px]
              shrink-0
              items-center
              justify-between
              border-b
              px-6

              ${
                isDark
                  ? "border-[#252525]"
                  : "border-slate-200"
              }
            `}
          >
            <div
              className={`
                text-[11px]
                font-medium

                ${
                  isDark
                    ? "text-[#666]"
                    : "text-slate-400"
                }
              `}
            >
              Preview
            </div>

            <Command
              size={15}
              className={
                isDark
                  ? "text-[#444]"
                  : "text-slate-300"
              }
            />
          </div>

          {/* PREVIEW CONTENT */}

          <div className="flex flex-1 items-center justify-center overflow-y-auto p-10">
            {selectedItem ? (
              <div className="w-full max-w-[420px]">
                {/* ICON */}

                <div
                  className={`
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    border

                    ${
                      isDark
                        ? "border-[#333] bg-[#1b1b1b]"
                        : "border-slate-200 bg-white"
                    }
                  `}
                >
                  {React.createElement(
                    selectedItem.icon,
                    {
                      size: 27,
                      strokeWidth: 1.6,
                      className:
                        isDark
                          ? "text-[#aaa]"
                          : "text-slate-600",
                    }
                  )}
                </div>

                {/* TITLE */}

                <p
                  className={`
                    mt-6
                    text-2xl
                    font-semibold
                    tracking-tight

                    ${
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }
                  `}
                >
                  {selectedItem.title}
                </p>

                {/* DESCRIPTION */}

                <p
                  className={`
                    mt-2
                    text-sm

                    ${
                      isDark
                        ? "text-[#777]"
                        : "text-slate-500"
                    }
                  `}
                >
                  {selectedItem.description ||
                    `Open ${selectedItem.title}`}
                </p>

                {/* PROJECT DETAILS */}

                {selectedItem.project && (
                  <div
                    className={`
                      mt-6
                      space-y-4
                      rounded-xl
                      border
                      p-4

                      ${
                        isDark
                          ? "border-[#292929] bg-[#141414]"
                          : "border-slate-200 bg-white"
                      }
                    `}
                  >
                    <div>
                      <p
                        className={`
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.08em]

                          ${
                            isDark
                              ? "text-[#666]"
                              : "text-slate-400"
                          }
                        `}
                      >
                        Project
                      </p>

                      <p
                        className={`
                          mt-1
                          text-sm
                          font-medium

                          ${
                            isDark
                              ? "text-[#ddd]"
                              : "text-slate-800"
                          }
                        `}
                      >
                        {
                          selectedItem.project
                            .name
                        }
                      </p>
                    </div>

                    {selectedItem
                      .project
                      .description && (
                      <div>
                        <p
                          className={`
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.08em]

                            ${
                              isDark
                                ? "text-[#666]"
                                : "text-slate-400"
                            }
                          `}
                        >
                          Description
                        </p>

                        <p
                          className={`
                            mt-1
                            line-clamp-3
                            text-xs
                            leading-relaxed

                            ${
                              isDark
                                ? "text-[#999]"
                                : "text-slate-500"
                            }
                          `}
                        >
                          {
                            selectedItem
                              .project
                              .description
                          }
                        </p>
                      </div>
                    )}

                    <div>
                      <p
                        className={`
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.08em]

                          ${
                            isDark
                              ? "text-[#666]"
                              : "text-slate-400"
                          }
                        `}
                      >
                        Category
                      </p>

                      <p
                        className={`
                          mt-1
                          text-sm

                          ${
                            isDark
                              ? "text-[#ccc]"
                              : "text-slate-700"
                          }
                        `}
                      >
                        Recent projects
                      </p>
                    </div>
                  </div>
                )}

                {/* NORMAL CATEGORY */}

                {!selectedItem.project && (
                  <div
                    className={`
                      mt-6
                      rounded-xl
                      border
                      p-4

                      ${
                        isDark
                          ? "border-[#292929] bg-[#141414]"
                          : "border-slate-200 bg-white"
                      }
                    `}
                  >
                    <p
                      className={`
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]

                        ${
                          isDark
                            ? "text-[#666]"
                            : "text-slate-400"
                        }
                      `}
                    >
                      Category
                    </p>

                    <p
                      className={`
                        mt-1
                        text-sm

                        ${
                          isDark
                            ? "text-[#ccc]"
                            : "text-slate-700"
                        }
                      `}
                    >
                      {selectedItem.category}
                    </p>
                  </div>
                )}

                {/* OPEN BUTTON */}

                {selectedItem.path && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSelect(
                        selectedItem
                      )
                    }
                    className={`
                      mt-4
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      transition

                      ${
                        isDark
                          ? "bg-white text-black hover:bg-[#ddd]"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }
                    `}
                  >
                    {selectedItem.project
                      ? "Open project"
                      : "Open"}

                    <ExternalLink
                      size={14}
                    />
                  </button>
                )}
              </div>
            ) : (
              <p
                className={`
                  text-sm

                  ${
                    isDark
                      ? "text-[#555]"
                      : "text-slate-400"
                  }
                `}
              >
                Select something to preview
              </p>
            )}
          </div>
        </div>

        {/* =================================================
            MOBILE CLOSE
        ================================================= */}

        <button
          type="button"
          onClick={onClose}
          className={`
            absolute
            right-4
            top-4
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            md:hidden

            ${
              isDark
                ? "text-[#777] hover:bg-[#222]"
                : "text-slate-400 hover:bg-slate-100"
            }
          `}
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
};

export default GlobalSearch;