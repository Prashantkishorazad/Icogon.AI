import React from "react";
import { ArrowUpRight, Check, Diamond } from "lucide-react";
import type { SearchNavigationItem } from "../../data/searchNavigation";

interface SearchResultItemProps {
  item: SearchNavigationItem;
  selected: boolean;
  activeTheme?: string;
  isProject?: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

// Brand colours for integrations; vivid accent colours for ICOGON navigation/settings.
const iconColors: Record<string, string> = {
  // Navigation
  dashboard: "text-[#06b6d4]",
  "create-project": "text-[#8b5cf6]",
  projects: "text-[#3b82f6]",
  connectors: "text-[#0d9488]",
  resources: "text-[#d97706]",
  profile: "text-[#ec4899]",
  // Settings
  settings: "text-[#64748b]",
  "account-settings": "text-[#ec4899]",
  "workspace-settings": "text-[#8b5cf6]",
  billing: "text-[#16a34a]",
  knowledge: "text-[#a855f7]",
  skills: "text-[#e879f9]",
  templates: "text-[#0ea5e9]",
  "connector-settings": "text-[#0d9488]",
  "git-settings": "text-[#f97316]",
  "build-secrets": "text-[#eab308]",
  "workspace-domains": "text-[#06b6d4]",
  security: "text-[#10b981]",
  // Themes
  "theme-light": "text-[#eab308]",
  "theme-dark": "text-[#8b5cf6]",
  "theme-system": "text-[#0ea5e9]",
  // Connectors
  github: "text-[#64748b]",
  gmail: "text-[#ef4444]",
  "google-calendar": "text-[#4285f4]",
  "google-analytics": "text-[#f97316]",
  slack: "text-[#a855f7]",
  stripe: "text-[#635bff]",
  supabase: "text-[#10b981]",
  shopify: "text-[#65a30d]",
  zapier: "text-[#f97316]",
};

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  selected,
  activeTheme,
  isProject = false,
  onClick,
  onMouseEnter,
}) => {
  const Icon = item.icon;
  const isDark = activeTheme === "dark";
  const isThemeSelected =
    item.type === "theme" && activeTheme === item.title.toLowerCase();

  const iconColor = isProject
    ? "text-[#60a5fa]"
    : iconColors[item.id] || "text-[#0ea5e9]";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`group flex min-h-[48px] w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left outline-none transition-colors ${
        selected
          ? isDark
            ? "bg-[#242424] text-white"
            : "bg-[#edf3fb] text-slate-900"
          : isDark
            ? "text-[#d0d0d0] hover:bg-[#191919]"
            : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center">
        {isProject ? (
          <Diamond size={21} strokeWidth={1.8} className={iconColor} />
        ) : (
          <Icon size={18} strokeWidth={1.9} className={iconColor} />
        )}
      </span>

      <span
        className={`min-w-0 flex-1 truncate text-[13px] font-semibold leading-5 ${
          selected
            ? isDark ? "text-white" : "text-slate-900"
            : isDark ? "text-[#d0d0d0]" : "text-slate-700"
        }`}
      >
        {item.title}
      </span>

      {isThemeSelected && (
        <Check size={15} className={isDark ? "text-[#aaa]" : "text-slate-500"} />
      )}

      {selected && item.path && item.type !== "theme" && (
        <ArrowUpRight
          size={14}
          className={`shrink-0 opacity-50 ${isDark ? "text-[#aaa]" : "text-slate-500"}`}
        />
      )}
    </button>
  );
};

export default SearchResultItem;
