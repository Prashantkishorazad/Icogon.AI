
import React from "react";
import { Search, X } from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isDark: boolean;
}

/* =========================================================
   COMPONENT
========================================================= */

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClose,
  inputRef,
  isDark,
}) => {
  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        background: "bg-[#252525]",
        border: "border-white/[0.09]",
        icon: "text-[#a3a3a3]",
        input: "text-[#f5f5f5] placeholder:text-[#969696]",
        clear: "text-[#a3a3a3] hover:bg-white/10 hover:text-white",
        escape: `
          border-[#454545]
          bg-[#303030]
          text-[#b5b5b5]
          hover:bg-[#383838]
          hover:text-white
        `,
      }
    : {
        background: "bg-white",
        border: "border-slate-200",
        icon: "text-slate-500",
        input: "text-slate-900 placeholder:text-slate-400",
        clear: "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
        escape: `
          border-slate-200
          bg-slate-100
          text-slate-500
          hover:bg-slate-200
          hover:text-slate-900
        `,
      };

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  const handleClear = () => {
    onChange("");

    inputRef.current?.focus({
      preventScroll: true,
    });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <header
      className={`
        relative
        flex
        h-[62px]
        w-full
        shrink-0
        items-center
        gap-3
        border-b
        px-4
        transition-colors
        duration-200
        sm:h-[66px]
        sm:gap-4
        sm:px-5

        ${colors.background}
        ${colors.border}
      `}
    >
      {/* =================================================
          SEARCH ICON
      ================================================= */}

      <div
        className="
          flex
          h-8
          w-7
          shrink-0
          items-center
          justify-center
        "
      >
        <Search
          size={21}
          strokeWidth={1.7}
          aria-hidden="true"
          className={colors.icon}
        />
      </div>

      {/* =================================================
          SEARCH INPUT
      ================================================= */}

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder="Search anything in ICOGON..."
        aria-label="Search anything in ICOGON"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="search"
        className={`
          h-full
          min-w-0
          flex-1
          border-0
          bg-transparent
          p-0
          text-[16px]
          font-normal
          leading-6
          tracking-[-0.015em]
          outline-none
          ring-0
          focus:outline-none
          focus:ring-0
          sm:text-[17px]

          ${colors.input}
        `}
      />

      {/* =================================================
          CLEAR SEARCH BUTTON
      ================================================= */}

      {value.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          title="Clear search"
          onClick={handleClear}
          className={`
            flex
            h-8
            w-8
            shrink-0
            cursor-pointer
            items-center
            justify-center
            rounded-lg
            transition-all
            duration-150
            active:scale-95
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#3978ff]
            motion-reduce:transition-none

            ${colors.clear}
          `}
        >
          <X
            size={16}
            strokeWidth={1.8}
          />
        </button>
      )}

      {/* =================================================
          ESCAPE BUTTON
      ================================================= */}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close search"
        aria-keyshortcuts="Escape"
        className={`
          flex
          h-8
          min-w-[36px]
          shrink-0
          cursor-pointer
          items-center
          justify-center
          rounded-[7px]
          border
          px-2
          text-[11px]
          font-medium
          transition-all
          duration-150
          active:scale-95
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#3978ff]
          motion-reduce:transition-none

          ${colors.escape}
        `}
      >
        Esc
      </button>
    </header>
  );
};

export default SearchInput;
