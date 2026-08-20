import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";

const Navbar = () => {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuthStore();

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

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      logout();

      navigate("/login", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#070B14]/95 backdrop-blur">

      <div className="flex h-20 items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-bold text-white">
            I
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">
              ICOGON AI
            </h1>

            <p className="text-xs text-slate-500">
              AI Development Platform
            </p>
          </div>
        </Link>

        {/* User */}
        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setOpen((value) => !value)
            }
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 transition hover:border-slate-700"
          >

            {/* Avatar */}
            {avatar ? (
              <img
                src={avatar}
                alt={fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold text-white">
                {fullName
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            {/* User info */}
            <div className="hidden text-left sm:block">

              <p className="max-w-[160px] truncate text-sm font-semibold text-white">
                {fullName}
              </p>

              <p className="max-w-[160px] truncate text-xs text-slate-500">
                {email}
              </p>

            </div>

            <ChevronDown
              size={17}
              className={`text-slate-500 transition ${
                open ? "rotate-180" : ""
              }`}
            />

          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">

              {/* User header */}
              <div className="border-b border-slate-800 p-4">

                <p className="truncate font-semibold text-white">
                  {fullName}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {email}
                </p>

              </div>

              {/* Profile */}
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <User size={18} />
                Profile
              </Link>

              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  alert(
                    "Settings coming soon."
                  );
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <Settings size={18} />
                Settings
              </button>

              {/* Logout */}
              <div className="border-t border-slate-800 p-2">

                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={18} />

                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </nav>
  );
};

export default Navbar;