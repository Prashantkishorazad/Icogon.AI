import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Settings2 } from "lucide-react";
import SettingsSidebar from "../components/settings/SettingsSidebar";

const SettingsLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#202020]">
      <SettingsSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="min-h-screen lg:pl-[276px]">
        <header className="sticky top-0 z-30 flex h-[62px] items-center gap-3 border-b border-[#e9e9e9] bg-white/95 px-4 backdrop-blur sm:px-7">
          <button
            type="button"
            aria-label="Open settings navigation"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#555] hover:bg-[#f2f2f2] lg:hidden"
          >
            <Menu size={19} />
          </button>
          <div className="flex items-center gap-2 text-[13px] text-[#777]">
            <Settings2 size={16} />
            <span>Settings</span>
            <span className="text-[#ccc]">/</span>
            <span className="font-medium text-[#333]">
              {location.pathname === "/settings" ? "Overview" : "Workspace administration"}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
