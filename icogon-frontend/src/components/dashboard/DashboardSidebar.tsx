import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Home,
  Search,
  Compass,
  Share2,
  LayoutGrid,
  Star,
  User,
  Users,
  Settings,
  UserPlus,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  LogOut,
  Inbox,
  Plus,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";


// =====================================================
// TYPES
// =====================================================

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
  shortcut?: string;
}


// =====================================================
// COMPONENT
// =====================================================

const DashboardSidebar: React.FC<
  DashboardSidebarProps
> = ({
  collapsed,
  setCollapsed,
}) => {

  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [
    workspaceMenuOpen,
    setWorkspaceMenuOpen,
  ] = useState(false);

  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false);


  // =====================================================
  // REFS
  // =====================================================

  const workspaceRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);


  // =====================================================
  // MAIN NAVIGATION
  // =====================================================

  const mainNavigation: NavigationItem[] = [

    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
    },

    {
      name: "Search",
      icon: Search,
      path: "/search",
      shortcut: "⌘ K",
    },

    {
      name: "Resources",
      icon: Compass,
      path: "/resources",
    },

    {
      name: "Connectors",
      icon: Share2,
      path: "/connectors",
    },

  ];


  // =====================================================
  // PROJECT NAVIGATION
  // =====================================================

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
  // CLOSE MENUS ON OUTSIDE CLICK
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
        setWorkspaceMenuOpen(false);
      }


      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileMenuOpen(false);
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
  // COLLAPSE
  // =====================================================

  const handleCollapse = () => {

    setWorkspaceMenuOpen(false);
    setProfileMenuOpen(false);

    setCollapsed(true);

  };


  // =====================================================
  // PROFILE NAVIGATION
  // =====================================================

  const handleProfileNavigation = (
    path: string
  ) => {

    setProfileMenuOpen(false);

    navigate(path);

  };


  // =====================================================
  // WORKSPACE MENU
  // =====================================================

  const handleWorkspaceClick = () => {

    if (collapsed) {

      setCollapsed(false);

      setWorkspaceMenuOpen(true);

      return;

    }

    setProfileMenuOpen(false);

    setWorkspaceMenuOpen(
      previous => !previous
    );

  };


  // =====================================================
  // NAVIGATION CLASS
  // =====================================================

  const navItemClass = (
    isActive: boolean
  ) => `
    flex
    h-[52px]
    w-full
    items-center
    rounded-xl
    transition-all
    duration-150

    ${
      collapsed
        ? "justify-center"
        : "gap-5 px-4"
    }

    ${
      isActive
        ? "bg-[#303030] text-white"
        : "text-[#bdbdbd] hover:bg-[#1c1c1c] hover:text-white"
    }
  `;


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <aside
      className={`
        fixed
        left-0
        top-0
        z-[100]
        flex
        h-screen
        flex-col

        border-r
        border-white/[0.10]

        bg-black
        text-white

        transition-all
        duration-300
        ease-in-out

        ${
          collapsed
            ? "w-[84px]"
            : "w-[292px]"
        }
      `}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className={`
          flex
          h-[88px]
          shrink-0
          items-center

          px-5

          ${
            collapsed
              ? "justify-center"
              : "justify-between"
          }
        `}
      >

        {/* ICOGON BRAND */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          {/* REAL ICOGON LOGO */}

          <img
            src="/logo.png"
            alt="ICOGON"
            className="
              h-12
              w-12
              shrink-0
              rounded-[15px]
              object-cover
            "
          />


          {!collapsed && (

            <span
              className="
                text-[25px]
                font-bold
                tracking-[-0.7px]
                text-white
              "
            >
              ICOGON
            </span>

          )}

        </div>


        {/* COLLAPSE */}

        {!collapsed && (

          <button
            type="button"
            onClick={handleCollapse}
            title="Collapse sidebar"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400

              transition

              hover:bg-white/[0.08]
              hover:text-white
            "
          >

            <PanelLeftClose
              size={21}
              strokeWidth={1.8}
            />

          </button>

        )}

      </header>


      {/* =================================================
          EXPAND BUTTON
      ================================================= */}

      {collapsed && (

        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
          className="
            absolute
            right-[-14px]
            top-[28px]
            z-[150]

            flex
            h-7
            w-7
            items-center
            justify-center

            rounded-full

            border
            border-[#3d3d3d]

            bg-[#242424]

            text-slate-300

            shadow-xl

            transition

            hover:bg-[#303030]
            hover:text-white
          "
        >

          <PanelLeftOpen
            size={15}
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
          px-4
          pb-4
        "
      >

        {/* WORKSPACE BUTTON */}

        <button
          type="button"
          onClick={handleWorkspaceClick}
          aria-expanded={workspaceMenuOpen}
          className={`
            flex
            w-full
            items-center
            rounded-2xl

            border
            border-white/[0.18]

            bg-[#242424]

            text-left

            transition-all
            duration-150

            hover:border-white/[0.25]
            hover:bg-[#2c2c2c]

            ${
              collapsed
                ? "h-[58px] justify-center"
                : "min-h-[92px] gap-4 px-4 py-3"
            }
          `}
        >

          {/* WORKSPACE ICON */}

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center

              rounded-xl

              bg-[#f04b00]

              text-[22px]
              font-semibold
              text-white

              shadow-[0_4px_16px_rgba(240,75,0,0.18)]
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
                "
              >

                <div
                  className="
                    truncate
                    text-[18px]
                    font-semibold
                    text-white
                  "
                >
                  ICOGON Workspace
                </div>


                <div
                  className="
                    mt-1
                    text-[15px]
                    text-slate-400
                  "
                >
                  Personal workspace
                </div>

              </div>


              <ChevronDown
                size={20}
                strokeWidth={1.8}
                className={`
                  shrink-0
                  text-slate-400
                  transition-transform
                  duration-200

                  ${
                    workspaceMenuOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </>

          )}

        </button>


        {/* =================================================
            WORKSPACE POPUP
        ================================================= */}

        {workspaceMenuOpen && !collapsed && (

          <div
            className="
              absolute

              left-[10px]
              top-[calc(100%-5px)]

              z-[300]

              w-[calc(100%-20px)]

              overflow-hidden

              rounded-[22px]

              border
              border-white/[0.18]

              bg-[#292929]

              shadow-[0_28px_80px_rgba(0,0,0,0.75)]

              backdrop-blur-2xl
            "
          >

            {/* =================================================
                WORKSPACE HEADER
            ================================================= */}

            <div
              className="
                border-b
                border-white/[0.10]
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-16
                    w-16
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    bg-[#f04b00]

                    text-[27px]
                    font-semibold
                  "
                >
                  I
                </div>


                <div
                  className="
                    min-w-0
                  "
                >

                  <div
                    className="
                      truncate
                      text-[19px]
                      font-semibold
                      text-white
                    "
                  >
                    ICOGON Workspace
                  </div>


                  <div
                    className="
                      mt-1
                      text-[14px]
                      text-slate-400
                    "
                  >
                    Free Plan • 1 member
                  </div>

                </div>

              </div>


              {/* =================================================
                  INVITE MEMBERS
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate("/workspace/members")
                }
                className="
                  mt-4

                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-3

                  rounded-xl

                  border
                  border-white/[0.18]

                  bg-[#363636]

                  text-[16px]
                  font-medium
                  text-white

                  transition

                  hover:bg-[#404040]
                "
              >

                <UserPlus
                  size={20}
                  strokeWidth={1.8}
                />

                Invite members

              </button>


              {/* =================================================
                  WORKSPACE SETTINGS
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate("/workspace/settings")
                }
                className="
                  mt-2.5

                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-3

                  rounded-xl

                  border
                  border-white/[0.18]

                  bg-[#363636]

                  text-[16px]
                  font-medium
                  text-white

                  transition

                  hover:bg-[#404040]
                "
              >

                <Settings
                  size={20}
                  strokeWidth={1.8}
                />

                Settings

              </button>

            </div>


            {/* =================================================
                CREDITS
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                navigate("/billing")
              }
              className="
                w-full
                border-b
                border-white/[0.10]

                px-5
                py-5

                text-left

                transition

                hover:bg-white/[0.03]
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <span
                  className="
                    text-[17px]
                    font-semibold
                    text-white
                  "
                >
                  Credits
                </span>


                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <span
                    className="
                      text-[17px]
                      text-slate-300
                    "
                  >
                    10 left
                  </span>

                  <ChevronRight
                    size={18}
                    className="text-slate-400"
                  />

                </div>

              </div>


              {/* CREDIT BAR */}

              <div
                className="
                  mt-4
                  h-2.5
                  w-full
                  overflow-hidden
                  rounded-full
                  bg-[#3b3b3b]
                "
              >

                <div
                  className="
                    h-full
                    w-full
                    rounded-full
                    bg-[#4779ff]
                  "
                />

              </div>


              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-2
                  text-[13px]
                  text-slate-400
                "
              >

                <span
                  className="
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-slate-300
                  "
                />

                Daily credits reset at midnight UTC

              </div>

            </button>


            {/* =================================================
                NEW WORKSPACE
            ================================================= */}

            <button
              type="button"
              onClick={() => {
                setWorkspaceMenuOpen(false);
                navigate("/workspace/new");
              }}
              className="
                flex
                w-full
                items-center
                gap-4

                border-b
                border-white/[0.10]

                px-5
                py-5

                text-left

                text-[17px]
                text-white

                transition

                hover:bg-white/[0.04]
              "
            >

              <Plus
                size={25}
                strokeWidth={1.6}
                className="text-slate-300"
              />

              New workspace

            </button>


            {/* =================================================
                TURN PRO
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between

                bg-[#202020]

                px-5
                py-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <Zap
                  size={22}
                  fill="currentColor"
                  className="text-white"
                />

                <span
                  className="
                    text-[17px]
                    font-medium
                    text-white
                  "
                >
                  Turn Pro
                </span>

              </div>


              <button
                type="button"
                onClick={() => {
                  setWorkspaceMenuOpen(false);
                  navigate("/billing");
                }}
                className="
                  rounded-xl

                  bg-[#422461]

                  px-5
                  py-2.5

                  text-[16px]
                  font-medium

                  text-[#c89aff]

                  transition

                  hover:bg-[#503074]
                "
              >
                Upgrade
              </button>

            </div>

          </div>

        )}

      </div>


      {/* =================================================
          SCROLLABLE NAVIGATION
      ================================================= */}

      <div
        className="
          min-h-0
          flex-1

          overflow-y-auto
          overflow-x-hidden

          px-4
          pb-5

          [scrollbar-width:thin]
          [scrollbar-color:rgba(255,255,255,0.15)_transparent]
        "
      >

        {/* =================================================
            MAIN NAV
        ================================================= */}

        <nav
          className="
            space-y-1
          "
        >

          {mainNavigation.map(
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

                  className={({
                    isActive,
                  }) =>
                    navItemClass(isActive)
                  }
                >

                  <Icon
                    size={25}
                    strokeWidth={1.8}
                    className="shrink-0"
                  />


                  {!collapsed && (

                    <span
                      className="
                        truncate
                        text-[18px]
                      "
                    >
                      {item.name}
                    </span>

                  )}


                  {!collapsed &&
                    item.shortcut && (

                    <span
                      className="
                        ml-auto

                        rounded-lg

                        bg-[#303030]

                        px-2.5
                        py-1

                        text-[12px]

                        text-slate-400
                      "
                    >
                      {item.shortcut}
                    </span>

                  )}

                </NavLink>

              );

            }
          )}

        </nav>


        {/* =================================================
            PROJECTS
        ================================================= */}

        <section
          className="
            mt-8
          "
        >

          {!collapsed && (

            <div
              className="
                mb-3
                px-4

                text-[18px]
                font-semibold

                text-slate-400
              "
            >
              Projects
            </div>

          )}


          {collapsed && (

            <div
              className="
                mb-3
                h-px
                bg-white/[0.10]
              "
            />

          )}


          <nav
            className="
              space-y-1
            "
          >

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

                    className={({
                      isActive,
                    }) =>
                      navItemClass(isActive)
                    }
                  >

                    <Icon
                      size={25}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />


                    {!collapsed && (

                      <span
                        className="
                          truncate
                          text-[18px]
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
          BOTTOM FIXED AREA
      ================================================= */}

      <div
        className="
          relative
          z-[110]

          shrink-0

          border-t
          border-white/[0.10]

          bg-black

          p-4
        "
      >

        {/* =================================================
            UPGRADE CARD
        ================================================= */}

        {!collapsed && (

          <button
            type="button"
            onClick={() =>
              navigate("/billing")
            }
            className="
              mb-3

              flex
              w-full
              items-center
              justify-between

              rounded-2xl

              border
              border-white/[0.18]

              bg-[#242424]

              px-4
              py-4

              text-left

              transition

              hover:border-white/[0.25]
              hover:bg-[#2c2c2c]
            "
          >

            <div>

              <div
                className="
                  text-[17px]
                  font-bold
                  text-white
                "
              >
                Upgrade to Pro
              </div>


              <div
                className="
                  mt-1
                  text-[14px]
                  text-slate-400
                "
              >
                Unlock more features
              </div>

            </div>


            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center

                rounded-full

                bg-purple-600

                text-white
              "
            >

              <Zap
                size={24}
                fill="currentColor"
              />

            </div>

          </button>

        )}


        {/* =================================================
            PROFILE
        ================================================= */}

        <div
          ref={profileRef}
          className="
            relative
          "
        >

          {/* =================================================
              PROFILE POPUP
          ================================================= */}

          {profileMenuOpen && !collapsed && (

            <div
              className="
                absolute

                bottom-[76px]
                left-0

                z-[250]

                w-[360px]
                max-w-[calc(100vw-24px)]

                overflow-hidden

                rounded-2xl

                border
                border-white/[0.18]

                bg-[#292929]

                shadow-[0_28px_80px_rgba(0,0,0,0.75)]

                backdrop-blur-2xl
              "
            >

              {/* PROFILE HEADER */}

              <div
                className="
                  border-b
                  border-white/[0.10]
                  p-2
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    handleProfileNavigation(
                      "/profile"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-4

                    rounded-xl

                    bg-[#333333]

                    px-4
                    py-3.5

                    text-left

                    transition

                    hover:bg-[#3a3a3a]
                  "
                >

                  <img
                    src="/logo.png"
                    alt="Prashant Kishor"
                    className="
                      h-12
                      w-12
                      shrink-0
                      rounded-full
                      object-cover
                    "
                  />


                  <div
                    className="
                      min-w-0
                    "
                  >

                    <div
                      className="
                        truncate
                        text-[18px]
                        font-bold
                        text-white
                      "
                    >
                      Prashant Kishor
                    </div>


                    <div
                      className="
                        mt-0.5
                        truncate
                        text-[14px]
                        text-slate-400
                      "
                    >
                      Personal account
                    </div>

                  </div>

                </button>

              </div>


              {/* PROFILE OPTIONS */}

              <div
                className="
                  border-b
                  border-white/[0.10]
                  p-2
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    handleProfileNavigation(
                      "/profile"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-4

                    rounded-xl

                    px-4
                    py-3

                    text-left

                    text-[17px]
                    text-white

                    transition

                    hover:bg-white/[0.08]
                  "
                >

                  <User
                    size={23}
                    strokeWidth={1.8}
                  />

                  Profile

                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleProfileNavigation(
                      "/settings"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between

                    rounded-xl

                    px-4
                    py-3

                    text-left

                    text-[17px]
                    text-white

                    transition

                    hover:bg-white/[0.08]
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >

                    <Settings
                      size={23}
                      strokeWidth={1.8}
                    />

                    Settings

                  </div>


                  <span
                    className="
                      text-[13px]
                      text-slate-400
                    "
                  >
                    ⌘ .
                  </span>

                </button>

              </div>


              {/* HELP */}

              <div
                className="
                  border-b
                  border-white/[0.10]
                  p-2
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    handleProfileNavigation(
                      "/support"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between

                    rounded-xl

                    px-4
                    py-3

                    text-[17px]
                    text-white

                    transition

                    hover:bg-white/[0.08]
                  "
                >

                  <span>
                    Support
                  </span>

                  <ChevronRight
                    size={19}
                    className="text-slate-400"
                  />

                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleProfileNavigation(
                      "/documentation"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between

                    rounded-xl

                    px-4
                    py-3

                    text-[17px]
                    text-white

                    transition

                    hover:bg-white/[0.08]
                  "
                >

                  <span>
                    Documentation
                  </span>

                  <ChevronRight
                    size={19}
                    className="text-slate-400"
                  />

                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleProfileNavigation(
                      "/community"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    rounded-xl

                    px-4
                    py-3

                    text-[17px]
                    text-white

                    transition

                    hover:bg-white/[0.08]
                  "
                >
                  Community
                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleProfileNavigation("/")
                  }
                  className="
                    flex
                    w-full
                    items-center

                    rounded-xl

                    px-4
                    py-3

                    text-[17px]
                    text-white

                    transition

                    hover:bg-white/[0.08]
                  "
                >
                  Homepage
                </button>

              </div>


              {/* SIGN OUT */}

              <div
                className="
                  p-2
                "
              >

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-4

                    rounded-xl

                    px-4
                    py-3

                    text-left

                    text-[17px]
                    text-white

                    transition

                    hover:bg-red-500/[0.10]
                    hover:text-red-400
                  "
                >

                  <LogOut
                    size={23}
                    strokeWidth={1.8}
                  />

                  Sign out

                </button>

              </div>

            </div>

          )}


          {/* =================================================
              PROFILE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() => {

              setWorkspaceMenuOpen(false);

              setProfileMenuOpen(
                previous => !previous
              );

            }}
            aria-expanded={profileMenuOpen}
            className={`
              flex
              w-full
              items-center

              rounded-xl

              text-left

              transition-all

              ${
                profileMenuOpen
                  ? "bg-[#242424]"
                  : "hover:bg-[#1d1d1d]"
              }

              ${
                collapsed
                  ? "justify-center p-2"
                  : "gap-4 px-3 py-2.5"
              }
            `}
          >

            {/* PROFILE IMAGE */}

            <img
              src="/logo.png"
              alt="Prashant"
              className="
                h-12
                w-12
                shrink-0
                rounded-full
                object-cover
              "
            />


            {!collapsed && (

              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <div
                  className="
                    truncate
                    text-[18px]
                    font-semibold
                    text-white
                  "
                >
                  Prashant
                </div>


                <div
                  className="
                    mt-0.5
                    truncate
                    text-[14px]
                    text-slate-400
                  "
                >
                  Personal account
                </div>

              </div>

            )}

          </button>

        </div>


        {/* =================================================
            NOTIFICATION
        ================================================= */}

        <button
          type="button"
          className={`
            relative

            mt-2

            flex
            h-10
            w-full

            items-center

            rounded-xl

            text-slate-500

            transition

            hover:bg-[#222222]
            hover:text-white

            ${
              collapsed
                ? "justify-center"
                : "px-3"
            }
          `}
        >

          <Inbox
            size={22}
            strokeWidth={1.8}
          />


          <span
            className="
              absolute
              right-1
              top-1

              h-2.5
              w-2.5

              rounded-full

              bg-red-400

              ring-2
              ring-black
            "
          />

        </button>

      </div>

    </aside>
  );
};


export default DashboardSidebar;