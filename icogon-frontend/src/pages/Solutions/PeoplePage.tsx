import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  // HeartHandshake,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const PeoplePage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Navbar handles login internally.
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const peopleFeatures = [
    {
      title: "Onboarding workflows",
      description:
        "Make onboarding straightforward and easy to follow, from collecting employee details to assigning tasks and resources.",
      eyebrow: "Employee experience",
      icon: Users,
      type: "onboarding",
    },
    {
      title: "Employee resource hubs",
      description:
        "Create centralized spaces where employees can quickly find policies, resources, processes, and important information.",
      eyebrow: "Knowledge",
      icon: FileText,
      type: "resources",
    },
    {
      title: "Approval and form workflows",
      description:
        "Build structured workflows for requests, approvals, employee forms, and recurring people operations.",
      eyebrow: "Workflows",
      icon: ClipboardCheck,
      type: "approval",
    },
    {
      title: "People metrics dashboards",
      description:
        "Create useful dashboards around employee data, engagement, onboarding progress, and team operations.",
      eyebrow: "Analytics",
      icon: BarChart3,
      type: "metrics",
    },
    {
      title: "Org charts",
      description:
        "Give your team a clear view of people, departments, reporting structures, and organizational information.",
      eyebrow: "Organization",
      icon: Users,
      type: "org",
    },
  ];

  const faqs = [
    "Can I build employee tools without coding?",
    "Can ICOGON help with HR workflows?",
    "Can I create an employee resource hub?",
    "Can people teams customize their applications?",
  ];

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#111111]">
      <Navbar
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      <main className="pt-[72px]">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative h-[370px] overflow-hidden bg-[#faf8f3] sm:h-[400px] lg:h-[430px]">

          {/* LEFT EMPLOYEE CARD */}

          <div className="pointer-events-none absolute left-[-35px] top-[55px] hidden sm:block">

            <div className="relative h-[150px] w-[115px] overflow-hidden rounded-r-[10px] bg-[#dddce9]">

              <div className="absolute inset-0 bg-gradient-to-br from-[#d5d2e0] via-[#f0dfe3] to-[#c5c7d8]" />

              <div className="absolute left-[-8px] top-[8px] h-[120px] w-[100px] rounded-full bg-[#d2b09f]" />

              <div className="absolute left-[18px] top-[0px] h-[75px] w-[72px] rounded-[50%] bg-[#332925]" />

              <div className="absolute left-[43px] top-[62px] h-[4px] w-[12px] rounded-full bg-[#3c2d2b]" />

              <div className="absolute left-[2px] bottom-[7px] rounded-md bg-[#ff2874] px-2 py-1 text-[7px] font-medium text-white">
                Employee
              </div>
            </div>

            <div className="absolute left-[62px] top-[92px] h-[105px] w-[105px] overflow-hidden rounded-[10px] bg-[#cfd5e3]">

              <div className="absolute inset-0 bg-gradient-to-br from-[#cbd5e3] to-[#eeeef1]" />

              <div className="absolute left-[20px] top-[20px] h-[70px] w-[65px] rounded-full bg-[#b98269]" />

              <div className="absolute left-[15px] top-[9px] h-[52px] w-[72px] rounded-t-full bg-[#463d3b]" />

              <div className="absolute bottom-2 left-2 rounded-md bg-[#ff5d91] px-2 py-1 text-[6px] text-white">
                New starter
              </div>

            </div>
          </div>

          {/* RIGHT EMPLOYEE CARD */}

          <div className="pointer-events-none absolute right-[-28px] top-[42px] hidden sm:block">

            <div className="relative h-[150px] w-[112px] overflow-hidden rounded-l-[10px] bg-[#d9d7df]">

              <div className="absolute inset-0 bg-gradient-to-br from-[#dddce6] to-[#c6c5d3]" />

              <div className="absolute left-[4px] top-[5px] h-[128px] w-[100px] rounded-full bg-[#d5aa95]" />

              <div className="absolute left-[0px] top-[-5px] h-[72px] w-[108px] rounded-t-full bg-[#302824]" />

              <div className="absolute right-[4px] bottom-[9px] rounded-md bg-[#ff653d] px-2 py-1 text-[6px] text-white">
                Employee
              </div>

              <div className="absolute left-[-8px] top-[4px] h-[16px] w-[35px] rounded-full bg-[#24201f]" />

            </div>

            <div className="absolute -left-[28px] top-[72px] h-[92px] w-[90px] overflow-hidden rounded-[10px] bg-[#ded8e5]">

              <div className="absolute inset-0 bg-gradient-to-br from-[#ddd7e3] to-[#f0d9d8]" />

              <div className="absolute left-[13px] top-[14px] h-[70px] w-[65px] rounded-full bg-[#b77e6a]" />

              <div className="absolute left-[8px] top-[4px] h-[43px] w-[70px] rounded-t-full bg-[#5b4038]" />

              <div className="absolute bottom-2 left-2 rounded-md bg-[#ff8064] px-2 py-1 text-[6px] text-white">
                HR team
              </div>

            </div>

          </div>

          {/* HERO CONTENT */}

          <div className="relative mx-auto flex h-full max-w-[900px] items-center justify-center px-6 text-center">

            <div className="max-w-[650px]">

              <h1 className="text-[43px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[55px] lg:text-[65px]">
                Build employee
                <br />
                resource hubs
              </h1>

              <p className="mx-auto mt-5 max-w-[500px] text-[11px] leading-[1.5] text-[#66635c] sm:text-[12px]">
                Make onboarding, requests, and updates easy
                for you and every employee.
              </p>

              <Link
                to="/builder"
                className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-[#171717] px-4 py-2 text-[9px] font-medium text-white transition hover:bg-black"
              >
                Start building
                <ArrowRight size={11} />
              </Link>

            </div>
          </div>
        </section>

        {/* =====================================================
            LOGOS
        ===================================================== */}

        <section className="border-b border-[#ebe8df] bg-[#fffefa]">
          <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-x-12 gap-y-5 px-6 py-7 opacity-40 sm:justify-between">

            <span className="text-[16px] font-semibold tracking-[-0.04em]">
              workday
            </span>

            <span className="text-[14px] font-bold">
              ◈ NVIDIA
            </span>

            <span className="text-[14px] font-semibold">
              HCA
              <span className="block text-center text-[8px] font-normal">
                Healthcare
              </span>
            </span>

            <span className="text-[12px] font-bold tracking-[0.22em]">
              HEARST
            </span>

          </div>
        </section>

        {/* =====================================================
            WHAT PEOPLE TEAMS BUILD
        ===================================================== */}

        <section className="bg-[#f5f2eb]">
          <div className="mx-auto max-w-[900px] px-6 py-20 sm:py-24 lg:px-10 lg:py-28">

            <div className="max-w-[430px]">
              <h2 className="text-[29px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[35px]">
                What people teams
                <br />
                build with ICOGON
              </h2>
            </div>

            <div className="mt-10 space-y-5">

              {peopleFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="overflow-hidden rounded-[12px] border border-[#e6e2d9] bg-[#fffefa]"
                  >
                    <div className="grid min-h-[145px] md:grid-cols-[1fr_1.08fr]">

                      {/* TEXT */}

                      <div className="flex flex-col justify-center p-5 sm:p-6">

                        <div className="flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.1em] text-[#aaa69e]">
                          <Icon size={11} />
                          {feature.eyebrow}
                        </div>

                        <h3 className="mt-3 text-[14px] font-medium tracking-[-0.02em] text-[#66635d] sm:text-[15px]">
                          {feature.title}
                        </h3>

                        <p className="mt-2 max-w-[330px] text-[9px] leading-[1.5] text-[#aaa69e] sm:text-[10px]">
                          {feature.description}
                        </p>

                      </div>

                      {/* PREVIEW */}

                      <div className="relative min-h-[145px] border-t border-[#eeeae2] bg-[#f7f5ef] md:border-l md:border-t-0">

                        {/* ONBOARDING */}

                        {feature.type === "onboarding" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#e8e1e5] bg-white shadow-sm">

                            <div className="h-6 border-b border-[#eee] bg-[#ffe6f0]" />

                            <div className="p-4">

                              <div className="h-2 w-28 rounded bg-[#dedbe0]" />

                              <div className="mt-4 space-y-3">

                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full bg-[#d9f0df]" />
                                  <div className="h-1.5 flex-1 rounded bg-[#ebe8ed]" />
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full bg-[#e4ddf5]" />
                                  <div className="h-1.5 w-[80%] rounded bg-[#ebe8ed]" />
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full bg-[#f3e4db]" />
                                  <div className="h-1.5 w-[65%] rounded bg-[#ebe8ed]" />
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full bg-[#e4eafa]" />
                                  <div className="h-1.5 w-[72%] rounded bg-[#ebe8ed]" />
                                </div>

                              </div>
                            </div>
                          </div>
                        )}

                        {/* RESOURCE HUB */}

                        {feature.type === "resources" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#e9e1dc] bg-white shadow-sm">

                            <div className="flex h-full">

                              <div className="w-[18%] bg-[#ffe5d9] p-2">

                                <div className="h-2 w-7 rounded bg-white/80" />

                                <div className="mt-4 space-y-2">
                                  <div className="h-1.5 rounded bg-white/70" />
                                  <div className="h-1.5 rounded bg-white/60" />
                                  <div className="h-1.5 rounded bg-white/60" />
                                </div>

                              </div>

                              <div className="flex-1 p-4">

                                <div className="h-2 w-28 rounded bg-[#ddd9d5]" />

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  <div className="h-8 rounded bg-[#f1efeb]" />
                                  <div className="h-8 rounded bg-[#f1efeb]" />
                                  <div className="h-8 rounded bg-[#ece9e4]" />
                                </div>

                                <div className="mt-4 h-2 w-[80%] rounded bg-[#eeeae5]" />

                              </div>

                            </div>
                          </div>
                        )}

                        {/* APPROVAL */}

                        {feature.type === "approval" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#e0dcef] bg-white shadow-sm">

                            <div className="flex h-full">

                              <div className="w-[18%] bg-[#d9d5e9] p-2">

                                <div className="h-2 w-7 rounded bg-white/70" />

                                <div className="mt-4 space-y-2">
                                  <div className="h-1.5 rounded bg-white/60" />
                                  <div className="h-1.5 rounded bg-white/50" />
                                  <div className="h-1.5 rounded bg-white/50" />
                                </div>

                              </div>

                              <div className="flex-1 p-4">

                                <div className="flex items-center justify-between">
                                  <div className="h-2 w-28 rounded bg-[#ddd9e2]" />
                                  <div className="h-4 w-10 rounded bg-[#f0edf3]" />
                                </div>

                                <div className="mt-5 space-y-3">

                                  <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded bg-[#eee9f4]" />
                                    <div className="flex-1 h-1.5 rounded bg-[#ebe8ed]" />
                                    <Check size={11} className="text-[#9992ae]" />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded bg-[#f1e8df]" />
                                    <div className="flex-1 h-1.5 rounded bg-[#ebe8ed]" />
                                    <Check size={11} className="text-[#9992ae]" />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded bg-[#eeeaf4]" />
                                    <div className="flex-1 h-1.5 rounded bg-[#ebe8ed]" />
                                  </div>

                                </div>

                              </div>
                            </div>
                          </div>
                        )}

                        {/* METRICS */}

                        {feature.type === "metrics" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#ddd9ef] bg-white shadow-sm">

                            <div className="flex h-full">

                              <div className="w-[18%] bg-[#d7d3ea]" />

                              <div className="flex-1 p-4">

                                <div className="flex gap-2">
                                  <div className="h-2 w-24 rounded bg-[#ddd9e3]" />
                                  <div className="h-2 w-12 rounded bg-[#eeeaf0]" />
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  <div className="h-8 rounded bg-[#f0eef3]" />
                                  <div className="h-8 rounded bg-[#f0eef3]" />
                                  <div className="h-8 rounded bg-[#ebe8f1]" />
                                </div>

                                <div className="mt-4 flex items-center gap-6">

                                  <div className="relative h-12 w-12 rounded-full border-[7px] border-[#d4efe0] border-r-[#f1b4c5]">
                                    <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white" />
                                  </div>

                                  <div className="flex flex-1 items-end gap-2">
                                    <div className="h-5 w-3 rounded-sm bg-[#d6d2e6]" />
                                    <div className="h-8 w-3 rounded-sm bg-[#c2bddb]" />
                                    <div className="h-6 w-3 rounded-sm bg-[#d0cce1]" />
                                    <div className="h-10 w-3 rounded-sm bg-[#aaa4d0]" />
                                  </div>

                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ORG CHART */}

                        {feature.type === "org" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#e0dced] bg-white shadow-sm">

                            <div className="flex h-full">

                              <div className="w-[18%] bg-[#d8d5e7] p-2">

                                <div className="h-2 w-7 rounded bg-white/70" />

                                <div className="mt-4 space-y-2">
                                  <div className="h-1.5 rounded bg-white/60" />
                                  <div className="h-1.5 rounded bg-white/50" />
                                  <div className="h-1.5 rounded bg-white/50" />
                                </div>

                              </div>

                              <div className="flex-1 p-3">

                                <div className="h-2 w-24 rounded bg-[#dedbe4]" />

                                <div className="mt-4 flex justify-center">
                                  <div className="h-6 w-14 rounded-full bg-[#eeeaf2]" />
                                </div>

                                <div className="mx-auto mt-3 h-4 w-px bg-[#ddd9e2]" />

                                <div className="flex justify-center gap-2">
                                  <div className="h-5 w-10 rounded-full bg-[#f0edf3]" />
                                  <div className="h-5 w-10 rounded-full bg-[#eeeaf2]" />
                                  <div className="h-5 w-10 rounded-full bg-[#f1eef3]" />
                                </div>

                              </div>

                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </section>

        {/* =====================================================
            MAKE PEOPLE OPS SCALABLE
        ===================================================== */}

        <section className="bg-[#fffefa]">
          <div className="mx-auto max-w-[900px] px-6 py-24 sm:py-28 lg:px-10">

            <div className="max-w-[500px]">

              <h2 className="text-[29px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[36px]">
                Make people ops scalable
              </h2>

              <p className="mt-4 max-w-[500px] text-[10px] leading-[1.55] text-[#85827b]">
                People teams can standardize workflows, reduce
                repetitive work, and give employees a clearer
                experience without adding unnecessary complexity.
              </p>

            </div>

            <div className="mt-8 overflow-hidden rounded-[12px] border border-[#e6e2d9] bg-[#f5f2eb]">

              <div className="grid min-h-[245px] md:grid-cols-[1.1fr_1fr]">

                {/* ONBOARDING TOOL */}

                <div className="flex items-center justify-center p-5">

                  <div className="w-full max-w-[390px] overflow-hidden rounded-lg border border-[#d8d5ce] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">

                    <div className="h-6 border-b border-[#e8e5df] bg-[#6d6ae8]" />

                    <div className="p-4">

                      <div className="flex items-center justify-between">

                        <div>
                          <div className="h-2 w-32 rounded bg-[#ddd9df]" />
                          <div className="mt-1.5 h-1.5 w-20 rounded bg-[#eeeaf0]" />
                        </div>

                        <div className="h-5 w-12 rounded bg-[#eeeaf2]" />

                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        <div className="rounded border border-[#ece9e4] p-3">

                          <div className="text-[7px] text-[#aaa59f]">
                            Your Tool Onboarding Journey
                          </div>

                          <div className="mt-3 h-2 w-20 rounded bg-[#ddd9df]" />

                          <div className="mt-3 h-1.5 w-full rounded bg-[#eeeae5]" />

                          <div className="mt-2 h-1.5 w-[70%] rounded bg-[#eeeae5]" />

                        </div>

                        <div className="rounded border border-[#ece9e4] p-3">

                          <div className="text-[7px] text-[#aaa59f]">
                            Progress
                          </div>

                          <div className="mt-3 text-[15px] font-semibold text-[#77736d]">
                            5 / 10
                          </div>

                          <div className="mt-2 h-1.5 rounded bg-[#eeeae5]" />

                        </div>

                      </div>

                    </div>
                  </div>

                </div>

                {/* TEXT */}

                <div className="flex flex-col justify-center border-t border-[#e5e1d8] p-7 md:border-l md:border-t-0">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#aaa69d]">
                    Standardization
                  </p>

                  <h3 className="mt-3 text-[17px] font-medium tracking-[-0.02em] text-[#55524c]">
                    Make every employee experience more consistent.
                  </h3>

                  <p className="mt-3 text-[10px] leading-[1.55] text-[#918e87]">
                    Give employees clear workflows and give
                    people teams better visibility into what is
                    happening across the organization.
                  </p>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            FAQ
        ===================================================== */}

        <section className="bg-[#f5f2eb]">
          <div className="mx-auto max-w-[700px] px-6 py-24 sm:py-28">

            <div className="text-center">

              <h2 className="text-[27px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#77746d]">
                Frequently asked
                <br />
                questions
              </h2>

              <p className="mt-5 text-[10px] text-[#aaa69f]">
                Can ICOGON connect to our HRIS?
              </p>

            </div>

            <div className="mt-9 divide-y divide-[#dfdbd2] border-y border-[#dfdbd2]">

              {faqs.map((faq) => (
                <div
                  key={faq}
                  className="flex items-center justify-between py-5"
                >
                  <span className="text-[11px] text-[#6e6b64]">
                    {faq}
                  </span>

                  <ChevronDown
                    size={13}
                    className="text-[#9b978e]"
                  />
                </div>
              ))}

            </div>

          </div>
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="relative overflow-hidden bg-[#faf9f5]">

          <div className="absolute inset-x-0 bottom-0 h-[350px] bg-[radial-gradient(ellipse_at_center_bottom,_#ff164e_0%,_#ff3471_23%,_#e9a5ff_47%,_#9bc8ff_72%,_transparent_100%)]" />

          <div className="relative mx-auto max-w-[1000px] px-6 pb-8 pt-24 sm:pb-14 sm:pt-28">

            <div className="text-center">

              <h2 className="text-[22px] font-semibold tracking-[-0.04em] sm:text-[26px]">
                Ready to bring your idea to life?
              </h2>

              <div className="mx-auto mt-5 flex max-w-[330px] items-center justify-between rounded-lg border border-[#dedbd4] bg-white px-3 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">

                <span className="truncate text-left text-[9px] text-[#9b978e]">
                  Ask ICOGON to create a people tool...
                </span>

                <ArrowRight
                  size={11}
                  className="shrink-0 text-[#77736b]"
                />

              </div>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="relative mt-16 overflow-hidden rounded-[9px] border border-[#e0dcd3] bg-[#faf9f5] px-6 py-8 shadow-[0_10px_35px_rgba(0,0,0,0.05)] sm:px-10">

              <div className="grid gap-8 sm:grid-cols-[1.15fr_repeat(4,1fr)]">

                {/* COMPANY */}

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

                {/* COMPANY */}

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

                {/* PRODUCT */}

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
                    <Link to="/solutions/people" className="block">
                      People
                    </Link>
                  </div>

                </div>

                {/* RESOURCES */}

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

                {/* LEGAL */}

                <div>

                  <p className="text-[8px] font-semibold text-[#5b5852]">
                    Legal
                  </p>

                  <div className="mt-3 space-y-2 text-[7px] text-[#918d85]">
                    <span className="block">Privacy</span>
                    <span className="block">Terms</span>
                    <span className="block">Security</span>
                    <span className="block">Cookies</span>
                  </div>

                </div>

              </div>

              <div className="mt-8 flex items-center justify-between border-t border-[#e7e3db] pt-5">

                <span className="text-[7px] text-[#aaa69f]">
                  © {new Date().getFullYear()} ICOGON
                </span>

                <div className="flex items-center gap-2">

                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#ddd9d0] text-[7px] text-[#8e8a82]">
                    X
                  </div>

                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#ddd9d0] text-[7px] text-[#8e8a82]">
                    in
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

export default PeoplePage;