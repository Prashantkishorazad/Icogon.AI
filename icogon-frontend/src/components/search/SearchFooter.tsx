import React from "react";
import { Command } from "lucide-react";

const SearchFooter: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const keyClass = `
    inline-flex h-[20px] min-w-[20px] items-center justify-center
    rounded border px-1 text-[10px] font-medium
    ${isDark
      ? "border-[#383838] bg-[#191919] text-[#aaa]"
      : "border-slate-200 bg-white text-slate-500"}
  `;

  return (
    <div
      className={`
        flex h-[44px] shrink-0 items-center gap-4
        border-t px-3
        text-[10px]
        ${isDark
          ? "border-[#242424] text-[#777]"
          : "border-slate-200 text-slate-400"}
      `}
    >
      <span className="flex items-center gap-1.5">
        <kbd className={keyClass}>↑</kbd>
        <kbd className={keyClass}>↓</kbd>
        <span className="hidden sm:inline">Navigate</span>
      </span>

      <span className="flex items-center gap-1.5">
        <kbd className={keyClass}>↵</kbd>
        <span className="hidden sm:inline">Open</span>
      </span>

      <span className="ml-auto flex items-center gap-1.5">
        <Command size={11} />
        <kbd className={keyClass}>K</kbd>
      </span>
    </div>
  );
};

export default SearchFooter;
