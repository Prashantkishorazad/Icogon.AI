import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleCheck,
  Code2,
  // Database,
  // GitBranch,
  Layers3,
  Settings2,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const OpsPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {};

  const handleSignup = () => {
    navigate("/signup");
  };

  const features = [
    {
      title: "Operational dashboards",
      description:
        "Track business performance, key metrics, and operational activity in one clear workspace.",
      type: "dashboard",
    },
    {
      title: "Intake and triage queues",
      description:
        "Capture requests, organize incoming work, and route tasks to the right people automatically.",
      type: "queue",
    },
    {
      title: "Approval workflows",
      description:
        "Standardize approvals, requests, decisions, and recurring operational processes.",
      type: "approval",
    },
    {
      title: "Knowledge and runbooks",
      description:
        "Put processes, documentation, and operational knowledge where your team can find it quickly.",
      type: "knowledge",
    },
  ];

  const integrations = [
    "Slack",
    "Notion",
    "Google Sheets",
    "Stripe",
    "Figma",
    "GitHub",
    "Gmail",
    "Google Drive",
  ];

  const faqs = [
    "Do I need to write code?",
    "Can I connect my existing tools?",
    "Is my data secure?",
    "Can I handle complex workflows?",
    "What kind of support do you offer?",
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#111111]">
      <Navbar
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      <main className="pt-[72px]">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden bg-[#faf9f5]">

          {/* Decorative gradient loops */}

          <div
            className="pointer-events-none absolute -left-[180px] top-[40px] h-[230px] w-[410px] rounded-[50%] border-[9px] border-[#ff1870]"
            style={{
              transform: "rotate(15deg)",
              borderTopColor: "#e85eff",
              borderRightColor: "#ff176f",
              borderBottomColor: "#ff5a9d",
            }}
          />

          <div
            className="pointer-events-none absolute -left-[150px] top-[150px] h-[170px] w-[390px] rounded-[50%] border-[9px] border-[#ff6425]"
            style={{
              transform: "rotate(-13deg)",
              borderLeftColor: "#ff3e83",
              borderBottomColor: "#ff6824",
            }}
          />

          <div
            className="pointer-events-none absolute -right-[160px] top-[35px] h-[290px] w-[410px] rounded-[50%] border-[9px] border-[#ff477d]"
            style={{
              transform: "rotate(-25deg)",
              borderTopColor: "#ff397e",
              borderRightColor: "#ff7624",
              borderBottomColor: "#ff5a29",
            }}
          />

          <div
            className="pointer-events-none absolute -right-[90px] top-[70px] h-[170px] w-[270px] rounded-[50%] border-[8px] border-[#ff397a]"
            style={{
              transform: "rotate(-12deg)",
              borderBottomColor: "#ff7024",
            }}
          />

          <div
            className="pointer-events-none absolute -right-[25px] -top-[100px] h-[160px] w-[300px] rounded-[50%] border-[8px] border-transparent"
            style={{
              borderTopColor: "#617dff",
              transform: "rotate(25deg)",
            }}
          />

          <div className="relative mx-auto max-w-[1000px] px-6 pb-16 pt-20 sm:pb-20 sm:pt-24 lg:px-10 lg:pt-28">

            <div className="grid items-center gap-10 md:grid-cols-[1fr_0.72fr]">

              {/* Hero text */}

              <div className="relative z-10 max-w-[500px]">

                <p className="mb-4 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8e8981]">
                  Operations
                </p>

                <h1 className="text-[42px] font-semibold leading-[0.96] tracking-[-0.055em] sm:text-[53px] lg:text-[60px]">
                  Automate workflows
                  <br />
                  and visualize data
                </h1>

                <p className="mt-5 max-w-[420px] text-[10px] leading-[1.6] text-[#66635d] sm:text-[11px]">
                  Replace manual work with live dashboards
                  and automated workflows, built around how
                  your team operates.
                </p>

                <Link
                  to="/builder"
                  className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-[#181818] px-4 py-2 text-[9px] font-medium text-white transition hover:bg-black"
                >
                  Start building
                  <ArrowRight size={11} />
                </Link>

              </div>

              {/* Hero checklist */}

              <div className="relative z-10 mx-auto w-full max-w-[280px]">

                <div className="space-y-4">

                  {[
                    "Connect all your tools",
                    "Automate repetitive work",
                    "Monitor and fix issues fast",
                    "Scale with confidence",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3"
                    >
                      <CircleCheck
                        size={14}
                        strokeWidth={2}
                        className="text-[#151515]"
                      />

                      <span className="text-[10px] text-[#55524c]">
                        {item}
                      </span>
                    </div>
                  ))}

                </div>

              </div>

            </div>

            {/* Dashboard hero preview */}

            <div className="relative z-10 mx-auto mt-14 max-w-[850px]">

              <div className="absolute -inset-6 rounded-[20px] bg-gradient-to-r from-[#ff42a1]/30 via-[#c78cff]/25 to-[#6695ff]/30 blur-2xl" />

              <div className="relative overflow-hidden rounded-[10px] border border-[#d9d5cc] bg-white shadow-[0_22px_55px_rgba(0,0,0,0.12)]">

                <div className="flex h-8 items-center gap-1.5 border-b border-[#ebe8e2] px-3">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4d0c9]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4d0c9]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4d0c9]" />

                  <div className="mx-auto h-4 w-[45%] rounded-md bg-[#f5f3ef]" />

                </div>

                <div className="grid min-h-[310px] grid-cols-[125px_1fr]">

                  {/* Sidebar */}

                  <div className="border-r border-[#ebe8e2] bg-[#fbfaf7] p-4">

                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#202020] text-[7px] font-bold text-white">
                        I
                      </div>

                      <span className="text-[9px] font-semibold">
                        ICOGON
                      </span>
                    </div>

                    <div className="mt-7 space-y-2">

                      {[
                        ["Home", BarChart3],
                        ["Workflows", Workflow],
                        ["Runs", Zap],
                        ["Logs", Code2],
                        ["Settings", Settings2],
                      ].map(([label, Icon]) => {
                        const ItemIcon = Icon as typeof BarChart3;

                        return (
                          <div
                            key={label as string}
                            className={`flex items-center gap-2 rounded-md px-2 py-2 ${
                              label === "Workflows"
                                ? "bg-[#e9e7f6]"
                                : ""
                            }`}
                          >
                            <ItemIcon size={11} />
                            <span className="text-[8px] text-[#77736d]">
                              {label as string}
                            </span>
                          </div>
                        );
                      })}

                    </div>

                  </div>

                  {/* Dashboard */}

                  <div className="bg-[#fffefa] p-5 sm:p-7">

                    <div className="flex items-center justify-between">

                      <div>
                        <h3 className="text-[13px] font-semibold">
                          Operations Overview
                        </h3>

                        <p className="mt-1 text-[7px] text-[#99958d]">
                          Monitor your workflows and business activity.
                        </p>
                      </div>

                      <div className="h-5 w-16 rounded-md bg-[#f1efea]" />

                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2">

                      {[
                        ["24", "Active workflows"],
                        ["312", "Tasks automated"],
                        ["99.9%", "Success rate"],
                        ["1.2k", "Hours saved"],
                      ].map(([number, label]) => (
                        <div
                          key={label}
                          className="rounded-md border border-[#ece8e1] bg-white p-3"
                        >
                          <div className="text-[15px] font-semibold">
                            {number}
                          </div>

                          <div className="mt-1 text-[6px] text-[#99958d]">
                            {label}
                          </div>
                        </div>
                      ))}

                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[1.35fr_0.8fr]">

                      {/* Chart */}

                      <div className="rounded-md border border-[#ece8e1] bg-white p-4">

                        <div className="text-[8px] font-medium">
                          Workflow runs
                        </div>

                        <div className="mt-5 flex h-[100px] items-end justify-between gap-2">

                          {[35, 60, 45, 75, 52, 82, 46, 92, 65, 78, 55, 88].map(
                            (height, index) => (
                              <div
                                key={index}
                                className="flex h-full flex-1 items-end"
                              >
                                <div
                                  className="w-full rounded-t-sm bg-gradient-to-t from-[#6e72f6] via-[#b56cff] to-[#ff4d9a]"
                                  style={{
                                    height: `${height}%`,
                                  }}
                                />
                              </div>
                            ),
                          )}

                        </div>

                      </div>

                      {/* Activity */}

                      <div className="rounded-md border border-[#ece8e1] bg-white p-4">

                        <div className="text-[8px] font-medium">
                          Recent activity
                        </div>

                        <div className="mt-4 space-y-3">

                          {[
                            "Customer sync completed",
                            "Invoice generated",
                            "Alert resolved",
                            "Data backup completed",
                          ].map((item, index) => (
                            <div
                              key={item}
                              className="flex items-center gap-2"
                            >
                              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#f0edf5]">
                                <Check size={8} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[6px]">
                                  {item}
                                </div>

                                <div className="mt-0.5 text-[5px] text-[#aaa69f]">
                                  {index + 1} min ago
                                </div>
                              </div>
                            </div>
                          ))}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            LOGOS
        ===================================================== */}

        <section className="border-y border-[#ebe7df] bg-[#fffefa]">

          <div className="mx-auto flex max-w-[850px] flex-wrap items-center justify-center gap-x-12 gap-y-5 px-6 py-7 opacity-40 sm:justify-between">

            <span className="text-[13px] font-bold">
              ◈ NVIDIA
            </span>

            <span className="text-[13px] font-semibold">
              HCA
              <span className="block text-center text-[7px] font-normal">
                Healthcare
              </span>
            </span>

            <span className="text-[12px] font-bold tracking-[0.22em]">
              HEARST
            </span>

            <span className="text-[12px] font-medium tracking-[0.1em]">
              UDACITY
            </span>

          </div>

        </section>

        {/* =====================================================
            WHAT OPS TEAMS BUILD
        ===================================================== */}

        <section className="bg-[#f5f2eb]">

          <div className="mx-auto max-w-[900px] px-6 py-20 sm:py-24 lg:px-10">

            <h2 className="text-[29px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[35px]">
              What Ops teams
              <br />
              build with ICOGON
            </h2>

            <div className="mt-10 space-y-5">

              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="overflow-hidden rounded-[12px] border border-[#e6e2d9] bg-[#fffefa]"
                >

                  <div className="grid min-h-[145px] md:grid-cols-[1fr_1.08fr]">

                    <div className="flex flex-col justify-center p-5 sm:p-6">

                      <p className="text-[8px] font-medium uppercase tracking-[0.1em] text-[#aaa69e]">
                        Operations
                      </p>

                      <h3 className="mt-3 text-[14px] font-medium tracking-[-0.02em] text-[#66635d] sm:text-[15px]">
                        {feature.title}
                      </h3>

                      <p className="mt-2 max-w-[330px] text-[9px] leading-[1.5] text-[#aaa69e] sm:text-[10px]">
                        {feature.description}
                      </p>

                    </div>

                    <div className="relative min-h-[145px] border-t border-[#eeeae2] bg-[#f7f5ef] md:border-l md:border-t-0">

                      {/* Dashboard */}

                      {feature.type === "dashboard" && (
                        <div className="absolute inset-4 overflow-hidden rounded-md border border-[#e8e3e8] bg-white shadow-sm">

                          <div className="h-6 bg-[#ffe5ee]" />

                          <div className="p-4">

                            <div className="h-2 w-28 rounded bg-[#ddd9df]" />

                            <div className="mt-4 grid grid-cols-3 gap-2">
                              <div className="h-8 rounded bg-[#f0eef2]" />
                              <div className="h-8 rounded bg-[#eeeaf1]" />
                              <div className="h-8 rounded bg-[#f1eef3]" />
                            </div>

                            <div className="mt-4 flex items-end gap-2">
                              {[35, 65, 48, 80, 55, 72].map(
                                (height, index) => (
                                  <div
                                    key={index}
                                    className="w-4 rounded-t-sm bg-[#d9d5eb]"
                                    style={{
                                      height: `${height / 2}px`,
                                    }}
                                  />
                                ),
                              )}
                            </div>

                          </div>
                        </div>
                      )}

                      {/* Queue */}

                      {feature.type === "queue" && (
                        <div className="absolute inset-4 overflow-hidden rounded-md border border-[#eadfd9] bg-white shadow-sm">

                          <div className="flex h-full">

                            <div className="w-[28%] bg-[#ffe3d6] p-3">

                              <div className="h-2 w-16 rounded bg-white/80" />

                              <div className="mt-4 space-y-2">
                                <div className="h-1.5 rounded bg-white/70" />
                                <div className="h-1.5 rounded bg-white/60" />
                                <div className="h-1.5 w-[70%] rounded bg-white/60" />
                              </div>

                            </div>

                            <div className="flex-1 p-4">

                              <div className="h-2 w-24 rounded bg-[#ddd9d3]" />

                              <div className="mt-4 grid grid-cols-5 items-end gap-2">
                                {[35, 55, 45, 75, 60].map(
                                  (height, index) => (
                                    <div
                                      key={index}
                                      className="rounded-t-sm bg-[#cfcbdc]"
                                      style={{
                                        height: `${height / 2}px`,
                                      }}
                                    />
                                  ),
                                )}
                              </div>

                            </div>

                          </div>

                        </div>
                      )}

                      {/* Approval */}

                      {feature.type === "approval" && (
                        <div className="absolute inset-4 overflow-hidden rounded-md border border-[#dfdbed] bg-white shadow-sm">

                          <div className="flex h-full">

                            <div className="w-[23%] bg-[#dcd7ef] p-3">
                              <div className="h-2 w-10 rounded bg-white/80" />

                              <div className="mt-4 space-y-2">
                                <div className="h-1.5 rounded bg-white/60" />
                                <div className="h-1.5 rounded bg-white/60" />
                                <div className="h-1.5 rounded bg-white/50" />
                              </div>
                            </div>

                            <div className="flex-1 p-4">

                              <div className="h-2 w-28 rounded bg-[#ddd9e2]" />

                              <div className="mt-4 space-y-2">

                                {[1, 2, 3].map((item) => (
                                  <div
                                    key={item}
                                    className="flex items-center gap-2 rounded border border-[#eeeae7] p-2"
                                  >
                                    <div className="h-4 w-4 rounded bg-[#eeeaf3]" />
                                    <div className="h-1.5 flex-1 rounded bg-[#eeeae7]" />
                                    <Check
                                      size={9}
                                      className="text-[#85809a]"
                                    />
                                  </div>
                                ))}

                              </div>

                            </div>

                          </div>

                        </div>
                      )}

                      {/* Knowledge */}

                      {feature.type === "knowledge" && (
                        <div className="absolute inset-4 overflow-hidden rounded-md border border-[#e9dce3] bg-white shadow-sm">

                          <div className="flex h-full">

                            <div className="w-[27%] bg-[#ffdce8] p-3">

                              <div className="h-2 w-12 rounded bg-white/80" />

                              <div className="mt-5 space-y-2">
                                <div className="h-1.5 rounded bg-white/60" />
                                <div className="h-1.5 rounded bg-white/60" />
                                <div className="h-1.5 rounded bg-white/50" />
                              </div>

                            </div>

                            <div className="flex-1 p-4">

                              <div className="h-2 w-24 rounded bg-[#ddd9df]" />

                              <div className="mt-4 space-y-2">

                                <div className="h-2 w-[85%] rounded bg-[#eeeae8]" />
                                <div className="h-2 w-[70%] rounded bg-[#eeeae8]" />
                                <div className="h-2 w-[90%] rounded bg-[#eeeae8]" />

                              </div>

                              <div className="mt-5 h-5 w-20 rounded bg-[#f0edf1]" />

                            </div>

                          </div>

                        </div>
                      )}

                    </div>

                  </div>

                </div>
              ))}

            </div>

          </div>
        </section>

        {/* =====================================================
            REDUCE OPERATIONAL COORDINATION
        ===================================================== */}

        <section className="bg-[#fffefa]">

          <div className="mx-auto max-w-[900px] px-6 py-24 sm:py-28 lg:px-10">

            <h2 className="text-[29px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[36px]">
              Reduce operational
              <br />
              coordination overhead
            </h2>

            <p className="mt-4 max-w-[510px] text-[10px] leading-[1.55] text-[#85827b]">
              Operations teams can automate repetitive work,
              connect data across systems, and keep important
              workflows visible from one place.
            </p>

            <div className="mt-8 overflow-hidden rounded-[12px] border border-[#e6e2d9] bg-[#f5f2eb]">

              <div className="grid min-h-[245px] md:grid-cols-[1.1fr_1fr]">

                {/* Automation preview */}

                <div className="flex items-center justify-center p-5">

                  <div className="w-full max-w-[390px] overflow-hidden rounded-lg border border-[#d6d2cb] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">

                    <div className="h-7 bg-[#6f70e9]" />

                    <div className="p-4">

                      <div className="flex items-center justify-between">

                        <div>
                          <div className="h-2 w-28 rounded bg-[#ddd9d3]" />
                          <div className="mt-1.5 h-1.5 w-20 rounded bg-[#eeeae5]" />
                        </div>

                        <div className="h-5 w-12 rounded bg-[#eeeaf0]" />

                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-2">

                        <div className="rounded border border-[#e8e4dd] p-3">
                          <div className="h-1.5 w-10 rounded bg-[#ddd9d3]" />
                          <div className="mt-3 h-2 w-14 rounded bg-[#e9e5df]" />
                        </div>

                        <div className="rounded border border-[#e8e4dd] p-3">
                          <div className="h-1.5 w-10 rounded bg-[#ddd9d3]" />
                          <div className="mt-3 h-2 w-14 rounded bg-[#e9e5df]" />
                        </div>

                        <div className="rounded border border-[#e8e4dd] p-3">
                          <div className="h-1.5 w-10 rounded bg-[#ddd9d3]" />
                          <div className="mt-3 h-2 w-14 rounded bg-[#e9e5df]" />
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Text */}

                <div className="flex flex-col justify-center border-t border-[#e5e1d8] p-7 md:border-l md:border-t-0">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#aaa69d]">
                    Automation
                  </p>

                  <h3 className="mt-3 text-[17px] font-medium tracking-[-0.02em] text-[#55524c]">
                    Reduce repetitive work and keep operations moving.
                  </h3>

                  <p className="mt-3 text-[10px] leading-[1.55] text-[#918e87]">
                    Connect triggers, actions, approvals, and
                    data into workflows your team can monitor
                    and improve over time.
                  </p>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            MONITORING
        ===================================================== */}

        <section className="bg-[#fffefa]">

          <div className="mx-auto max-w-[900px] px-6 pb-20 sm:pb-24 lg:px-10">

            <div className="grid gap-8 md:grid-cols-[1fr_0.85fr]">

              <div>

                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#aaa69d]">
                  Monitoring
                </p>

                <h2 className="mt-4 text-[27px] font-semibold leading-[1.03] tracking-[-0.045em] sm:text-[34px]">
                  Find and fix issues
                  <br />
                  before they slow you down
                </h2>

              </div>

              <div className="flex items-end">

                <p className="text-[10px] leading-[1.55] text-[#85827b]">
                  Get real-time visibility into your workflows,
                  logs, and failures. Detect issues early and keep
                  your operations running smoothly.
                </p>

              </div>

            </div>

            {/* Dark monitor */}

            <div className="relative mt-8 overflow-hidden rounded-[10px] bg-[#141516]">

              <div className="grid min-h-[270px] grid-cols-[125px_1fr]">

                <div className="border-r border-white/10 p-4">

                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ff496b] text-[7px] font-bold text-white">
                      I
                    </div>

                    <span className="text-[8px] font-semibold text-white">
                      ICOGON
                    </span>
                  </div>

                  <div className="mt-7 space-y-3">

                    {["Workflows", "Logs", "Alerts", "Settings"].map(
                      (item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 text-[7px] text-white/45"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                          {item}
                        </div>
                      ),
                    )}

                  </div>

                </div>

                <div className="p-5 sm:p-7">

                  <div className="flex items-start justify-between">

                    <div>
                      <h3 className="text-[15px] font-medium text-white">
                        Operations Monitor
                      </h3>

                      <p className="mt-1 text-[7px] text-white/40">
                        Real-time workflow monitoring and error tracking
                      </p>
                    </div>

                    <div className="hidden gap-2 sm:flex">

                      <div className="rounded-md bg-white/5 px-3 py-2">
                        <div className="text-[13px] font-semibold text-white">
                          24
                        </div>
                        <div className="text-[6px] text-white/40">
                          Active
                        </div>
                      </div>

                      <div className="rounded-md bg-white/5 px-3 py-2">
                        <div className="text-[13px] font-semibold text-[#ff7593]">
                          2
                        </div>
                        <div className="text-[6px] text-white/40">
                          Errors
                        </div>
                      </div>

                      <div className="rounded-md bg-white/5 px-3 py-2">
                        <div className="text-[13px] font-semibold text-white">
                          99.9%
                        </div>
                        <div className="text-[6px] text-white/40">
                          Uptime
                        </div>
                      </div>

                    </div>

                  </div>

                  <div className="mt-5 overflow-hidden rounded-md border border-white/10">

                    <div className="grid grid-cols-[1.5fr_0.8fr_0.7fr_0.7fr] border-b border-white/10 bg-white/5 px-3 py-2 text-[6px] text-white/40">
                      <span>Workflow</span>
                      <span>Status</span>
                      <span>Last run</span>
                      <span>Duration</span>
                    </div>

                    {[
                      ["Customer sync", "Success", "2 min ago", "12s"],
                      ["Invoice generation", "Success", "12 min ago", "8s"],
                      ["Data backup", "Failed", "36 min ago", "24s"],
                      ["Email notifications", "Success", "1 hour ago", "6s"],
                      ["Report generation", "Success", "2 hours ago", "18s"],
                    ].map(([name, status, time, duration]) => (
                      <div
                        key={name}
                        className="grid grid-cols-[1.5fr_0.8fr_0.7fr_0.7fr] border-b border-white/5 px-3 py-2 text-[6px] text-white/55 last:border-0"
                      >
                        <span>{name}</span>

                        <span
                          className={
                            status === "Failed"
                              ? "text-[#ff758e]"
                              : "text-[#6ed99d]"
                          }
                        >
                          ● {status}
                        </span>

                        <span>{time}</span>
                        <span>{duration}</span>
                      </div>
                    ))}

                  </div>

                </div>

              </div>

              <div className="pointer-events-none absolute bottom-[-70px] left-[8%] h-[100px] w-[85%] rounded-full bg-gradient-to-r from-[#ff2c9a] via-[#ff6b35] to-[#667cff] opacity-90 blur-3xl" />

            </div>

          </div>
        </section>

        {/* =====================================================
            INTEGRATIONS
        ===================================================== */}

        <section className="bg-[#f5f2eb]">

          <div className="mx-auto max-w-[900px] px-6 py-20 sm:py-24 lg:px-10">

            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#aaa69d]">
              Integrations
            </p>

            <h2 className="mt-4 text-[27px] font-semibold leading-[1.03] tracking-[-0.045em] sm:text-[34px]">
              More than just automation
            </h2>

            <p className="mt-3 max-w-[470px] text-[9px] leading-[1.6] text-[#85827b]">
              Connect your existing tools and services. Bring
              your data and workflows together in one place.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              {/* Tools */}

              <div className="rounded-[10px] border border-[#e5e1d8] bg-[#fffefa] p-5">

                <h3 className="text-[11px] font-medium">
                  Your tools
                </h3>

                <div className="mt-4 space-y-2">

                  {integrations.slice(0, 4).map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center justify-between rounded-md border border-[#eeeae3] px-3 py-2"
                    >
                      <span className="text-[8px]">
                        {tool}
                      </span>

                      <span className="text-[7px] text-[#5da77c]">
                        Connected
                      </span>
                    </div>
                  ))}

                </div>

              </div>

              {/* Payments */}

              <div className="rounded-[10px] border border-[#e5e1d8] bg-[#fffefa] p-5">

                <h3 className="text-[11px] font-medium">
                  Payments
                </h3>

                <div className="mt-5 flex items-center justify-around">

                  <span className="text-[20px] font-semibold text-[#635bff]">
                    stripe
                  </span>

                  <span className="text-[17px] font-medium text-[#77736d]">
                    paddle
                  </span>

                </div>

                <p className="mt-6 text-[8px] leading-[1.5] text-[#99958d]">
                  Automate billing, invoices, and financial
                  workflows around your business.
                </p>

              </div>

              {/* 100 integrations */}

              <div className="rounded-[10px] border border-[#e5e1d8] bg-[#fffefa] p-5">

                <h3 className="text-[11px] font-medium">
                  100+ integrations
                </h3>

                <div className="mt-5 grid grid-cols-4 gap-2">

                  {integrations.map((tool) => (
                    <div
                      key={tool}
                      className="flex h-9 items-center justify-center rounded-md border border-[#e9e5df] bg-[#faf9f5] text-[7px] font-medium text-[#77736d]"
                    >
                      {tool}
                    </div>
                  ))}

                </div>

                <p className="mt-5 text-[8px] leading-[1.5] text-[#99958d]">
                  Connect your favorite tools and services
                  to your workflows.
                </p>

              </div>

              {/* Custom workflows */}

              <div className="rounded-[10px] border border-[#e5e1d8] bg-[#fffefa] p-5">

                <h3 className="text-[11px] font-medium">
                  Custom workflows
                </h3>

                <div className="mt-4 space-y-2">

                  {[
                    ["Trigger", "New form submission"],
                    ["Action", "Add to CRM"],
                    ["Action", "Send email"],
                    ["Action", "Create task"],
                  ].map(([label, value]) => (
                    <div
                      key={`${label}-${value}`}
                      className="flex items-center gap-3 rounded-md border border-[#eeeae3] px-3 py-2"
                    >
                      <span className="w-10 text-[7px] text-[#99958d]">
                        {label}
                      </span>

                      <span className="text-[7px] text-[#55524c]">
                        {value}
                      </span>
                    </div>
                  ))}

                </div>

                <p className="mt-4 text-[8px] text-[#99958d]">
                  Build powerful multi-step workflows without code.
                </p>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            SEARCH READY
        ===================================================== */}

        <section className="bg-[#fffefa]">

          <div className="mx-auto max-w-[900px] px-6 py-20 sm:py-24 lg:px-10">

            <div className="grid gap-10 md:grid-cols-2">

              <div>

                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#aaa69d]">
                  SEO friendly
                </p>

                <h2 className="mt-4 text-[27px] font-semibold leading-[1.03] tracking-[-0.045em] sm:text-[34px]">
                  Search-ready
                  <br />
                  from day one
                </h2>

                <p className="mt-4 max-w-[380px] text-[9px] leading-[1.6] text-[#85827b]">
                  Your operations data and content can be
                  structured clearly for people and the systems
                  your business depends on.
                </p>

                <div className="mt-6 space-y-3">

                  {[
                    "Clean data structure",
                    "Fast and reliable",
                    "Optimized for scale",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-[8px] text-[#6f6b64]"
                    >
                      <CircleCheck size={12} />
                      {item}
                    </div>
                  ))}

                </div>

              </div>

              <div className="flex items-center justify-center">

                <div className="w-full max-w-[390px] rounded-xl border border-[#e5e1d8] bg-[#f5f2eb] p-5">

                  <div className="flex items-center gap-2 text-[8px] text-[#99958d]">
                    <SearchIcon />
                    operations automation
                  </div>

                  <div className="mt-4 rounded-lg border border-[#e1dce9] bg-white p-4 shadow-sm">

                    <div className="flex items-center gap-2">

                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ece9fa]">
                        <Sparkles size={12} />
                      </div>

                      <div>
                        <div className="text-[8px] font-semibold">
                          ICOGON
                        </div>

                        <div className="text-[7px] text-[#99958d]">
                          Operations assistant
                        </div>
                      </div>

                    </div>

                    <div className="mt-4 text-[11px] font-semibold">
                      Automate your operations
                    </div>

                    <p className="mt-2 text-[8px] leading-[1.5] text-[#99958d]">
                      Automate workflows, connect your tools,
                      and scale your business with ICOGON.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            WHAT KIND OF OPS
        ===================================================== */}

        <section className="bg-[#faf9f5]">

          <div className="mx-auto max-w-[850px] px-6 py-20 sm:py-24">

            <div className="text-center">

              <h2 className="text-[23px] font-semibold tracking-[-0.04em] sm:text-[27px]">
                What kind of ops can you build?
              </h2>

            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-3">

              {[
                {
                  icon: BarChart3,
                  title: "Internal operations",
                  text: "HR, finance, legal, and more.",
                },
                {
                  icon: Users,
                  title: "Customer operations",
                  text: "Support, onboarding, success.",
                },
                {
                  icon: Layers3,
                  title: "Product operations",
                  text: "Deployments, monitoring, data syncs.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="text-center"
                  >

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">

                      <Icon
                        size={17}
                        className="text-[#7771d8]"
                      />

                    </div>

                    <h3 className="mt-4 text-[10px] font-medium">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-[8px] text-[#99958d]">
                      {item.text}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>
        </section>

        {/* =====================================================
            FAQ
        ===================================================== */}

        <section className="bg-[#fffefa]">

          <div className="mx-auto max-w-[900px] px-6 py-20 sm:py-24 lg:px-10">

            <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">

              <div>

                <h2 className="text-[27px] font-semibold leading-[1.03] tracking-[-0.045em]">
                  Frequently
                  <br />
                  asked questions
                </h2>

                <p className="mt-4 max-w-[260px] text-[9px] leading-[1.5] text-[#99958d]">
                  Everything you need to know about building
                  operations workflows with ICOGON.
                </p>

              </div>

              <div className="divide-y divide-[#e4e0d8] border-y border-[#e4e0d8]">

                {faqs.map((faq) => (
                  <div
                    key={faq}
                    className="flex items-center justify-between gap-5 py-5"
                  >

                    <span className="text-[10px] text-[#55524c]">
                      {faq}
                    </span>

                    <ChevronDown
                      size={13}
                      className="shrink-0 text-[#99958d]"
                    />

                  </div>
                ))}

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            CTA + FOOTER
        ===================================================== */}

        <section className="relative overflow-hidden bg-[#faf9f5]">

          <div className="absolute inset-x-0 bottom-0 h-[370px] bg-[radial-gradient(ellipse_at_center_bottom,_#ff164f_0%,_#ff3974_22%,_#e5a5ff_46%,_#9ac9ff_72%,_transparent_100%)]" />

          <div className="relative mx-auto max-w-[1000px] px-6 pb-8 pt-24 sm:pb-14 sm:pt-28">

            <div className="text-center">

              <h2 className="text-[22px] font-semibold tracking-[-0.04em] sm:text-[26px]">
                Ready to automate your operations?
              </h2>

              <Link
                to="/builder"
                className="mx-auto mt-5 flex max-w-[330px] items-center justify-between rounded-lg border border-[#dedbd4] bg-white px-3 py-2.5 text-left shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
              >

                <span className="truncate text-[9px] text-[#9b978e]">
                  Ask ICOGON to set up a workflow...
                </span>

                <ArrowRight
                  size={11}
                  className="shrink-0 text-[#77736b]"
                />

              </Link>

            </div>

            {/* Footer */}

            <footer className="relative mt-16 overflow-hidden rounded-[9px] border border-[#e0dcd3] bg-[#faf9f5] px-6 py-8 shadow-[0_10px_35px_rgba(0,0,0,0.05)] sm:px-10">

              <div className="grid gap-8 sm:grid-cols-[1.15fr_repeat(4,1fr)]">

                {/* Brand */}

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ff496b] text-[8px] font-bold text-white">
                      I
                    </div>

                    <span className="text-[11px] font-semibold">
                      ICOGON
                    </span>

                  </div>

                  <p className="mt-4 max-w-[150px] text-[8px] leading-[1.5] text-[#99958d]">
                    Build software that moves your business forward.
                  </p>

                </div>

                {/* Company */}

                <div>

                  <p className="text-[8px] font-semibold text-[#5b5852]">
                    Company
                  </p>

                  <div className="mt-3 space-y-2 text-[7px] text-[#918d85]">
                    <a href="mailto:info@icogon.com" className="block">
                      Contact
                    </a>
                    <span className="block">Pricing</span>
                    <span className="block">Enterprise</span>
                    <span className="block">Security</span>
                  </div>

                </div>

                {/* Product */}

                <div>

                  <p className="text-[8px] font-semibold text-[#5b5852]">
                    Product
                  </p>

                  <div className="mt-3 space-y-2 text-[7px] text-[#918d85]">

                    <Link to="/builder" className="block">
                      AI Builder
                    </Link>

                    <Link to="/templates" className="block">
                      Templates
                    </Link>

                    <Link to="/connectors" className="block">
                      Connectors
                    </Link>

                    <Link to="/academy" className="block">
                      Academy
                    </Link>

                    <Link to="/solutions/operations" className="block">
                      Operations
                    </Link>

                  </div>

                </div>

                {/* Resources */}

                <div>

                  <p className="text-[8px] font-semibold text-[#5b5852]">
                    Resources
                  </p>

                  <div className="mt-3 space-y-2 text-[7px] text-[#918d85]">

                    <Link to="/blog" className="block">
                      Blog
                    </Link>

                    <Link to="/guides" className="block">
                      Guides
                    </Link>

                    <Link to="/docs" className="block">
                      Docs
                    </Link>

                    <Link to="/partners" className="block">
                      Partners
                    </Link>

                    <Link to="/customer-stories" className="block">
                      Stories
                    </Link>

                  </div>

                </div>

                {/* Legal */}

                <div>

                  <p className="text-[8px] font-semibold text-[#5b5852]">
                    Legal
                  </p>

                  <div className="mt-3 space-y-2 text-[7px] text-[#918d85]">

                    <span className="block">Privacy</span>
                    <span className="block">Terms</span>
                    <span className="block">Security</span>
                    <span className="block">Cookies</span>
                    <span className="block">GDPR</span>

                  </div>

                </div>

              </div>

              <div className="mt-8 flex items-center justify-between border-t border-[#e7e3db] pt-5">

                <span className="text-[7px] text-[#aaa69f]">
                  © {new Date().getFullYear()} ICOGON. All rights reserved.
                </span>

                <div className="flex items-center gap-2">

                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#ddd9d0] text-[7px] text-[#8e8a82]">
                    X
                  </div>

                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#ddd9d0] text-[7px] text-[#8e8a82]">
                    in
                  </div>

                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#ddd9d0] text-[7px] text-[#8e8a82]">
                    ◎
                  </div>

                </div>

              </div>

            </footer>

          </div>
        </section>

      </main>
    </div>
  );
};

const SearchIcon = () => (
  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#dcd8d0]">
    <span className="h-1.5 w-1.5 rounded-full border border-[#99958d]" />
  </span>
);

export default OpsPage;