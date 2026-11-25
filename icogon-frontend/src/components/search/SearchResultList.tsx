
import React, { useMemo } from "react";

import {
  Clock3,
  FolderKanban,
  Loader2,
  Search,
  Plus,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

import SearchResultItem from "./SearchResultItem";

import type { SearchNavigationItem } from "../../data/searchNavigation";

/* =========================================================
   TYPES
========================================================= */

export type SearchResult = SearchNavigationItem & {
  project?: {
    id: string;
    name: string;
    description?: string | null;
    prompt?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    user_id?: string | null;
    owner_name?: string | null;
    status?: string | null;
    visibility?: string | null;
    last_opened_at?: string | null;
    is_public?: boolean | null;
  };
};

interface Props<T extends SearchResult> {
  items: T[];
  recentItems: T[];
  query: string;
  selectedIndex: number;
  isDark: boolean;
  activeTheme: string;
  loading: boolean;
  error: string | null;
  onSelect: (item: T) => void;
  onHover: (index: number) => void;
  onCreateProject: () => void;
  onClearSearch?: () => void;
}

/* =========================================================
   CATEGORY HEADING
========================================================= */

interface CategoryHeadingProps {
  title: string;
  count?: number;
  isDark: boolean;
  icon?: React.ReactNode;
}

const CategoryHeading: React.FC<CategoryHeadingProps> = ({
  title,
  count,
  isDark,
  icon,
}) => (
  <div
    className={`
      mb-2 flex items-center gap-2 px-3
      text-[12px] font-medium
      tracking-[-0.01em]
      ${isDark ? "text-[#a3a3a3]" : "text-slate-500"}
    `}
  >
    {icon}

    <span>{title}</span>

    {typeof count === "number" && (
      <span
        className={`
          ml-auto text-[11px] tabular-nums
          ${isDark ? "text-[#858585]" : "text-slate-400"}
        `}
      >
        {count}
      </span>
    )}
  </div>
);

/* =========================================================
   LOADING SKELETON
========================================================= */

const LoadingSkeleton: React.FC<{
  isDark: boolean;
}> = ({ isDark }) => {
  const skeleton = isDark
    ? "bg-white/[0.07]"
    : "bg-slate-200";

  return (
    <div
      role="status"
      aria-label="Loading projects"
      className="
        space-y-1
        motion-safe:animate-pulse
      "
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="
            flex h-12 w-full
            items-center gap-3
            rounded-[10px] px-3
          "
        >
          <div
            className={`
              h-7 w-7 shrink-0 rounded-lg
              ${skeleton}
            `}
          />

          <div
            className={`
              h-3 rounded-md
              ${skeleton}
            `}
            style={{
              width: `${72 - index * 14}%`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

function SearchResultList<T extends SearchResult>({
  items,
  recentItems,
  query,
  selectedIndex,
  isDark,
  activeTheme,
  loading,
  error,
  onSelect,
  onHover,
  onCreateProject,
  onClearSearch,
}: Props<T>) {
  const hasQuery = Boolean(query.trim());

  /* =======================================================
     THEME
  ======================================================= */

  const colors = isDark
    ? {
        text: "text-[#ededed]",
        muted: "text-[#a3a3a3]",
        subtle: "text-[#858585]",
        border: "border-white/[0.08]",
        surface: "bg-white/[0.035]",
        hover: "hover:bg-white/[0.06]",
        icon: "text-[#a3a3a3]",
        accent: "text-[#60a5fa]",
        error: "text-[#fca5a5]",
      }
    : {
        text: "text-slate-900",
        muted: "text-slate-500",
        subtle: "text-slate-400",
        border: "border-slate-200",
        surface: "bg-slate-50",
        hover: "hover:bg-slate-100",
        icon: "text-slate-400",
        accent: "text-[#2563eb]",
        error: "text-red-600",
      };

  /* =======================================================
     RESULT INDEX MAP
     Preserve keyboard selection order from GlobalSearch.
  ======================================================= */

  const itemIndexes = useMemo(
    () =>
      new Map(
        items.map((item, index) => [
          item.id,
          index,
        ] as const),
      ),
    [items],
  );

  /* =======================================================
     GROUP RESULTS
     Prevent duplicate recent projects.
  ======================================================= */

  const groups = useMemo(() => {
    const result = new Map<string, T[]>();

    const recentIds = new Set(
      recentItems.map((item) => item.id),
    );

    items.forEach((item) => {
      if (
        !hasQuery &&
        (item.project || recentIds.has(item.id))
      ) {
        return;
      }

      const category =
        item.category || "Other";

      const existing = result.get(category);

      if (existing) {
        existing.push(item);
      } else {
        result.set(category, [item]);
      }
    });

    return Array.from(result.entries());
  }, [items, recentItems, hasQuery]);

  /* =======================================================
     RENDER INDIVIDUAL RESULT
  ======================================================= */

  const renderResult = (item: T) => {
    const index = itemIndexes.get(item.id);

    if (index === undefined) {
      return null;
    }

    const selected = index === selectedIndex;

    return (
      <div
        key={item.id}
        id={`icogon-search-${item.id}`}
        onFocusCapture={() => onHover(index)}
        className={`
          icogon-search-result
          min-w-0
          overflow-hidden
          rounded-[10px]
          ${selected ? "is-selected" : ""}
        `}
      >
        <SearchResultItem
          item={item}
          isProject={Boolean(item.project)}
          selected={selected}
          activeTheme={activeTheme}
          onMouseEnter={() => {
            onHover(index);
          }}
          onClick={() => {
            onSelect(item);
          }}
        />
      </div>
    );
  };

  /* =======================================================
     EMPTY SEARCH STATE
  ======================================================= */

  if (!items.length && hasQuery) {
    return (
      <div
        className="
          flex min-h-[300px]
          flex-col items-center
          justify-center
          px-6 py-12 text-center
        "
      >
        <div
          className={`
            flex h-14 w-14
            items-center justify-center
            rounded-2xl border
            ${colors.border}
            ${colors.surface}
          `}
        >
          {loading ? (
            <Loader2
              size={23}
              className={`
                animate-spin
                ${colors.accent}
              `}
            />
          ) : (
            <Search
              size={23}
              strokeWidth={1.6}
              className={colors.icon}
            />
          )}
        </div>

        <h3
          className={`
            mt-4
            text-[15px]
            font-semibold
            tracking-tight
            ${colors.text}
          `}
        >
          {loading
            ? "Searching projects..."
            : "No results found"}
        </h3>

        <p
          className={`
            mt-2 max-w-[280px]
            break-words
            text-[13px]
            leading-relaxed
            ${colors.muted}
          `}
        >
          {loading
            ? "Loading your available projects."
            : `We couldn't find anything matching "${query}". Try another search term.`}
        </p>

        {error && (
          <p
            role="alert"
            className={`
              mt-3 text-xs
              ${colors.error}
            `}
          >
            {error}
          </p>
        )}

        {!loading && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className={`
              mt-5 cursor-pointer
              rounded-lg border
              px-4 py-2
              text-[13px] font-medium
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#3978ff]
              ${colors.border}
              ${colors.surface}
              ${colors.hover}
              ${colors.text}
            `}
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <div
      className="
        min-w-0
        space-y-5
        px-2.5 py-4
        sm:px-3
      "
    >
      {/* =================================================
          RECENT PROJECTS
      ================================================= */}

      {!hasQuery && (
        <section aria-label="Recent projects">
          <CategoryHeading
            title="Recent projects"
            count={
              loading
                ? undefined
                : recentItems.length
            }
            icon={
              <Clock3
                size={14}
                strokeWidth={1.7}
              />
            }
            isDark={isDark}
          />

          {loading && !recentItems.length ? (
            <LoadingSkeleton isDark={isDark} />
          ) : recentItems.length > 0 ? (
            <div className="space-y-1">
              {recentItems.map(renderResult)}
            </div>
          ) : !error ? (
            /* ===========================================
               NO PROJECTS
            =========================================== */

            <button
              type="button"
              onClick={onCreateProject}
              className={`
                group flex w-full
                cursor-pointer items-center
                gap-3 rounded-[12px]
                border p-3
                text-left
                transition-colors
                duration-150
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#3978ff]
                ${colors.border}
                ${colors.surface}
                ${colors.hover}
              `}
            >
              <span
                className={`
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl border
                  ${colors.border}
                  ${colors.accent}
                `}
              >
                <FolderKanban
                  size={19}
                  strokeWidth={1.7}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`
                    block text-[13px]
                    font-semibold
                    ${colors.text}
                  `}
                >
                  Create your first project
                </span>

                <span
                  className={`
                    mt-1 block
                    text-[12px]
                    leading-relaxed
                    ${colors.muted}
                  `}
                >
                  Turn your next idea into reality.
                </span>
              </span>

              <Plus
                size={17}
                className={`
                  shrink-0
                  ${colors.icon}
                `}
              />
            </button>
          ) : null}

          {error && (
            <div
              role="alert"
              className={`
                mt-2 flex items-start
                gap-2 rounded-lg
                border px-3 py-3
                text-[12px]
                leading-relaxed
                ${colors.border}
                ${colors.error}
              `}
            >
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0"
              />

              {error}
            </div>
          )}
        </section>
      )}

      {/* =================================================
          SEARCH RESULTS COUNT
      ================================================= */}

      {hasQuery && (
        <div
          role="status"
          className={`
            flex items-center
            justify-between
            px-3
            text-[12px]
            ${colors.muted}
          `}
        >
          <span>
            {items.length}{" "}
            {items.length === 1
              ? "result"
              : "results"}
          </span>

          {loading && (
            <Loader2
              size={13}
              className="animate-spin"
            />
          )}
        </div>
      )}

      {/* =================================================
          CATEGORY GROUPS
      ================================================= */}

      {groups.map(([category, rows]) => (
        <section
          key={category}
          aria-label={category}
        >
          <CategoryHeading
            title={category}
            count={rows.length}
            isDark={isDark}
          />

          <div className="space-y-1">
            {rows.map(renderResult)}
          </div>
        </section>
      ))}

      {/* =================================================
          QUICK CREATE ACTION
      ================================================= */}

      {!hasQuery && recentItems.length > 0 && (
        <div
          className={`
            border-t pt-3
            ${colors.border}
          `}
        >
          <button
            type="button"
            onClick={onCreateProject}
            className={`
              flex h-11 w-full
              cursor-pointer items-center
              gap-3 rounded-[10px]
              px-3 text-left
              text-[13px] font-medium
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#3978ff]
              ${colors.muted}
              ${colors.hover}
            `}
          >
            <Plus
              size={18}
              strokeWidth={1.7}
              className={colors.accent}
            />

            <span className="flex-1">
              Start a new project
            </span>

            <ArrowUpRight
              size={14}
              className={colors.subtle}
            />
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchResultList;
