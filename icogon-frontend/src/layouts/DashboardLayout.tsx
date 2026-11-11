import { useState } from "react";
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

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const connectorsOpen = searchParams.has("connectors");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const sidebarWidth = collapsed ? 72 : 232;

  return (
    <div className={`flex h-dvh w-full overflow-hidden ${isDark ? "bg-[#080808] text-white" : "bg-[#fafafa] text-slate-900"}`}>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
        />
      )}

      <div
        className={`relative z-40 h-full shrink-0 overflow-visible transition-[width] duration-200 ease-in-out max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:!w-[min(280px,85vw)] max-md:transition-transform ${mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}`}
        style={{
          width: collapsed ? 72 : 232,
          maxWidth: "min(280px, 85vw)",
        }}
      >
        <DashboardSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader
          title={getPageTitle(location.pathname)}
          onOpenMobileMenu={() => {
            setCollapsed(false);
            setMobileOpen(true);
          }}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <Outlet context={{ sidebarWidth }} />
        </main>
      </div>

      <ConnectorModal open={connectorsOpen} sidebarWidth={sidebarWidth} />
    </div>
  );
};

export default DashboardLayout;
