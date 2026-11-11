import React from "react";
import {
  Clock3,
  FolderKanban,
  Loader2,
  Search,
} from "lucide-react";
import SearchResultItem from "./SearchResultItem";
import type { SearchNavigationItem } from "../../data/searchNavigation";

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

interface Props {
  items: SearchResult[];
  recentItems: SearchResult[];
  query: string;
  selectedIndex: number;
  isDark: boolean;
  activeTheme: string;
  loading: boolean;
  error: string | null;
  onSelect: (item: SearchResult) => void;
  onHover: (index: number) => void;
  onCreateProject: () => void;
}

const SearchResultList: React.FC<Props> = ({
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
}) => {
  const hasQuery = Boolean(query.trim());

  // On the empty search state, projects are shown only in the
  // Recent projects section. This avoids displaying them twice.
  const groupedItems = hasQuery
    ? items
    : items.filter((item) => !item.project);

  const groups = groupedItems.reduce<Record<string, SearchResult[]>>(
    (acc, item) => {
      (acc[item.category] ||= []).push(item);
      return acc;
    },
    {}
  );

  const heading = `
    mb-2 flex items-center gap-1.5 px-2.5
    text-[10px] font-semibold uppercase tracking-[0.09em]
    ${isDark ? "text-[#777]" : "text-slate-400"}
  `;

  if (!items.length && hasQuery) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-5 py-12">
        <div
          className={`
            flex h-11 w-11 items-center justify-center rounded-xl
            ${isDark
              ? "bg-[#1d1d1d] text-[#777]"
              : "bg-slate-100 text-slate-400"}
          `}
        >
          <Search size={18} />
        </div>
        <p
          className={`mt-3 text-[13px] font-medium ${
            isDark ? "text-[#aaa]" : "text-slate-600"
          }`}
        >
          No results found
        </p>
        <p
          className={`mt-1 text-[11px] ${
            isDark ? "text-[#777]" : "text-slate-400"
          }`}
        >
          Try another search term
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-2.5 py-3">
      {!hasQuery && (
        <section>
          <div className={heading}>
            <Clock3 size={12} />
            Recent projects
          </div>

          {loading ? (
            <div
              className={`
                flex items-center gap-2.5 rounded-lg px-2.5 py-4 text-[12px]
                ${isDark ? "text-[#777]" : "text-slate-400"}
              `}
            >
              <Loader2 size={14} className="animate-spin" />
              Loading projects...
            </div>
          ) : error ? (
            <div
              className={`
                rounded-lg px-2.5 py-3 text-[11px]
                ${isDark
                  ? "bg-[#151515] text-[#999]"
                  : "bg-slate-50 text-slate-500"}
              `}
            >
              {error}
            </div>
          ) : recentItems.length ? (
            <div className="space-y-1">
              {recentItems.map((item) => {
                const index = items.findIndex((row) => row.id === item.id);

                return (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    selected={index === selectedIndex}
                    activeTheme={activeTheme}
                    resolvedTheme={isDark ? "dark" : "light"}
                    onMouseEnter={() => onHover(index)}
                    onClick={() => onSelect(item)}
                  />
                );
              })}
            </div>
          ) : (
            <button
              type="button"
              onClick={onCreateProject}
              className={`
                flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition
                ${isDark ? "hover:bg-[#1d1d1d]" : "hover:bg-slate-50"}
              `}
            >
              <span
                className={`
                  flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                  ${isDark
                    ? "bg-[#202020] text-[#888]"
                    : "bg-slate-100 text-slate-500"}
                `}
              >
                <FolderKanban size={16} />
              </span>
              <span>
                <span className="block text-[12px] font-medium">
                  No recent projects
                </span>
                <span
                  className={`mt-0.5 block text-[11px] ${
                    isDark ? "text-[#777]" : "text-slate-400"
                  }`}
                >
                  Create your first project
                </span>
              </span>
            </button>
          )}
        </section>
      )}

      {Object.entries(groups).map(([category, rows]) => (
        <section key={category}>
          <div className={heading}>{category}</div>
          <div className="space-y-1">
            {rows.map((item) => {
              const index = items.findIndex((row) => row.id === item.id);

              return (
                <SearchResultItem
                  key={item.id}
                  item={item}
                  selected={index === selectedIndex}
                  activeTheme={activeTheme}
                  resolvedTheme={isDark ? "dark" : "light"}
                  onMouseEnter={() => onHover(index)}
                  onClick={() => onSelect(item)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default SearchResultList;
