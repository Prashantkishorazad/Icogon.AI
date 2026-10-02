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

  /* =====================================================
     LOAD PROJECTS
  ===================================================== */

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

  /* =====================================================
     RESET + FOCUS
  ===================================================== */

  useEffect(() => {
    if (!open) return;

    setQuery("");
    setSelectedIndex(0);

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  /* =====================================================
     PROJECT SEARCH ITEMS
  ===================================================== */

  const projectItems = useMemo<SearchItem[]>(() => {
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

  /* =====================================================
     ALL ITEMS
  ===================================================== */

  const allItems = useMemo<SearchItem[]>(() => {
    return [
      ...projectItems,
      ...searchNavigation,
      ...settingsNavigation,
      ...connectorData,
    ];
  }, [projectItems]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredItems = useMemo<SearchItem[]>(() => {
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

  /* =====================================================
     KEEP INDEX VALID
  ===================================================== */

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

  /* =====================================================
     GROUP
  ===================================================== */

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

  /* =====================================================
     SELECT
  ===================================================== */

  const handleSelect = (
    item: SearchItem
  ) => {
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

    if (item.path) {
      onClose();
      navigate(item.path);
    }
  };

  /* =====================================================
     KEYBOARD
  ===================================================== */

  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent
    ) => {
      const isCommand =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k";

      if (isCommand) {
        event.preventDefault();

        if (open) {
          onClose();
        }

        return;
      }

      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setSelectedIndex((current) =>
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

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSelectedIndex((current) =>
          Math.max(current - 1, 0)
        );

        return;
      }

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

  /* =====================================================
     SELECTED
  ===================================================== */

  const selectedItem =
    filteredItems[selectedIndex] ||
    filteredItems[0];

  const recentProjectItems =
    projectItems;

  if (!open) {
    return null;
  }

  return (
    <div
      className={`
        fixed
        inset-0
        z-[999]
        flex
        items-start
        justify-center
        px-4
        pt-[72px]
        sm:pt-[90px]

        ${
          isDark
            ? "bg-black/55"
            : "bg-slate-900/15"
        }

        backdrop-blur-[3px]
      `}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {/* =================================================
          SEARCH PANEL
      ================================================= */}

      <div
        className={`
          flex
          w-full
          max-w-[760px]
          overflow-hidden
          rounded-2xl
          border
          shadow-[0_24px_80px_rgba(0,0,0,0.20)]
          transition

          ${
            isDark
              ? "border-[#292929] bg-[#111111] text-white"
              : "border-slate-200 bg-white text-slate-900"
          }
        `}
      >
        {/* =================================================
            MAIN SEARCH
        ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* SEARCH HEADER */}

          <div
            className={`
              flex
              h-[58px]
              shrink-0
              items-center
              gap-3
              border-b
              px-4

              ${
                isDark
                  ? "border-[#242424]"
                  : "border-slate-200"
              }
            `}
          >
            <Search
              size={18}
              strokeWidth={1.8}
              className={
                isDark
                  ? "text-[#777]"
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
              placeholder="Search anything..."
              className={`
                min-w-0
                flex-1
                bg-transparent
                text-[14px]
                outline-none

                ${
                  isDark
                    ? "text-white placeholder:text-[#666]"
                    : "text-slate-900 placeholder:text-slate-400"
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
                      ? "text-[#777] hover:bg-[#222] hover:text-white"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }
                `}
              >
                <X size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`
                flex
                h-6
                items-center
                gap-1
                rounded-md
                border
                px-1.5
                text-[9px]
                font-medium

                ${
                  isDark
                    ? "border-[#333] text-[#666] hover:text-[#aaa]"
                    : "border-slate-200 text-slate-400 hover:text-slate-600"
                }
              `}
            >
              ESC
            </button>
          </div>

          {/* =================================================
              RESULTS
          ================================================= */}

          <div className="max-h-[min(560px,calc(100vh-190px))] min-h-[240px] overflow-y-auto p-2.5">
            {filteredItems.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center">
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
                  <Search size={17} />
                </div>

                <p
                  className={`
                    mt-3
                    text-[13px]
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
                    text-[11px]

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
              <div className="space-y-4">
                {/* =================================================
                    RECENT PROJECTS
                ================================================= */}

                {!query && (
                  <section>
                    <div
                      className={`
                        mb-1.5
                        flex
                        items-center
                        gap-1.5
                        px-2.5
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.09em]

                        ${
                          isDark
                            ? "text-[#666]"
                            : "text-slate-400"
                        }
                      `}
                    >
                      <Clock3 size={11} />
                      Recent projects
                    </div>

                    {projectsLoading ? (
                      <div
                        className={`
                          flex
                          items-center
                          gap-2.5
                          rounded-lg
                          px-2.5
                          py-3
                          text-[11px]

                          ${
                            isDark
                              ? "text-[#777]"
                              : "text-slate-400"
                          }
                        `}
                      >
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />

                        Loading projects...
                      </div>
                    ) : projectsError ? (
                      <div
                        className={`
                          rounded-lg
                          px-2.5
                          py-3
                          text-[11px]

                          ${
                            isDark
                              ? "bg-[#151515] text-[#777]"
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
                          gap-2.5
                          rounded-lg
                          p-2.5
                          text-left
                          transition

                          ${
                            isDark
                              ? "hover:bg-[#1d1d1d]"
                              : "hover:bg-slate-50"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg

                            ${
                              isDark
                                ? "bg-[#202020] text-[#888]"
                                : "bg-slate-100 text-slate-500"
                            }
                          `}
                        >
                          <FolderKanban
                            size={15}
                          />
                        </div>

                        <div>
                          <p className="text-[12px] font-medium">
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
                    CATEGORIES
                ================================================= */}

                {Object.entries(
                  groupedItems
                ).map(
                  ([category, items]) => {
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
                            mb-1.5
                            px-2.5
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[0.09em]

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
              h-[42px]
              shrink-0
              items-center
              gap-3
              border-t
              px-3
              text-[9px]

              ${
                isDark
                  ? "border-[#242424] text-[#666]"
                  : "border-slate-200 text-slate-400"
              }
            `}
          >
            <span className="flex items-center gap-1">
              <kbd
                className={`
                  rounded
                  border
                  px-1
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
                  px-1
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

            <span className="flex items-center gap-1">
              <kbd
                className={`
                  rounded
                  border
                  px-1
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

            <span className="ml-auto flex items-center gap-1">
              <Command size={10} />

              K
            </span>
          </div>
        </div>

        {/* =================================================
            RIGHT PREVIEW
        ================================================= */}

        <div
          className={`
            hidden
            w-[300px]
            shrink-0
            flex-col
            border-l
            md:flex

            ${
              isDark
                ? "border-[#242424] bg-[#0c0c0c]"
                : "border-slate-200 bg-slate-50/70"
            }
          `}
        >
          {/* PREVIEW HEADER */}

          <div
            className={`
              flex
              h-[58px]
              shrink-0
              items-center
              justify-between
              border-b
              px-4

              ${
                isDark
                  ? "border-[#242424]"
                  : "border-slate-200"
              }
            `}
          >
            <span
              className={`
                text-[10px]
                font-medium

                ${
                  isDark
                    ? "text-[#666]"
                    : "text-slate-400"
                }
              `}
            >
              Preview
            </span>

            <Command
              size={13}
              className={
                isDark
                  ? "text-[#444]"
                  : "text-slate-300"
              }
            />
          </div>

          {/* PREVIEW CONTENT */}

          <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            {selectedItem ? (
              <div className="w-full">
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    border

                    ${
                      isDark
                        ? "border-[#303030] bg-[#191919]"
                        : "border-slate-200 bg-white"
                    }
                  `}
                >
                  {React.createElement(
                    selectedItem.icon,
                    {
                      size: 21,
                      strokeWidth: 1.7,
                      className:
                        isDark
                          ? "text-[#aaa]"
                          : "text-slate-600",
                    }
                  )}
                </div>

                <p
                  className={`
                    mt-4
                    text-lg
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

                <p
                  className={`
                    mt-1.5
                    text-xs
                    leading-relaxed

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

                {selectedItem.project && (
                  <div
                    className={`
                      mt-5
                      space-y-3
                      rounded-xl
                      border
                      p-3

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
                          text-[9px]
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
                          truncate
                          text-xs
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

                    {selectedItem.project.description && (
                      <div>
                        <p
                          className={`
                            text-[9px]
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
                            text-[11px]
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
                          text-[9px]
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
                          text-[11px]

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

                {!selectedItem.project && (
                  <div
                    className={`
                      mt-5
                      rounded-xl
                      border
                      p-3

                      ${
                        isDark
                          ? "border-[#292929] bg-[#141414]"
                          : "border-slate-200 bg-white"
                      }
                    `}
                  >
                    <p
                      className={`
                        text-[9px]
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
                        text-xs

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

                {selectedItem.path && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSelect(
                        selectedItem
                      )
                    }
                    className={`
                      mt-3
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      px-3
                      py-2
                      text-xs
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
                      size={12}
                    />
                  </button>
                )}
              </div>
            ) : (
              <p
                className={`
                  text-xs

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

        {/* MOBILE CLOSE */}

        <button
          type="button"
          onClick={onClose}
          className={`
            absolute
            right-3
            top-3
            flex
            h-7
            w-7
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
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default GlobalSearch;