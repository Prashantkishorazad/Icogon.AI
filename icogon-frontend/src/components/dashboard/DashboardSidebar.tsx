import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

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
  LifeBuoy,
  Bot
} from "lucide-react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

import {
  useTheme,
  type Theme,
} from "../../context/ThemeContext";

import GlobalSearch from "../search/GlobalSearch";
import { getProjectsApi } from "../../api/projectApi";

/* =========================================================
   TYPES
========================================================= */

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onMobileClose?: () => void;
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
  mobileOpen,
  setMobileOpen,
  onMobileClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const [recentProjects, setRecentProjects] =
    useState<RecentProject[]>([]);

  useEffect(() => {
    let active = true;

    getProjectsApi()
      .then((projects) => {
        if (!active) return;
        setRecentProjects(
          projects.slice(0, 6).map((project) => ({
            id: project.id,
            name: project.name,
          }))
        );
      })
      .catch((error) => {
        console.error("Unable to load sidebar recent projects:", error);
      });

    return () => {
      active = false;
    };
  }, []);

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
     ESCAPE HANDLING
  ======================================================= */

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setWorkspaceOpen(false);
      setProfileOpen(false);
      setAppearanceOpen(false);
      setMobileOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
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
    setMobileOpen(false);

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
      relative
      flex
      w-full
      items-center
      rounded-xl
      transition-all
      duration-200
      ease-out
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-cyan-400/70
      ${
        (collapsed && !mobileOpen)
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
    setMobileOpen(false);
    onMobileClose?.();
    navigate(
      `/builder/${project.id}`
    );
  };

  /* =======================================================
     PROFILE ROUTE
     Hide the dashboard sidebar only on the profile page.
     Keep the component mounted on every other route.
  ======================================================= */

  const isProfileRoute =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile/");

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <aside
        className={`
          relative z-40 flex h-full min-h-0 w-full flex-col overflow-visible border-r-0
          transition-[background-color,border-color]
          duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isProfileRoute ? "hidden" : ""}
          ${colors.sidebar}
        `}
        aria-label="Main navigation"
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
            ${
              (collapsed && !mobileOpen)
                ? "justify-center px-2"
                : "justify-between px-4"
            }
          `}
        >
          <button
            type="button"
            onClick={() => {
              if (mobileOpen) {
                setMobileOpen(false);
                onMobileClose?.();
                return;
              }

              setCollapsed((current) => !current);
            }}
            className={`
              group flex min-w-0 items-center gap-2.5 rounded-lg
              cursor-pointer outline-none
              transition-colors duration-200
              focus-visible:ring-2 focus-visible:ring-cyan-400/70
              ${colors.hover}
              ${(collapsed && !mobileOpen) ? "justify-center p-1" : "px-1.5 py-1"}
            `}
            aria-label={
              mobileOpen
                ? "Close sidebar"
                : collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
            }
            aria-expanded={!collapsed || mobileOpen}
            title={
              mobileOpen
                ? "Close sidebar"
                : collapsed
                  ? "Open sidebar"
                  : "Close sidebar"
            }
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <img
                src="/logo.png"
                alt=""
                aria-hidden="true"
                className="
                  absolute inset-0 h-8 w-8 rounded-[9px] object-cover
                  opacity-100 transition-all duration-200 ease-out
                  group-hover:scale-90 group-hover:opacity-0
                "
              />
              <span
                className="
                  absolute inset-0 flex items-center justify-center rounded-lg
                  text-current opacity-0 transition-all duration-200 ease-out
                  group-hover:scale-100 group-hover:opacity-100
                "
              >
                {collapsed && !mobileOpen ? (
                  <PanelLeftOpen size={19} strokeWidth={1.9} />
                ) : (
                  <PanelLeftClose size={19} strokeWidth={1.9} />
                )}
              </span>
            </span>

            {(!collapsed || mobileOpen) && (
              <span
                className={`
                  whitespace-nowrap text-[17px] font-bold
                  tracking-[-0.45px] ${colors.text}
                  transition-colors duration-200
                `}
              >
                ICOGON
              </span>
            )}
          </button>
        </div>

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
              setProfileOpen(false);
              setAppearanceOpen(false);
              setWorkspaceOpen((value) => !value);
            }}
            title={collapsed ? "ICOGON Workspace" : undefined}
            className={`
              flex
              w-full
              items-center
              rounded-xl
              transition
              ${colors.hoverSoft}
              ${
                (collapsed && !mobileOpen)
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

            {(!collapsed || mobileOpen) && (
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

          {workspaceOpen && (
            <div
              className={`
                absolute
                z-[200]
                overflow-hidden
                rounded-xl
                border
                shadow-xl
                transition-all
                duration-200
                ease-out
                ${collapsed ? "left-3 right-3 top-[58px] origin-top" : "left-3 right-3 top-[58px] origin-top"}
                ${colors.popup}
              `}
            >
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceOpen(false);
                    setMobileOpen(false);
                    onMobileClose?.();
                    navigate("/profile?tab=workspace");
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
                    setMobileOpen(false);
                    onMobileClose?.();
                    navigate("/builder");
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
            {/* PRIMARY NAVIGATION */}

            {/* DASHBOARD */}

            <NavLink
              to="/dashboard"
              end
              onClick={() => {
                setMobileOpen(false);
                onMobileClose?.();
              }}
              title={
                (collapsed && !mobileOpen)
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

              {(!collapsed || mobileOpen) && (
                <span className="text-[13px] font-medium">
                  Dashboard
                </span>
              )}
            </NavLink>

            {/* SEARCH */}

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onMobileClose?.();
                openSearch();
              }}
              title={
                (collapsed && !mobileOpen)
                  ? "Search"
                  : "Search (⌘ K)"
              }
              className={navClass(searchOpen)}
            >
              <Search
                size={17}
                strokeWidth={1.8}
                className="shrink-0"
              />

              {(!collapsed || mobileOpen) && (
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
              to="/dashboard?connectors="
              onClick={() => {
                setMobileOpen(false);
                onMobileClose?.();
              }}
              title={
                (collapsed && !mobileOpen)
                  ? "Connectors"
                  : undefined
              }
              className={() =>
                navClass(location.pathname === "/dashboard" && new URLSearchParams(location.search).has("connectors"))
              }
            >
              <Plug
                size={17}
                strokeWidth={1.8}
                className="shrink-0"
              />

              {(!collapsed || mobileOpen) && (
                <span className="text-[13px] font-medium">
                  Connectors
                </span>
              )}
            </NavLink>

            {/* AUTOMATIONS */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onMobileClose?.();
                navigate("/dashboard?tab=automations");
              }}
              title={collapsed && !mobileOpen ? "Automations" : undefined}
              className={navClass(location.pathname === "/dashboard" && new URLSearchParams(location.search).get("tab") === "automations")}
            >
              <Bot size={17} strokeWidth={1.8} className="shrink-0" />
              {(!collapsed || mobileOpen) && <span className="text-[13px] font-medium">Automations</span>}
            </button>

            {/* PROJECTS */}

            <NavLink
              to="/projects"
              onClick={() => {
                setMobileOpen(false);
                onMobileClose?.();
              }}
              title={
                (collapsed && !mobileOpen)
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

              {(!collapsed || mobileOpen) && (
                <span className="text-[13px] font-medium">
                  Projects
                </span>
              )}
            </NavLink>
          </nav>

          {/* =================================================
              RECENTS
          ================================================= */}

          {(!collapsed || mobileOpen) && (
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

          {collapsed && recentProjects.length > 0 && (
            <section className={`mt-4 space-y-1 border-t pt-3 ${colors.border}`}>
              {recentProjects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  type="button"
                  title={project.name}
                  aria-label={`Open ${project.name}`}
                  onClick={() => openRecentProject(project)}
                  className={`
                    flex h-10 w-full items-center justify-center rounded-xl
                    transition-all duration-200
                    ${colors.navInactive}
                  `}
                >
                  <FolderKanban size={17} strokeWidth={1.8} />
                </button>
              ))}
              <button
                type="button"
                title="View all projects"
                aria-label="View all projects"
                onClick={() => navigate("/projects")}
                className={`
                  flex h-9 w-full items-center justify-center rounded-xl
                  text-[10px] transition-colors ${colors.navInactive}
                `}
              >
                <ChevronRight size={16} />
              </button>
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

          {collapsed ? (
            <button
              type="button"
              title="Upgrade to Pro"
              aria-label="Upgrade to Pro"
              onClick={() => navigate("/pricing")}
              className="
                mb-2 flex h-10 w-full items-center justify-center
                rounded-xl bg-purple-500 text-white
                transition-all duration-200 hover:scale-[1.04] hover:bg-purple-400
              "
            >
              <Zap size={17} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/pricing")}
              className={`
                mb-3 flex w-full items-center gap-3 rounded-xl
                bg-gradient-to-r px-3 py-2.5 text-left
                transition-all duration-200 hover:brightness-105
                ${colors.upgrade}
              `}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500 text-white">
                <Zap size={15} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-semibold ${colors.upgradeText}`}>
                  Upgrade to Pro
                </p>
                <p className={`truncate text-[9px] ${colors.upgradeSubtext}`}>
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

            <div
              aria-hidden={!profileOpen}
              className={`
                absolute
                z-[250]
                ${collapsed && !mobileOpen
                  ? "left-[calc(100%+10px)] right-auto w-[260px] max-w-[min(260px,calc(100vw-96px))]"
                  : "left-0 right-0 w-auto max-w-full"}
                max-h-[min(72vh,520px)]
                overflow-y-auto
                overflow-x-hidden
                rounded-xl
                border
                shadow-2xl
                transition-[opacity,transform,visibility]
                duration-200
                ease-out
                bottom-[48px]
                origin-bottom-left
                ${profileOpen
                  ? "visible translate-y-0 scale-100 opacity-100"
                  : "invisible translate-y-2 scale-[0.98] opacity-0 pointer-events-none"}
                ${colors.popup}
              `}
            >
                {!appearanceOpen ? (
                  <>
                    {/* USER */}

                    <div
                      className={`
                        border-b
                        p-2
                        ${colors.border}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={fullName}
                            className="
                              h-7
                              w-7
                              rounded-full
                              object-cover
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-7
                              w-7
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
                              text-[12px]
                              font-semibold
                              ${colors.text}
                            `}
                          >
                            {fullName}
                          </p>

                          <p
                            className={`
                              truncate
                              text-[9px]
                              ${colors.muted}
                            `}
                          >
                            {email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* MENU */}

                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setMobileOpen(false);
                          onMobileClose?.();
                          navigate("/profile");
                        }}
                        className={`
                          flex
                          w-full
                          items-center
                          gap-2
                          rounded-lg
                          px-2
                          py-2
                          text-[12px]
                          transition
                          ${colors.popupText}
                        `}
                      >
                        <User size={14} />
                        <span>
                          Profile
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setMobileOpen(false);
                          onMobileClose?.();
                          navigate("/dashboard?tab=inbox");
                        }}
                        className={`
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          text-[12px] transition ${colors.popupText}
                        `}
                      >
                        <LifeBuoy size={14} />
                        <span>Inbox</span>
                      </button>

                      <div className={`my-1 border-t ${colors.border}`} />

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
                          px-2
                          py-2
                          text-[12px]
                          transition
                          ${colors.popupText}
                        `}
                      >
                        <span className="flex items-center gap-2">
                          <Palette size={14} />
                          Appearance
                        </span>

                        <ChevronRight
                          size={13}
                          className={
                            colors.iconMuted
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setMobileOpen(false);
                          onMobileClose?.();
                          navigate("/profile?tab=settings");
                        }}
                        className={`
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          text-[12px] transition ${colors.popupText}
                        `}
                      >
                        <Settings size={14} />
                        <span>Account settings</span>
                      </button>

                      <div className={`my-1 border-t ${colors.border}`} />

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setMobileOpen(false);
                          onMobileClose?.();
                          navigate("/docs");
                        }}
                        className={`
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          text-[12px] transition ${colors.popupText}
                        `}
                      >
                        <LifeBuoy size={14} />
                        <span>Support</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setMobileOpen(false);
                          onMobileClose?.();
                          navigate("/docs");
                        }}
                        className={`
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          text-[12px] transition ${colors.popupText}
                        `}
                      >
                        <LifeBuoy size={14} />
                        <span>Documentation</span>
                      </button>

                      {/* <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setMobileOpen(false);
                          onMobileClose?.();
                          navigate("/community");
                        }}
                        className={`
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          text-[12px] transition ${colors.popupText}
                        `}
                      >
                        <User size={14} />
                        <span>Community</span>
                      </button> */}

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setMobileOpen(false);
                          onMobileClose?.();
                          navigate("/download");
                        }}
                        className={`
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          text-[12px] transition ${colors.popupText}
                        `}
                      >
                        <FolderKanban size={14} />
                        <span>Download apps</span>
                      </button>

                      {/* <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setMobileOpen(false);
                          onMobileClose?.();
                          navigate("/");
                        }}
                        className={`
                          flex w-full items-center gap-2 rounded-lg px-2 py-2
                          text-[12px] transition ${colors.popupText}
                        `}
                      >
                        <Home size={14} />
                        <span>Homepage</span>
                      </button> */}
                    </div>

                    {/* LOGOUT */}

                    <div
                      className={`
                        border-t
                        p-1
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
                          gap-2
                          rounded-lg
                          px-2
                          py-2
                          text-[12px]
                          text-red-500
                          transition
                          hover:bg-red-500/10
                          disabled:opacity-50
                        "
                      >
                        <LogOut size={14} />

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
                        p-2
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
                          size={13}
                          className="rotate-180"
                        />
                      </button>

                      <div>
                        <p
                          className={`
                            text-[12px]
                            font-semibold
                            ${colors.text}
                          `}
                        >
                          Appearance
                        </p>

                        <p
                          className={`
                            text-[9px]
                            ${colors.muted}
                          `}
                        >
                          Choose your preferred theme
                        </p>
                      </div>
                    </div>

                    {/* THEME OPTIONS */}

                    <div className="p-1">
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
                                gap-2
                                rounded-lg
                                px-2
                                py-2
                                text-left
                                text-[12px]
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
                                  size={14}
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

            {/* PROFILE BUTTON */}

            <button
              type="button"
              title={collapsed ? `${fullName} — account menu` : undefined}
              aria-label={`${fullName} account menu`}
              aria-expanded={profileOpen}
              onClick={() => {
                setWorkspaceOpen(false);
                setAppearanceOpen(false);

                // Opening the account menu must not expand the sidebar.
                // In collapsed mode the menu is rendered as a flyout beside it.
                setProfileOpen((value) => !value);
              }}
              className={`
                group flex w-full items-center rounded-full bg-transparent
                cursor-pointer transition-all duration-200
                ${
                  (collapsed && !mobileOpen)
                    ? "justify-center p-0"
                    : "justify-start px-0 py-1"
                }
              `}
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 group-hover:ring-2 group-hover:ring-emerald-300/70 group-hover:ring-offset-2 group-hover:ring-offset-[#0b0b0b] group-hover:shadow-[0_0_16px_rgba(110,231,183,0.22)]">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="
                    flex h-8 w-8 items-center justify-center rounded-full
                    bg-gradient-to-br from-orange-500 to-orange-600
                    text-xs font-bold text-white
                  ">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>


            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          GLOBAL SEARCH
      ===================================================== */}

      {typeof document !== "undefined" &&
        createPortal(
          <GlobalSearch
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
          />,
          document.body,
        )}
    </>
  );
};

export default DashboardSidebar;