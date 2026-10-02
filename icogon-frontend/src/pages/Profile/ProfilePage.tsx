import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Folder,
  Globe,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string;
  provider: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activityCells = Array.from({ length: 364 });

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        if (mounted) {
          setLoading(true);
          setError("");
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          navigate("/login");
          return;
        }

        const metadata = user.user_metadata || {};

        const name =
          metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "User";

        const username =
          metadata.username ||
          name
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9_]/g, "")
            .slice(0, 20) ||
          "user";

        const avatarUrl =
          metadata.avatar_url ||
          metadata.picture ||
          "";

        const provider =
          user.app_metadata?.provider ||
          "email";

        if (!mounted) return;

        setProfile({
          id: user.id,
          name,
          email: user.email || "",
          username,
          avatarUrl,
          provider,
        });
      } catch (err: any) {
        console.error("PROFILE LOAD ERROR:", err);

        if (!mounted) return;

        setError(
          err?.message ||
            "Unable to load profile."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const goTo = (path: string) => {
    navigate(path);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center font-sans ${
          isDark
            ? "bg-[#0b0d10] text-white"
            : "bg-[#fafafa] text-slate-900"
        }`}
      >
        <div className="text-center">
          <div
            className={`mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 ${
              isDark
                ? "border-white/10 border-t-white"
                : "border-slate-200 border-t-slate-700"
            }`}
          />

          <p
            className={`text-[12px] ${
              isDark
                ? "text-zinc-500"
                : "text-slate-500"
            }`}
          >
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !profile) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center px-5 font-sans ${
          isDark
            ? "bg-[#0b0d10] text-white"
            : "bg-[#fafafa] text-slate-900"
        }`}
      >
        <div
          className={`w-full max-w-[400px] rounded-2xl border p-7 text-center ${
            isDark
              ? "border-white/10 bg-[#111418]"
              : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="mb-3 text-2xl">
            ⚠️
          </div>

          <h1
            className={`text-[17px] font-semibold tracking-tight ${
              isDark
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            Profile could not be loaded
          </h1>

          <p
            className={`mt-2 text-[12px] leading-5 ${
              isDark
                ? "text-zinc-500"
                : "text-slate-500"
            }`}
          >
            {error ||
              "User profile is unavailable."}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className={`mt-5 w-full rounded-xl px-4 py-2.5 text-[12px] font-medium transition ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Reload Profile
          </button>
        </div>
      </div>
    );
  }

  const initial =
    profile.name.charAt(0).toUpperCase();

  /* =========================================================
     THEME CLASSES
  ========================================================= */

  const pageBg = isDark
    ? "bg-[#0b0d10] text-white"
    : "bg-[#fafafa] text-slate-900";

  const border = isDark
    ? "border-white/[0.08]"
    : "border-slate-200";

  const muted = isDark
    ? "text-zinc-500"
    : "text-slate-500";

  const subtleText = isDark
    ? "text-zinc-400"
    : "text-slate-600";

  const card = isDark
    ? "border-white/[0.08] bg-[#111418]"
    : "border-slate-200 bg-white";

  const hover =
    isDark
      ? "hover:bg-white/[0.04]"
      : "hover:bg-slate-50";

  return (
    <div
      className={`min-h-screen font-sans ${pageBg}`}
    >
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
          isDark
            ? "border-white/[0.07] bg-[#0b0d10]/90"
            : "border-slate-200/80 bg-[#fafafa]/90"
        }`}
      >
        <div className="mx-auto flex h-[52px] max-w-[1180px] items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className={`flex items-center gap-2 text-[11px] font-medium transition ${
              isDark
                ? "text-zinc-500 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.8}
            />

            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-medium transition ${
              isDark
                ? "border-white/[0.09] bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07]"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Settings
              size={12}
              strokeWidth={1.8}
            />

            Account settings
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-[1180px] px-4 pb-14 pt-6 sm:px-6 md:pt-7">
        {/* ===================================================
            PROFILE COVER
        =================================================== */}

        <section>
          <div
            className={`relative h-[150px] overflow-visible rounded-2xl sm:h-[190px] ${
              isDark
                ? "bg-gradient-to-br from-[#172332] via-[#182b3d] to-[#101820]"
                : "bg-gradient-to-br from-[#dcefff] via-[#c3e1fa] to-[#edf7ff]"
            }`}
          >
            <div
              className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${
                isDark
                  ? "from-white/[0.03] via-transparent to-cyan-400/[0.06]"
                  : "from-white/60 via-transparent to-blue-400/[0.08]"
              }`}
            />

            <div
              className={`pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full blur-3xl ${
                isDark
                  ? "bg-cyan-400/[0.08]"
                  : "bg-white/40"
              }`}
            />

            <div
              className={`pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full blur-3xl ${
                isDark
                  ? "bg-blue-500/[0.07]"
                  : "bg-white/30"
              }`}
            />

            {/* AVATAR */}

            <div className="absolute -bottom-9 left-5 sm:-bottom-10 sm:left-7">
              <div
                className={`flex h-[82px] w-[82px] items-center justify-center overflow-hidden rounded-full border-[3px] text-[27px] font-semibold shadow-lg sm:h-[94px] sm:w-[94px] sm:text-[30px] ${
                  isDark
                    ? "border-[#0b0d10] bg-gradient-to-br from-[#315b78] to-[#1b3447] text-white"
                    : "border-white bg-gradient-to-br from-[#a9d8f8] to-[#6eafe0] text-white"
                }`}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  initial
                )}
              </div>
            </div>
          </div>

          {/* PROFILE INFO */}

          <div className="mt-12 flex flex-col gap-4 sm:mt-14 md:flex-row md:items-end md:justify-between">
            <div>
              <h1
                className={`text-[25px] font-semibold leading-none tracking-[-0.035em] sm:text-[28px] ${
                  isDark
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {profile.name}
              </h1>

              <div
                className={`mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] ${muted}`}
              >
                <span>
                  @{profile.username}
                </span>

                <span
                  className={
                    isDark
                      ? "text-zinc-700"
                      : "text-slate-300"
                  }
                >
                  •
                </span>

                <span>0 followers</span>

                <span>0 following</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate("/profile")
                }
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-medium transition ${border} ${hover} ${subtleText}`}
              >
                <Edit3
                  size={12}
                  strokeWidth={1.7}
                />

                Edit profile
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-medium transition ${border} ${hover} ${subtleText}`}
              >
                Account settings

                <Settings
                  size={12}
                  strokeWidth={1.7}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            PUBLISHED PROJECTS
        =================================================== */}

        <section
          className={`mt-7 overflow-hidden rounded-2xl border ${card}`}
        >
          <div className="flex min-h-[170px] flex-col items-center justify-center px-6 text-center">
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${
                isDark
                  ? "bg-white/[0.05] text-zinc-500"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Folder
                size={18}
                strokeWidth={1.6}
              />
            </div>

            <h2
              className={`text-[11px] font-semibold ${
                isDark
                  ? "text-zinc-300"
                  : "text-slate-700"
              }`}
            >
              No published projects yet
            </h2>

            <p
              className={`mt-1.5 text-[10px] leading-4 ${muted}`}
            >
              Projects published to this profile
              <br className="sm:hidden" />
              {" "}will appear here
            </p>
          </div>
        </section>

        {/* ===================================================
            ACTIVITY
        =================================================== */}

        <section className="mt-8">
          <div
            className={`mb-3 flex items-center gap-1.5 text-[10px] font-medium ${subtleText}`}
          >
            <span>
              0 edits on ICOGON AI in the last year
            </span>

            <CalendarDays
              size={12}
              strokeWidth={1.7}
              className={muted}
            />
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            {/* HEATMAP */}

            <div
              className={`min-w-0 rounded-xl border p-3 ${
                card
              } lg:flex-1`}
            >
              <div
                className={`mb-1.5 grid grid-cols-12 px-[2px] text-[8px] ${muted}`}
              >
                {[
                  "Oct",
                  "Nov",
                  "Dec",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                ].map((month) => (
                  <span key={month}>
                    {month}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-[repeat(28,minmax(0,1fr))] gap-[2px]">
                {activityCells.map(
                  (_, index) => {
                    const active =
                      index === 350;

                    return (
                      <div
                        key={index}
                        className={`aspect-square rounded-[2px] transition-colors ${
                          active
                            ? "bg-[#55a9e8]"
                            : isDark
                            ? "bg-white/[0.06]"
                            : "bg-[#f0f2f3]"
                        }`}
                      />
                    );
                  }
                )}
              </div>
            </div>

            {/* STATS */}

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 px-1 lg:w-[240px] lg:pt-1">
              <div>
                <p
                  className={`text-[9px] ${muted}`}
                >
                  Daily average
                </p>

                <p
                  className={`mt-1 text-[11px] font-medium ${
                    isDark
                      ? "text-zinc-200"
                      : "text-slate-800"
                  }`}
                >
                  0.0 edits
                </p>
              </div>

              <div>
                <p
                  className={`text-[9px] ${muted}`}
                >
                  Days active
                </p>

                <p
                  className={`mt-1 text-[11px] font-medium ${
                    isDark
                      ? "text-zinc-200"
                      : "text-slate-800"
                  }`}
                >
                  0 days
                </p>

                <p
                  className={`mt-0.5 text-[8px] ${muted}`}
                >
                  0% of year
                </p>
              </div>

              <div>
                <p
                  className={`text-[9px] ${muted}`}
                >
                  Current streak
                </p>

                <p
                  className={`mt-1 text-[11px] font-medium ${
                    isDark
                      ? "text-zinc-200"
                      : "text-slate-800"
                  }`}
                >
                  0 days
                </p>
              </div>

              <div>
                <p
                  className={`text-[9px] ${muted}`}
                >
                  Total edits
                </p>

                <p
                  className={`mt-1 text-[11px] font-medium ${
                    isDark
                      ? "text-zinc-200"
                      : "text-slate-800"
                  }`}
                >
                  0
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer
          className={`mt-12 rounded-2xl border px-6 py-7 sm:px-7 ${
            isDark
              ? "border-white/[0.07] bg-[#101317]"
              : "border-slate-200 bg-[#f6f7f8]"
          }`}
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* BRAND */}

            <div>
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7">
                  <div
                    className={`absolute left-[5px] top-[2px] h-4 w-4 rotate-[30deg] rounded-[5px] ${
                      isDark
                        ? "bg-gradient-to-br from-[#38a0ff] to-[#37c7df]"
                        : "bg-gradient-to-br from-[#1687f7] to-[#2bc5dc]"
                    }`}
                  />

                  <div
                    className={`absolute bottom-[2px] right-[2px] h-4 w-4 rotate-[30deg] rounded-[5px] ${
                      isDark
                        ? "bg-gradient-to-br from-[#2d9cff] to-[#45cde0]"
                        : "bg-gradient-to-br from-[#1595ff] to-[#35c7df]"
                    }`}
                  />
                </div>

                <span
                  className={`text-[13px] font-semibold tracking-[-0.025em] ${
                    isDark
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  ICOGON
                </span>
              </div>

              <div
                className={`mt-8 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] ${
                  isDark
                    ? "border-white/[0.08] bg-white/[0.03] text-zinc-400"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <Globe
                  size={10}
                  strokeWidth={1.7}
                />

                EN

                <span className={muted}>
                  ⌄
                </span>
              </div>
            </div>

            <FooterColumn
              title="Company"
              isDark={isDark}
              links={[
                ["Careers", "/"],
                ["Press & media", "/"],
                ["Enterprise", "/enterprise"],
                ["Security", "/security"],
                ["Trust center", "/security"],
                ["Partnerships", "/partners"],
              ]}
              goTo={goTo}
            />

            <FooterColumn
              title="Product"
              isDark={isDark}
              links={[
                ["Pricing", "/pricing"],
                ["Founders", "/solutions/founders"],
                [
                  "Product Managers",
                  "/solutions/product-managers",
                ],
                [
                  "Designers",
                  "/solutions/designers",
                ],
                [
                  "Marketers",
                  "/solutions/marketers",
                ],
                ["Sales", "/solutions/sales"],
                ["Ops", "/solutions/operations"],
                ["People", "/solutions/people"],
                ["App builder", "/builder"],
                [
                  "Prototyping",
                  "/solutions/prototyping",
                ],
                [
                  "Internal Tools",
                  "/solutions/internal-tools",
                ],
                ["Connections", "/connectors"],
              ]}
              goTo={goTo}
            />

            <FooterColumn
              title="Resources"
              isDark={isDark}
              links={[
                ["Learn", "/academy"],
                ["Templates", "/templates"],
                ["Guides", "/guides"],
                ["Connectors", "/connectors"],
                ["Docs", "/docs"],
                ["Blog", "/blog"],
              ]}
              goTo={goTo}
            />

            <FooterColumn
              title="Legal"
              isDark={isDark}
              links={[
                ["Privacy policy", "/privacy"],
              ]}
              goTo={goTo}
              extra={[
                "Do not sell or share my personal information",
                "Cookie settings",
                "Enterprise terms",
                "General terms",
                "Desktop app terms",
                "Domain registration terms",
                "DMCA copyright policy",
                "Accessibility",
                "Platform rules",
                "Report abuse",
                "Report security concerns",
                "DPA",
              ]}
            />
          </div>

          {/* COMMUNITY */}

          <div
            className={`mt-8 border-t pt-6 ${
              isDark
                ? "border-white/[0.07]"
                : "border-slate-200"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p
                  className={`text-[10px] font-semibold ${
                    isDark
                      ? "text-zinc-300"
                      : "text-slate-800"
                  }`}
                >
                  Community
                </p>

                <div
                  className={`mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[9px] ${muted}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      goTo("/partners")
                    }
                    className="transition hover:text-current"
                  >
                    Become a partner
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      goTo("/community")
                    }
                    className="transition hover:text-current"
                  >
                    Community
                  </button>

                  <span>Affiliates</span>
                  <span>Discord</span>
                  <span>Reddit</span>
                  <span>X / Twitter</span>
                  <span>YouTube</span>
                  <span>LinkedIn</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`mt-6 border-t pt-4 text-[9px] ${
              isDark
                ? "border-white/[0.07] text-zinc-600"
                : "border-slate-200 text-slate-400"
            }`}
          >
            © {new Date().getFullYear()} ICOGON AI.
            All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
};

/* ===========================================================
   FOOTER COLUMN
=========================================================== */

interface FooterColumnProps {
  title: string;
  isDark: boolean;
  links: Array<[string, string]>;
  goTo: (path: string) => void;
  extra?: string[];
}

const FooterColumn: React.FC<
  FooterColumnProps
> = ({
  title,
  isDark,
  links,
  goTo,
  extra = [],
}) => {
  return (
    <div>
      <p
        className={`mb-4 text-[10px] font-semibold ${
          isDark
            ? "text-zinc-300"
            : "text-slate-800"
        }`}
      >
        {title}
      </p>

      <div
        className={`space-y-2.5 text-[9px] leading-4 ${
          isDark
            ? "text-zinc-500"
            : "text-slate-500"
        }`}
      >
        {links.map(([label, path]) => (
          <button
            key={label}
            type="button"
            onClick={() => goTo(path)}
            className="block text-left transition hover:text-current"
          >
            {label}
          </button>
        ))}

        {extra.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;