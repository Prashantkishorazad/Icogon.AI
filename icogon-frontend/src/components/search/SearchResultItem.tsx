
import React from "react";

import {
  ArrowUpRight,
  Check,
  Diamond,
  CornerDownLeft,
} from "lucide-react";

import type { SearchNavigationItem } from "../../data/searchNavigation";
import { useTheme } from "../context/ThemeContext";

/* =========================================================
   TYPES
========================================================= */

interface SearchResultItemProps {
  item: SearchNavigationItem;
  selected: boolean;
  activeTheme?: string;
  isProject?: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

/* =========================================================
   CONNECTOR BRAND COLORS
========================================================= */

const connectorColors: Record<string, string> = {
  github: "text-current",
  gmail: "text-[#EA4335]",
  "google-calendar": "text-[#4285F4]",
  "google-analytics": "text-[#F59E0B]",
  slack: "text-[#C084FC]",
  stripe: "text-[#818CF8]",
  supabase: "text-[#3ECF8E]",
  shopify: "text-[#84CC16]",
  zapier: "text-[#FF6A00]",
};

/* =========================================================
   COMPONENT
========================================================= */

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  selected,
  activeTheme,
  isProject = false,
  onClick,
  onMouseEnter,
}) => {
  const { theme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const Icon = item.icon;

  const isThemeItem = item.type === "theme";

  const isThemeSelected =
    isThemeItem &&
    item.id === `theme-${activeTheme || theme}`;

  const isExternal =
    typeof item.path === "string" &&
    /^https?:\/\//i.test(item.path);

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        idle: "text-[#dedede]",
        hover: "hover:bg-[#303030]",
        icon: "text-[#b5b5b5]",
        muted: "text-[#8b8b8b]",
        selected: "bg-[#2455e6] text-white",
        selectedIcon: "text-white",
        selectedMuted: "text-white/75",
        shortcut: "border-white/15 bg-white/10",
        projectIcon: "text-[#60a5fa]",
      }
    : {
        idle: "text-[#30343b]",
        hover: "hover:bg-[#f1f5f9]",
        icon: "text-[#64748b]",
        muted: "text-[#94a3b8]",
        selected: "bg-[#2455e6] text-white",
        selectedIcon: "text-white",
        selectedMuted: "text-white/75",
        shortcut: "border-white/15 bg-white/10",
        projectIcon: "text-[#2563eb]",
      };

  /* =======================================================
     ICON COLOR
  ======================================================= */

  const iconColor = selected
    ? colors.selectedIcon
    : isProject
      ? colors.projectIcon
      : connectorColors[item.id] || colors.icon;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      aria-label={item.title}
      aria-pressed={isThemeItem ? isThemeSelected : undefined}
      data-selected={selected}
      className={`
        group
        relative
        flex
        min-h-[48px]
        w-full
        min-w-0
        cursor-pointer
        select-none
        items-center
        gap-3
        rounded-[10px]
        px-3
        py-2.5
        text-left
        outline-none
        transition-colors
        duration-150
        ease-out
        focus-visible:ring-2
        focus-visible:ring-[#60a5fa]
        focus-visible:ring-inset
        motion-reduce:transition-none

        ${
          selected
            ? colors.selected
            : `${colors.idle} ${colors.hover}`
        }
      `}
    >
      {/* =================================================
          ICON
      ================================================= */}

      <span
        aria-hidden="true"
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
        "
      >
        {isProject ? (
          <Diamond
            size={18}
            strokeWidth={1.7}
            className={iconColor}
          />
        ) : (
          <Icon
            size={18}
            strokeWidth={1.75}
            className={iconColor}
          />
        )}
      </span>

      {/* =================================================
          RESULT TITLE
      ================================================= */}

      <span
        className="
          min-w-0
          flex-1
          truncate
          text-[13px]
          font-medium
          leading-5
          tracking-[-0.015em]
          sm:text-[14px]
        "
      >
        {item.title}
      </span>

      {/* =================================================
          ACTIVE THEME INDICATOR
      ================================================= */}

      {isThemeSelected && (
        <span
          className={`
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            ${
              selected
                ? colors.selectedMuted
                : "text-[#22c55e]"
            }
          `}
        >
          <Check
            size={15}
            strokeWidth={2}
          />
        </span>
      )}

      {/* =================================================
          EXTERNAL LINK INDICATOR
      ================================================= */}

      {isExternal && !isThemeItem && (
        <ArrowUpRight
          size={15}
          strokeWidth={1.7}
          className={`
            shrink-0
            ${
              selected
                ? colors.selectedMuted
                : colors.muted
            }
          `}
        />
      )}

      {/* =================================================
          KEYBOARD ACTION INDICATOR
      ================================================= */}

      {selected &&
        item.path &&
        !isExternal &&
        !isThemeItem && (
          <span
            aria-hidden="true"
            className={`
              hidden
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded-md
              border
              sm:flex
              ${colors.shortcut}
            `}
          >
            <CornerDownLeft
              size={13}
              strokeWidth={1.8}
              className="text-white/85"
            />
          </span>
        )}
    </button>
  );
};

export default SearchResultItem;
