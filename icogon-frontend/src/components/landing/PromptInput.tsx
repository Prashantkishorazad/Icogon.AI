import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  FolderKanban,
  Link2,
  Mic,
  Paperclip,
  Plus,
  Search,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { useNavigate } from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";

/* =========================================================
   TYPES
========================================================= */

type MenuView =
  | "main"
  | "context"
  | "skills"
  | "projects"
  | "connectors"
  | "databases";

type BuildMode =
  | "Build"
  | "Chat"
  | "Plan";

/* =========================================================
   DATA
========================================================= */

const suggestions = [
  "Build an AI SaaS dashboard",
  "Create an E-commerce website",
  "Build a social media app",
];

const animatedPrompts = [
  "What do you want to build?",
  "Build an AI SaaS dashboard...",
  "Create an e-commerce website...",
  "Build a social media application...",
];

const skills = [
  "Goal",
  "Accessibility",
  "Redesign",
  "SEO Review",
  "Video Creator",
  "Skill Creator",
  "Database Optimization",
];

const connectors = [
  "Gmail",
  "Slack",
  "Google Drive",
  "Google Maps",
  "Google Sheets",
  "Google Calendar",
  "Resend",
];

const projects = [
  "Recent Project",
  "AI SaaS Dashboard",
  "E-commerce Website",
  "Portfolio Website",
];

const databases = [
  "Supabase",
  "PostgreSQL",
  "MongoDB",
];

/* =========================================================
   COMPONENT
========================================================= */

const PromptInput = () => {
  /* =======================================================
     THEME
  ======================================================= */

  const {
    resolvedTheme,
  } = useTheme();

  const isDark =
    resolvedTheme === "dark";

  /* =======================================================
     THEME TOKENS
  ======================================================= */

  const theme = isDark
    ? {
        composer:
          "border-[#292929] bg-[#111111] shadow-[0_20px_55px_rgba(0,0,0,0.38)]",

        text:
          "text-white",

        placeholder:
          "text-[#777]",

        caret:
          "bg-[#777]",

        button:
          "text-[#999] hover:bg-[#202020] hover:text-white",

        circle:
          "border-[#303030] text-[#999] hover:bg-[#202020] hover:text-white",

        mode:
          "text-[#aaa] hover:bg-[#202020] hover:text-white",

        menu:
          "border-[#2c2c2c] bg-[#171717] shadow-[0_20px_55px_rgba(0,0,0,0.5)]",

        menuBorder:
          "border-[#292929]",

        menuText:
          "text-white",

        menuMuted:
          "text-[#777]",

        menuItem:
          "text-[#d2d2d2] hover:bg-[#242424] hover:text-white",

        menuIcon:
          "text-[#929292]",

        search:
          "border-[#303030] bg-[#101010] text-white placeholder:text-[#666]",

        chip:
          "border-[#303030] bg-[#1b1b1b] text-[#ccc]",

        chipClose:
          "text-[#777] hover:text-white",

        suggestion:
          "border-[#292929] bg-[#111111] text-[#aaa] hover:border-[#444] hover:bg-[#191919] hover:text-white",

        generate:
          "bg-white text-black hover:bg-[#e8e8e8]",

        selected:
          "text-cyan-400",
      }
    : {
        composer:
          "border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.09)]",

        text:
          "text-slate-900",

        placeholder:
          "text-slate-400",

        caret:
          "bg-slate-400",

        button:
          "text-slate-500 hover:bg-slate-100 hover:text-slate-900",

        circle:
          "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900",

        mode:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",

        menu:
          "border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.14)]",

        menuBorder:
          "border-slate-200",

        menuText:
          "text-slate-900",

        menuMuted:
          "text-slate-400",

        menuItem:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-950",

        menuIcon:
          "text-slate-500",

        search:
          "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",

        chip:
          "border-slate-200 bg-slate-50 text-slate-600",

        chipClose:
          "text-slate-400 hover:text-slate-800",

        suggestion:
          "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900",

        generate:
          "bg-slate-900 text-white hover:bg-slate-950",

        selected:
          "text-cyan-600",
      };

  /* =======================================================
     STATE
  ======================================================= */

  const [
    prompt,
    setPrompt,
  ] = useState("");

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  const [
    animatedText,
    setAnimatedText,
  ] = useState("");

  const [
    promptIndex,
    setPromptIndex,
  ] = useState(0);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    isWaiting,
    setIsWaiting,
  ] = useState(false);

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    menuView,
    setMenuView,
  ] = useState<MenuView>("main");

  const [
    buildMode,
    setBuildMode,
  ] = useState<BuildMode>("Build");

  const [
    buildMenuOpen,
    setBuildMenuOpen,
  ] = useState(false);

  const [
    selectedSkill,
    setSelectedSkill,
  ] = useState<string | null>(null);

  const [
    selectedProject,
    setSelectedProject,
  ] = useState<string | null>(null);

  const [
    selectedConnector,
    setSelectedConnector,
  ] = useState<string | null>(null);

  const [
    selectedDatabase,
    setSelectedDatabase,
  ] = useState<string | null>(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const navigate =
    useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const promptRef =
    useRef<HTMLTextAreaElement>(null);

  /* =========================================================
     TYPING ANIMATION
  ========================================================= */

  useEffect(() => {
    if (prompt.length > 0) {
      return;
    }

    const currentText =
      animatedPrompts[promptIndex];

    if (isWaiting) {
      const timeout =
        setTimeout(() => {
          setIsWaiting(false);
          setIsDeleting(true);
        }, 1500);

      return () =>
        clearTimeout(timeout);
    }

    const speed =
      isDeleting ? 25 : 45;

    const timeout =
      setTimeout(() => {
        if (!isDeleting) {
          if (
            animatedText.length <
            currentText.length
          ) {
            setAnimatedText(
              currentText.slice(
                0,
                animatedText.length + 1
              )
            );
          } else {
            setIsWaiting(true);
          }
        } else {
          if (
            animatedText.length > 0
          ) {
            setAnimatedText(
              currentText.slice(
                0,
                animatedText.length - 1
              )
            );
          } else {
            setIsDeleting(false);

            setPromptIndex(
              (index) =>
                (index + 1) %
                animatedPrompts.length
            );
          }
        }
      }, speed);

    return () =>
      clearTimeout(timeout);
  }, [
    animatedText,
    promptIndex,
    isDeleting,
    isWaiting,
    prompt,
  ]);

  /* =========================================================
     GENERATE
  ========================================================= */

  const handleGenerate = () => {
    const value =
      prompt.trim();

    if (
      !value ||
      isGenerating
    ) {
      return;
    }

    setIsGenerating(true);

    navigate("/builder", {
      state: {
        prompt: value,
        mode: buildMode,
        skill: selectedSkill,
        project: selectedProject,
        connector: selectedConnector,
        database: selectedDatabase,
      },
    });
  };

  /* =========================================================
     ENHANCE
  ========================================================= */

  const handleEnhancePrompt =
    () => {
      if (!prompt.trim()) {
        setPrompt(
          "Build a modern, responsive and production-ready application with a beautiful UI, authentication and scalable architecture."
        );

        return;
      }

      setPrompt(
        `${prompt.trim()}

Make the design modern, responsive, professional and production-ready. Include a beautiful user interface and clean architecture.`
      );
    };

  /* =========================================================
     KEYBOARD
  ========================================================= */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      (event.metaKey ||
        event.ctrlKey)
    ) {
      event.preventDefault();

      handleGenerate();
    }
  };

  /* =========================================================
     FILE
  ========================================================= */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    console.log(
      "Selected file:",
      file
    );
  };

  /* =========================================================
     MENU
  ========================================================= */

  const openMenu = () => {
    setMenuOpen(true);
    setMenuView("main");
    setSearch("");
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuView("main");
    setSearch("");
  };

  const goBack = () => {
    if (menuView === "main") {
      closeMenu();
      return;
    }

    if (
      menuView === "context"
    ) {
      setMenuView("main");
      setSearch("");
      return;
    }

    setMenuView("context");
    setSearch("");
  };

  /* =========================================================
     SELECTORS
  ========================================================= */

  const selectSkill = (
    value: string
  ) => {
    setSelectedSkill(value);
    closeMenu();
  };

  const selectProject = (
    value: string
  ) => {
    setSelectedProject(value);
    closeMenu();
  };

  const selectConnector = (
    value: string
  ) => {
    setSelectedConnector(value);
    closeMenu();
  };

  const selectDatabase = (
    value: string
  ) => {
    setSelectedDatabase(value);
    closeMenu();
  };

  /* =========================================================
     FILTERS
  ========================================================= */

  const filteredSkills =
    skills.filter((item) =>
      item
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const filteredProjects =
    projects.filter((item) =>
      item
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const filteredConnectors =
    connectors.filter((item) =>
      item
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const filteredDatabases =
    databases.filter((item) =>
      item
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  /* =========================================================
     MENU ITEM
  ========================================================= */

  const MenuItem = ({
    icon,
    label,
    onClick,
    hasArrow = false,
  }: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    hasArrow?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        flex
        w-full
        items-center
        justify-between
        rounded-lg
        px-3
        py-2.5
        text-left
        text-[14px]
        transition
        ${theme.menuItem}
      `}
    >
      <span className="flex items-center gap-3">
        <span
          className={theme.menuIcon}
        >
          {icon}
        </span>

        <span>{label}</span>
      </span>

      {hasArrow && (
        <ChevronRight
          size={16}
          className={theme.menuIcon}
        />
      )}
    </button>
  );

  /* =========================================================
     SUB MENU
  ========================================================= */

  const renderSubMenu = () => {
    let title = "";
    let items: string[] = [];
    let onSelect:
      (item: string) => void =
      () => {};

    if (menuView === "skills") {
      title = "Skills";
      items = filteredSkills;
      onSelect = selectSkill;
    }

    if (
      menuView === "projects"
    ) {
      title = "Projects";
      items = filteredProjects;
      onSelect = selectProject;
    }

    if (
      menuView ===
      "connectors"
    ) {
      title = "Connectors";
      items = filteredConnectors;
      onSelect = selectConnector;
    }

    if (
      menuView === "databases"
    ) {
      title = "Databases";
      items = filteredDatabases;
      onSelect = selectDatabase;
    }

    return (
      <div className="w-[320px]">
        <div
          className={`
            flex
            items-center
            gap-2
            border-b
            px-3
            py-2.5
            ${theme.menuBorder}
          `}
        >
          <button
            type="button"
            onClick={goBack}
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              ${theme.menuItem}
            `}
          >
            <ArrowLeft
              size={17}
            />
          </button>

          <span
            className={`
              text-sm
              font-semibold
              ${theme.menuText}
            `}
          >
            {title}
          </span>
        </div>

        <div className="p-2.5">
          <div
            className={`
              flex
              h-10
              items-center
              gap-2.5
              rounded-lg
              border
              px-3
              ${theme.search}
            `}
          >
            <Search
              size={17}
              className={
                theme.menuIcon
              }
            />

            <input
              autoFocus
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={`Search ${title.toLowerCase()}...`}
              className="
                min-w-0
                flex-1
                bg-transparent
                text-sm
                outline-none
              "
            />
          </div>
        </div>

        <div className="max-h-[260px] overflow-y-auto px-2 pb-2">
          {items.length > 0 ? (
            items.map(
              (item) => {
                const selected =
                  item ===
                    selectedSkill ||
                  item ===
                    selectedProject ||
                  item ===
                    selectedConnector ||
                  item ===
                    selectedDatabase;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      onSelect(item)
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      transition
                      ${theme.menuItem}
                    `}
                  >
                    <span>
                      {item}
                    </span>

                    {selected && (
                      <Check
                        size={16}
                        className={
                          theme.selected
                        }
                      />
                    )}
                  </button>
                );
              }
            )
          ) : (
            <div
              className={`
                py-8
                text-center
                text-sm
                ${theme.menuMuted}
              `}
            >
              No results found
            </div>
          )}
        </div>
      </div>
    );
  };

  /* =========================================================
     CONTEXT MENU
  ========================================================= */

  const renderContextMenu =
    () => (
      <div className="w-[320px]">
        <div
          className={`
            flex
            items-center
            gap-2
            border-b
            px-3
            py-2.5
            ${theme.menuBorder}
          `}
        >
          <button
            type="button"
            onClick={goBack}
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              ${theme.menuItem}
            `}
          >
            <ArrowLeft
              size={17}
            />
          </button>

          <span
            className={`
              text-sm
              font-semibold
              ${theme.menuText}
            `}
          >
            Add context
          </span>
        </div>

        <div className="p-2">
          <MenuItem
            icon={
              <Wrench size={17} />
            }
            label="Skills"
            hasArrow
            onClick={() => {
              setMenuView(
                "skills"
              );
              setSearch("");
            }}
          />

          <MenuItem
            icon={
              <FolderKanban
                size={17}
              />
            }
            label="Projects"
            hasArrow
            onClick={() => {
              setMenuView(
                "projects"
              );
              setSearch("");
            }}
          />

          <MenuItem
            icon={
              <Link2 size={17} />
            }
            label="Connectors"
            hasArrow
            onClick={() => {
              setMenuView(
                "connectors"
              );
              setSearch("");
            }}
          />
        </div>
      </div>
    );

  /* =========================================================
     MAIN MENU
  ========================================================= */

  const renderMainMenu =
    () => (
      <div className="w-[320px]">
        {/* SEARCH */}

        <div
          className={`
            border-b
            p-2.5
            ${theme.menuBorder}
          `}
        >
          <div
            className={`
              flex
              h-10
              items-center
              gap-2.5
              rounded-lg
              border
              px-3
              ${theme.search}
            `}
          >
            <Search
              size={18}
              className={
                theme.menuIcon
              }
            />

            <input
              autoFocus
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search..."
              className="
                min-w-0
                flex-1
                bg-transparent
                text-sm
                outline-none
              "
            />
          </div>
        </div>

        {/* OPTIONS */}

        <div className="p-2">
          <MenuItem
            icon={
              <Paperclip
                size={18}
              />
            }
            label="Attach"
            onClick={() => {
              fileInputRef.current?.click();
              closeMenu();
            }}
          />

          <MenuItem
            icon={
              <Sparkles
                size={18}
              />
            }
            label="Add context"
            hasArrow
            onClick={() => {
              setMenuView(
                "context"
              );
              setSearch("");
            }}
          />

          <MenuItem
            icon={
              <Database
                size={18}
              />
            }
            label="Databases"
            hasArrow
            onClick={() => {
              setMenuView(
                "databases"
              );
              setSearch("");
            }}
          />
        </div>
      </div>
    );

  /* =========================================================
     ACTIVE CONTEXTS
  ========================================================= */

  const activeContexts = [
    selectedSkill
      ? {
          label: selectedSkill,
          type: "skill",
        }
      : null,

    selectedProject
      ? {
          label: selectedProject,
          type: "project",
        }
      : null,

    selectedConnector
      ? {
          label: selectedConnector,
          type: "connector",
        }
      : null,

    selectedDatabase
      ? {
          label: selectedDatabase,
          type: "database",
        }
      : null,
  ].filter(Boolean) as {
    label: string;
    type: string;
  }[];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.55,
        delay: 0.2,
      }}
      className="
        mt-10
        w-full
        max-w-[700px]
      "
    >
      {/* ===================================================
          PROMPT BOX
      =================================================== */}

      <div
        className={`
          relative
          overflow-visible
          rounded-[24px]
          border
          transition-colors
          duration-200
          ${theme.composer}
        `}
      >
        {/* =================================================
            CONTEXT CHIPS
        ================================================= */}

        {activeContexts.length >
          0 && (
          <div className="flex flex-wrap gap-2 px-5 pt-3">
            {activeContexts.map(
              (context) => (
                <div
                  key={`${context.type}-${context.label}`}
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3
                    py-1
                    text-xs
                    ${theme.chip}
                  `}
                >
                  <span>
                    {context.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        context.type ===
                        "skill"
                      ) {
                        setSelectedSkill(
                          null
                        );
                      }

                      if (
                        context.type ===
                        "project"
                      ) {
                        setSelectedProject(
                          null
                        );
                      }

                      if (
                        context.type ===
                        "connector"
                      ) {
                        setSelectedConnector(
                          null
                        );
                      }

                      if (
                        context.type ===
                        "database"
                      ) {
                        setSelectedDatabase(
                          null
                        );
                      }
                    }}
                    className={
                      theme.chipClose
                    }
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* =================================================
            INPUT
        ================================================= */}

        <div
          className="
            relative
            min-h-[105px]
            px-6
            pt-5
          "
        >
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={(event) =>
              setPrompt(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            className={`
              absolute
              inset-0
              h-full
              w-full
              resize-none
              bg-transparent
              px-6
              pt-5
              text-[18px]
              leading-relaxed
              outline-none
              md:text-[19px]
              ${theme.text}
            `}
          />

          {!prompt && (
            <div
              className={`
                pointer-events-none
                absolute
                left-6
                top-5
                flex
                items-center
                whitespace-nowrap
                text-[18px]
                tracking-tight
                md:text-[19px]
                ${theme.placeholder}
              `}
            >
              {animatedText}

              <motion.span
                animate={{
                  opacity: [
                    1,
                    0,
                    1,
                  ],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                }}
                className={`
                  ml-[3px]
                  h-[21px]
                  w-[2px]
                  ${theme.caret}
                `}
              />
            </div>
          )}
        </div>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            px-4
            pb-3
            pt-1
          "
        >
          {/* LEFT */}

          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={
                handleFileChange
              }
            />

            {/* PLUS */}

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (menuOpen) {
                    closeMenu();
                  } else {
                    openMenu();
                  }
                }}
                aria-label={
                  menuOpen
                    ? "Close menu"
                    : "Add"
                }
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  transition
                  ${theme.circle}
                `}
              >
                {menuOpen ? (
                  <X
                    size={19}
                    strokeWidth={1.8}
                  />
                ) : (
                  <Plus
                    size={20}
                    strokeWidth={1.8}
                  />
                )}
              </button>

              {/* MENU */}

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.97,
                      y: 7,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.97,
                      y: 7,
                    }}
                    transition={{
                      duration: 0.15,
                    }}
                    className={`
                      absolute
                      bottom-[48px]
                      left-0
                      z-[100]
                      overflow-hidden
                      rounded-2xl
                      border
                      ${theme.menu}
                    `}
                  >
                    {menuView ===
                      "main" &&
                      renderMainMenu()}

                    {menuView ===
                      "context" &&
                      renderContextMenu()}

                    {(menuView ===
                      "skills" ||
                      menuView ===
                        "projects" ||
                      menuView ===
                        "connectors" ||
                      menuView ===
                        "databases") &&
                      renderSubMenu()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ENHANCE */}

            <button
              type="button"
              onClick={
                handleEnhancePrompt
              }
              className={`
                hidden
                items-center
                gap-1.5
                rounded-full
                px-2.5
                py-1.5
                text-[13px]
                font-medium
                transition
                sm:flex
                ${theme.button}
              `}
            >
              <Sparkles size={15} />
              Enhance
            </button>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-1">
            {/* BUILD */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setBuildMenuOpen(
                    (value) =>
                      !value
                  )
                }
                className={`
                  flex
                  items-center
                  gap-1
                  rounded-lg
                  px-2
                  py-1.5
                  text-[13px]
                  font-medium
                  transition
                  ${theme.mode}
                `}
              >
                {buildMode}

                <ChevronDown
                  size={15}
                />
              </button>

              <AnimatePresence>
                {buildMenuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.97,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.97,
                      y: 5,
                    }}
                    className={`
                      absolute
                      bottom-10
                      right-0
                      z-50
                      w-[145px]
                      overflow-hidden
                      rounded-xl
                      border
                      p-1
                      ${theme.menu}
                    `}
                  >
                    {(
                      [
                        "Build",
                        "Chat",
                        "Plan",
                      ] as BuildMode[]
                    ).map(
                      (mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setBuildMode(
                              mode
                            );

                            setBuildMenuOpen(
                              false
                            );
                          }}
                          className={`
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-lg
                            px-3
                            py-2
                            text-left
                            text-sm
                            transition
                            ${theme.menuItem}
                          `}
                        >
                          {mode}

                          {buildMode ===
                            mode && (
                            <Check
                              size={14}
                              className={
                                theme.selected
                              }
                            />
                          )}
                        </button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MIC */}

            <button
              type="button"
              title="Voice input"
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                transition
                ${theme.button}
              `}
            >
              <Mic
                size={18}
                strokeWidth={1.7}
              />
            </button>

            {/* GENERATE */}

            <button
              type="button"
              onClick={
                handleGenerate
              }
              disabled={
                !prompt.trim() ||
                isGenerating
              }
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                shadow-sm
                transition
                disabled:cursor-not-allowed
                disabled:opacity-30
                ${theme.generate}
              `}
              aria-label="Generate"
            >
              {isGenerating ? (
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-current/30
                    border-t-current
                  "
                />
              ) : (
                <ArrowUp size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUGGESTIONS
      ===================================================== */}

      <div
        className="
          mt-4
          flex
          flex-wrap
          justify-center
          gap-2
        "
      >
        {suggestions.map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setPrompt(item);

                promptRef.current?.focus();
              }}
              className={`
                rounded-full
                border
                px-3.5
                py-1.5
                text-[13px]
                transition
                ${theme.suggestion}
              `}
            >
              {item}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
};

export default PromptInput;