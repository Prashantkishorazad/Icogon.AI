import React, {
  useEffect,
  useState,
} from "react";

import {
  Edit3,
  Settings,
  Folder,
  ArrowLeft,
  // Github,
  Globe,
  // Linkedin,
  CalendarDays,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../../lib/supabase";


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


  const [profile, setProfile] =
    useState<ProfileData | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {

    const loadProfile = async () => {

      try {

        setLoading(true);

        setError("");


        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();


        if (userError) {
          throw userError;
        }


        if (!user) {

          navigate("/login");

          return;

        }


        const metadata =
          user.user_metadata || {};


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


        setProfile({

          id: user.id,

          name,

          email:
            user.email || "",

          username,

          avatarUrl,

          provider,

        });


      } catch (err: any) {

        console.error(
          "PROFILE LOAD ERROR:",
          err
        );


        setError(
          err?.message ||
          "Unable to load profile."
        );


      } finally {

        setLoading(false);

      }

    };


    loadProfile();

  }, [navigate]);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div
        className="
          min-h-screen

          bg-[#191919]

          text-white

          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <div
            className="
              mx-auto
              mb-4

              h-9
              w-9

              animate-spin

              rounded-full

              border-2
              border-white/10

              border-t-white
            "
          />

          <p
            className="
              text-sm
              text-slate-500
            "
          >
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
          min-h-screen

          bg-[#191919]

          text-white

          flex
          items-center
          justify-center

          px-6
        "
      >

        <div
          className="
            w-full
            max-w-md

            rounded-2xl

            border
            border-red-500/20

            bg-[#222222]

            p-7

            text-center
          "
        >

          <div
            className="
              mb-5
              text-4xl
            "
          >
            ⚠️
          </div>


          <h1
            className="
              text-xl
              font-semibold
            "
          >
            Profile could not be loaded
          </h1>


          <p
            className="
              mt-3

              text-sm

              text-slate-500
            "
          >
            {error || "User profile is unavailable."}
          </p>


          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="
              mt-6

              w-full

              rounded-xl

              bg-white

              px-5
              py-3

              font-semibold

              text-black

              transition

              hover:bg-slate-200
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

        bg-[#191919]

        text-white
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
          border-white/[0.06]

          bg-[#191919]/90

          backdrop-blur-xl
        "
      >

        <div
          className="
            mx-auto

            flex

            h-[72px]

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

              text-sm
              text-slate-400

              transition

              hover:text-white
            "
          >

            <ArrowLeft
              size={18}
            />

            Dashboard

          </button>


          {/* RIGHT */}

          <button
            type="button"
            className="
              flex
              items-center
              gap-2

              rounded-lg

              border
              border-white/10

              px-3
              py-2

              text-xs
              text-slate-300

              transition

              hover:bg-white/5
            "
          >

            <Settings
              size={14}
            />

            Account settings

          </button>

        </div>

      </header>


      {/* =================================================
          PROFILE CONTENT
      ================================================= */}

      <main
        className="
          mx-auto

          max-w-[1180px]

          px-5
          py-8

          md:px-8
          md:py-10
        "
      >


        {/* =================================================
            COVER
        ================================================= */}

        <section>

          <div
            className="
              relative

              h-[190px]
              md:h-[250px]

              overflow-visible

              rounded-[24px]

              bg-gradient-to-br
              from-[#527bb5]
              via-[#b6509b]
              to-[#c54d24]
            "
          >

            {/* subtle glow */}

            <div
              className="
                pointer-events-none

                absolute
                inset-0

                rounded-[24px]

                bg-gradient-to-r
                from-white/5
                via-transparent
                to-black/10
              "
            />


            {/* AVATAR */}

            <div
              className="
                absolute

                -bottom-12
                left-7

                md:left-10
              "
            >

              <div
                className="
                  flex

                  h-28
                  w-28

                  md:h-32
                  md:w-32

                  items-center
                  justify-center

                  overflow-hidden

                  rounded-full

                  border-[3px]
                  border-[#191919]

                  bg-gradient-to-br
                  from-blue-400
                  to-purple-600

                  text-4xl
                  font-semibold

                  shadow-xl
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
              mt-16

              flex

              flex-col

              gap-6

              md:flex-row
              md:items-end
              md:justify-between
            "
          >

            <div>

              <h1
                className="
                  text-3xl
                  font-bold

                  tracking-tight
                "
              >
                {profile.name}
              </h1>


              <div
                className="
                  mt-2

                  flex
                  flex-wrap

                  items-center
                  gap-2

                  text-sm
                  text-slate-500
                "
              >

                <span>
                  @{profile.username}
                </span>

                <span>
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


            {/* BUTTONS */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <button
                type="button"
                className="
                  flex
                  items-center
                  gap-2

                  rounded-full

                  border
                  border-white/10

                  px-4
                  py-2

                  text-sm

                  text-slate-300

                  transition

                  hover:bg-white/5
                  hover:text-white
                "
              >

                <Edit3
                  size={14}
                />

                Edit profile

              </button>


              <button
                type="button"
                className="
                  flex
                  items-center
                  gap-2

                  rounded-full

                  border
                  border-white/10

                  px-4
                  py-2

                  text-sm

                  text-slate-300

                  transition

                  hover:bg-white/5
                  hover:text-white
                "
              >

                Account settings

                <Settings
                  size={14}
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
            mt-8

            overflow-hidden

            rounded-2xl

            bg-[#202020]
          "
        >

          <div
            className="
              flex

              min-h-[190px]

              flex-col

              items-center
              justify-center

              px-6

              text-center
            "
          >

            <div
              className="
                mb-4

                flex
                h-12
                w-12

                items-center
                justify-center

                rounded-full

                bg-white/[0.04]

                text-slate-500
              "
            >

              <Folder
                size={21}
              />

            </div>


            <h2
              className="
                text-sm
                font-semibold
              "
            >
              No published projects yet
            </h2>


            <p
              className="
                mt-2

                text-xs

                text-slate-500
              "
            >
              Projects published to this profile
              will appear here
            </p>

          </div>

        </section>


        {/* =================================================
            ACTIVITY
        ================================================= */}

        <section className="mt-8">

          <div
            className="
              mb-3

              flex
              items-center
              gap-2

              text-xs
              font-medium

              text-slate-400
            "
          >

            <span>
              0 edits on ICOGON AI in the last year
            </span>

            <CalendarDays
              size={14}
            />

          </div>


          <div
            className="
              flex
              flex-col

              gap-6

              lg:flex-row
            "
          >

            {/* HEATMAP */}

            <div
              className="
                overflow-hidden

                rounded-xl

                border
                border-white/[0.06]

                bg-[#202020]

                p-4

                lg:flex-1
              "
            >

              <div
                className="
                  grid

                  grid-cols-12

                  gap-1
                "
              >

                {Array.from({
                  length: 144,
                }).map((_, index) => (

                  <div
                    key={index}
                    className="
                      aspect-square

                      rounded-[3px]

                      bg-[#303030]
                    "
                  />

                ))}

              </div>

            </div>


            {/* STATS */}

            <div
              className="
                grid

                grid-cols-2

                gap-x-8
                gap-y-5

                text-sm

                lg:w-[280px]
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Daily Average
                </p>

                <p className="mt-1">
                  0.0 edits
                </p>

              </div>


              <div>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Days Active
                </p>

                <p className="mt-1">
                  0 days
                </p>

              </div>


              <div>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Current Streak
                </p>

                <p className="mt-1">
                  0 days
                </p>

              </div>


              <div>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Total Edits
                </p>

                <p className="mt-1">
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
            mt-14

            rounded-2xl

            border
            border-white/[0.06]

            bg-[#202020]

            px-7
            py-10
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

                <div
                  className="
                    flex
                    h-8
                    w-8

                    items-center
                    justify-center

                    rounded-lg

                    bg-gradient-to-br
                    from-pink-500
                    via-purple-500
                    to-cyan-400
                  "
                >

                  <div
                    className="
                      h-3
                      w-3

                      rounded-full
                      bg-white
                    "
                  />

                </div>


                <span
                  className="
                    font-semibold
                  "
                >
                  ICOGON
                </span>

              </div>

            </div>


            {/* COMPANY */}

            <div>

              <p
                className="
                  mb-4
                  text-sm
                  font-medium
                  text-white
                "
              >
                Company
              </p>

              <div
                className="
                  space-y-2

                  text-xs
                  text-slate-500
                "
              >

                <p>About</p>
                <p>Careers</p>
                <p>Security</p>
                <p>Contact</p>

              </div>

            </div>


            {/* PRODUCT */}

            <div>

              <p
                className="
                  mb-4
                  text-sm
                  font-medium
                "
              >
                Product
              </p>

              <div
                className="
                  space-y-2

                  text-xs
                  text-slate-500
                "
              >

                <p>Pricing</p>
                <p>Features</p>
                <p>Templates</p>
                <p>Changelog</p>

              </div>

            </div>


            {/* RESOURCES */}

            <div>

              <p
                className="
                  mb-4
                  text-sm
                  font-medium
                "
              >
                Resources
              </p>

              <div
                className="
                  space-y-2

                  text-xs
                  text-slate-500
                "
              >

                <p>Learn</p>
                <p>Documentation</p>
                <p>Guides</p>
                <p>Support</p>

              </div>

            </div>


            {/* COMMUNITY */}

            <div>

              <p
                className="
                  mb-4
                  text-sm
                  font-medium
                "
              >
                Community
              </p>

              <div
                className="
                  flex
                  gap-3

                  text-slate-500
                "
              >

                {/*<Github*/}
                {/*  size={17}*/}
                {/*/>*/}

                <Globe
                  size={17}
                />

                {/*<Linkedin*/}
                {/*  size={17}*/}
                {/*/>*/}

              </div>

            </div>

          </div>


          <div
            className="
              mt-8

              border-t
              border-white/[0.06]

              pt-5

              text-xs
              text-slate-600
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