import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const email = user?.email || "";

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const ThemeIcon =
    theme === "light"
      ? Sun
      : theme === "dark"
        ? Moon
        : Monitor;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#070B14]/90">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white shadow-sm">
            I
          </div>

          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              ICOGON AI
            </h1>

            <p className="text-[10px] leading-none text-slate-500 dark:text-slate-500">
              AI Development Platform
            </p>
          </div>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme */}
          <button
            type="button"
            onClick={cycleTheme}
            title={`Theme: ${theme}`}
            aria-label={`Change theme. Current: ${theme}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ThemeIcon size={16} />
          </button>

          {/* User */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-800"
            >
              {/* Avatar */}
              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-xs font-semibold text-white">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* User info */}
              <div className="hidden text-left sm:block">
                <p className="max-w-[130px] truncate text-xs font-semibold text-slate-800 dark:text-white">
                  {fullName}
                </p>

                <p className="max-w-[130px] truncate text-[10px] text-slate-500 dark:text-slate-500">
                  {email}
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`text-slate-400 transition ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-[#111827] dark:shadow-black/30">
                {/* User header */}
                <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {fullName}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {email}
                  </p>
                </div>

                {/* Profile */}
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <User size={16} />
                  Profile
                </Link>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    alert("Settings coming soon.");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Settings size={16} />
                  Settings
                </button>

                {/* Theme */}
                <button
                  type="button"
                  onClick={() => {
                    cycleTheme();
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <ThemeIcon size={16} />
                    Appearance
                  </span>

                  <span className="text-[10px] capitalize text-slate-400">
                    {theme}
                  </span>
                </button>

                {/* Logout */}
                <div className="border-t border-slate-200 p-2 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-500/10 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <LogOut size={16} />

                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;