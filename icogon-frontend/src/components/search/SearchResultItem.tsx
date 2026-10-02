import React from "react";
import {
  ArrowUpRight,
  Check,
} from "lucide-react";

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

  const isDark =
    activeTheme === "dark";

  const isThemeSelected =
    item.type === "theme" &&
    activeTheme ===
      item.title.toLowerCase();

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
        gap-2.5
        rounded-lg
        px-2.5
        py-2
        text-left
        transition-colors
        duration-100
        outline-none

        ${
          selected
            ? isDark
              ? "bg-[#242424] text-white"
              : "bg-slate-100 text-slate-900"
            : isDark
              ? "text-[#d0d0d0] hover:bg-[#191919]"
              : "text-slate-700 hover:bg-slate-50"
        }
      `}
    >
      {/* =================================================
          ICON
      ================================================= */}

      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          transition-colors

          ${
            selected
              ? isDark
                ? "bg-[#303030]"
                : "bg-white shadow-sm"
              : isDark
                ? "bg-[#1d1d1d] group-hover:bg-[#242424]"
                : "bg-slate-100 group-hover:bg-white"
          }
        `}
      >
        <Icon
          size={15}
          strokeWidth={1.8}
          className={
            selected
              ? isDark
                ? "text-white"
                : "text-slate-700"
              : isDark
                ? "text-[#929292]"
                : "text-slate-500"
          }
        />
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={`
              min-w-0
              truncate
              text-[12px]
              font-medium
              leading-5

              ${
                selected
                  ? isDark
                    ? "text-white"
                    : "text-slate-900"
                  : isDark
                    ? "text-[#d0d0d0]"
                    : "text-slate-700"
              }
            `}
          >
            {item.title}
          </span>

          {/* CONNECTOR CATEGORY */}

          {item.type === "connector" && (
            <span
              className={`
                shrink-0
                truncate
                text-[9px]
                leading-4

                ${
                  selected
                    ? isDark
                      ? "text-[#777]"
                      : "text-slate-400"
                    : isDark
                      ? "text-[#666]"
                      : "text-slate-400"
                }
              `}
            >
              {item.category}
            </span>
          )}
        </div>

        {/* DESCRIPTION */}

        {item.description && (
          <p
            className={`
              mt-0.5
              truncate
              text-[10px]
              leading-4

              ${
                selected
                  ? isDark
                    ? "text-[#777]"
                    : "text-slate-400"
                  : isDark
                    ? "text-[#666]"
                    : "text-slate-400"
              }
            `}
          >
            {item.description}
          </p>
        )}
      </div>

      {/* =================================================
          THEME CHECK
      ================================================= */}

      {isThemeSelected && (
        <div
          className={`
            flex
            h-5
            w-5
            shrink-0
            items-center
            justify-center
            rounded-md

            ${
              selected
                ? isDark
                  ? "bg-[#303030]"
                  : "bg-white"
                : "bg-transparent"
            }
          `}
        >
          <Check
            size={13}
            strokeWidth={2}
            className={
              isDark
                ? "text-[#aaa]"
                : "text-slate-500"
            }
          />
        </div>
      )}

      {/* =================================================
          NAVIGATION ARROW
      ================================================= */}

      {selected &&
        item.path &&
        item.type !== "theme" && (
          <ArrowUpRight
            size={14}
            strokeWidth={1.7}
            className={`
              shrink-0
              opacity-50
              transition-opacity
              group-hover:opacity-80

              ${
                isDark
                  ? "text-[#aaa]"
                  : "text-slate-500"
              }
            `}
          />
        )}
    </button>
  );
};

export default SearchResultItem;