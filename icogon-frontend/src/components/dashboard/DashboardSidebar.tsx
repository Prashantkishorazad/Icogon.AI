import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Home,
  Search,
  BookOpen,
  Plug,
  LayoutGrid,
  Star,
  User,
  Users,
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
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";

import {
  useTheme,
  type Theme,
} from "../../context/ThemeContext";

import GlobalSearch from "../search/GlobalSearch";

interface DashboardSidebarProps {
  collapsed: boolean;

  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

interface NavigationItem {
  name: string;
  icon: React.ElementType;
  path: string;
}

const DashboardSidebar: React.FC<
  DashboardSidebarProps
> = ({
  collapsed,
  setCollapsed,
}) => {
  const navigate = useNavigate();

  // =====================================================
  // AUTH
  // =====================================================

  const {
    user,
    logout,
  } = useAuthStore();

  // =====================================================
  // THEME
  // =====================================================

  const {
    theme,
    setTheme,
    resolvedTheme,
  } = useTheme();

  const isDark =
    resolvedTheme === "dark";

  // =====================================================
  // STATE
  // =====================================================

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

  // =====================================================
  // REFS
  // =====================================================

  const workspaceRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  // =====================================================
  // USER
  // =====================================================

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

  // =====================================================
  // COLORS
  // =====================================================

  const colors = isDark
    ? {
        sidebar:
          "border-[#1f1f1f] bg-[#090909] text-white",

        text:
          "text-white",

        muted:
          "text-[#777]",

        navInactive:
          "text-[#a3a3a3] hover:bg-[#1c1c1c] hover:text-white",

        navActive:
          "bg-[#252525] text-white",

        hover:
          "hover:bg-[#1b1b1b]",

        hoverSoft:
          "hover:bg-[#191919]",

        border:
          "border-[#1f1f1f]",

        divider:
          "bg-[#222]",

        popup:
          "border-[#2a2a2a] bg-[#161616]",

        popupText:
          "text-[#ccc] hover:bg-[#242424]",

        iconMuted:
          "text-[#777]",

        button:
          "border-[#333] bg-[#161616] text-[#aaa]",

        upgrade:
          "from-[#1d1628] to-[#21192d]",

        upgradeText:
          "text-white",

        upgradeSubtext:
          "text-[#9d8aad]",

        themeInactive:
          "text-[#ccc] hover:bg-[#242424]",
      }
    : {
        sidebar:
          "border-slate-200 bg-white text-slate-900",

        text:
          "text-slate-900",

        muted:
          "text-slate-500",

        navInactive:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",

        navActive:
          "bg-slate-200 text-slate-900",

        hover:
          "hover:bg-slate-100",

        hoverSoft:
          "hover:bg-slate-100",

        border:
          "border-slate-200",

        divider:
          "bg-slate-200",

        popup:
          "border-slate-200 bg-white",

        popupText:
          "text-slate-700 hover:bg-slate-100",

        iconMuted:
          "text-slate-500",

        button:
          "border-slate-200 bg-white text-slate-600",

        upgrade:
          "from-purple-50 to-purple-100",

        upgradeText:
          "text-slate-900",

        upgradeSubtext:
          "text-purple-600",

        themeInactive:
          "text-slate-700 hover:bg-slate-100",
      };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const mainNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
    },

    {
      name: "Resources",
      icon: BookOpen,
      path: "/resources",
    },

    {
      name: "Connectors",
      icon: Plug,
      path: "/connectors",
    },
  ];

  const projectNavigation: NavigationItem[] = [
    {
      name: "All projects",
      icon: LayoutGrid,
      path: "/projects",
    },

    {
      name: "Starred",
      icon: Star,
      path: "/projects/starred",
    },

    {
      name: "Owned by me",
      icon: User,
      path: "/projects/owned",
    },

    {
      name: "Shared with me",
      icon: Users,
      path: "/projects/shared",
    },
  ];

  // =====================================================
  // OUTSIDE CLICK
  // =====================================================

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

  // =====================================================
  // GLOBAL SEARCH SHORTCUT
  // =====================================================

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

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const {
        error,
      } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      logout();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      setLoggingOut(false);
    }
  };

  // =====================================================
  // NAV CLASS
  // =====================================================

  const navClass = (
    isActive: boolean
  ) => {
    return `
      group
      flex
      w-full
      items-center
      rounded-lg
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

  // =====================================================
  // THEME OPTIONS
  // =====================================================

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

  // =====================================================
  // SEARCH BUTTON
  // =====================================================

  const openSearch = () => {
    setWorkspaceOpen(false);
    setProfileOpen(false);
    setAppearanceOpen(false);

    setSearchOpen(true);
  };

  // =====================================================
  // RENDER
  // =====================================================

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
              : "w-[260px]"
          }
        `}
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className={`
            flex
            h-[68px]
            shrink-0
            items-center

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
            "
          >
            <img
              src="/logo.png"
              alt="ICOGON"
              className="
                h-9
                w-9
                rounded-[10px]
                object-cover
              "
            />

            {!collapsed && (
              <span
                className={`
                  text-[18px]
                  font-bold
                  tracking-[-0.4px]
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
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                ${colors.muted}
                ${colors.hover}
              `}
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

        {/* =================================================
            COLLAPSED BUTTON
        ================================================= */}

        {collapsed && (
          <button
            type="button"
            onClick={() =>
              setCollapsed(false)
            }
            className={`
              absolute
              right-[-12px]
              top-[20px]
              z-[100]
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              border
              shadow-lg
              ${colors.button}
            `}
          >
            <PanelLeftOpen size={14} />
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
            pb-5
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
                  ? "h-11 justify-center"
                  : "gap-3 px-2 py-2"
              }
            `}
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-gradient-to-br
                from-orange-500
                to-orange-600
                text-sm
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
                      text-[13px]
                      font-semibold
                      ${colors.text}
                    `}
                  >
                    ICOGON Workspace
                  </p>

                  <p
                    className={`
                      mt-0.5
                      truncate
                      text-[11px]
                      ${colors.muted}
                    `}
                  >
                    Personal workspace
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`
                    transition-transform
                    ${colors.muted}

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

          {/* WORKSPACE DROPDOWN */}

          {workspaceOpen && !collapsed && (
            <div
              className={`
                absolute
                left-3
                right-3
                top-[52px]
                z-[200]
                overflow-hidden
                rounded-xl
                border
                shadow-2xl
                ${colors.popup}
              `}
            >
              <div className="p-2">
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
                    ${colors.popupText}
                  `}
                >
                  <Settings size={17} />
                  Workspace settings
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
                    ${colors.popupText}
                  `}
                >
                  <Plus size={17} />
                  New workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            NAVIGATION
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
                size={18}
                strokeWidth={1.8}
                className="shrink-0"
              />

              {!collapsed && (
                <span
                  className="
                    truncate
                    text-[13px]
                    font-medium
                  "
                >
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
              className={`
                group
                flex
                w-full
                items-center
                rounded-lg
                transition-all
                duration-150
                ${colors.navInactive}

                ${
                  collapsed
                    ? "h-10 justify-center"
                    : "h-10 gap-3 px-3"
                }
              `}
            >
              <Search
                size={18}
                strokeWidth={1.8}
                className="shrink-0"
              />

              {!collapsed && (
                <>
                  <span
                    className="
                      truncate
                      text-[13px]
                      font-medium
                    "
                  >
                    Search
                  </span>

                  <span
                    className={`
                      ml-auto
                      text-[10px]
                      ${colors.iconMuted}
                    `}
                  >
                    ⌘ K
                  </span>
                </>
              )}
            </button>

            {/* OTHER MAIN NAVIGATION */}

            {mainNavigation
              .filter(
                (item) =>
                  item.name !== "Dashboard"
              )
              .map((item) => {
                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={
                      collapsed
                        ? item.name
                        : undefined
                    }
                    className={({ isActive }) =>
                      navClass(isActive)
                    }
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    {!collapsed && (
                      <span
                        className="
                          truncate
                          text-[13px]
                          font-medium
                        "
                      >
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                );
              })}
          </nav>

          {/* =================================================
              PROJECTS
          ================================================= */}

          <section className="mt-7">
            {!collapsed ? (
              <p
                className={`
                  mb-2
                  px-3
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  ${colors.iconMuted}
                `}
              >
                Projects
              </p>
            ) : (
              <div
                className={`
                  mb-3
                  h-px
                  ${colors.divider}
                `}
              />
            )}

            <nav className="space-y-1">
              {projectNavigation.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      title={
                        collapsed
                          ? item.name
                          : undefined
                      }
                      className={({ isActive }) =>
                        navClass(isActive)
                      }
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        className="shrink-0"
                      />

                      {!collapsed && (
                        <span
                          className="
                            truncate
                            text-[13px]
                            font-medium
                          "
                        >
                          {item.name}
                        </span>
                      )}
                    </NavLink>
                  );
                }
              )}
            </nav>
          </section>
        </div>

        {/* =================================================
            BOTTOM
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
                py-3
                text-left
                transition
                hover:brightness-110
                ${colors.upgrade}
              `}
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-purple-500
                  text-white
                "
              >
                <Zap
                  size={16}
                  fill="currentColor"
                />
              </div>

              <div>
                <p
                  className={`
                    text-[12px]
                    font-semibold
                    ${colors.upgradeText}
                  `}
                >
                  Upgrade to Pro
                </p>

                <p
                  className={`
                    mt-0.5
                    text-[10px]
                    ${colors.upgradeSubtext}
                  `}
                >
                  Unlock more features
                </p>
              </div>
            </button>
          )}

          {/* PROFILE */}

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
                  w-[300px]
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
                              h-10
                              w-10
                              rounded-full
                              object-cover
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-full
                              bg-gradient-to-br
                              from-orange-500
                              to-orange-600
                              text-sm
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
                              mt-0.5
                              truncate
                              text-[11px]
                              ${colors.muted}
                            `}
                          >
                            {email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* MENU */}

                    <div className="p-2">
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
                          ${colors.popupText}
                        `}
                      >
                        <User size={17} />
                        Profile
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
                          ${colors.popupText}
                        `}
                      >
                        <span className="flex items-center gap-3">
                          <Palette size={17} />
                          Appearance
                        </span>

                        <ChevronRight
                          size={16}
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
                          ${colors.popupText}
                        `}
                      >
                        <Settings size={17} />
                        Settings
                      </button>
                    </div>

                    {/* LOGOUT */}

                    <div
                      className={`
                        border-t
                        p-2
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
                          hover:bg-red-500/10
                          disabled:opacity-50
                        "
                      >
                        <LogOut size={17} />

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
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          ${colors.muted}
                          ${colors.hover}
                        `}
                      >
                        ←
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
                            mt-0.5
                            text-[11px]
                            ${colors.muted}
                          `}
                        >
                          Choose your preferred theme
                        </p>
                      </div>
                    </div>

                    {/* THEME */}

                    <div className="p-2">
                      {themeOptions.map(
                        (item) => {
                          const Icon =
                            item.icon;

                          const active =
                            theme === item.value;

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
                                py-3
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
                              <Icon size={18} />

                              <span className="font-medium">
                                {item.label}
                              </span>

                              {active && (
                                <Check
                                  size={18}
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
                rounded-lg
                transition
                ${colors.hover}

                ${
                  collapsed
                    ? "justify-center p-2"
                    : "gap-3 px-2 py-2"
                }
              `}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="
                    h-9
                    w-9
                    shrink-0
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
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-orange-500
                    to-orange-600
                    text-sm
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
                      text-[12px]
                      font-medium
                      ${colors.text}
                    `}
                  >
                    {fullName}
                  </p>

                  <p
                    className={`
                      mt-0.5
                      truncate
                      text-[10px]
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

      {/* =================================================
          GLOBAL SEARCH
      ================================================= */}

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