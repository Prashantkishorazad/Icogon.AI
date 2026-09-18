import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Search,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

interface Guide {
  category: string;
  title: string;
  description: string;
  readTime: string;
}

const guides: Guide[] = [
  {
    category: "GETTING STARTED",
    title: "Build your first project with ICOGON",
    description:
      "Learn the complete workflow from describing your idea to generating your first application.",
    readTime: "8 min read",
  },
  {
    category: "AI DEVELOPMENT",
    title: "How to write better prompts for AI development",
    description:
      "Practical techniques for giving AI clear instructions and getting better development results.",
    readTime: "10 min read",
  },
  {
    category: "WEB DEVELOPMENT",
    title: "Build a modern website with AI",
    description:
      "Go from a simple concept to a polished, responsive website using an AI-first workflow.",
    readTime: "12 min read",
  },
  {
    category: "INTEGRATIONS",
    title: "Connect your application to external services",
    description:
      "Understand how connectors can bring APIs, data, and third-party services into your project.",
    readTime: "9 min read",
  },
  {
    category: "PRODUCT",
    title: "Turn an idea into a production-ready product",
    description:
      "A practical guide to moving from an early prototype toward a real application.",
    readTime: "14 min read",
  },
  {
    category: "DEPLOYMENT",
    title: "Prepare your application for launch",
    description:
      "Learn the essential steps to review, verify, and prepare an application for deployment.",
    readTime: "11 min read",
  },
];

const categories = [
  "All guides",
  "Getting Started",
  "AI Development",
  "Web Development",
  "Integrations",
  "Deployment",
];

const GuidesPage = () => {
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

      {/* =====================================================
          HERO
      ===================================================== */}

      <main>
        <section className="mx-auto max-w-[1200px] px-6 pb-16 pt-20 lg:px-10 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:items-end">
            {/* HERO COPY */}

            <div className="max-w-[760px]">
              <div
                className="
                  mb-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2
                  text-[12px]
                  font-medium
                  text-slate-600
                  shadow-sm
                "
              >
                <Compass
                  size={15}
                  strokeWidth={1.8}
                />

                ICOGON Guides
              </div>

              <h1
                className="
                  text-[48px]
                  font-semibold
                  leading-[1.02]
                  tracking-[-0.05em]
                  text-slate-950
                  sm:text-[60px]
                  lg:text-[72px]
                "
              >
                Learn as
                <br />
                you build.
              </h1>

              <p
                className="
                  mt-6
                  max-w-[650px]
                  text-[17px]
                  leading-7
                  text-slate-500
                  sm:text-[18px]
                "
              >
                Practical, step-by-step guides for building
                websites, applications, integrations, and
                AI-powered products with ICOGON.
              </p>
            </div>

            {/* SEARCH */}

            <div>
              <label
                htmlFor="guide-search"
                className="
                  mb-2
                  block
                  text-[12px]
                  font-medium
                  text-slate-500
                "
              >
                Search guides
              </label>

              <div
                className="
                  flex
                  h-12
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  shadow-sm
                "
              >
                <Search
                  size={17}
                  strokeWidth={1.8}
                  className="text-slate-400"
                />

                <input
                  id="guide-search"
                  type="text"
                  placeholder="What do you want to build?"
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    text-[13px]
                    text-slate-800
                    outline-none
                    placeholder:text-slate-400
                  "
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CATEGORY NAVIGATION
        ===================================================== */}

        <section className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div
            className="
              flex
              gap-2
              overflow-x-auto
              border-b
              border-slate-200
              pb-4
              scrollbar-none
            "
          >
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`
                  shrink-0
                  rounded-full
                  border
                  px-4
                  py-2
                  text-[12px]
                  font-medium
                  transition-all
                  ${
                    index === 0
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* =====================================================
            FEATURED GUIDE
        ===================================================== */}

        <section className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10">
          <Link
            to="#"
            className="
              group
              grid
              overflow-hidden
              rounded-[28px]
              border
              border-slate-200
              bg-white
              shadow-[0_12px_40px_rgba(15,23,42,0.06)]
              lg:grid-cols-[1.1fr_0.9fr]
            "
          >
            {/* VISUAL */}

            <div
              className="
                relative
                min-h-[300px]
                overflow-hidden
                bg-[linear-gradient(135deg,#e5e2db_0%,#faf9f6_48%,#d9d5cc_100%)]
                sm:min-h-[380px]
              "
            >
              <div
                className="
                  absolute
                  left-[10%]
                  right-[10%]
                  top-[12%]
                  bottom-[-15%]
                  rounded-t-[20px]
                  border
                  border-white/90
                  bg-white/70
                  p-5
                  shadow-[0_20px_50px_rgba(15,23,42,0.12)]
                  backdrop-blur-xl
                  transition-transform
                  duration-500
                  group-hover:scale-[1.02]
                "
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                </div>

                <div className="mt-7 flex gap-4">
                  <div className="w-[23%] rounded-lg bg-slate-100 p-3">
                    <div className="h-2 w-full rounded bg-slate-300" />

                    <div className="mt-5 space-y-2">
                      <div className="h-2 rounded bg-slate-200" />
                      <div className="h-2 w-[75%] rounded bg-slate-200" />
                      <div className="h-2 w-[85%] rounded bg-slate-200" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="h-3 w-[55%] rounded bg-slate-300" />

                    <div className="mt-5 space-y-3">
                      <div className="h-2 w-full rounded bg-slate-200" />
                      <div className="h-2 w-[90%] rounded bg-slate-200" />
                      <div className="h-2 w-[70%] rounded bg-slate-200" />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="h-20 rounded-lg bg-slate-100" />
                      <div className="h-20 rounded-lg bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="
                  absolute
                  right-5
                  top-5
                  rounded-full
                  border
                  border-white/80
                  bg-white/75
                  px-3
                  py-1.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-slate-600
                  shadow-sm
                  backdrop-blur
                "
              >
                Featured guide
              </div>
            </div>

            {/* CONTENT */}

            <div className="flex flex-col justify-center px-8 py-10 lg:px-10">
              <span
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-slate-400
                "
              >
                Getting Started
              </span>

              <h2
                className="
                  mt-4
                  text-[28px]
                  font-semibold
                  leading-[1.15]
                  tracking-[-0.03em]
                  sm:text-[32px]
                "
              >
                Build your first project
                with ICOGON
              </h2>

              <p
                className="
                  mt-4
                  text-[14px]
                  leading-6
                  text-slate-500
                "
              >
                Follow a complete walkthrough of the ICOGON
                workflow, from your first idea to a working
                application.
              </p>

              <div
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  text-[13px]
                  font-semibold
                  text-slate-700
                "
              >
                Read guide

                <ArrowRight
                  size={15}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </div>
            </div>
          </Link>
        </section>

        {/* =====================================================
            ALL GUIDES
        ===================================================== */}

        <section className="mx-auto max-w-[1200px] px-6 pb-24 lg:px-10">
          <div className="flex items-end justify-between">
            <div>
              <p
                className="
                  text-[12px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-slate-400
                "
              >
                Explore
              </p>

              <h2
                className="
                  mt-2
                  text-[30px]
                  font-semibold
                  tracking-[-0.03em]
                "
              >
                All guides
              </h2>
            </div>

            <span className="hidden text-[13px] text-slate-400 sm:block">
              {guides.length} guides
            </span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.title}
                to="#"
                className="
                  group
                  flex
                  min-h-[290px]
                  flex-col
                  rounded-[22px]
                  border
                  border-slate-200
                  bg-white
                  p-6
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)]
                "
              >
                {/* ICON */}

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-[#fbfaf8]
                  "
                >
                  <BookOpen
                    size={18}
                    strokeWidth={1.7}
                  />
                </div>

                {/* CATEGORY */}

                <span
                  className="
                    mt-7
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    text-slate-400
                  "
                >
                  {guide.category}
                </span>

                {/* TITLE */}

                <h3
                  className="
                    mt-3
                    text-[18px]
                    font-semibold
                    leading-[1.3]
                    tracking-[-0.02em]
                    text-slate-900
                  "
                >
                  {guide.title}
                </h3>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-3
                    text-[13px]
                    leading-6
                    text-slate-500
                  "
                >
                  {guide.description}
                </p>

                {/* FOOTER */}

                <div className="mt-auto flex items-center justify-between pt-7">
                  <span className="text-[11px] text-slate-400">
                    {guide.readTime}
                  </span>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-[12px]
                      font-semibold
                      text-slate-700
                    "
                  >
                    Read

                    <ChevronRight
                      size={14}
                      className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-0.5
                      "
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =====================================================
            LEARN MORE
        ===================================================== */}

        <section className="border-y border-slate-200/80 bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p
                  className="
                    text-[12px]
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    text-slate-400
                  "
                >
                  Keep learning
                </p>

                <h2
                  className="
                    mt-3
                    text-[34px]
                    font-semibold
                    tracking-[-0.035em]
                    sm:text-[42px]
                  "
                >
                  Want a deeper learning path?
                </h2>

                <p
                  className="
                    mt-4
                    max-w-[620px]
                    text-[15px]
                    leading-7
                    text-slate-500
                  "
                >
                  Explore ICOGON Academy for structured lessons
                  and courses designed to help you build with AI.
                </p>
              </div>

              <Link
                to="/academy"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#20242f]
                  px-6
                  py-3.5
                  text-[14px]
                  font-medium
                  text-white
                  shadow-lg
                  shadow-slate-900/15
                  transition-all
                  hover:-translate-y-[1px]
                  hover:bg-[#111827]
                "
              >
                Explore Academy

                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10">
          <div
            className="
              overflow-hidden
              rounded-[30px]
              bg-[#20242f]
              px-7
              py-16
              text-center
              sm:px-12
              lg:py-20
            "
          >
            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white/10
                text-white
              "
            >
              <Sparkles
                size={21}
                strokeWidth={1.7}
              />
            </div>

            <h2
              className="
                mx-auto
                mt-6
                max-w-[700px]
                text-[38px]
                font-semibold
                leading-tight
                tracking-[-0.04em]
                text-white
                sm:text-[48px]
              "
            >
              Learn it.
              <br />
              Build it with ICOGON.
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-[580px]
                text-[15px]
                leading-6
                text-slate-400
              "
            >
              When you're ready, turn what you've learned into
              a real AI-powered application.
            </p>

            <Link
              to="/builder"
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-white
                px-6
                py-3.5
                text-[14px]
                font-medium
                text-slate-900
                transition-all
                hover:-translate-y-[1px]
                hover:bg-slate-100
              "
            >
              Start building

              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* =====================================================
            FOOTER NOTE
        ===================================================== */}

        <section className="pb-16">
          <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-6 text-[12px] text-slate-400 lg:px-10">
            <CheckCircle2 size={14} />
            Practical guides for building with ICOGON AI
          </div>
        </section>
      </main>
    </div>
  );
};

export default GuidesPage;