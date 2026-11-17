import { useCallback, useMemo, useRef, useState, type PointerEvent } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useTheme } from "../context/ThemeContext";
import ConnectorModal from "../components/connectors/ConnectorModal";

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.toLowerCase().startsWith("/connectors")) return "Connectors";
  if (pathname.startsWith("/profile")) return "Profile";
  return "Dashboard";
};

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 232;
const HOVER_COLLAPSE_DELAY = 360;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const connectorsOpen = searchParams.has("connectors");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerInsideSidebar = useRef(false);

  const isProfileRoute = useMemo(
    () =>
      location.pathname === "/profile" ||
      location.pathname.startsWith("/profile/"),
    [location.pathname],
  );

  const sidebarWidth = isProfileRoute
    ? 0
    : collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_EXPANDED_WIDTH;

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
  }, []);

  const expandFromPointer = useCallback(() => {
    if (isProfileRoute || mobileOpen) return;
    clearCollapseTimer();
    pointerInsideSidebar.current = true;
    setCollapsed(false);
  }, [isProfileRoute, mobileOpen, clearCollapseTimer]);

  const scheduleHoverCollapse = useCallback(() => {
    if (isProfileRoute || mobileOpen) return;
    pointerInsideSidebar.current = false;
    clearCollapseTimer();
    collapseTimer.current = setTimeout(() => {
      if (!pointerInsideSidebar.current) setCollapsed(true);
      collapseTimer.current = null;
    }, HOVER_COLLAPSE_DELAY);
  }, [isProfileRoute, mobileOpen, clearCollapseTimer]);

  const handleSidebarPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      // Only mouse/trackpad hover should trigger this. Touch remains click-driven.
      if (event.pointerType !== "mouse") return;
      if (event.clientX <= SIDEBAR_COLLAPSED_WIDTH + 12) {
        expandFromPointer();
      }
    },
    [expandFromPointer],
  );

  return (
    <>
      <style>{`
        .dashboard-outer-scroll-dark,
        .dashboard-outer-scroll-light {
          scrollbar-width: thin;
          scrollbar-gutter: stable;
        }
        .dashboard-outer-scroll-dark { scrollbar-color: #555 #080808; }
        .dashboard-outer-scroll-light { scrollbar-color: #a1a1aa #f4f4f5; }
        .dashboard-outer-scroll-dark::-webkit-scrollbar,
        .dashboard-outer-scroll-light::-webkit-scrollbar { width: 8px; }
        .dashboard-outer-scroll-dark::-webkit-scrollbar-track { background: #080808; }
        .dashboard-outer-scroll-light::-webkit-scrollbar-track { background: #f4f4f5; }
        .dashboard-outer-scroll-dark::-webkit-scrollbar-thumb,
        .dashboard-outer-scroll-light::-webkit-scrollbar-thumb {
          border: 2px solid transparent;
          background-clip: padding-box;
          border-radius: 999px;
        }
        .dashboard-outer-scroll-dark::-webkit-scrollbar-thumb { background-color: #555; }
        .dashboard-outer-scroll-light::-webkit-scrollbar-thumb { background-color: #a1a1aa; }

        .dashboard-sidebar-shell {
          position: relative;
          z-index: 20;
          height: 100%;
          min-height: 0;
          flex: 0 0 var(--dashboard-sidebar-width);
          width: var(--dashboard-sidebar-width);
          overflow: visible;
          will-change: width, flex-basis;
          transition:
            width 360ms cubic-bezier(0.22, 1, 0.36, 1),
            flex-basis 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .dashboard-workspace-frame {
          box-sizing: border-box;
          isolation: isolate;
          overflow: hidden;
          border-radius: 24px;
          clip-path: inset(0 round 24px);
        }

        @media (max-width: 767px) {
          .dashboard-sidebar-shell {
            position: fixed;
            inset: 0 auto 0 0;
            z-index: 50;
            width: min(280px, 84vw);
            max-width: 280px;
            height: 100dvh;
            flex: none;
            transform: translateX(-105%);
            transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .dashboard-sidebar-shell.dashboard-sidebar-mobile-open {
            transform: translateX(0);
          }
          .dashboard-workspace-frame {
            border-radius: 0;
            clip-path: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-sidebar-shell {
            transition-duration: 1ms !important;
          }
        }
      `}</style>

      <div
        className={`flex h-dvh w-full overflow-hidden ${
          isDark ? "bg-[#080808] text-white" : "bg-[#f4f4f5] text-slate-900"
        }`}
        onPointerMove={handleSidebarPointerMove}
      >
        {!isProfileRoute && mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] md:hidden"
          />
        )}

        {!isProfileRoute && (
          <div
            className={`dashboard-sidebar-shell ${
              mobileOpen ? "dashboard-sidebar-mobile-open" : ""
            }`}
            style={{
              ["--dashboard-sidebar-width" as string]: `${sidebarWidth}px`,
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse" && !mobileOpen) {
                expandFromPointer();
              }
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse" && !mobileOpen) {
                scheduleHoverCollapse();
              }
            }}
          >
            <DashboardSidebar
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              onMobileClose={() => setMobileOpen(false)}
            />
          </div>
        )}

        <div
          className={`
            min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden
            overscroll-contain
            ${isDark ? "dashboard-outer-scroll-dark" : "dashboard-outer-scroll-light"}
          `}
        >
          <div
            className={`
              dashboard-workspace-frame
              relative isolate box-border
              flex min-h-full flex-col
              md:my-2 md:mr-2 md:ml-0
              md:min-h-[calc(100dvh-16px)]
              md:rounded-[24px] md:border
              md:shadow-[0_0_0_1px_rgba(255,255,255,0.025),0_18px_55px_rgba(0,0,0,0.12)]
              ${
                isDark
                  ? "md:border-white/[0.18] md:bg-[#1d1d1d]"
                  : "md:border-slate-300 md:bg-white md:shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
              }
            `}
          >
            <DashboardHeader
              title={getPageTitle(location.pathname)}
              onOpenMobileMenu={() => {
                setCollapsed(false);
                setMobileOpen(true);
              }}
            />
            <main className="min-h-0 flex-1 overflow-visible">
              <Outlet context={{ sidebarWidth }} />
            </main>
          </div>
        </div>

        <ConnectorModal open={connectorsOpen} sidebarWidth={sidebarWidth} />
      </div>
    </>
  );
};

export default DashboardLayout;
