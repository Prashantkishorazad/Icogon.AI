import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import logo from "../../assets/logo1.png";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showBack?: boolean;
}

const AuthLayout = ({
  children,
  title,
  subtitle,
  showBack = true,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#111214] text-white">

      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div
          className="
            absolute
            -left-40
            -top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-blue-500/10
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -right-40
            h-[600px]
            w-[600px]
            rounded-full
            bg-cyan-500/10
            blur-[150px]
          "
        />

      </div>


      <div className="relative flex min-h-screen">


        {/* ==========================================
            LEFT SIDE
        ========================================== */}

        <section
          className="
            relative
            flex
            w-full
            flex-col
            px-6
            py-8
            lg:w-[46%]
            lg:px-16
            xl:px-24
          "
        >


          {/* ==========================================
              ICOGON LOGO
          ========================================== */}

          <Link
            to="/"
            className="
              flex
              w-fit
              items-center
              gap-3
              transition
              hover:opacity-80
            "
          >

            <img
              src={logo}
              alt="ICOGON AI"
              className="
                h-12
                w-12
                object-contain
              "
            />

            <div>

              <div
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                ICOGON
              </div>

              <div
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.35em]
                  text-slate-500
                "
              >
                AI
              </div>

            </div>

          </Link>


          {/* ==========================================
              MAIN CONTENT
          ========================================== */}

          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[450px]
              flex-1
              flex-col
              justify-center
              py-10
            "
          >


            {/* BACK */}

            {showBack && (

              <Link
                to="/"
                className="
                  mb-8
                  flex
                  w-fit
                  items-center
                  gap-2
                  text-sm
                  text-slate-500
                  transition
                  hover:text-white
                "
              >

                <ArrowLeft size={16} />

                Back to ICOGON

              </Link>

            )}


            {/* TITLE */}

            <div className="mb-8">

              <h1
                className="
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                {title}
              </h1>


              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                {subtitle}
              </p>

            </div>


            {/* FORM */}

            {children}

          </div>


          {/* ==========================================
              FOOTER
          ========================================== */}

          <div
            className="
              pt-8
              text-center
              text-xs
              text-slate-600
            "
          >

            By continuing, you agree to our{" "}

            <Link
              to="/terms"
              className="
                text-slate-400
                underline
                underline-offset-4
                transition
                hover:text-white
              "
            >
              Terms of Service
            </Link>

            {" "}and{" "}

            <Link
              to="/privacy"
              className="
                text-slate-400
                underline
                underline-offset-4
                transition
                hover:text-white
              "
            >
              Privacy Policy
            </Link>

          </div>

        </section>


        {/* ==========================================
            RIGHT SIDE
        ========================================== */}

        <section
          className="
            relative
            hidden
            overflow-hidden
            lg:flex
            lg:w-[54%]
          "
        >

          <div
            className="
              absolute
              inset-5
              overflow-hidden
              rounded-[32px]
              bg-gradient-to-br
              from-[#a8d8dc]
              via-[#2389d0]
              to-[#0646b8]
            "
          >


            {/* GLOWS */}

            <div
              className="
                absolute
                -left-24
                -top-24
                h-[400px]
                w-[400px]
                rounded-full
                bg-cyan-200/40
                blur-[100px]
              "
            />

            <div
              className="
                absolute
                -bottom-24
                -right-24
                h-[400px]
                w-[400px]
                rounded-full
                bg-blue-900/40
                blur-[100px]
              "
            />


            {/* ======================================
                ICOGON BADGE
            ====================================== */}

            <div
              className="
                absolute
                right-6
                top-6
                z-20
                flex
                items-center
                gap-2
                rounded-xl
                bg-blue-700/70
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                backdrop-blur-xl
              "
            >

              <img
                src={logo}
                alt="ICOGON"
                className="
                  h-7
                  w-7
                  object-contain
                "
              />

              ICOGON AI

            </div>


            {/* ======================================
                CONTENT
            ====================================== */}

            <div
              className="
                relative
                z-10
                flex
                h-full
                flex-col
                items-center
                px-8
                pt-24
                text-center
              "
            >


              {/* ICON */}

              <div className="mb-5 text-6xl text-white">
                ✦
              </div>


              {/* HEADING */}

              <h2
                className="
                  max-w-xl
                  text-5xl
                  font-bold
                  leading-tight
                  text-white
                "
              >
                Build your ideas

                <br />

                with AI

              </h2>


              {/* TEXT */}

              <p
                className="
                  mt-5
                  max-w-lg
                  text-lg
                  leading-8
                  text-white/80
                "
              >
                Generate websites, apps and complete software
                applications in minutes.
              </p>


              {/* ======================================
                  BROWSER PREVIEW
              ====================================== */}

              <div
                className="
                  relative
                  mt-14
                  w-full
                  max-w-[700px]
                "
              >


                {/* PHONE */}

                <div
                  className="
                    absolute
                    -left-12
                    bottom-[-30px]
                    hidden
                    w-[180px]
                    overflow-hidden
                    rounded-[32px]
                    border-[7px]
                    border-black
                    bg-white
                    shadow-2xl
                    xl:block
                  "
                >

                  <div
                    className="
                      h-[360px]
                      bg-gradient-to-b
                      from-blue-100
                      to-white
                      p-4
                    "
                  >

                    <div className="mb-5 h-3 w-16 rounded-full bg-slate-300" />

                    <div className="rounded-xl bg-white p-3 shadow">

                      <div className="h-2 w-14 rounded bg-slate-200" />

                      <div className="mt-2 h-2 w-20 rounded bg-slate-200" />

                    </div>


                    <div className="mt-4 rounded-xl bg-blue-500 p-4">

                      <div className="h-2 w-16 rounded bg-white/70" />

                      <div className="mt-2 h-2 w-20 rounded bg-white/40" />

                    </div>

                  </div>

                </div>


                {/* BROWSER */}

                <div
                  className="
                    relative
                    ml-auto
                    w-full
                    overflow-hidden
                    rounded-2xl
                    border-[5px]
                    border-[#111]
                    bg-black
                    shadow-2xl
                  "
                >


                  {/* BROWSER BAR */}

                  <div
                    className="
                      flex
                      h-10
                      items-center
                      gap-2
                      bg-[#161616]
                      px-4
                    "
                  >

                    <span className="h-3 w-3 rounded-full bg-red-400" />

                    <span className="h-3 w-3 rounded-full bg-yellow-400" />

                    <span className="h-3 w-3 rounded-full bg-green-400" />

                    <div className="ml-5 h-5 flex-1 rounded-md bg-[#242424]" />

                  </div>


                  {/* WEBSITE */}

                  <div
                    className="
                      relative
                      aspect-[16/9]
                      overflow-hidden
                      bg-[#090909]
                    "
                  >

                    {/* NAV */}

                    <div
                      className="
                        absolute
                        left-6
                        right-6
                        top-6
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <div className="flex items-center gap-2">

                        <img
                          src={logo}
                          alt=""
                          className="h-5 w-5"
                        />

                        <span className="text-sm font-bold text-white">
                          ICOGON
                        </span>

                      </div>


                      <div
                        className="
                          flex
                          gap-5
                          text-[8px]
                          text-slate-400
                        "
                      >
                        <span>PRODUCT</span>
                        <span>FEATURES</span>
                        <span>PRICING</span>
                      </div>

                    </div>


                    {/* CENTER */}

                    <div
                      className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <div className="text-center">

                        <div
                          className="
                            text-5xl
                            font-black
                            tracking-tight
                            text-white
                          "
                        >
                          BUILD
                        </div>


                        <div
                          className="
                            mt-1
                            text-4xl
                            font-black
                            text-cyan-400
                          "
                        >
                          WITH AI
                        </div>


                        <div
                          className="
                            mx-auto
                            mt-5
                            h-1
                            w-32
                            rounded-full
                            bg-gradient-to-r
                            from-cyan-400
                            to-blue-500
                          "
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
};

export default AuthLayout;