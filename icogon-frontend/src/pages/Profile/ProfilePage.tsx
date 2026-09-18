import React, { useEffect, useState } from "react";

import {
  Edit3,
  Settings,
  Folder,
  ArrowLeft,
  Globe,
  CalendarDays,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

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

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * IMPORTANT:
   * Do not put hooks below conditional returns.
   * Activity cells are intentionally NOT useMemo().
   */
  const activityCells = Array.from({ length: 364 });

  // =====================================================
  // LOAD PROFILE
  // =====================================================

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

  // =====================================================
  // NAVIGATION
  // =====================================================

  const goTo = (path: string) => {
    navigate(path);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#fbfaf7]
          font-sans
          text-slate-900
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              mb-4
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-[#dcecf8]
              border-t-[#75b7ef]
            "
          />

          <p className="text-[12px] text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !profile) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#fbfaf7]
          px-5
          font-sans
          text-slate-900
        "
      >
        <div
          className="
            w-full
            max-w-[420px]
            rounded-[20px]
            border
            border-[#e7e2d9]
            bg-white
            p-8
            text-center
            shadow-[0_18px_50px_rgba(72,115,150,0.08)]
          "
        >
          <div className="mb-4 text-3xl">
            ⚠️
          </div>

          <h1
            className="
              text-[18px]
              font-semibold
              tracking-[-0.025em]
              text-slate-900
            "
          >
            Profile could not be loaded
          </h1>

          <p
            className="
              mt-2
              text-[12px]
              leading-5
              text-slate-500
            "
          >
            {error ||
              "User profile is unavailable."}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="
              mt-5
              w-full
              rounded-[10px]
              bg-[#20242f]
              px-5
              py-2.5
              text-[12px]
              font-medium
              text-white
              transition
              hover:bg-[#111827]
            "
          >
            Reload Profile
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // INITIAL
  // =====================================================

  const initial =
    profile.name
      .charAt(0)
      .toUpperCase();

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#fbfaf7]
        font-sans
        text-slate-900
      "
    >
      {/* =================================================
          TOP BAR
      ================================================= */}

      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-[#ece8e0]
          bg-[#fbfaf7]/95
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[52px]
            max-w-[1180px]
            items-center
            justify-between
            px-5
            md:px-8
          "
        >
          {/* LEFT */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              flex
              items-center
              gap-2
              text-[11px]
              font-medium
              text-slate-500
              transition
              hover:text-slate-900
            "
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.8}
            />

            Dashboard
          </button>

          {/* RIGHT */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              flex
              items-center
              gap-1.5
              rounded-[9px]
              border
              border-[#ddd9d0]
              bg-white
              px-3
              py-1.5
              text-[10px]
              font-medium
              text-slate-700
              shadow-[0_1px_2px_rgba(15,23,42,0.03)]
              transition
              hover:border-[#c5def0]
              hover:bg-[#f8fcff]
            "
          >
            <Settings
              size={12}
              strokeWidth={1.8}
            />

            Account settings
          </button>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          mx-auto
          max-w-[1180px]
          px-5
          pb-14
          pt-7
          md:px-8
          md:pt-8
        "
      >
        {/* =================================================
            COVER
        ================================================= */}

        <section>
          <div
            className="
              relative
              h-[185px]
              overflow-visible
              rounded-[22px]
              bg-gradient-to-br
              from-[#d9edff]
              via-[#b9dcfa]
              to-[#e5f4ff]
              shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]
              md:h-[250px]
              md:rounded-[24px]
            "
          >
            {/* LIGHT SKY BLUE GLOW */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                rounded-[22px]
                bg-gradient-to-r
                from-white/55
                via-transparent
                to-[#72b8eb]/20
                md:rounded-[24px]
              "
            />

            {/* SOFT BLUE ORB */}

            <div
              className="
                pointer-events-none
                absolute
                -right-12
                -top-16
                h-[230px]
                w-[230px]
                rounded-full
                bg-white/35
                blur-3xl
              "
            />

            {/* SOFT LEFT GLOW */}

            <div
              className="
                pointer-events-none
                absolute
                -left-10
                bottom-[-30px]
                h-[170px]
                w-[170px]
                rounded-full
                bg-white/30
                blur-3xl
              "
            />

            {/* AVATAR */}

            <div
              className="
                absolute
                -bottom-10
                left-6
                md:-bottom-11
                md:left-8
              "
            >
              <div
                className="
                  flex
                  h-[88px]
                  w-[88px]
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-[3px]
                  border-white
                  bg-gradient-to-br
                  from-[#a9d8f8]
                  to-[#6eafe0]
                  text-[28px]
                  font-semibold
                  text-white
                  shadow-[0_6px_20px_rgba(58,112,160,0.22)]
                  md:h-[104px]
                  md:w-[104px]
                  md:text-[32px]
                "
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="
                      h-full
                      w-full
                      object-cover
                    "
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

          {/* =================================================
              PROFILE HEADER
          ================================================= */}

          <div
            className="
              mt-14
              flex
              flex-col
              gap-5
              md:mt-16
              md:flex-row
              md:items-end
              md:justify-between
            "
          >
            {/* USER INFO */}

            <div>
              <h1
                className="
                  text-[26px]
                  font-semibold
                  leading-none
                  tracking-[-0.035em]
                  text-[#202020]
                  md:text-[28px]
                "
              >
                {profile.name}
              </h1>

              <div
                className="
                  mt-2.5
                  flex
                  flex-wrap
                  items-center
                  gap-x-2
                  gap-y-1
                  text-[11px]
                  text-slate-500
                "
              >
                <span>
                  @{profile.username}
                </span>

                <span className="text-slate-300">
                  •
                </span>

                <span>
                  0 followers
                </span>

                <span>
                  0 following
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <button
                type="button"
                onClick={() =>
                  navigate("/profile")
                }
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#dedbd4]
                  bg-white
                  px-3.5
                  py-1.5
                  text-[10px]
                  font-medium
                  text-slate-700
                  shadow-[0_1px_2px_rgba(15,23,42,0.02)]
                  transition
                  hover:border-[#b9d9ee]
                  hover:bg-[#f7fcff]
                "
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
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#dedbd4]
                  bg-white
                  px-3.5
                  py-1.5
                  text-[10px]
                  font-medium
                  text-slate-700
                  shadow-[0_1px_2px_rgba(15,23,42,0.02)]
                  transition
                  hover:border-[#b9d9ee]
                  hover:bg-[#f7fcff]
                "
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

        {/* =================================================
            PUBLISHED PROJECTS
        ================================================= */}

        <section
          className="
            mt-7
            overflow-hidden
            rounded-[17px]
            border
            border-[#eeeae3]
            bg-[#faf9f5]
          "
        >
          <div
            className="
              flex
              min-h-[180px]
              flex-col
              items-center
              justify-center
              px-6
              text-center
              md:min-h-[185px]
            "
          >
            <div
              className="
                mb-3.5
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#edf5fa]
                text-slate-400
              "
            >
              <Folder
                size={18}
                strokeWidth={1.6}
              />
            </div>

            <h2
              className="
                text-[11px]
                font-semibold
                tracking-[-0.01em]
                text-slate-700
              "
            >
              No published projects yet
            </h2>

            <p
              className="
                mt-1.5
                text-[10px]
                leading-4
                text-slate-500
              "
            >
              Projects published to this profile
              <br className="sm:hidden" />
              {" "}will appear here
            </p>
          </div>
        </section>

        {/* =================================================
            ACTIVITY
        ================================================= */}

        <section className="mt-8">
          {/* TITLE */}

          <div
            className="
              mb-3
              flex
              items-center
              gap-1.5
              text-[10px]
              font-medium
              text-slate-700
            "
          >
            <span>
              0 edits on ICOGON AI in the last year
            </span>

            <CalendarDays
              size={12}
              strokeWidth={1.7}
              className="text-slate-400"
            />
          </div>

          {/* ACTIVITY AREA */}

          <div
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-start
            "
          >
            {/* HEATMAP */}

            <div
              className="
                min-w-0
                rounded-[12px]
                border
                border-[#e7e5df]
                bg-white
                p-3
                shadow-[0_1px_2px_rgba(15,23,42,0.02)]
                lg:flex-1
              "
            >
              {/* MONTHS */}

              <div
                className="
                  mb-1.5
                  grid
                  grid-cols-12
                  px-[2px]
                  text-[8px]
                  text-slate-400
                "
              >
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
              </div>

              {/* HEATMAP GRID */}

              <div
                className="
                  grid
                  grid-cols-[repeat(28,minmax(0,1fr))]
                  gap-[2px]
                "
              >
                {activityCells.map(
                  (_, index) => {
                    const active =
                      index === 350;

                    return (
                      <div
                        key={index}
                        className={`
                          aspect-square
                          rounded-[2px]
                          transition-colors
                          ${
                            active
                              ? "bg-[#55a9e8]"
                              : "bg-[#f2f4f3]"
                          }
                        `}
                      />
                    );
                  }
                )}
              </div>
            </div>

            {/* STATS */}

            <div
              className="
                grid
                grid-cols-2
                gap-x-8
                gap-y-5
                px-1
                lg:w-[250px]
                lg:pt-1
              "
            >
              {/* DAILY */}

              <div>
                <p className="text-[9px] text-slate-400">
                  Daily average
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    font-medium
                    text-slate-800
                  "
                >
                  0.0 edits
                </p>
              </div>

              {/* DAYS ACTIVE */}

              <div>
                <p className="text-[9px] text-slate-400">
                  Days active
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    font-medium
                    text-slate-800
                  "
                >
                  0 days
                </p>

                <p
                  className="
                    mt-0.5
                    text-[8px]
                    text-slate-400
                  "
                >
                  0% of year
                </p>
              </div>

              {/* STREAK */}

              <div>
                <p className="text-[9px] text-slate-400">
                  Current streak
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    font-medium
                    text-slate-800
                  "
                >
                  0 days
                </p>
              </div>

              {/* TOTAL */}

              <div>
                <p className="text-[9px] text-slate-400">
                  Total edits
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    font-medium
                    text-slate-800
                  "
                >
                  0
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="
            mt-12
            rounded-[17px]
            border
            border-[#e8e3da]
            bg-[#f7f4ed]
            px-7
            py-8
            md:px-8
            md:py-9
          "
        >
          <div
            className="
              grid
              gap-8
              sm:grid-cols-2
              lg:grid-cols-5
            "
          >
            {/* BRAND */}

            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                {/* ICOGON MARK */}

                <div
                  className="
                    relative
                    h-7
                    w-7
                  "
                >
                  <div
                    className="
                      absolute
                      left-[5px]
                      top-[2px]
                      h-4
                      w-4
                      rotate-[30deg]
                      rounded-[5px]
                      bg-gradient-to-br
                      from-[#1687f7]
                      to-[#2bc5dc]
                    "
                  />

                  <div
                    className="
                      absolute
                      bottom-[2px]
                      right-[2px]
                      h-4
                      w-4
                      rotate-[30deg]
                      rounded-[5px]
                      bg-gradient-to-br
                      from-[#1595ff]
                      to-[#35c7df]
                    "
                  />
                </div>

                <span
                  className="
                    text-[13px]
                    font-semibold
                    tracking-[-0.025em]
                    text-slate-900
                  "
                >
                  ICOGON
                </span>
              </div>

              {/* LANGUAGE */}

              <div
                className="
                  mt-10
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-[8px]
                  border
                  border-[#dedbd3]
                  bg-white/70
                  px-2.5
                  py-1
                  text-[9px]
                  text-slate-600
                "
              >
                <Globe
                  size={10}
                  strokeWidth={1.7}
                />

                EN

                <span className="text-slate-400">
                  ⌄
                </span>
              </div>
            </div>

            {/* COMPANY */}

            <div>
              <p
                className="
                  mb-4
                  text-[10px]
                  font-semibold
                  text-slate-800
                "
              >
                Company
              </p>

              <div
                className="
                  space-y-2.5
                  text-[9px]
                  leading-4
                  text-slate-500
                "
              >
                <button
                  type="button"
                  onClick={() => goTo("/")}
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Careers
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/")}
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Press & media
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/enterprise")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Enterprise
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/security")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Security
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/security")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Trust center
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/partners")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Partnerships
                </button>
              </div>
            </div>

            {/* PRODUCT */}

            <div>
              <p
                className="
                  mb-4
                  text-[10px]
                  font-semibold
                  text-slate-800
                "
              >
                Product
              </p>

              <div
                className="
                  space-y-2.5
                  text-[9px]
                  leading-4
                  text-slate-500
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    goTo("/pricing")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Pricing
                </button>

                <p>Student discount</p>

                <p>For Work</p>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/solutions/founders")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Founders
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/solutions/product-managers")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Product Managers
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/solutions/designers")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Designers
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/solutions/marketers")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Marketers
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/solutions/sales")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Sales
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/solutions/operations")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Ops
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/solutions/people")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  People
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/builder")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  App builder
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/solutions/prototyping")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Prototyping
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/solutions/internal-tools")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Internal Tools
                </button>

                <p>Download apps</p>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/connectors")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Connections
                </button>

                <p>Changelog</p>

                <p>Status</p>
              </div>
            </div>

            {/* RESOURCES */}

            <div>
              <p
                className="
                  mb-4
                  text-[10px]
                  font-semibold
                  text-slate-800
                "
              >
                Resources
              </p>

              <div
                className="
                  space-y-2.5
                  text-[9px]
                  leading-4
                  text-slate-500
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    goTo("/academy")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Learn
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/templates")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Templates
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/guides")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Guides
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/connectors")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Connectors
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/docs")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Docs
                </button>

                <p>Videos</p>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/blog")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Blog
                </button>

                <p>Reviews</p>

                <p>Sitemap</p>
              </div>
            </div>

            {/* LEGAL */}

            <div>
              <p
                className="
                  mb-4
                  text-[10px]
                  font-semibold
                  text-slate-800
                "
              >
                Legal
              </p>

              <div
                className="
                  space-y-2.5
                  text-[9px]
                  leading-4
                  text-slate-500
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    goTo("/privacy")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Privacy policy
                </button>

                <p>
                  Do not sell or share my
                  personal information
                </p>

                <p>Cookie settings</p>

                <p>Enterprise terms</p>

                <p>General terms</p>

                <p>Desktop app terms</p>

                <p>
                  Domain registration terms
                </p>

                <p>
                  DMCA copyright policy
                </p>

                <p>Accessibility</p>

                <p>Platform rules</p>

                <p>Report abuse</p>

                <p>
                  Report security concerns
                </p>

                <p>DPA</p>
              </div>
            </div>

            {/* COMMUNITY */}

            <div>
              <p
                className="
                  mb-4
                  text-[10px]
                  font-semibold
                  text-slate-800
                "
              >
                Community
              </p>

              <div
                className="
                  space-y-2.5
                  text-[9px]
                  leading-4
                  text-slate-500
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    goTo("/partners")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Become a partner
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/community")
                  }
                  className="
                    block
                    text-left
                    transition
                    hover:text-slate-900
                  "
                >
                  Community
                </button>

                <p>Affiliates</p>

                <p>Code of conduct</p>

                <p>Discord</p>

                <p>Reddit</p>

                <p>X / Twitter</p>

                <p>YouTube</p>

                <p>LinkedIn</p>
              </div>
            </div>
          </div>

          {/* COPYRIGHT */}

          <div
            className="
              mt-8
              border-t
              border-[#e4e0d7]
              pt-4
              text-[9px]
              text-slate-400
            "
          >
            © {new Date().getFullYear()} ICOGON AI.
            All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
};

export default ProfilePage;