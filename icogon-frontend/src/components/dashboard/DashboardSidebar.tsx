import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  Home,
  Search,
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
  UserPlus,
  ArrowRight,
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
} from "../context/ThemeContext";

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

interface SidebarTooltipState {
  label: string;
  shortcut?: string;
  anchorRight: number;
  anchorY: number;
}

// Compact inline icons, independent of additional icon packages.
const ConnectorIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
    <g transform="rotate(45 12 12)"><path d="M7 9V6a5 5 0 0 1 10 0v3H7Z"/><path d="M7 12h10v6a5 5 0 0 1-10 0v-6Z"/></g>
  </svg>
);
const AutomationIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
    <circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>
  </svg>
);

const TOOLTIP_DELAY = 180;

const findTooltipTarget = (target: EventTarget | null): HTMLElement | null =>
  target instanceof Element
    ? target.closest<HTMLElement>("[data-sidebar-tooltip]")
    : null;


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
  ] = useState(false);
  const projectTrigger = useRef<HTMLButtonElement>(null);
  const projectMenu = useRef<HTMLDivElement>(null);
  const projectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workspaceMenu = useRef<HTMLDivElement>(null);
  const workspaceTrigger = useRef<HTMLButtonElement>(null);
  const compact = collapsed && !mobileOpen;
  const [menuPosition, setMenuPosition] = useState({ left: 8, top: 8, width: 320 });
  const [projectPosition, setProjectPosition] = useState({ left: 8, top: 8, width: 260 });

  const cancelProjectClose = () => {
    if (projectTimer.current !== null) clearTimeout(projectTimer.current);
    projectTimer.current = null;
  };
  const scheduleProjectClose = () => {
    cancelProjectClose();
    projectTimer.current = setTimeout(() => setProjectsOpen(false), 240);
  };
  const openProjectsMenu = () => {
    cancelProjectClose();
    const rect = projectTrigger.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(270, window.innerWidth - 16);
    setProjectPosition({ left: Math.max(8, Math.min(rect.right + 8, window.innerWidth - width - 8)), top: Math.max(8, Math.min(rect.top, window.innerHeight - 320)), width });
    setWorkspaceOpen(false);
    setProfileOpen(false);
    setProjectsOpen(true);
  };
  useEffect(() => () => { if (projectTimer.current !== null) clearTimeout(projectTimer.current); }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setProjectsOpen(false);
      setWorkspaceOpen(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.search, mobileOpen]);
  useEffect(() => {
    if (compact) return;
    const frame = requestAnimationFrame(() => setProjectsOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [compact]);

  const [recentProjects, setRecentProjects] =
    useState<RecentProject[]>([]);

  /* Floating tooltips are rendered in a portal, outside the scrollable rail. */
  const [tooltip, setTooltip] = useState<SidebarTooltipState | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipTarget = useRef<HTMLElement | null>(null);

  const hideTooltip = useCallback(() => {
    if (tooltipTimer.current !== null) {
      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
    tooltipTarget.current = null;
    setTooltip(null);
  }, []);

  const showTooltip = useCallback((target: HTMLElement, immediate = false) => {
    if (mobileOpen || target.matches(":disabled") || (!collapsed && !target.hasAttribute("data-sidebar-toggle"))) return;
    const label = target.dataset.sidebarTooltip;
    if (!label) return;
    if (tooltipTarget.current === target) return;

    hideTooltip();
    tooltipTarget.current = target;

    const reveal = () => {
      tooltipTimer.current = null;
      if (tooltipTarget.current !== target || !target.isConnected) return;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      setTooltip({
        label,
        shortcut: target.dataset.sidebarShortcut,
        anchorRight: rect.right,
        anchorY: rect.top + rect.height / 2,
      });
    };

    if (immediate) reveal();
    else tooltipTimer.current = setTimeout(reveal, TOOLTIP_DELAY);
  }, [hideTooltip, mobileOpen, collapsed]);

  useEffect(() => {
    // Dismiss stale tooltips when scrolling, changing viewport size, or
    // using keyboard shortcuts. Native title bubbles are not used.
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey))) {
        hideTooltip();
      }
    };
    window.addEventListener("resize", hideTooltip);
    window.addEventListener("scroll", hideTooltip, true);
    window.addEventListener("blur", hideTooltip);
    document.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("resize", hideTooltip);
      window.removeEventListener("scroll", hideTooltip, true);
      window.removeEventListener("blur", hideTooltip);
      document.removeEventListener("keydown", handleKey);
      if (tooltipTimer.current !== null) clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
      tooltipTarget.current = null;
    };
  }, [hideTooltip]);

  const searchShortcut = typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
    ? "⌘ K"
    : "Ctrl K";


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

  const firstName = fullName.trim().split(/\s+/)[0] || "User";
  const workspaceName = `${firstName}'s Icogon`;
  const workspaceInitial = firstName.slice(0, 1).toUpperCase() || "U";

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
          "bg-[#171716] text-white",

        text:
          "text-white",

        muted:
          "text-[#858585]",

        navInactive:
          "text-[#c5c5c5] hover:bg-[#222222] hover:text-white",

        navActive:
          "bg-[#282827] text-white",

        hover:
          "hover:bg-[#222222]",

        hoverSoft:
          "hover:bg-[#222222]",

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
          "bg-white text-slate-900",

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
        !workspaceRef.current.contains(target) &&
        !workspaceMenu.current?.contains(target)
      ) {
        setWorkspaceOpen(false);
      }

      if (!projectTrigger.current?.contains(target) && !projectMenu.current?.contains(target)) setProjectsOpen(false);

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
      setProjectsOpen(false);
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

        setProjectsOpen(false);
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
    setProjectsOpen(false);
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

  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== "[" || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || mobileOpen || searchOpen || isProfileRoute) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"], [contenteditable="true"], .monaco-editor, .cm-editor'))) return;
      event.preventDefault();
      hideTooltip();
      setWorkspaceOpen(false);
      setProjectsOpen(false);
      setProfileOpen(false);
      setCollapsed(value => !value);
    };
    document.addEventListener("keydown", toggle);
    return () => document.removeEventListener("keydown", toggle);
  }, [hideTooltip, isProfileRoute, mobileOpen, searchOpen, setCollapsed]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <aside
        className={`
          relative z-40 flex h-full min-h-0 w-full flex-col overflow-visible border-r-0
          [&_button:not(:disabled)]:cursor-pointer [&_a]:cursor-pointer
          transition-[background-color,border-color]
          duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isProfileRoute ? "hidden" : ""}
          ${colors.sidebar}
        `}
        aria-label="Main navigation"
        onPointerOver={(event) => {
          if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
          const target = findTooltipTarget(event.target);
          if (!target || !event.currentTarget.contains(target)) return;
          if (findTooltipTarget(event.relatedTarget) === target) return;
          showTooltip(target);
        }}
        onPointerOut={(event) => {
          const target = findTooltipTarget(event.target);
          if (target && target === tooltipTarget.current && findTooltipTarget(event.relatedTarget) !== target) {
            hideTooltip();
          }
        }}
        onPointerLeave={hideTooltip}
        onPointerDownCapture={hideTooltip}
        onFocusCapture={(event) => {
          const target = findTooltipTarget(event.target);
          if (target?.matches(":focus-visible")) showTooltip(target, true);
        }}
        onBlurCapture={hideTooltip}
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
            data-sidebar-toggle
            data-sidebar-tooltip={mobileOpen || !collapsed ? "Close sidebar" : "Open sidebar"}
            data-sidebar-shortcut="["
            aria-keyshortcuts="["
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
            ref={workspaceTrigger}
            type="button"
            aria-label={workspaceName}
            aria-expanded={workspaceOpen}
            onClick={() => {
              const rect = workspaceTrigger.current?.getBoundingClientRect();
              if (!rect) return;
              const width = Math.min(320, window.innerWidth - 16);
              setMenuPosition({ left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)), top: Math.min(rect.bottom + 6, window.innerHeight - 100), width });
              setProfileOpen(false);
              setAppearanceOpen(false);
              setProjectsOpen(false);
              hideTooltip();
              setWorkspaceOpen(value => !value);
            }}
            className={`flex items-center border rounded-[13px] cursor-pointer transition-colors duration-150
              ${compact ? "mx-auto h-11 w-11 justify-center" : "w-full gap-2.5 px-2 py-2"}
              ${isDark ? "border-[#4b4b4b] hover:bg-[#303030]" : "border-slate-300 hover:bg-slate-100"}
              ${workspaceOpen ? (isDark ? "bg-[#303030]" : "bg-slate-100") : ""}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-orange-400/60 bg-[#c94700] text-sm font-semibold text-white">{workspaceInitial}</span>
            {!compact && <><span className="min-w-0 flex-1 truncate text-left text-[13px] font-semibold">{workspaceName}</span><ChevronDown size={15} className={`shrink-0 ${colors.muted} ${workspaceOpen ? "rotate-180" : ""}`} /></>}
          </button>
        </div>

        {/* =================================================
            MAIN NAVIGATION
        ================================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            [scrollbar-width:thin]
            [scrollbar-color:rgba(128,128,128,0.35)_transparent]
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
              aria-label="Dashboard"
              data-sidebar-tooltip="Dashboard"
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
              aria-label="Search"
              aria-keyshortcuts="Control+K Meta+K"
              data-sidebar-tooltip="Search"
              data-sidebar-shortcut={searchShortcut}
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
                    {searchShortcut}
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
              aria-label="Connectors"
              data-sidebar-tooltip="Connectors"
              className={() =>
                navClass(location.pathname === "/dashboard" && new URLSearchParams(location.search).has("connectors"))
              }
            >
              <ConnectorIcon />

              {(!collapsed || mobileOpen) && (
                <span className="text-[13px] font-medium">
                  Connectors
                </span>
              )}
            </NavLink>

            {/* AUTOMATIONS */}
            <NavLink
              to="/automations"
              onClick={() => {
                setMobileOpen(false);
                onMobileClose?.();
              }}
              aria-label="Automations"
              data-sidebar-tooltip="Automations"
              className={({ isActive }) => navClass(isActive)}
            >
              <AutomationIcon />
              {(!collapsed || mobileOpen) && <span className="text-[13px] font-medium">Automations</span>}
            </NavLink>

            {/* PROJECTS */}
            {compact ? (
              <button ref={projectTrigger} type="button" aria-label="Projects" aria-expanded={projectsOpen}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") openProjectsMenu(); }}
                onPointerLeave={scheduleProjectClose}
                onClick={() => { if (!projectsOpen) openProjectsMenu(); else navigate("/projects"); }}
                className={navClass(projectsOpen || location.pathname.startsWith("/projects"))}>
                <FolderKanban size={17} strokeWidth={1.8} />
              </button>
            ) : (
              <NavLink to="/projects" onClick={() => { setMobileOpen(false); onMobileClose?.(); }}
                aria-label="Projects" className={({isActive}) => navClass(isActive)}>
                <FolderKanban size={17} strokeWidth={1.8} className="shrink-0" />
                <span className="text-[13px] font-medium">Projects</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* =================================================
            BOTTOM AREA
        ================================================= */}

        <div
          className={`
            shrink-0
            p-3
          `}
        >
          {/* UPGRADE */}

          {!compact ? (
            <button
              type="button"
              data-sidebar-tooltip="Upgrade to Pro"
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
          ) : null}

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
              data-sidebar-tooltip={profileOpen ? undefined : `${fullName} — account menu`}
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
              <span style={{ "--avatar-gap": isDark ? "#171716" : "#ffffff" } as React.CSSProperties} className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 before:absolute before:-inset-3px before:rounded-full before:bg-linear-30 before:from-[#22d3ee] before:via-[#0ea5e9] before:to-[#2563eb] before:opacity-0 before:transition-opacity group-hover:before:opacity-100 group-focus-visible:before:opacity-100 group-hover:shadow-[0_0_14px_rgba(14,165,233,0.28)] after:absolute after:inset-[1px after:rounded-full after:bg-[var(--avatar-gap)">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName}
                    className="relative z-10 h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="
                    relative z-10 flex h-8 w-8 items-center justify-center rounded-full
                    bg-linear-30 from-cyan-500 to-blue-600
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

      {workspaceOpen && !isProfileRoute && createPortal(
        <div ref={workspaceMenu} role="region" aria-label="Workspace menu"
          className={`fixed z-[1100] overflow-hidden rounded-[16px] border shadow-2xl ${isDark ? "border-[#484848] bg-[#1d1d1c] text-white" : "border-slate-200 bg-white text-slate-900"}`}
          style={{ ...menuPosition, maxHeight: window.innerHeight - menuPosition.top - 8 }}>
          <div className={`overflow-y-auto rounded-b-[14px] border-b p-3 ${isDark ? "border-[#484848] bg-[#262625]" : "border-slate-200 bg-slate-50"}`} style={{maxHeight: Math.max(40, window.innerHeight - menuPosition.top - 66)}}>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-orange-400/60 bg-[#c94700] text-xl font-medium text-white">{workspaceInitial}</span>
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{workspaceName}</p><p className={`text-xs ${colors.muted}`}>Personal workspace</p></div>
            </div>
            <button type="button" disabled title="Member invitations are not connected yet" className={`mb-2 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm opacity-60 cursor-not-allowed ${isDark ? "border-[#555] bg-[#353534]" : "border-slate-300 bg-white"}`}><UserPlus size={16}/> Invite members</button>
            <button type="button" onClick={() => {setWorkspaceOpen(false); setMobileOpen(false); onMobileClose?.(); navigate("/profile?tab=workspace");}} className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm ${isDark ? "border-[#555] bg-[#353534] hover:bg-[#434342]" : "border-slate-300 bg-white hover:bg-slate-100"}`}><Settings size={16}/> Workspace settings</button>
            <div className="mt-6 flex items-center justify-between text-sm font-semibold"><span>Credits</span><span className={colors.muted}>Unavailable</span></div>
            <div className={`mt-3 h-2.5 rounded-full ${isDark ? "bg-[#414140]" : "bg-slate-200"}`} />
            <p className={`mt-3 text-xs ${colors.muted}`}>Credit balance is not connected yet.</p>
            <button type="button" disabled title="Workspace creation is not connected yet" className={`mt-4 flex w-full items-center gap-3 border-t px-2 pt-3 text-left text-sm opacity-60 cursor-not-allowed ${colors.border}`}><Plus size={16}/> New workspace</button>
          </div>
          <button type="button" onClick={() => {setWorkspaceOpen(false); navigate("/pricing");}} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm font-semibold"><Zap size={18} fill="currentColor"/> Turn Pro <span className="ml-auto rounded-lg bg-[#35264b] px-3 py-2 text-[#c6a1ff]">Upgrade</span></button>
        </div>, document.body)}

      {projectsOpen && compact && !isProfileRoute && createPortal(
        <div ref={projectMenu} role="region" aria-label="Recent projects" onPointerEnter={cancelProjectClose} onPointerLeave={scheduleProjectClose}
          className={`fixed z-[1100] overflow-y-auto rounded-[15px] border p-1.5 shadow-2xl ${isDark ? "border-[#484848] bg-[#262625] text-white" : "border-slate-200 bg-white text-slate-900"}`}
          style={{...projectPosition, maxHeight: window.innerHeight - projectPosition.top - 8}}>
          <button type="button" onClick={() => {setProjectsOpen(false); navigate("/dashboard");}} className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-sm font-medium ${colors.hover}`}><span>New project</span><Plus size={18}/></button>
          <div className={`my-1 border-t ${colors.border}`}/>
          {recentProjects.map(project => <button key={project.id} type="button" onClick={() => {setProjectsOpen(false); openRecentProject(project);}} className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${colors.hover}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${isDark ? "border-[#666] bg-[#383837]" : "border-slate-300 bg-slate-100"}`}>{project.name.charAt(0).toUpperCase()}</span><span className="truncate">{project.name}</span></button>)}
          <button type="button" onClick={() => {setProjectsOpen(false); navigate("/projects");}} className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-sm font-medium ${colors.hover}`}>All projects <ArrowRight size={17}/></button>
        </div>, document.body)}

      {/* Custom floating tooltips, never clipped by the sidebar's scrolling region. */}
      {tooltip && !mobileOpen && !searchOpen && !workspaceOpen && !projectsOpen && !profileOpen && !isProfileRoute &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            aria-hidden="true"
            className="icogon-sidebar-tooltip"
            style={{
              position: "fixed",
              zIndex: 1000,
              pointerEvents: "none",
              left: Math.min(tooltip.anchorRight + 8, Math.max(8, window.innerWidth - 180)),
              top: Math.max(22, Math.min(tooltip.anchorY, window.innerHeight - 22)),
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "max-content",
              maxWidth: Math.min(320, window.innerWidth - Math.min(tooltip.anchorRight + 8, Math.max(8, window.innerWidth - 180)) - 8),
              padding: "8px 12px",
              borderRadius: 11,
              border: `1px solid ${isDark ? "#484848" : "#d4d4d4"}`,
              background: isDark ? "#262625" : "#ffffff",
              color: isDark ? "#f5f5f5" : "#202020",
              boxShadow: isDark ? "0 3px 12px rgba(0,0,0,.32)" : "0 3px 12px rgba(0,0,0,.12)",
              fontSize: 13,
              fontWeight: 500,
              lineHeight: "18px",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
              {tooltip.label}
            </span>
            {tooltip.shortcut && (
              <kbd style={{
                flexShrink: 0,
                padding: "2px 6px",
                borderRadius: 6,
                border: `1px solid ${isDark ? "#515151" : "#dedede"}`,
                background: isDark ? "#353534" : "#f3f3f3",
                color: isDark ? "#d4d4d4" : "#525252",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}>
                {tooltip.shortcut}
              </kbd>
            )}
          </div>,
          document.body,
        )}

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