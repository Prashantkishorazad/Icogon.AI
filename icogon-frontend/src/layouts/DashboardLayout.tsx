import {
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useTheme } from "../components/context/ThemeContext";
import ConnectorModal from "../components/connectors/ConnectorModal";

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/automations")) return "Automations";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.toLowerCase().startsWith("/connectors")) return "Connectors";
  if (pathname.startsWith("/profile")) return "Profile";
  return "Dashboard";
};

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 280;
const SIDEBAR_MIDPOINT = (SIDEBAR_COLLAPSED_WIDTH + SIDEBAR_EXPANDED_WIDTH) / 2;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const connectorsOpen = searchParams.has("connectors");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const drag = useRef<{ x: number; width: number; moved: boolean } | null>(null);

  const isProfileRoute = useMemo(
    () =>
      location.pathname === "/profile" ||
      location.pathname.startsWith("/profile/"),
    [location.pathname],
  );
  const isDashboardRoute = location.pathname === "/dashboard";

  const settledWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  const sidebarWidth = isProfileRoute ? 0 : (dragWidth ?? settledWidth);
  const visuallyCollapsed = !mobileOpen && sidebarWidth < SIDEBAR_MIDPOINT;

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || mobileOpen) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const width = event.currentTarget.parentElement?.getBoundingClientRect().width ?? settledWidth;
    drag.current = { x: event.clientX, width, moved: false };
    setDragWidth(width);
  };

  const moveResize = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    const delta = event.clientX - start.x;
    if (Math.abs(delta) > 4) start.moved = true;
    if (!start.moved) return;
    setDragWidth(Math.max(SIDEBAR_COLLAPSED_WIDTH,
      Math.min(SIDEBAR_EXPANDED_WIDTH, start.width + delta)));
  };

  const finishResize = (event: PointerEvent<HTMLDivElement>, cancel = false) => {
    const start = drag.current;
    if (!start) return;
    drag.current = null;
    if (!cancel) {
      const delta = event.clientX - start.x;
      setCollapsed(start.moved || Math.abs(delta) > 4
        ? start.width + delta < SIDEBAR_MIDPOINT : !collapsed);
    }
    setDragWidth(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const resizeByKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Enter", " ", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "ArrowLeft" || event.key === "Home") setCollapsed(true);
    else if (event.key === "ArrowRight" || event.key === "End") setCollapsed(false);
    else setCollapsed(value => !value);
  };

  return (
    <>
      <style>{`
        .dashboard-shell {
          --dashboard-sidebar-width: ${sidebarWidth}px;
          position: relative;
          isolation: isolate;
          --dashboard-shell-color: ${isDark ? "#171716" : "#ffffff"};
          background: var(--dashboard-shell-color);
        }

        /* The ambient canvas is clipped inside the workspace; the shell stays a solid color. */
        .dashboard-ambient-canvas {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          background:
            ${
              isDark
                ? `
                  radial-gradient(ellipse 42% 62% at 18% 56%, rgba(42, 91, 150, 0.42) 0%, rgba(42, 91, 150, 0) 76%),
                  radial-gradient(ellipse 42% 56% at 49% 38%, rgba(116, 55, 111, 0.34) 0%, rgba(116, 55, 111, 0) 76%),
                  radial-gradient(ellipse 38% 58% at 78% 74%, rgba(162, 68, 42, 0.38) 0%, rgba(162, 68, 42, 0) 76%),
                  linear-gradient(135deg, #222222 0%, #242122 52%, #24211d 100%)
                `
                : `
                  radial-gradient(ellipse 42% 62% at 18% 56%, rgba(93, 151, 218, 0.24) 0%, rgba(93, 151, 218, 0) 76%),
                  radial-gradient(ellipse 42% 56% at 49% 38%, rgba(188, 117, 183, 0.20) 0%, rgba(188, 117, 183, 0) 76%),
                  radial-gradient(ellipse 38% 58% at 78% 74%, rgba(227, 143, 101, 0.22) 0%, rgba(227, 143, 101, 0) 76%),
                  linear-gradient(135deg, #f8f9fb 0%, #faf7fa 52%, #faf6f1 100%)
                `
            };
        }

        .dashboard-ambient-canvas::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: ${isDark ? "0.12" : "0.08"};
          background-image:
            repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(255,255,255,0.12) 4px),
            repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(0,0,0,0.08) 4px);
          background-size: 4px 4px;
          mix-blend-mode: soft-light;
        }

        .dashboard-outer-scroll-dark,
        .dashboard-outer-scroll-light {
          scrollbar-width: thin;
          scrollbar-gutter: auto;
        }
        .dashboard-outer-scroll-dark { scrollbar-color: #555 transparent; }
        .dashboard-outer-scroll-light { scrollbar-color: #a1a1aa transparent; }
        .dashboard-outer-scroll-dark::-webkit-scrollbar,
        .dashboard-outer-scroll-light::-webkit-scrollbar { width: 8px; }
        .dashboard-outer-scroll-dark::-webkit-scrollbar-track,
        .dashboard-outer-scroll-light::-webkit-scrollbar-track { background: transparent; }
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
          box-sizing: border-box;
          height: 100%;
          min-height: 0;
          flex: 0 0 var(--dashboard-sidebar-width);
          width: var(--dashboard-sidebar-width);
          padding-block: 0;
          background: var(--dashboard-shell-color);
          overflow: visible;
          will-change: width, flex-basis;
          transition:
            width 320ms cubic-bezier(0.22, 1, 0.36, 1),
            flex-basis 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* The workspace owns the curve; navigation is a straight rail. */
        .dashboard-sidebar-shell > aside {
          height: 100%;
          border-radius: 0;
          border-right: 0;
          box-shadow: none;
          background: var(--dashboard-shell-color);
          background-clip: padding-box;
        }

        .dashboard-shell[data-resizing="true"] .dashboard-sidebar-shell {
          transition: none;
        }
        .dashboard-shell[data-resizing="true"] { user-select: none; cursor: col-resize; }
        .dashboard-resize-handle {
          position: absolute;
          top: 12px;
          bottom: 12px;
          right: -5px;
          width: 10px;
          z-index: 60;
          cursor: col-resize;
          touch-action: none;
          outline: none;
        }
        .dashboard-resize-handle:focus-visible { background: rgba(100,150,255,.35); }
        .dashboard-workspace-frame {
          position: relative;
          box-sizing: border-box;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid ${isDark ? "#3b3b3a" : "#dedee2"};
          border-radius: 22px;
          margin: 8px 8px 8px 0;
          min-height: calc(100dvh - 16px);
          background: ${isDark ? "#222222" : "#f8f9fb"};
          background-clip: padding-box;
          box-shadow: none;
        }

        .dashboard-frame-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            ${isDark
              ? "radial-gradient(ellipse 65% 56% at 52% 22%, rgba(255,255,255,0.035), transparent 72%)"
              : "radial-gradient(ellipse 65% 56% at 52% 22%, rgba(255,255,255,0.48), transparent 72%)"};
        }

        .dashboard-workspace-frame > :not(.dashboard-frame-glow):not(.dashboard-ambient-canvas) {
          position: relative;
          z-index: 1;
        }

        /* The dashboard page uses the layout canvas instead of painting a second page background. */
        .dashboard-outlet-dashboard > div:first-child {
          background-color: transparent !important;
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
            padding-block: 0;
            transform: translateX(-105%);
            transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .dashboard-sidebar-shell > aside {
            border-radius: 0;
          }
          .dashboard-sidebar-shell.dashboard-sidebar-mobile-open {
            transform: translateX(0);
          }
          .dashboard-resize-handle { display: none; }
          .dashboard-workspace-frame {
            margin: 8px;
            min-height: calc(100dvh - 16px);
            border-radius: 24px;
            clip-path: inset(0 round 24px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-sidebar-shell {
            transition-duration: 1ms !important;
          }
        }
      `}</style>

      <div
        className={`dashboard-shell flex h-dvh w-full overflow-hidden ${
          isDark ? "text-white" : "text-slate-900"
        }`}
        data-resizing={dragWidth !== null}
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
          >
            <DashboardSidebar
              collapsed={visuallyCollapsed}
              setCollapsed={setCollapsed}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              onMobileClose={() => setMobileOpen(false)}
            />
            <div
              className="dashboard-resize-handle"
              role="separator"
              aria-label="Resize navigation sidebar"
              aria-orientation="vertical"
              aria-valuemin={SIDEBAR_COLLAPSED_WIDTH}
              aria-valuemax={SIDEBAR_EXPANDED_WIDTH}
              aria-valuenow={Math.round(sidebarWidth)}
              tabIndex={0}
              onPointerDown={startResize}
              onPointerMove={moveResize}
              onPointerUp={event => finishResize(event)}
              onPointerCancel={event => finishResize(event, true)}
              onLostPointerCapture={event => finishResize(event, true)}
              onKeyDown={resizeByKeyboard}
            />
          </div>
        )}

        <div
          className={`
            relative z-10 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden
            overscroll-contain
            ${isDark ? "dashboard-outer-scroll-dark" : "dashboard-outer-scroll-light"}
          `}
        >
          <div
            className={`
              dashboard-workspace-frame
              relative isolate box-border
              flex flex-col
            `}
          >
            <div className="dashboard-ambient-canvas" aria-hidden="true" />
            <div className="dashboard-frame-glow" aria-hidden="true" />

            <DashboardHeader
              title={getPageTitle(location.pathname)}
              onOpenMobileMenu={() => {
                setCollapsed(false);
                setMobileOpen(true);
              }}
            />

            <main
              className={`dashboard-outlet ${
                isDashboardRoute ? "dashboard-outlet-dashboard" : ""
              } relative z-10 min-h-0 flex-1 overflow-visible`}
            >
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
