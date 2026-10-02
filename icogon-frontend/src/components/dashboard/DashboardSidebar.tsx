import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Home,
  Search,
  Plug,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  LogOut,
  Settings,
  Plus,
  Sun,
  Moon,
  Monitor,
  Check,
  Palette,
  User,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

import {
  useTheme,
  type Theme,
} from "../../context/ThemeContext";

import GlobalSearch from "../search/GlobalSearch";

/* =========================================================
   TYPES
========================================================= */

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

interface RecentProject {
  id: string;
  name: string;
}

/* =========================================================
   COMPONENT
========================================================= */

const DashboardSidebar: React.FC<
  DashboardSidebarProps
> = ({
  collapsed,
  setCollapsed,
}) => {
  const navigate = useNavigate();

  /* =======================================================
     AUTH
  ======================================================= */

  const {
    user,
    logout,
  } = useAuthStore();

  /* =======================================================
     THEME
  ======================================================= */

  const {
    theme,
    setTheme,
    resolvedTheme,
  } = useTheme();

  const isDark =
    resolvedTheme === "dark";

  /* =======================================================
     STATE
  ======================================================= */

  const [
    workspaceOpen,
    setWorkspaceOpen,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    appearanceOpen,
    setAppearanceOpen,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    projectsOpen,
    setProjectsOpen,
  ] = useState(true);

  /*
   * Recent projects are intentionally local for now.
   * API integration can be connected after the sidebar UI
   * is finalized.
   */

  const [
    recentProjects,
  ] = useState<RecentProject[]>([]);

  /* =======================================================
     REFS
  ======================================================= */

  const workspaceRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  /* =======================================================
     USER
  ======================================================= */

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const email =
    user?.email || "";

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        sidebar:
          "border-[#242424] bg-[#0b0b0b] text-white",

        text:
          "text-white",

        muted:
          "text-[#858585]",

        navInactive:
          "text-[#a8a8a8] hover:bg-[#181818] hover:text-white",

        navActive:
          "bg-[#242424] text-white",

        hover:
          "hover:bg-[#181818]",

        hoverSoft:
          "hover:bg-[#151515]",

        border:
          "border-[#242424]",

        divider:
          "bg-[#242424]",

        popup:
          "border-[#2c2c2c] bg-[#171717]",

        popupText:
          "text-[#d0d0d0] hover:bg-[#242424]",

        iconMuted:
          "text-[#777]",

        button:
          "border-[#333] bg-[#171717] text-[#aaa] hover:bg-[#202020] hover:text-white",

        upgrade:
          "from-[#20152b] to-[#281b35]",

        upgradeText:
          "text-white",

        upgradeSubtext:
          "text-[#b69bc9]",

        themeInactive:
          "text-[#d0d0d0] hover:bg-[#242424]",
      }
    : {
        sidebar:
          "border-slate-200 bg-white text-slate-900",

        text:
          "text-slate-900",

        muted:
          "text-slate-500",

        navInactive:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-950",

        navActive:
          "bg-slate-100 text-slate-950",

        hover:
          "hover:bg-slate-100",

        hoverSoft:
          "hover:bg-slate-50",

        border:
          "border-slate-200",

        divider:
          "bg-slate-200",

        popup:
          "border-slate-200 bg-white",

        popupText:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-950",

        iconMuted:
          "text-slate-400",

        button:
          "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",

        upgrade:
          "from-purple-50 to-purple-100",

        upgradeText:
          "text-slate-900",

        upgradeSubtext:
          "text-purple-600",

        themeInactive:
          "text-slate-700 hover:bg-slate-100",
      };

  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        workspaceRef.current &&
        !workspaceRef.current.contains(target)
      ) {
        setWorkspaceOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
        setAppearanceOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =======================================================
     GLOBAL SEARCH SHORTCUT
  ======================================================= */

  useEffect(() => {
    const handleSearchShortcut = (
      event: KeyboardEvent
    ) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

        setSearchOpen(true);
        setWorkspaceOpen(false);
        setProfileOpen(false);
        setAppearanceOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleSearchShortcut
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleSearchShortcut
      );
    };
  }, []);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
  try {
    setLoggingOut(true);

    // Close profile menu
    setProfileOpen(false);
    setAppearanceOpen(false);
    setWorkspaceOpen(false);

    // Clear Supabase session through auth store
    await logout();

    // Go directly to landing page
    navigate("/", {
      replace: true,
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    setLoggingOut(false);
  }
};

  /* =======================================================
     SEARCH
  ======================================================= */

  const openSearch = () => {
    setWorkspaceOpen(false);
    setProfileOpen(false);
    setAppearanceOpen(false);
    setSearchOpen(true);
  };

  /* =======================================================
     THEME OPTIONS
  ======================================================= */

  const themeOptions: {
    value: Theme;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
    },
  ];

  /* =======================================================
     NAV CLASS
  ======================================================= */

  const navClass = (
    isActive: boolean
  ) => {
    return `
      group
      flex
      w-full
      items-center
      rounded-xl
      transition-all
      duration-150
      ${
        collapsed
          ? "h-10 justify-center"
          : "h-10 gap-3 px-3"
      }
      ${
        isActive
          ? colors.navActive
          : colors.navInactive
      }
    `;
  };

  /* =======================================================
     RECENT PROJECT
  ======================================================= */

  const openRecentProject = (
    project: RecentProject
  ) => {
    navigate(
      `/builder/${project.id}`
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          flex-col
          border-r
          transition-all
          duration-300
          ${colors.sidebar}
          ${
            collapsed
              ? "w-[72px]"
              : "w-[232px]"
          }
        `}
      >
        {/* =================================================
            BRAND HEADER
        ================================================= */}

        <div
          className={`
            flex
            h-[58px]
            shrink-0
            items-center
            border-b
            ${colors.border}
            ${
              collapsed
                ? "justify-center"
                : "justify-between px-4"
            }
          `}
        >
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              flex
              items-center
              gap-2.5
              outline-none
            "
          >
            <img
              src="/logo.png"
              alt="ICOGON"
              className="
                h-8
                w-8
                rounded-[9px]
                object-cover
              "
            />

            {!collapsed && (
              <span
                className={`
                  text-[17px]
                  font-bold
                  tracking-[-0.45px]
                  ${colors.text}
                `}
              >
                ICOGON
              </span>
            )}
          </button>

          {!collapsed && (
            <button
              type="button"
              onClick={() =>
                setCollapsed(true)
              }
              className={`
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                ${colors.muted}
                ${colors.hover}
                transition
              `}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose
                size={16}
                strokeWidth={1.8}
              />
            </button>
          )}
        </div>

        {/* =================================================
            EXPAND BUTTON
        ================================================= */}

        {collapsed && (
          <button
            type="button"
            onClick={() =>
              setCollapsed(false)
            }
            className={`
              absolute
              right-[-11px]
              top-[18px]
              z-[100]
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              border
              shadow-sm
              ${colors.button}
            `}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen
              size={13}
              strokeWidth={1.8}
            />
          </button>
        )}

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div
          ref={workspaceRef}
          className="
            relative
            shrink-0
            px-3
            py-3
          "
        >
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                setCollapsed(false);

                setTimeout(() => {
                  setWorkspaceOpen(true);
                }, 150);

                return;
              }

              setProfileOpen(false);
              setAppearanceOpen(false);

              setWorkspaceOpen(
                (value) => !value
              );
            }}
            className={`
              flex
              w-full
              items-center
              rounded-xl
              transition
              ${colors.hoverSoft}
              ${
                collapsed
                  ? "h-10 justify-center"
                  : "gap-2.5 px-1.5 py-1.5"
              }
            `}
          >
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-[9px]
                bg-gradient-to-br
                from-orange-500
                to-orange-600
                text-xs
                font-bold
                text-white
              "
            >
              I
            </div>

            {!collapsed && (
              <>
                <div
                  className="
                    min-w-0
                    flex-1
                    text-left
                  "
                >
                  <p
                    className={`
                      truncate
                      text-[12px]
                      font-semibold
                      ${colors.text}
                    `}
                  >
                    ICOGON Workspace
                  </p>

                  <p
                    className={`
                      truncate
                      text-[10px]
                      ${colors.muted}
                    `}
                  >
                    Personal workspace
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className={`
                    shrink-0
                    ${colors.muted}
                    transition-transform
                    ${
                      workspaceOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </>
            )}
          </button>

          {/* WORKSPACE POPUP */}

          {workspaceOpen && !collapsed && (
            <div
              className={`
                absolute
                left-3
                right-3
                top-[58px]
                z-[200]
                overflow-hidden
                rounded-xl
                border
                shadow-xl
                ${colors.popup}
              `}
            >
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceOpen(false);
                    navigate(
                      "/workspace/settings"
                    );
                  }}
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    transition
                    ${colors.popupText}
                  `}
                >
                  <Settings size={16} />
                  <span>
                    Workspace settings
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceOpen(false);
                    navigate(
                      "/workspace/new"
                    );
                  }}
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    transition
                    ${colors.popupText}
                  `}
                >
                  <Plus size={16} />
                  <span>
                    New workspace
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            MAIN NAVIGATION
        ================================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-3
          "
        >
          <nav className="space-y-1">
            {/* DASHBOARD */}

            <NavLink
              to="/dashboard"
              title={
                collapsed
                  ? "Dashboard"
                  : undefined
              }
              className={({ isActive }) =>
                navClass(isActive)
              }
            >
              <Home
                size={17}
                strokeWidth={1.8}
                className="shrink-0"
              />

              {!collapsed && (
                <span className="text-[13px] font-medium">
                  Dashboard
                </span>
              )}
            </NavLink>

            {/* SEARCH */}

            <button
              type="button"
              onClick={openSearch}
              title={
                collapsed
                  ? "Search"
                  : "Search (⌘ K)"
              }
              className={navClass(false)}
            >
              <Search
                size={17}
                strokeWidth={1.8}
                className="shrink-0"
              />

              {!collapsed && (
                <>
                  <span className="text-[13px] font-medium">
                    Search
                  </span>

                  <span
                    className={`
                      ml-auto
                      text-[9px]
                      ${colors.iconMuted}
                    `}
                  >
                    ⌘ K
                  </span>
                </>
              )}
            </button>

            {/* CONNECTORS */}

            <NavLink
              to="/connectors"
              title={
                collapsed
                  ? "Connectors"
                  : undefined
              }
              className={({ isActive }) =>
                navClass(isActive)
              }
            >
              <Plug
                size={17}
                strokeWidth={1.8}
                className="shrink-0"
              />

              {!collapsed && (
                <span className="text-[13px] font-medium">
                  Connectors
                </span>
              )}
            </NavLink>

            {/* PROJECTS */}

            <NavLink
              to="/projects"
              title={
                collapsed
                  ? "Projects"
                  : undefined
              }
              className={({ isActive }) =>
                navClass(isActive)
              }
            >
              <FolderKanban
                size={17}
                strokeWidth={1.8}
                className="shrink-0"
              />

              {!collapsed && (
                <span className="text-[13px] font-medium">
                  Projects
                </span>
              )}
            </NavLink>
          </nav>

          {/* =================================================
              RECENTS
          ================================================= */}

          {!collapsed && (
            <section className="mt-7">
              <div className="mb-2 flex items-center justify-between px-3">
                <button
                  type="button"
                  onClick={() =>
                    setProjectsOpen(
                      (value) => !value
                    )
                  }
                  className={`
                    flex
                    items-center
                    gap-1
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.09em]
                    ${colors.iconMuted}
                  `}
                >
                  <span>
                    Recents
                  </span>

                  <ChevronDown
                    size={12}
                    className={`
                      transition-transform
                      ${
                        projectsOpen
                          ? ""
                          : "-rotate-90"
                      }
                    `}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/projects")
                  }
                  className={`
                    text-[10px]
                    transition
                    ${colors.iconMuted}
                    ${
                      isDark
                        ? "hover:text-white"
                        : "hover:text-slate-900"
                    }
                  `}
                >
                  View all
                </button>
              </div>

              {projectsOpen && (
                <div className="space-y-0.5">
                  {recentProjects.length > 0 ? (
                    recentProjects.map(
                      (project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() =>
                            openRecentProject(
                              project
                            )
                          }
                          className={`
                            flex
                            w-full
                            items-center
                            gap-2.5
                            rounded-lg
                            px-3
                            py-2
                            text-left
                            transition
                            ${colors.navInactive}
                          `}
                        >
                          <div
                            className={`
                              flex
                              h-6
                              w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-md
                              border
                              ${
                                isDark
                                  ? "border-[#333]"
                                  : "border-slate-200"
                              }
                              text-[10px]
                            `}
                          >
                            <FolderKanban
                              size={13}
                            />
                          </div>

                          <span className="truncate text-[12px]">
                            {project.name}
                          </span>
                        </button>
                      )
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/projects")
                      }
                      className={`
                        flex
                        w-full
                        items-center
                        gap-2.5
                        rounded-lg
                        px-3
                        py-2
                        text-left
                        transition
                        ${colors.navInactive}
                      `}
                    >
                      <div
                        className={`
                          flex
                          h-6
                          w-6
                          shrink-0
                          items-center
                          justify-center
                          rounded-md
                          border
                          border-dashed
                          ${
                            isDark
                              ? "border-[#444]"
                              : "border-slate-300"
                          }
                        `}
                      >
                        <Plus size={13} />
                      </div>

                      <span className="text-[12px]">
                        Create your first project
                      </span>
                    </button>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* =================================================
            BOTTOM AREA
        ================================================= */}

        <div
          className={`
            shrink-0
            border-t
            p-3
            ${colors.border}
          `}
        >
          {/* UPGRADE */}

          {!collapsed && (
            <button
              type="button"
              onClick={() =>
                navigate("/billing")
              }
              className={`
                mb-3
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                bg-gradient-to-r
                px-3
                py-2.5
                text-left
                transition
                hover:brightness-105
                ${colors.upgrade}
              `}
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-purple-500
                  text-white
                "
              >
                <Zap
                  size={15}
                  fill="currentColor"
                />
              </div>

              <div className="min-w-0">
                <p
                  className={`
                    text-[11px]
                    font-semibold
                    ${colors.upgradeText}
                  `}
                >
                  Upgrade to Pro
                </p>

                <p
                  className={`
                    truncate
                    text-[9px]
                    ${colors.upgradeSubtext}
                  `}
                >
                  Unlock more features
                </p>
              </div>
            </button>
          )}

          {/* =================================================
              PROFILE
          ================================================= */}

          <div
            ref={profileRef}
            className="relative"
          >
            {/* PROFILE POPUP */}

            {profileOpen && !collapsed && (
              <div
                className={`
                  absolute
                  bottom-[58px]
                  left-0
                  z-[250]
                  w-[280px]
                  overflow-hidden
                  rounded-xl
                  border
                  shadow-2xl
                  ${colors.popup}
                `}
              >
                {!appearanceOpen ? (
                  <>
                    {/* USER */}

                    <div
                      className={`
                        border-b
                        p-3
                        ${colors.border}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={fullName}
                            className="
                              h-9
                              w-9
                              rounded-full
                              object-cover
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-full
                              bg-gradient-to-br
                              from-orange-500
                              to-orange-600
                              text-xs
                              font-bold
                              text-white
                            "
                          >
                            {fullName
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p
                            className={`
                              truncate
                              text-sm
                              font-semibold
                              ${colors.text}
                            `}
                          >
                            {fullName}
                          </p>

                          <p
                            className={`
                              truncate
                              text-[10px]
                              ${colors.muted}
                            `}
                          >
                            {email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* MENU */}

                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/profile");
                        }}
                        className={`
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-lg
                          px-3
                          py-2.5
                          text-sm
                          transition
                          ${colors.popupText}
                        `}
                      >
                        <User size={16} />
                        <span>
                          Profile
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setAppearanceOpen(true)
                        }
                        className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-lg
                          px-3
                          py-2.5
                          text-sm
                          transition
                          ${colors.popupText}
                        `}
                      >
                        <span className="flex items-center gap-3">
                          <Palette size={16} />
                          Appearance
                        </span>

                        <ChevronRight
                          size={15}
                          className={
                            colors.iconMuted
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/settings");
                        }}
                        className={`
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-lg
                          px-3
                          py-2.5
                          text-sm
                          transition
                          ${colors.popupText}
                        `}
                      >
                        <Settings size={16} />
                        <span>
                          Settings
                        </span>
                      </button>
                    </div>

                    {/* LOGOUT */}

                    <div
                      className={`
                        border-t
                        p-1.5
                        ${colors.border}
                      `}
                    >
                      <button
                        type="button"
                        disabled={loggingOut}
                        onClick={handleLogout}
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-lg
                          px-3
                          py-2.5
                          text-sm
                          text-red-500
                          transition
                          hover:bg-red-500/10
                          disabled:opacity-50
                        "
                      >
                        <LogOut size={16} />

                        {loggingOut
                          ? "Logging out..."
                          : "Log out"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* APPEARANCE HEADER */}

                    <div
                      className={`
                        flex
                        items-center
                        gap-2
                        border-b
                        p-3
                        ${colors.border}
                      `}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setAppearanceOpen(false)
                        }
                        className={`
                          flex
                          h-7
                          w-7
                          items-center
                          justify-center
                          rounded-lg
                          ${colors.muted}
                          ${colors.hover}
                        `}
                        aria-label="Back"
                      >
                        <ChevronRight
                          size={15}
                          className="rotate-180"
                        />
                      </button>

                      <div>
                        <p
                          className={`
                            text-sm
                            font-semibold
                            ${colors.text}
                          `}
                        >
                          Appearance
                        </p>

                        <p
                          className={`
                            text-[10px]
                            ${colors.muted}
                          `}
                        >
                          Choose your preferred theme
                        </p>
                      </div>
                    </div>

                    {/* THEME OPTIONS */}

                    <div className="p-1.5">
                      {themeOptions.map(
                        (item) => {
                          const Icon =
                            item.icon;

                          const active =
                            theme ===
                            item.value;

                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() =>
                                setTheme(
                                  item.value
                                )
                              }
                              className={`
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-lg
                                px-3
                                py-2.5
                                text-left
                                text-sm
                                transition
                                ${
                                  active
                                    ? "bg-cyan-500/10 text-cyan-600"
                                    : colors.themeInactive
                                }
                              `}
                            >
                              <Icon size={17} />

                              <span className="font-medium">
                                {item.label}
                              </span>

                              {active && (
                                <Check
                                  size={16}
                                  className="ml-auto"
                                />
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PROFILE BUTTON */}

            <button
              type="button"
              onClick={() => {
                setWorkspaceOpen(false);

                setProfileOpen(
                  (value) => {
                    const next =
                      !value;

                    if (next) {
                      setAppearanceOpen(false);
                    }

                    return next;
                  }
                );
              }}
              className={`
                flex
                w-full
                items-center
                rounded-xl
                transition
                ${colors.hover}
                ${
                  collapsed
                    ? "justify-center p-1.5"
                    : "gap-2.5 px-1.5 py-1.5"
                }
              `}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="
                    h-8
                    w-8
                    shrink-0
                    rounded-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-orange-500
                    to-orange-600
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  {fullName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              {!collapsed && (
                <div
                  className="
                    min-w-0
                    flex-1
                    text-left
                  "
                >
                  <p
                    className={`
                      truncate
                      text-[11px]
                      font-medium
                      ${colors.text}
                    `}
                  >
                    {fullName}
                  </p>

                  <p
                    className={`
                      truncate
                      text-[9px]
                      ${colors.iconMuted}
                    `}
                  >
                    Personal account
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          GLOBAL SEARCH
      ===================================================== */}

      <GlobalSearch
        open={searchOpen}
        onClose={() =>
          setSearchOpen(false)
        }
      />
    </>
  );
};

export default DashboardSidebar;