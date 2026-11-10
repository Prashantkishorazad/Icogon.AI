import { useState } from "react";
import {
  Outlet,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type React from "react";
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

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const [searchParams] = useSearchParams();

  // The builder owns its workspace header and AI panel. Hiding the
  // dashboard chrome prevents two headers and two competing sidebars.
  const isBuilderRoute =
    location.pathname === "/builder" ||
    location.pathname.startsWith("/builder/");

  const connectorsOpen =
    !isBuilderRoute && searchParams.has("connectors");

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const sidebarWidth = collapsed ? 72 : 232;

  return (
    <div
      className={`flex h-dvh w-full overflow-hidden ${
        isDark
          ? "bg-[#080808] text-white"
          : "bg-[#fafafa] text-slate-900"
      }`}
    >
      {!isBuilderRoute && mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
        />
      )}

      {!isBuilderRoute && (
        <div
          className={`
            relative z-40 h-full shrink-0 overflow-visible
            transition-[width] duration-200 ease-in-out
            w-[var(--sidebar-width)]
            max-md:fixed max-md:inset-y-0 max-md:left-0
            max-md:z-50 max-md:!w-[min(280px,85vw)]
            max-md:transition-transform
            ${
              mobileOpen
                ? "max-md:translate-x-0"
                : "max-md:-translate-x-full"
            }
          `}
          style={
            {
              "--sidebar-width": `${sidebarWidth}px`,
            } as React.CSSProperties
          }
        >
          <DashboardSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {!isBuilderRoute && (
          <DashboardHeader
            title={getPageTitle(location.pathname)}
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((value) => !value)}
            onOpenMobileMenu={() => {
              setCollapsed(false);
              setMobileOpen(true);
            }}
          />
        )}

        <main
          className={
            isBuilderRoute
              ? "min-h-0 flex-1 overflow-hidden"
              : "min-h-0 flex-1 overflow-y-auto overscroll-contain"
          }
        >
          <Outlet context={{ sidebarWidth }} />
        </main>
      </div>

      {!isBuilderRoute && (
        <ConnectorModal
          open={connectorsOpen}
          sidebarWidth={sidebarWidth}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
