import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Database,
  LayoutDashboard,
  Settings2,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const InternalToolsPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const startBuilding = () => {
    navigate("/builder");
  };

  const teamSections = [
    {
      title: "Sales & marketing teams",
      description:
        "Create tools that help teams manage leads, campaigns, customer information and repetitive workflows.",
      features: [
        "Lead management",
        "Campaign tracking",
        "Customer workflows",
        "Sales dashboards",
      ],
    },
    {
      title: "Product teams",
      description:
        "Build internal product tools for planning, feedback, research, releases and product operations.",
      features: [
        "Roadmap management",
        "Feedback tracking",
        "Research tools",
        "Release workflows",
      ],
    },
    {
      title: "Finance & operations teams",
      description:
        "Turn spreadsheets and repetitive processes into focused internal applications.",
      features: [
        "Financial reporting",
        "Approval workflows",
        "Operations dashboards",
        "Process automation",
      ],
    },
    {
      title: "People teams",
      description:
        "Create simple internal experiences for employee operations, onboarding and team management.",
      features: [
        "Employee directories",
        "Onboarding tools",
        "Request workflows",
        "Team dashboards",
      ],
    },
  ];

  const faqs = [
    {
      question: "What are internal tools?",
      answer:
        "Internal tools are applications built specifically for the people and workflows inside a company. They can include dashboards, admin panels, approval systems, trackers and custom business applications.",
    },
    {
      question: "Can I build an internal tool with a prompt?",
      answer:
        "Yes. You can describe the workflow, users and information you need and use ICOGON as the starting point for building the interface.",
    },
    {
      question: "Can internal tools connect to business data?",
      answer:
        "ICOGON is designed to help create applications around your data and workflows. Integrations and backend configuration can be added depending on your application requirements.",
    },
    {
      question: "Who can use ICOGON for internal tools?",
      answer:
        "Sales, marketing, product, finance, operations, people teams and developers can use ICOGON to create focused tools for their workflows.",
    },
    {
      question: "Can I customize the generated tool?",
      answer:
        "Yes. You can continue iterating on the structure, interface, content and functionality as your requirements become clearer.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf6] text-[#171717]">
      <Navbar
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#f7f5ee]">
        {/* Decorative floating icons */}
        <div className="pointer-events-none absolute left-[2%] top-[150px] hidden sm:block">
          <div className="flex h-9 w-9 rotate-[-8deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#665cff] to-[#b7a8ff] text-white shadow-lg">
            <Workflow size={17} />
          </div>
        </div>

        <div className="pointer-events-none absolute left-[11%] top-[95px] hidden sm:block">
          <div className="flex h-10 w-10 rotate-[8deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#ff3cae] to-[#ff766d] text-white shadow-lg">
            <LayoutDashboard size={18} />
          </div>
        </div>

        <div className="pointer-events-none absolute left-[5%] top-[270px] hidden sm:block">
          <div className="flex h-10 w-10 rotate-[-6deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#ff3cac] to-[#ff7464] text-white shadow-lg">
            <Settings2 size={18} />
          </div>
        </div>

        <div className="pointer-events-none absolute right-[4%] top-[140px] hidden sm:block">
          <div className="flex h-10 w-10 rotate-[8deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#438dff] to-[#7565ff] text-white shadow-lg">
            <Code2 size={18} />
          </div>
        </div>

        <div className="pointer-events-none absolute right-[11%] top-[90px] hidden sm:block">
          <div className="flex h-9 w-9 rotate-[-7deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#ff3cac] to-[#ff6d70] text-white shadow-lg">
            <Sparkles size={16} />
          </div>
        </div>

        <div className="pointer-events-none absolute right-[5%] top-[265px] hidden sm:block">
          <div className="flex h-10 w-10 rotate-[7deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#ff3cad] to-[#ff765f] text-white shadow-lg">
            <Settings2 size={18} />
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-14 sm:px-8 lg:px-10 lg:pb-20 lg:pt-20">
          <div className="mx-auto max-w-[720px] text-center">
            <h1 className="text-[43px] font-semibold leading-[0.94] tracking-[-0.06em] sm:text-[58px] lg:text-[66px]">
              Build custom tools
              <br />
              from your workflows,
              <br />
              data, and ideas
            </h1>

            <p className="mx-auto mt-5 max-w-[500px] text-[11px] leading-5 text-neutral-600 sm:text-[12px]">
              Build the internal tools your team needs without waiting months
              for engineering resources. Start with a workflow and turn it
              into a useful application.
            </p>

            <button
              onClick={startBuilding}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#171717] px-5 py-2.5 text-[10px] font-medium text-white transition hover:bg-black"
            >
              Start building
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Hero mini cards */}
          <div className="mx-auto mt-12 grid max-w-[920px] grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Workflows", Workflow],
              ["Data", Database],
              ["Teams", Users],
              ["Automation", Zap],
            ].map(([label, Icon]) => {
              const ToolIcon = Icon as typeof Workflow;

              return (
                <div
                  key={label as string}
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white/80 px-3 py-3 shadow-sm"
                >
                  <ToolIcon
                    size={13}
                    strokeWidth={1.6}
                    className="text-neutral-500"
                  />

                  <span className="text-[9px] font-medium text-neutral-500">
                    {label as string}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          LOGO STRIP
      ========================================================= */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-[1050px] items-center justify-center gap-10 overflow-hidden px-6 sm:gap-16">
          <span className="text-[9px] font-semibold tracking-[0.15em] text-neutral-300">
            NOVA
          </span>

          <span className="text-[10px] font-bold tracking-[0.08em] text-neutral-300">
            META
          </span>

          <span className="text-[9px] font-semibold tracking-[0.18em] text-neutral-300">
            HEART
          </span>

          <span className="text-[10px] font-medium text-neutral-300">
            north
          </span>

          <span className="text-[9px] font-semibold tracking-[0.12em] text-neutral-300">
            STUDIO
          </span>
        </div>
      </section>

      {/* =========================================================
          INTERNAL TOOLS INTRO
      ========================================================= */}
      <section className="bg-[#f7f5ee]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <h2 className="text-[25px] font-semibold tracking-[-0.045em] text-neutral-700 sm:text-[30px]">
            Internal tools, built for anyone
          </h2>

          <div className="mt-7 grid gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200 md:grid-cols-3">
            <div className="bg-white p-5">
              <p className="text-[9px] font-semibold text-neutral-800">
                Build what you need
              </p>

              <p className="mt-3 text-[9px] leading-4 text-neutral-400">
                Start from your exact workflow instead of adapting your
                process to generic software.
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-[9px] font-semibold text-neutral-800">
                Work with your data
              </p>

              <p className="mt-3 text-[9px] leading-4 text-neutral-400">
                Create interfaces around the information your team already
                uses every day.
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-[9px] font-semibold text-neutral-800">
                Adapt as you grow
              </p>

              <p className="mt-3 text-[9px] leading-4 text-neutral-400">
                Keep changing the tool as your business and workflows evolve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TEAM SECTIONS
      ========================================================= */}
      {teamSections.map((team, index) => (
        <section
          key={team.title}
          className={`border-t border-neutral-200 ${
            index === 2 ? "bg-[#f7f5ee]" : "bg-[#fbfaf6]"
          }`}
        >
          <div className="mx-auto max-w-[1030px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
            <h2 className="text-[20px] font-semibold tracking-[-0.035em] sm:text-[24px]">
              {team.title}
            </h2>

            <div className="mt-5 overflow-hidden rounded-[8px] border border-neutral-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
              <div className="grid min-h-[220px] md:grid-cols-[1fr_0.95fr]">
                {/* Mock application */}
                <div className="border-b border-neutral-200 bg-[#f5f4ef] p-5 md:border-b-0 md:border-r">
                  <div className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm">
                    <div className="flex h-7 items-center justify-between border-b border-neutral-100 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded bg-neutral-900" />
                        <div className="h-1.5 w-16 rounded bg-neutral-300" />
                      </div>

                      <div className="h-4 w-14 rounded bg-neutral-50" />
                    </div>

                    <div className="grid grid-cols-[0.35fr_1fr]">
                      <div className="border-r border-neutral-100 p-3">
                        <div className="h-1.5 w-12 rounded bg-neutral-300" />

                        <div className="mt-5 space-y-2">
                          <div className="h-5 rounded bg-neutral-100" />
                          <div className="h-5 rounded bg-neutral-50" />
                          <div className="h-5 rounded bg-neutral-50" />
                          <div className="h-5 rounded bg-neutral-50" />
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="h-2 w-20 rounded bg-neutral-700" />
                            <div className="mt-2 h-1.5 w-28 rounded bg-neutral-100" />
                          </div>

                          <div className="h-6 w-14 rounded bg-neutral-900" />
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <div className="h-12 rounded bg-neutral-50" />
                          <div className="h-12 rounded bg-neutral-50" />
                          <div className="h-12 rounded bg-neutral-50" />
                        </div>

                        <div className="mt-3 h-14 rounded bg-neutral-50" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information */}
                <div className="p-6 sm:p-8">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                    {index === 0
                      ? "Work faster"
                      : index === 1
                        ? "Ship better"
                        : index === 2
                          ? "Operate smarter"
                          : "Support your team"}
                  </p>

                  <p className="mt-4 max-w-[330px] text-[12px] leading-5 text-neutral-600">
                    {team.description}
                  </p>

                  <div className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {team.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-[9px] text-neutral-500"
                      >
                        <Check size={11} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quote after each major section */}
            <div className="mx-auto mt-12 max-w-[780px] rounded-lg border border-neutral-200 bg-white/60 px-6 py-7 text-center">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200">
                <Sparkles size={12} className="text-neutral-600" />
              </div>

              <p className="mx-auto mt-4 max-w-[620px] text-[11px] leading-5 text-neutral-500">
                “When your team can build the small tools they need, ideas
                move faster and workflows become easier to improve.”
              </p>

              <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                ICOGON customer
              </p>
            </div>
          </div>
        </section>
      ))}

      {/* =========================================================
          WHAT TEAMS BUILD
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[650px] text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Built around your workflow
            </p>

            <h2 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[44px]">
              One tool can replace
              <br />
              a dozen workarounds.
            </h2>

            <p className="mt-5 text-[11px] leading-5 text-neutral-500">
              Bring scattered information, repetitive processes and manual
              tasks into one focused internal experience.
            </p>
          </div>

          <div className="relative mt-14">
            <div className="pointer-events-none absolute left-1/2 top-[35%] h-[180px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#4b8fff] via-[#a46cff] to-[#ff38b7] opacity-60 blur-[70px]" />

            <div className="relative mx-auto max-w-[850px] overflow-hidden rounded-[9px] border border-neutral-200 bg-white shadow-[0_25px_70px_rgba(0,0,0,0.1)]">
              <div className="flex h-8 items-center gap-1.5 border-b border-neutral-200 bg-[#f7f7f5] px-3">
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
              </div>

              <div className="grid min-h-[320px] grid-cols-[0.4fr_1fr]">
                <div className="border-r border-neutral-200 bg-[#fafafa] p-4">
                  <div className="h-2 w-16 rounded bg-neutral-800" />

                  <div className="mt-7 space-y-2">
                    {[
                      "Overview",
                      "Requests",
                      "Projects",
                      "People",
                      "Reports",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded px-2 py-2 text-[7px] ${
                          index === 0
                            ? "bg-neutral-200 text-neutral-700"
                            : "text-neutral-400"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f2f1ed] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-2.5 w-28 rounded bg-neutral-800" />
                      <div className="mt-2 h-1.5 w-36 rounded bg-neutral-200" />
                    </div>

                    <div className="h-7 w-20 rounded bg-neutral-900" />
                  </div>

                  <div className="mt-6 grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="rounded-md border border-neutral-200 bg-white p-3"
                      >
                        <div className="h-1.5 w-14 rounded bg-neutral-200" />
                        <div className="mt-3 h-4 w-12 rounded bg-neutral-800" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-[1.25fr_0.75fr] gap-3">
                    <div className="rounded-md border border-neutral-200 bg-white p-4">
                      <div className="h-2 w-20 rounded bg-neutral-700" />

                      <div className="mt-5 space-y-3">
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2"
                          >
                            <div className="h-5 w-5 rounded bg-neutral-100" />
                            <div className="flex-1">
                              <div className="h-1.5 w-full rounded bg-neutral-100" />
                              <div className="mt-1 h-1.5 w-2/3 rounded bg-neutral-50" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-md border border-neutral-200 bg-white p-4">
                      <div className="h-2 w-20 rounded bg-neutral-700" />

                      <div className="mt-5 h-24 rounded bg-neutral-50" />

                      <div className="mt-3 h-2 w-full rounded bg-neutral-100" />
                      <div className="mt-2 h-2 w-3/4 rounded bg-neutral-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#f7f5ee]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Workflow
                size={17}
                className="text-neutral-500"
              />

              <h3 className="mt-5 text-[14px] font-semibold">
                Workflow-first
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                Start with how your team works and build the interface around
                that process.
              </p>
            </div>

            <div>
              <Database
                size={17}
                className="text-neutral-500"
              />

              <h3 className="mt-5 text-[14px] font-semibold">
                Data-aware
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                Create useful views around the information your people need
                to make decisions.
              </p>
            </div>

            <div>
              <Zap
                size={17}
                className="text-neutral-500"
              />

              <h3 className="mt-5 text-[14px] font-semibold">
                Built for speed
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                Go from a manual workaround to a custom tool without waiting
                for a long development cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[900px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-14 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                FAQ
              </p>

              <h2 className="mt-4 text-[31px] font-semibold leading-[1] tracking-[-0.05em]">
                Frequently
                <br />
                asked questions
              </h2>
            </div>

            <div className="divide-y divide-neutral-200 border-y border-neutral-200">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-5 py-5 text-left"
                    >
                      <span className="text-[11px] font-medium text-neutral-800">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={14}
                        className={`shrink-0 text-neutral-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-5 pr-8">
                        <p className="text-[10px] leading-5 text-neutral-500">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="relative overflow-hidden border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="pointer-events-none absolute bottom-[-130px] left-1/2 h-[270px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#428cff] via-[#ff39bd] to-[#ff6718] opacity-70 blur-[75px]" />

        <div className="relative mx-auto max-w-[850px] px-6 py-24 text-center sm:px-8 lg:py-28">
          <h2 className="text-[34px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[46px]">
            Ready to bring your
            <br />
            ideas to life?
          </h2>

          <p className="mx-auto mt-5 max-w-[430px] text-[11px] leading-5 text-neutral-500">
            Start with your workflow. Describe the tool you need and begin
            building with ICOGON.
          </p>

          <button
            onClick={startBuilding}
            className="group mx-auto mt-8 flex w-full max-w-[510px] items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition hover:border-neutral-300"
          >
            <span className="text-[10px] text-neutral-400">
              Build an internal tool for my team...
            </span>

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-white">
              <ArrowRight size={14} />
            </span>
          </button>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="relative overflow-hidden border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="pointer-events-none absolute bottom-[-150px] left-1/2 h-[280px] w-[800px] -translate-x-1/2 bg-gradient-to-r from-[#438cff] via-[#ff37bd] to-[#ff6b1a] opacity-55 blur-[80px]" />

        <div className="relative mx-auto max-w-[1180px] px-6 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#171717] text-white">
                  <Sparkles size={13} />
                </div>

                <span className="text-[14px] font-semibold tracking-[-0.03em]">
                  ICOGON
                </span>
              </div>

              <p className="mt-5 max-w-[240px] text-[10px] leading-5 text-neutral-500">
                Build websites, applications and internal tools with
                AI-powered development.
              </p>

              <button
                onClick={startBuilding}
                className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-neutral-800"
              >
                Start building
                <ArrowRight size={12} />
              </button>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Product
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-neutral-500">
                <button
                  onClick={startBuilding}
                  className="block hover:text-neutral-900"
                >
                  Builder
                </button>

                <button
                  onClick={() => navigate("/templates")}
                  className="block hover:text-neutral-900"
                >
                  Templates
                </button>

                <button
                  onClick={() => navigate("/connectors")}
                  className="block hover:text-neutral-900"
                >
                  Connectors
                </button>

                <button
                  onClick={() => navigate("/docs")}
                  className="block hover:text-neutral-900"
                >
                  Docs
                </button>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Solutions
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-neutral-500">
                <button
                  onClick={() => navigate("/solutions/founders")}
                  className="block hover:text-neutral-900"
                >
                  Founders
                </button>

                <button
                  onClick={() => navigate("/solutions/websites")}
                  className="block hover:text-neutral-900"
                >
                  Websites
                </button>

                <button
                  onClick={() => navigate("/solutions/prototyping")}
                  className="block hover:text-neutral-900"
                >
                  Prototyping
                </button>

                <button
                  onClick={() => navigate("/solutions/dashboards")}
                  className="block hover:text-neutral-900"
                >
                  Dashboards
                </button>

                <button
                  onClick={() => navigate("/solutions/internal-tools")}
                  className="block hover:text-neutral-900"
                >
                  Internal Tools
                </button>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Resources
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-neutral-500">
                <button
                  onClick={() => navigate("/blog")}
                  className="block hover:text-neutral-900"
                >
                  Blog
                </button>

                <button
                  onClick={() => navigate("/academy")}
                  className="block hover:text-neutral-900"
                >
                  Academy
                </button>

                <button
                  onClick={() => navigate("/guides")}
                  className="block hover:text-neutral-900"
                >
                  Guides
                </button>

                <button
                  onClick={() => navigate("/customer-stories")}
                  className="block hover:text-neutral-900"
                >
                  Customer stories
                </button>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-[9px] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} ICOGON. All rights reserved.</p>

            <div className="flex gap-5">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InternalToolsPage;