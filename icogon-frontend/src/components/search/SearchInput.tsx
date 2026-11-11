import React from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isDark: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClose,
  inputRef,
  isDark,
}) => (
  <div
    className={`
      flex h-[60px] shrink-0 items-center gap-3
      border-b px-5
      ${isDark ? "border-[#242424]" : "border-slate-200"}
    `}
  >
    <Search
      size={19}
      strokeWidth={1.8}
      className={`shrink-0 ${isDark ? "text-[#888]" : "text-slate-400"}`}
    />

    <input
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search anything..."
      aria-label="Search anything"
      className={`
        min-w-0 flex-1 bg-transparent
        text-[15px] leading-6 outline-none
        ${isDark
          ? "text-white placeholder:text-[#666]"
          : "text-slate-900 placeholder:text-slate-400"}
      `}
    />

    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className={`
          flex h-7 w-7 shrink-0 items-center justify-center rounded-md
          ${isDark
            ? "text-[#777] hover:bg-[#222] hover:text-white"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}
        `}
      >
        <X size={14} />
      </button>
    )}

    <button
      type="button"
      onClick={onClose}
      aria-label="Close search"
      className={`
        flex h-7 shrink-0 items-center rounded-md border
        px-2 text-[11px] font-medium
        ${isDark
          ? "border-[#333] text-[#888] hover:text-white"
          : "border-slate-200 text-slate-400 hover:text-slate-700"}
      `}
    >
      ESC
    </button>
  </div>
);

export default SearchInput;
