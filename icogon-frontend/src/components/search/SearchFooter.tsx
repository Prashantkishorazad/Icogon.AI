import React from "react";
import { Command } from "lucide-react";

const SearchFooter: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const keyClass = `rounded border px-1 py-0.5 ${isDark ? "border-[#333]" : "border-slate-200"}`;
  return <div className={`flex h-[42px] shrink-0 items-center gap-3 border-t px-3 text-[9px] ${isDark ? "border-[#242424] text-[#777]" : "border-slate-200 text-slate-400"}`}>
    <span className="flex items-center gap-1"><kbd className={keyClass}>↑</kbd><kbd className={keyClass}>↓</kbd> Navigate</span>
    <span className="flex items-center gap-1"><kbd className={keyClass}>↵</kbd> Open</span>
    <span className="ml-auto flex items-center gap-1"><Command size={10}/> K</span>
  </div>;
};
export default SearchFooter;
