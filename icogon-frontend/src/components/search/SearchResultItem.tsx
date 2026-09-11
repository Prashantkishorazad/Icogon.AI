import React from "react";
import { ArrowUpRight, Check } from "lucide-react";
import type { SearchNavigationItem } from "../../data/searchNavigation";

interface SearchResultItemProps {
  item: SearchNavigationItem;
  selected: boolean;
  activeTheme?: string;
  onClick: () => void;
  onMouseEnter: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  selected,
  activeTheme,
  onClick,
  onMouseEnter,
}) => {
  const Icon = item.icon;

  const isDark = activeTheme === "dark";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        group
        flex
        w-full
        items-center
        gap-3
        rounded-lg
        px-3
        py-2.5
        text-left
        transition-all
        duration-100

        ${
          selected
            ? isDark
              ? "bg-[#d9b45a] text-black"
              : "bg-[#eef4ff] text-slate-900"
            : isDark
              ? "text-[#d4d4d4] hover:bg-[#1d1d1d]"
              : "text-slate-700 hover:bg-slate-100"
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
            selected
              ? isDark
                ? "bg-black/10"
                : "bg-white"
              : isDark
                ? "bg-[#242424]"
                : "bg-slate-100"
          }
        `}
      >
        <Icon
          size={16}
          strokeWidth={1.8}
          className={
            selected
              ? isDark
                ? "text-black"
                : "text-slate-800"
              : isDark
                ? "text-[#a3a3a3]"
                : "text-slate-500"
          }
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium">
            {item.title}
          </span>

          {item.type === "connector" && (
            <span
              className={`
                shrink-0
                text-[10px]
                ${
                  selected
                    ? isDark
                      ? "text-black/60"
                      : "text-slate-400"
                    : isDark
                      ? "text-[#737373]"
                      : "text-slate-400"
                }
              `}
            >
              {item.category}
            </span>
          )}
        </div>

        {item.description && (
          <p
            className={`
              mt-0.5
              truncate
              text-[10px]
              ${
                selected
                  ? isDark
                    ? "text-black/60"
                    : "text-slate-500"
                  : isDark
                    ? "text-[#737373]"
                    : "text-slate-400"
              }
            `}
          >
            {item.description}
          </p>
        )}
      </div>

      {item.type === "theme" && activeTheme === item.title.toLowerCase() && (
        <Check
          size={16}
          className="shrink-0"
        />
      )}

      {selected && item.path && item.type !== "theme" && (
        <ArrowUpRight
          size={15}
          className="shrink-0 opacity-60"
        />
      )}
    </button>
  );
};

export default SearchResultItem;