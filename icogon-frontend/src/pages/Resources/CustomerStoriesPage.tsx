import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

interface Story {
  name: string;
  category: string;
  logo: string;
  logoStyle?: string;
}

const stories: Story[] = [
  {
    name: "O3",
    category: "Technology",
    logo: "O₃",
    logoStyle: "text-[34px] font-bold tracking-[-0.08em]",
  },
  {
    name: "Exp Realty",
    category: "Real Estate",
    logo: "exp\nREALTY",
    logoStyle: "whitespace-pre-line text-[22px] font-bold leading-[0.8]",
  },
  {
    name: "Scion",
    category: "Technology",
    logo: "scion",
    logoStyle: "text-[30px] font-light tracking-[-0.05em]",
  },
  {
    name: "Nursa",
    category: "Healthcare",
    logo: "✣ NURSA",
    logoStyle: "text-[20px] font-bold tracking-[-0.04em]",
  },
  {
    name: "Atonom",
    category: "Technology",
    logo: "● atonom",
    logoStyle: "text-[21px] font-semibold tracking-[-0.04em]",
  },
  {
    name: "ElevenLabs",
    category: "AI",
    logo: "IIElevenLabs",
    logoStyle: "text-[19px] font-semibold tracking-[-0.05em]",
  },
  {
    name: "Productiv",
    category: "SaaS",
    logo: "◧ Productiv",
    logoStyle: "text-[20px] font-bold tracking-[-0.04em]",
  },
  {
    name: "Delivery Hero",
    category: "Technology",
    logo: "➤ Delivery Hero",
    logoStyle: "text-[18px] font-semibold italic tracking-[-0.03em]",
  },
  {
    name: "Sentry",
    category: "Developer Tools",
    logo: "◢ SENTRY",
    logoStyle: "text-[18px] font-medium tracking-[0.02em]",
  },
  {
    name: "AppDirect",
    category: "Technology",
    logo: "◢ AppDirect",
    logoStyle: "text-[18px] font-medium tracking-[-0.03em]",
  },
];

const companies = [
  "HEARST",
  "◫ UDACITY",
  "✣ asana",
  "Handshake",
];

const CustomerStoriesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-slate-950">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        onLogin={() => navigate("/login")}
        onSignup={() => navigate("/signup")}
      />

      <div className="h-[72px]" />

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="px-6 pb-10 pt-20 sm:pt-24">
          <div className="mx-auto max-w-[850px] text-center">
            <h1
              className="
                text-[48px]
                font-semibold
                leading-[0.98]
                tracking-[-0.055em]
                text-slate-950
                sm:text-[64px]
                lg:text-[72px]
              "
            >
              Customer stories
            </h1>

            <p
              className="
                mx-auto
                mt-5
                max-w-[530px]
                text-[13px]
                leading-5
                text-slate-500
                sm:text-[14px]
              "
            >
              Businesses and teams use ICOGON to build,
              launch, and grow with AI. See what they're
              creating.
            </p>
          </div>
        </section>

        {/* =====================================================
            COMPANY LOGOS
        ===================================================== */}

        <section className="mx-auto max-w-[1050px] px-6 pb-12 pt-5">
          <div
            className="
              flex
              min-h-[90px]
              items-center
              justify-center
              gap-10
              border-y
              border-slate-200/80
              py-7
              sm:gap-16
              lg:gap-20
            "
          >
            {companies.map((company) => (
              <span
                key={company}
                className="
                  whitespace-nowrap
                  text-[11px]
                  font-bold
                  tracking-[0.13em]
                  text-slate-800
                  sm:text-[13px]
                "
              >
                {company}
              </span>
            ))}
          </div>
        </section>

        {/* =====================================================
            FEATURED STORY
        ===================================================== */}

        <section className="px-4 sm:px-6">
          <div
            className="
              relative
              mx-auto
              max-w-[1350px]
              overflow-hidden
              rounded-[4px]
              border
              border-slate-300
              bg-[#30343a]
            "
          >
            {/* Background */}

            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.35),transparent_22%),radial-gradient(circle_at_22%_72%,rgba(30,64,80,0.75),transparent_35%),linear-gradient(125deg,#111a20,#71614f_48%,#8b8d91)]
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_50%_100%,rgba(0,0,0,0.35),transparent_50%)]
              "
            />

            {/* Content */}

            <div
              className="
                relative
                flex
                min-h-[360px]
                flex-col
                justify-center
                px-8
                py-14
                sm:min-h-[430px]
                sm:px-16
                lg:min-h-[470px]
                lg:px-[11%]
              "
            >
              <div className="max-w-[560px]">
                <p
                  className="
                    text-[28px]
                    font-medium
                    leading-[1.18]
                    tracking-[-0.035em]
                    text-white
                    sm:text-[36px]
                  "
                >
                  “With ICOGON, the constraint
                  is no longer resources, it's
                  imagination.”
                </p>

                <p
                  className="
                    mt-4
                    text-[15px]
                    leading-6
                    text-white/80
                  "
                >
                  See how modern teams use AI to
                  transform ideas into working products.
                </p>
              </div>

              <div className="mt-9 flex items-center gap-5">
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    ICOGON Customer
                  </p>

                  <p className="mt-1 text-[11px] text-white/65">
                    Product &amp; Technology Team
                  </p>
                </div>

                <Link
                  to="#stories"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-white
                    px-4
                    py-2.5
                    text-[11px]
                    font-medium
                    text-slate-900
                    transition-all
                    hover:bg-slate-100
                  "
                >
                  Go to customer story

                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Gradient strip */}

          <div
            className="
              mx-auto
              mt-1
              h-[30px]
              max-w-[1350px]
              rounded-[3px]
              bg-[linear-gradient(100deg,#4d8cff,#ff77db_30%,#ff45bd_58%,#4c91ff)]
              shadow-[0_8px_30px_rgba(80,120,255,0.2)]
            "
          />
        </section>

        {/* =====================================================
            ALL STORIES
        ===================================================== */}

        <section
          id="stories"
          className="
            mx-auto
            max-w-[1050px]
            px-6
            pb-28
            pt-20
            sm:px-8
            lg:px-10
          "
        >
          {/* Heading + Filters */}

          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <h2
              className="
                text-[24px]
                font-semibold
                tracking-[-0.035em]
              "
            >
              All stories
            </h2>

            <div className="flex gap-2">
              {/* Team size */}

              <button
                type="button"
                className="
                  inline-flex
                  h-9
                  min-w-[135px]
                  items-center
                  justify-between
                  gap-5
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-[11px]
                  text-slate-600
                  shadow-sm
                "
              >
                Team size

                <ChevronDown
                  size={13}
                  className="text-slate-400"
                />
              </button>

              {/* Team */}

              <button
                type="button"
                className="
                  inline-flex
                  h-9
                  min-w-[105px]
                  items-center
                  justify-between
                  gap-5
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-[11px]
                  text-slate-600
                  shadow-sm
                "
              >
                Team

                <ChevronDown
                  size={13}
                  className="text-slate-400"
                />
              </button>
            </div>
          </div>

          {/* Stories Grid */}

          <div
            className="
              mt-7
              grid
              grid-cols-1
              gap-1
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {stories.map((story) => (
              <Link
                key={story.name}
                to="#"
                className="
                  group
                  relative
                  flex
                  min-h-[180px]
                  items-center
                  justify-center
                  overflow-hidden
                  border
                  border-slate-200
                  bg-[#f7f6f3]
                  transition-all
                  duration-300
                  hover:z-10
                  hover:-translate-y-0.5
                  hover:bg-white
                  hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)]
                "
              >
                {/* Logo */}

                <span
                  className={`
                    select-none
                    text-slate-900
                    transition-transform
                    duration-300
                    group-hover:scale-105
                    ${story.logoStyle ?? ""}
                  `}
                >
                  {story.logo}
                </span>

                {/* Hover label */}

                <div
                  className="
                    absolute
                    bottom-3
                    left-3
                    right-3
                    flex
                    items-center
                    justify-between
                    rounded-lg
                    bg-white/95
                    px-3
                    py-2
                    opacity-0
                    shadow-sm
                    transition-opacity
                    duration-200
                    group-hover:opacity-100
                  "
                >
                  <span className="text-[10px] font-medium text-slate-500">
                    {story.category}
                  </span>

                  <ChevronRight
                    size={13}
                    className="text-slate-500"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="relative overflow-hidden pb-0">
          {/* Ambient gradient */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-[360px]
              bg-[radial-gradient(ellipse_at_center,#ffffff_5%,rgba(110,160,255,0.38)_45%,rgba(255,45,170,0.65)_78%,rgba(255,55,80,0.82)_100%)]
            "
          />

          <div
            className="
              relative
              mx-auto
              max-w-[1050px]
              px-6
              pb-20
              pt-4
              text-center
            "
          >
            <h2
              className="
                text-[26px]
                font-semibold
                tracking-[-0.035em]
                sm:text-[30px]
              "
            >
              Ready to bring your idea to life?
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-[460px]
                text-[13px]
                leading-5
                text-slate-500
              "
            >
              Start with an idea and let ICOGON help you
              turn it into a real product.
            </p>

            {/* Prompt style CTA */}

            <Link
              to="/builder"
              className="
                mx-auto
                mt-7
                flex
                max-w-[440px]
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-left
                shadow-[0_12px_35px_rgba(15,23,42,0.13)]
                transition-all
                hover:-translate-y-0.5
                hover:shadow-[0_18px_45px_rgba(15,23,42,0.16)]
              "
            >
              <Sparkles
                size={16}
                strokeWidth={1.7}
                className="shrink-0 text-slate-400"
              />

              <span className="flex-1 text-[11px] text-slate-400">
                Ask ICOGON to create an internal tool...
              </span>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-[10px]
                  font-medium
                  text-slate-500
                "
              >
                Build

                <ArrowRight size={12} />
              </span>
            </Link>
          </div>

          {/* ===================================================
              FOOTER
          =================================================== */}

          <footer
            className="
              relative
              mx-auto
              mb-10
              max-w-[1220px]
              px-6
              sm:px-8
            "
          >
            <div
              className="
                rounded-[10px]
                border
                border-white/70
                bg-[#f8f6ef]
                px-7
                py-9
                shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                sm:px-10
                sm:py-10
              "
            >
              <div
                className="
                  grid
                  gap-10
                  sm:grid-cols-2
                  lg:grid-cols-[1.1fr_repeat(4,1fr)]
                "
              >
                {/* Logo */}

                <div>
                  <Link
                    to="/"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-[18px]
                      font-semibold
                      tracking-[-0.04em]
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#20242f]
                        text-[12px]
                        text-white
                      "
                    >
                      I
                    </span>

                    ICOGON
                  </Link>

                  <p
                    className="
                      mt-4
                      max-w-[190px]
                      text-[11px]
                      leading-5
                      text-slate-400
                    "
                  >
                    Build websites, applications,
                    and AI-powered products with ICOGON.
                  </p>
                </div>

                {/* Company */}

                <div>
                  <p className="text-[11px] font-semibold text-slate-900">
                    Company
                  </p>

                  <div className="mt-4 space-y-2">
                    {[
                      "About",
                      "Careers",
                      "Contact",
                      "Security",
                    ].map((item) => (
                      <Link
                        key={item}
                        to="#"
                        className="
                          block
                          text-[10px]
                          text-slate-500
                          hover:text-slate-900
                        "
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Product */}

                <div>
                  <p className="text-[11px] font-semibold text-slate-900">
                    Product
                  </p>

                  <div className="mt-4 space-y-2">
                    {[
                      "Pricing",
                      "AI Builder",
                      "Templates",
                      "Changelog",
                    ].map((item) => (
                      <Link
                        key={item}
                        to="#"
                        className="
                          block
                          text-[10px]
                          text-slate-500
                          hover:text-slate-900
                        "
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Resources */}

                <div>
                  <p className="text-[11px] font-semibold text-slate-900">
                    Resources
                  </p>

                  <div className="mt-4 space-y-2">
                    {[
                      {
                        label: "Blog",
                        path: "/blog",
                      },
                      {
                        label: "Guides",
                        path: "/guides",
                      },
                      {
                        label: "Academy",
                        path: "/academy",
                      },
                      {
                        label: "Docs",
                        path: "/docs",
                      },
                      {
                        label: "Templates",
                        path: "/templates",
                      },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        className="
                          block
                          text-[10px]
                          text-slate-500
                          hover:text-slate-900
                        "
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Legal */}

                <div>
                  <p className="text-[11px] font-semibold text-slate-900">
                    Legal
                  </p>

                  <div className="mt-4 space-y-2">
                    {[
                      "Privacy Policy",
                      "Terms of Service",
                      "Cookie Policy",
                      "Security",
                    ].map((item) => (
                      <Link
                        key={item}
                        to="#"
                        className="
                          block
                          text-[10px]
                          text-slate-500
                          hover:text-slate-900
                        "
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom */}

              <div
                className="
                  mt-10
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-slate-200
                  pt-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <span className="text-[10px] text-slate-400">
                  © {new Date().getFullYear()} ICOGON. All rights reserved.
                </span>

                <span className="text-[10px] text-slate-400">
                  Built with ICOGON AI
                </span>
              </div>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default CustomerStoriesPage;