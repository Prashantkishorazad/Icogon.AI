import {
  ArrowRight,
  BookOpen,
  Cable,
  ChevronRight,
  Code2,
  FileCode2,
  KeyRound,
  Rocket,
  Search,
  Settings2,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

interface DocSection {
  icon: React.ElementType;
  title: string;
  description: string;
  items: string[];
}

const docSections: DocSection[] = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description:
      "Everything you need to understand ICOGON and create your first project.",
    items: [
      "Introduction",
      "Quickstart",
      "Your first project",
    ],
  },
  {
    icon: Sparkles,
    title: "AI Builder",
    description:
      "Learn how ICOGON turns natural-language instructions into applications.",
    items: [
      "Builder overview",
      "Working with prompts",
      "Iterating on your app",
    ],
  },
  {
    icon: Terminal,
    title: "Prompts",
    description:
      "Understand how to write clear instructions and guide your AI workflow.",
    items: [
      "Prompt basics",
      "Prompt structure",
      "Best practices",
    ],
  },
  {
    icon: Cable,
    title: "Connectors",
    description:
      "Connect your projects with external services, APIs, and data sources.",
    items: [
      "Connector overview",
      "Configuration",
      "Using integrations",
    ],
  },
  {
    icon: KeyRound,
    title: "Authentication",
    description:
      "Understand authentication, users, sessions, and secure application access.",
    items: [
      "Authentication overview",
      "User sessions",
      "Protected routes",
    ],
  },
  {
    icon: Code2,
    title: "API",
    description:
      "Explore the foundations for connecting your applications to ICOGON services.",
    items: [
      "API overview",
      "Requests",
      "Responses",
    ],
  },
  {
    icon: Rocket,
    title: "Deployment",
    description:
      "Prepare your project for launch and move from development to production.",
    items: [
      "Preparing for launch",
      "Environment setup",
      "Deployment basics",
    ],
  },
  {
    icon: Settings2,
    title: "Project Configuration",
    description:
      "Manage project settings and understand the different parts of your application.",
    items: [
      "Project settings",
      "Environment variables",
      "Configuration",
    ],
  },
];

const popularDocs = [
  {
    number: "01",
    title: "Getting started with ICOGON",
    description:
      "A quick introduction to the platform and your first AI-built project.",
  },
  {
    number: "02",
    title: "Understanding the AI Builder",
    description:
      "Learn how to work with prompts, iterations, and generated applications.",
  },
  {
    number: "03",
    title: "Working with Connectors",
    description:
      "Understand how external services can become part of your application.",
  },
];

const DocsPage = () => {
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
          <div className="max-w-[820px]">
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
              <FileCode2
                size={15}
                strokeWidth={1.8}
              />

              ICOGON Documentation
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
              Everything you need
              <br />
              to build with ICOGON.
            </h1>

            <p
              className="
                mt-6
                max-w-[700px]
                text-[17px]
                leading-7
                text-slate-500
                sm:text-[18px]
              "
            >
              Explore the ICOGON platform, understand how
              the AI Builder works, connect your services,
              and take your applications from idea to launch.
            </p>

            {/* SEARCH */}

            <div className="mt-8 max-w-[620px]">
              <div
                className="
                  flex
                  h-14
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  shadow-[0_8px_30px_rgba(15,23,42,0.06)]
                "
              >
                <Search
                  size={19}
                  strokeWidth={1.8}
                  className="shrink-0 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    text-[14px]
                    text-slate-800
                    outline-none
                    placeholder:text-slate-400
                  "
                />

                <span
                  className="
                    hidden
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-2
                    py-1
                    text-[10px]
                    font-medium
                    text-slate-400
                    sm:block
                  "
                >
                  /
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK LINKS
        ===================================================== */}

        <section className="mx-auto max-w-[1200px] px-6 pb-16 lg:px-10">
          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {[
              {
                icon: BookOpen,
                title: "Quickstart",
                text: "Start building in minutes.",
              },
              {
                icon: Sparkles,
                title: "AI Builder",
                text: "Understand the core workflow.",
              },
              {
                icon: Cable,
                title: "Connectors",
                text: "Connect your favorite services.",
              },
              {
                icon: Rocket,
                title: "Deployment",
                text: "Take your project live.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  to="#"
                  className="
                    group
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]
                  "
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-700
                      "
                    >
                      <Icon
                        size={17}
                        strokeWidth={1.7}
                      />
                    </div>

                    <ChevronRight
                      size={15}
                      className="
                        text-slate-300
                        transition-transform
                        duration-200
                        group-hover:translate-x-0.5
                        group-hover:text-slate-500
                      "
                    />
                  </div>

                  <h3
                    className="
                      mt-5
                      text-[14px]
                      font-semibold
                      text-slate-900
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-1.5
                      text-[12px]
                      leading-5
                      text-slate-500
                    "
                  >
                    {item.text}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            DOCUMENTATION LAYOUT
        ===================================================== */}

        <section className="border-y border-slate-200/80 bg-white">
          <div
            className="
              mx-auto
              grid
              max-w-[1200px]
              lg:grid-cols-[220px_1fr]
            "
          >
            {/* SIDEBAR */}

            <aside
              className="
                border-b
                border-slate-200
                px-6
                py-8
                lg:border-b-0
                lg:border-r
                lg:px-0
                lg:py-10
                lg:pr-8
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Documentation
              </p>

              <nav className="mt-5 space-y-1">
                {[
                  "Getting Started",
                  "AI Builder",
                  "Prompts",
                  "Connectors",
                  "Authentication",
                  "API",
                  "Deployment",
                  "Project Configuration",
                ].map((item, index) => (
                  <Link
                    key={item}
                    to="#"
                    className={`
                      flex
                      items-center
                      justify-between
                      rounded-lg
                      px-3
                      py-2.5
                      text-[12px]
                      font-medium
                      transition-colors
                      ${
                        index === 0
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    {item}

                    <ChevronRight
                      size={13}
                      className="text-slate-300"
                    />
                  </Link>
                ))}
              </nav>
            </aside>

            {/* CONTENT */}

            <div className="px-6 py-12 lg:px-12 lg:py-14">
              <div>
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    text-slate-400
                  "
                >
                  Explore the docs
                </p>

                <h2
                  className="
                    mt-2
                    text-[30px]
                    font-semibold
                    tracking-[-0.03em]
                  "
                >
                  Documentation
                </h2>

                <p
                  className="
                    mt-3
                    max-w-[650px]
                    text-[14px]
                    leading-6
                    text-slate-500
                  "
                >
                  Find the information you need to understand,
                  build, configure, and deploy applications with
                  ICOGON.
                </p>
              </div>

              {/* DOC CARDS */}

              <div
                className="
                  mt-9
                  grid
                  gap-4
                  sm:grid-cols-2
                "
              >
                {docSections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <Link
                      key={section.title}
                      to="#"
                      className="
                        group
                        rounded-2xl
                        border
                        border-slate-200
                        bg-[#fbfaf8]
                        p-5
                        transition-all
                        duration-200
                        hover:border-slate-300
                        hover:bg-white
                        hover:shadow-[0_8px_25px_rgba(15,23,42,0.05)]
                      "
                    >
                      <div className="flex items-start justify-between">
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
                            bg-white
                            text-slate-700
                          "
                        >
                          <Icon
                            size={18}
                            strokeWidth={1.7}
                          />
                        </div>

                        <ArrowRight
                          size={15}
                          className="
                            translate-x-[-3px]
                            text-slate-300
                            opacity-0
                            transition-all
                            duration-200
                            group-hover:translate-x-0
                            group-hover:opacity-100
                          "
                        />
                      </div>

                      <h3
                        className="
                          mt-5
                          text-[16px]
                          font-semibold
                          tracking-[-0.01em]
                          text-slate-900
                        "
                      >
                        {section.title}
                      </h3>

                      <p
                        className="
                          mt-2
                          text-[12px]
                          leading-5
                          text-slate-500
                        "
                      >
                        {section.description}
                      </p>

                      <div className="mt-5 space-y-2">
                        {section.items.map((item) => (
                          <div
                            key={item}
                            className="
                              flex
                              items-center
                              gap-2
                              text-[11px]
                              text-slate-500
                            "
                          >
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            POPULAR DOCS
        ===================================================== */}

        <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10">
          <div>
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-slate-400
              "
            >
              Start here
            </p>

            <h2
              className="
                mt-2
                text-[30px]
                font-semibold
                tracking-[-0.03em]
              "
            >
              Popular documentation
            </h2>
          </div>

          <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {popularDocs.map((doc) => (
              <Link
                key={doc.number}
                to="#"
                className="
                  group
                  grid
                  gap-4
                  px-6
                  py-6
                  transition-colors
                  hover:bg-slate-50
                  sm:grid-cols-[55px_1fr_auto]
                  sm:items-center
                "
              >
                <span
                  className="
                    text-[12px]
                    font-semibold
                    text-slate-300
                  "
                >
                  {doc.number}
                </span>

                <div>
                  <h3
                    className="
                      text-[15px]
                      font-semibold
                      text-slate-900
                    "
                  >
                    {doc.title}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      leading-5
                      text-slate-500
                    "
                  >
                    {doc.description}
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="
                    hidden
                    text-slate-300
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                    sm:block
                  "
                />
              </Link>
            ))}
          </div>
        </section>

        {/* =====================================================
            DEVELOPER CTA
        ===================================================== */}

        <section className="border-y border-slate-200/80 bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10">
            <div
              className="
                overflow-hidden
                rounded-[30px]
                bg-[#20242f]
                px-7
                py-14
                sm:px-12
                lg:px-16
                lg:py-16
              "
            >
              <div
                className="
                  grid
                  gap-10
                  lg:grid-cols-[1fr_auto]
                  lg:items-center
                "
              >
                <div>
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-white/10
                      text-white
                    "
                  >
                    <Code2
                      size={20}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h2
                    className="
                      mt-6
                      max-w-[700px]
                      text-[34px]
                      font-semibold
                      leading-tight
                      tracking-[-0.035em]
                      text-white
                      sm:text-[42px]
                    "
                  >
                    Ready to build?
                  </h2>

                  <p
                    className="
                      mt-4
                      max-w-[600px]
                      text-[14px]
                      leading-6
                      text-slate-400
                    "
                  >
                    Put the documentation into practice and
                    start building your next application with
                    ICOGON AI.
                  </p>
                </div>

                <Link
                  to="/builder"
                  className="
                    inline-flex
                    items-center
                    justify-center
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
                  Open Builder

                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER NOTE
        ===================================================== */}

        <section className="pb-16 pt-10">
          <div
            className="
              mx-auto
              flex
              max-w-[1200px]
              items-center
              justify-center
              gap-2
              px-6
              text-[12px]
              text-slate-400
              lg:px-10
            "
          >
            <FileCode2 size={14} />

            ICOGON Documentation
          </div>
        </section>
      </main>
    </div>
  );
};

export default DocsPage;