import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Database,
  Filter,
  Gauge,
  LineChart,
  Search,
  Sparkles,
  Table2,
  Zap,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const DashboardsPage = () => {
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

  const dashboardTypes = [
    {
      icon: BarChart3,
      title: "Analytics dashboards",
      description:
        "Turn business and product data into clear dashboards your team can understand.",
    },
    {
      icon: Gauge,
      title: "Operations dashboards",
      description:
        "Monitor workflows, tasks, performance and important operational metrics.",
    },
    {
      icon: LineChart,
      title: "Growth dashboards",
      description:
        "Bring acquisition, conversion and customer metrics together in one place.",
    },
    {
      icon: Table2,
      title: "Internal dashboards",
      description:
        "Build focused internal tools around the data and workflows your team uses.",
    },
  ];

  const faqs = [
    {
      question: "Can I create a dashboard from a prompt?",
      answer:
        "Yes. Describe the information you want to monitor and the experience you want your users to have, then use ICOGON as the starting point for the dashboard.",
    },
    {
      question: "What types of dashboards can I build?",
      answer:
        "You can build analytics dashboards, operational dashboards, growth dashboards, admin panels, reporting interfaces and custom internal tools.",
    },
    {
      question: "Can dashboards contain charts and tables?",
      answer:
        "Yes. Dashboard experiences can include different types of visual data views, cards, tables, charts, filters and other interface components.",
    },
    {
      question: "Can I customize the dashboard?",
      answer:
        "Yes. You can continue refining the structure, layout, content, visual design and functionality to match your requirements.",
    },
    {
      question: "Can I build internal business tools?",
      answer:
        "Yes. Dashboards can be used as part of internal workflows for teams that need focused interfaces around business data and operations.",
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
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-[-160px] top-[110px] h-[360px] w-[360px] rounded-full bg-[#ff2aa8]/70 blur-[85px]" />

        <div className="pointer-events-none absolute left-[24%] top-[260px] h-[240px] w-[240px] rounded-full bg-[#7655ff]/60 blur-[75px]" />

        <div className="pointer-events-none absolute right-[-130px] top-[430px] h-[380px] w-[380px] rounded-full bg-[#3f91ff]/65 blur-[90px]" />

        <div className="relative mx-auto max-w-[1180px] px-6 pb-24 pt-20 sm:px-8 lg:px-10 lg:pt-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-sm">
                <BarChart3
                  size={13}
                  strokeWidth={1.7}
                  className="text-neutral-600"
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Dashboards
                </span>
              </div>

              <h1 className="max-w-[690px] text-[52px] font-semibold leading-[0.93] tracking-[-0.065em] sm:text-[68px] lg:text-[78px]">
                Turn your data
                <br />
                into something
                <br />
                your team can use.
              </h1>
            </div>

            <div className="pt-4 lg:pt-14">
              <p className="max-w-[370px] text-[14px] leading-6 text-neutral-600">
                Build dashboards that bring the right information together.
                From analytics and reporting to internal operations, create
                interfaces around the way your team works.
              </p>

              <button
                onClick={startBuilding}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#171717] px-5 py-2.5 text-[11px] font-medium text-white transition hover:bg-black"
              >
                Build a dashboard
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400 sm:justify-start sm:pl-8">
            <span>Collect</span>
            <span>→</span>
            <span>Understand</span>
            <span>→</span>
            <span>Act</span>
            <span>→</span>
            <span>Improve</span>
          </div>

          {/* Dashboard preview */}
          <div className="relative mx-auto mt-8 max-w-[1040px]">
            <div className="absolute -bottom-10 left-1/2 h-16 w-[84%] -translate-x-1/2 bg-gradient-to-r from-[#ff35b9] via-[#ff6718] to-[#438cff] opacity-85 blur-xl" />

            <div className="relative overflow-hidden rounded-[9px] border border-neutral-300 bg-white shadow-[0_28px_85px_rgba(0,0,0,0.15)]">
              <div className="flex h-8 items-center gap-1.5 border-b border-neutral-200 bg-[#f7f7f5] px-3">
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />

                <div className="mx-auto h-4 w-[38%] rounded bg-white" />

                <div className="h-4 w-9 rounded bg-neutral-200" />
              </div>

              <div className="grid min-h-[360px] grid-cols-[0.48fr_1.52fr]">
                {/* Sidebar */}
                <div className="border-r border-neutral-200 bg-[#fafafa] p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-white">
                      <BarChart3 size={12} />
                    </div>

                    <div className="h-2 w-16 rounded bg-neutral-800" />
                  </div>

                  <div className="mt-8 space-y-2">
                    <div className="rounded bg-neutral-200 p-2">
                      <div className="h-1.5 w-16 rounded bg-neutral-500" />
                    </div>

                    <div className="p-2">
                      <div className="h-1.5 w-20 rounded bg-neutral-200" />
                    </div>

                    <div className="p-2">
                      <div className="h-1.5 w-14 rounded bg-neutral-200" />
                    </div>

                    <div className="p-2">
                      <div className="h-1.5 w-18 rounded bg-neutral-200" />
                    </div>

                    <div className="p-2">
                      <div className="h-1.5 w-16 rounded bg-neutral-200" />
                    </div>
                  </div>

                  <div className="mt-10 border-t border-neutral-200 pt-4">
                    <div className="h-1.5 w-20 rounded bg-neutral-200" />

                    <div className="mt-3 h-6 rounded bg-white" />
                    <div className="mt-2 h-6 rounded bg-white" />
                  </div>
                </div>

                {/* Dashboard */}
                <div className="bg-[#f2f1ed] p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-2.5 w-24 rounded bg-neutral-800" />
                      <div className="mt-2 h-1.5 w-32 rounded bg-neutral-200" />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex h-6 items-center gap-1 rounded bg-white px-2">
                        <Filter size={9} className="text-neutral-400" />
                        <span className="text-[6px] text-neutral-400">
                          Filter
                        </span>
                      </div>

                      <div className="h-6 w-16 rounded bg-neutral-900" />
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mt-6 grid grid-cols-4 gap-2">
                    {[
                      ["Revenue", "$84.2K"],
                      ["Users", "12.8K"],
                      ["Orders", "2,431"],
                      ["Growth", "+18.4%"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-neutral-200 bg-white p-3"
                      >
                        <div className="text-[6px] text-neutral-400">
                          {label}
                        </div>

                        <div className="mt-2 text-[12px] font-semibold text-neutral-800">
                          {value}
                        </div>

                        <div className="mt-2 h-1 w-10 rounded bg-neutral-100" />
                      </div>
                    ))}
                  </div>

                  {/* Chart + activity */}
                  <div className="mt-3 grid grid-cols-[1.35fr_0.65fr] gap-3">
                    <div className="rounded-lg border border-neutral-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="h-2 w-20 rounded bg-neutral-700" />
                          <div className="mt-2 h-1.5 w-28 rounded bg-neutral-100" />
                        </div>

                        <div className="h-5 w-14 rounded bg-neutral-50" />
                      </div>

                      <div className="relative mt-5 h-[105px] overflow-hidden">
                        <div className="absolute inset-x-0 top-0 border-t border-neutral-100" />
                        <div className="absolute inset-x-0 top-1/3 border-t border-neutral-100" />
                        <div className="absolute inset-x-0 top-2/3 border-t border-neutral-100" />

                        <svg
                          viewBox="0 0 400 120"
                          className="absolute inset-0 h-full w-full"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 92 C35 78 48 86 70 72 C95 56 110 76 132 58 C155 38 173 58 196 45 C220 30 238 52 260 37 C287 18 304 34 325 25 C350 12 374 24 400 10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-neutral-800"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-white p-4">
                      <div className="h-2 w-20 rounded bg-neutral-700" />

                      <div className="mt-5 space-y-3">
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2"
                          >
                            <div className="h-5 w-5 rounded-full bg-neutral-100" />

                            <div className="flex-1">
                              <div className="h-1.5 w-full rounded bg-neutral-100" />
                              <div className="mt-1 h-1.5 w-2/3 rounded bg-neutral-50" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="h-2 w-24 rounded bg-neutral-700" />
                      <div className="h-5 w-14 rounded bg-neutral-50" />
                    </div>

                    <div className="mt-4 space-y-2">
                      {[1, 2, 3].map((row) => (
                        <div
                          key={row}
                          className="grid grid-cols-4 gap-3 border-t border-neutral-100 pt-2"
                        >
                          <div className="h-1.5 rounded bg-neutral-100" />
                          <div className="h-1.5 rounded bg-neutral-100" />
                          <div className="h-1.5 rounded bg-neutral-100" />
                          <div className="h-1.5 rounded bg-neutral-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <h2 className="max-w-[480px] text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[48px]">
                Information is only
                <br />
                useful when you
                <br />
                can act on it.
              </h2>

              <p className="mt-6 max-w-[410px] text-[13px] leading-6 text-neutral-600">
                Build interfaces that turn complex information into a clear
                picture of what is happening and what needs attention.
              </p>
            </div>

            <div className="border-l border-neutral-300 pl-7">
              <div className="space-y-8">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    See
                  </p>

                  <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                    Bring important metrics and information together instead
                    of making people search across multiple tools.
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Understand
                  </p>

                  <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                    Organize information into visual patterns that help teams
                    understand changes and trends.
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Act
                  </p>

                  <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                    Put useful actions and workflows close to the information
                    that drives the decision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DASHBOARD TYPES
      ========================================================= */}
      <section className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mb-12">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              What you can build
            </p>

            <h2 className="mt-4 text-[35px] font-semibold leading-[0.98] tracking-[-0.055em]">
              A dashboard for
              <br />
              whatever matters.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {dashboardTypes.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group border-t border-neutral-300 pt-5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white">
                    <Icon
                      size={16}
                      strokeWidth={1.6}
                      className="text-neutral-600"
                    />
                  </div>

                  <h3 className="mt-5 text-[14px] font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                    {item.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1 text-[9px] font-medium text-neutral-500">
                    Explore
                    <ArrowRight size={11} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          DATA TO INTERFACE
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Data to interface
              </p>

              <h2 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[46px]">
                Make complex
                <br />
                information feel simple.
              </h2>

              <p className="mt-6 max-w-[390px] text-[12px] leading-6 text-neutral-500">
                Combine metrics, charts, tables and actions into a single
                experience designed around your users.
              </p>

              <button
                onClick={startBuilding}
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#171717] px-5 py-2.5 text-[10px] font-medium text-white"
              >
                Create a dashboard
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-1/2 h-[220px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#428cff] via-[#a46bff] to-[#ff38b8] opacity-55 blur-[70px]" />

              <div className="relative overflow-hidden rounded-[9px] border border-neutral-200 bg-[#f3f2ee] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.11)]">
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-2 w-24 rounded bg-neutral-800" />
                      <div className="mt-2 h-1.5 w-32 rounded bg-neutral-100" />
                    </div>

                    <div className="flex gap-2">
                      <div className="h-6 w-14 rounded bg-neutral-50" />
                      <div className="h-6 w-6 rounded bg-neutral-900" />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="h-16 rounded bg-neutral-50" />
                    <div className="h-16 rounded bg-neutral-50" />
                    <div className="h-16 rounded bg-neutral-50" />
                  </div>

                  <div className="mt-3 grid grid-cols-[1.4fr_0.6fr] gap-2">
                    <div className="h-36 rounded bg-neutral-50 p-3">
                      <div className="h-2 w-20 rounded bg-neutral-200" />

                      <div className="relative mt-5 h-20">
                        <svg
                          viewBox="0 0 300 90"
                          className="h-full w-full"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 72 C30 60 45 66 68 50 C95 31 108 60 132 44 C156 27 176 45 195 33 C220 18 239 39 260 24 C278 13 290 18 300 9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-neutral-700"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="h-36 rounded bg-neutral-50 p-3">
                      <div className="h-2 w-16 rounded bg-neutral-200" />

                      <div className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full border-[8px] border-neutral-200">
                        <span className="text-[9px] font-semibold">
                          72%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 h-24 rounded bg-neutral-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FILTERS / WORKFLOW
      ========================================================= */}
      <section className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="rounded-[9px] border border-neutral-200 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="h-2 w-28 rounded bg-neutral-800" />

                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 rounded border border-neutral-200 px-2 py-1">
                      <Filter size={9} />
                      <span className="text-[7px]">Filter</span>
                    </div>

                    <div className="h-5 w-5 rounded bg-neutral-100" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {["All", "Today", "Week", "Month"].map((item, index) => (
                    <div
                      key={item}
                      className={`rounded px-2 py-2 text-center text-[8px] ${
                        index === 0
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-50 text-neutral-400"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-2">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="grid grid-cols-[1.1fr_0.8fr_0.7fr_0.5fr] items-center gap-3 rounded border border-neutral-100 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-neutral-100" />
                        <div className="h-1.5 w-16 rounded bg-neutral-100" />
                      </div>

                      <div className="h-1.5 rounded bg-neutral-100" />
                      <div className="h-1.5 rounded bg-neutral-100" />
                      <div className="h-1.5 rounded bg-neutral-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Explore the details
              </p>

              <h2 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[46px]">
                Start with the
                <br />
                big picture.
                <br />
                Drill down when needed.
              </h2>

              <p className="mt-6 max-w-[410px] text-[12px] leading-6 text-neutral-500">
                Give users a high-level overview while keeping useful filters,
                tables and details close at hand.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Flexible filtering",
                  "Searchable data",
                  "Clear information hierarchy",
                  "Actionable states",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-[11px] text-neutral-600"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                      <Check size={11} />
                    </div>

                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DARK SECTION
      ========================================================= */}
      <section className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-[8px] bg-[#171717] text-white">
            <div className="pointer-events-none absolute right-[-90px] top-[-100px] h-[300px] w-[300px] rounded-full border border-white/10" />

            <div className="relative grid gap-12 p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-12">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Your data, your interface
                </p>

                <h2 className="mt-5 max-w-[370px] text-[31px] font-semibold leading-[0.98] tracking-[-0.045em]">
                  Build dashboards
                  <br />
                  around the work.
                </h2>

                <p className="mt-5 max-w-[340px] text-[11px] leading-5 text-white/50">
                  Don't make your team adapt to a generic dashboard. Create
                  the interface around the information and actions they need.
                </p>

                <button
                  onClick={startBuilding}
                  className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-[10px] font-semibold text-neutral-900"
                >
                  Build yours
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="overflow-hidden rounded-md border border-white/10 bg-[#222]">
                <div className="flex h-7 items-center gap-1 border-b border-white/10 px-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded bg-white/[0.05] p-3">
                      <div className="h-1.5 w-12 rounded bg-white/10" />
                      <div className="mt-3 h-5 w-16 rounded bg-white/15" />
                    </div>

                    <div className="rounded bg-white/[0.05] p-3">
                      <div className="h-1.5 w-12 rounded bg-white/10" />
                      <div className="mt-3 h-5 w-14 rounded bg-white/15" />
                    </div>

                    <div className="rounded bg-white/[0.05] p-3">
                      <div className="h-1.5 w-12 rounded bg-white/10" />
                      <div className="mt-3 h-5 w-12 rounded bg-white/15" />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-[1.3fr_0.7fr] gap-2">
                    <div className="rounded bg-white/[0.04] p-4">
                      <div className="h-2 w-20 rounded bg-white/15" />

                      <div className="relative mt-6 h-[105px]">
                        <svg
                          viewBox="0 0 400 110"
                          className="h-full w-full"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 92 C35 75 55 88 80 68 C105 48 122 70 148 52 C176 32 194 58 220 42 C247 25 270 48 294 30 C325 12 350 30 400 8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white/50"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="rounded bg-white/[0.04] p-4">
                      <div className="h-2 w-16 rounded bg-white/15" />

                      <div className="mx-auto mt-6 h-20 w-20 rounded-full border-[7px] border-white/10 border-t-white/35" />

                      <div className="mx-auto mt-3 h-2 w-14 rounded bg-white/10" />
                    </div>
                  </div>

                  <div className="mt-3 rounded bg-white/[0.04] p-4">
                    <div className="h-2 w-24 rounded bg-white/15" />

                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div
                          key={item}
                          className="h-6 rounded bg-white/5"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-3 bg-gradient-to-r from-[#ff32b7] via-[#ff6418] to-[#438cff]" />
          </div>
        </div>
      </section>

      {/* =========================================================
          CAPABILITIES
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[600px] text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Dashboard capabilities
            </p>

            <h2 className="mt-4 text-[35px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[46px]">
              Build the interface
              <br />
              your data deserves.
            </h2>

            <p className="mt-5 text-[12px] leading-5 text-neutral-500">
              Start simple and add the pieces your users need as the product
              grows.
            </p>
          </div>

          <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-200 bg-[#fbfaf6] p-5">
              <Database size={16} className="text-neutral-500" />

              <h3 className="mt-5 text-[13px] font-semibold">
                Data views
              </h3>

              <p className="mt-2 text-[10px] leading-5 text-neutral-500">
                Organize information into useful cards, tables and views.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-[#fbfaf6] p-5">
              <LineChart size={16} className="text-neutral-500" />

              <h3 className="mt-5 text-[13px] font-semibold">
                Visual analytics
              </h3>

              <p className="mt-2 text-[10px] leading-5 text-neutral-500">
                Give users a visual understanding of trends and changes.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-[#fbfaf6] p-5">
              <Search size={16} className="text-neutral-500" />

              <h3 className="mt-5 text-[13px] font-semibold">
                Search & filters
              </h3>

              <p className="mt-2 text-[10px] leading-5 text-neutral-500">
                Let users quickly find the information that matters to them.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-[#fbfaf6] p-5">
              <Zap size={16} className="text-neutral-500" />

              <h3 className="mt-5 text-[13px] font-semibold">
                Actions
              </h3>

              <p className="mt-2 text-[10px] leading-5 text-neutral-500">
                Connect information to the actions your team needs to take.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[900px] px-6 py-24 sm:px-8 lg:py-28">
          <div className="grid gap-14 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                FAQ
              </p>

              <h2 className="mt-4 text-[32px] font-semibold leading-[1] tracking-[-0.05em]">
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
                      <span className="text-[12px] font-medium text-neutral-800">
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
                        <p className="text-[11px] leading-5 text-neutral-500">
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
        <div className="pointer-events-none absolute bottom-[-150px] left-1/2 h-[300px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#438cff] via-[#ff38bb] to-[#ff6818] opacity-65 blur-[80px]" />

        <div className="relative mx-auto max-w-[850px] px-6 py-24 text-center sm:px-8 lg:py-32">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <Sparkles size={15} />
          </div>

          <h2 className="mt-7 text-[38px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[50px]">
            Ready to make your
            <br />
            data useful?
          </h2>

          <p className="mx-auto mt-5 max-w-[430px] text-[12px] leading-5 text-neutral-500">
            Describe the dashboard you need and start building an interface
            around the way your team works.
          </p>

          <button
            onClick={startBuilding}
            className="group mx-auto mt-9 flex w-full max-w-[520px] items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition hover:border-neutral-300"
          >
            <span className="text-[11px] text-neutral-400">
              Build a dashboard for my business...
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
                Turn ideas into websites, applications and digital products
                with AI.
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
                  onClick={() => navigate("/solutions/product-managers")}
                  className="block hover:text-neutral-900"
                >
                  Product Managers
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

export default DashboardsPage;