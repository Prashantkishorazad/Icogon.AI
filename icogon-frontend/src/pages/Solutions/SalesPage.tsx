import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  FileText,
  Globe,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const SalesPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Navbar handles the login flow.
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const salesFeatures = [
    {
      title: "Account-specific demos",
      description:
        "Create personalized sales experiences for every account and customer conversation.",
      eyebrow: "Personalized selling",
      icon: Users,
      preview: "demo",
    },
    {
      title: "Revenue command center",
      description:
        "Bring pipeline, revenue, activity, and sales information into one focused workspace.",
      eyebrow: "Sales visibility",
      icon: BarChart3,
      preview: "revenue",
    },
    {
      title: "Customer onboarding",
      description:
        "Build smooth onboarding experiences that help customers move from signed to successful.",
      eyebrow: "Customer experience",
      icon: Globe,
      preview: "onboarding",
    },
    {
      title: "Calculate your return on investment",
      description:
        "Give prospects interactive tools that make the value of your product easier to understand.",
      eyebrow: "Interactive selling",
      icon: FileText,
      preview: "roi",
    },
    {
      title: "Automate deal desk workflows",
      description:
        "Create internal workflows for approvals, pricing, contracts, and repetitive sales operations.",
      eyebrow: "Sales operations",
      icon: Zap,
      preview: "deal",
    },
  ];

  const faqs = [
    "Can I build a sales tool without coding?",
    "Can ICOGON connect to my existing sales tools?",
    "What types of sales workflows can I build?",
    "Can my sales team customize an application after it is created?",
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

        <section className="relative overflow-hidden border-b border-[#e7e4dc] bg-[#faf9f5]">
          {/* Grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(116,151,224,0.32) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(116,151,224,0.22) 1px, transparent 1px)
              `,
              backgroundSize: "36px 36px",
            }}
          />

          {/* Subtle warm vertical lines */}
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute left-[12%] top-0 h-full w-px bg-orange-300" />
            <div className="absolute left-[23%] top-0 h-full w-px bg-pink-300" />
            <div className="absolute left-[36%] top-0 h-full w-px bg-orange-200" />
            <div className="absolute right-[34%] top-0 h-full w-px bg-orange-200" />
            <div className="absolute right-[22%] top-0 h-full w-px bg-pink-300" />
            <div className="absolute right-[11%] top-0 h-full w-px bg-orange-300" />
          </div>

          <div className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-24 text-center sm:pb-24 sm:pt-28 lg:px-10 lg:pt-32">
            <div className="mx-auto max-w-[780px]">
              <h1 className="text-[48px] font-semibold leading-[0.96] tracking-[-0.055em] sm:text-[62px] lg:text-[76px]">
                Close deals faster
              </h1>

              <p className="mx-auto mt-5 max-w-[570px] text-[13px] leading-[1.55] text-[#686760] sm:text-[14px]">
                Create custom sales experiences, workflows,
                and tools with AI. Turn every part of your sales
                process into software that works for your team.
              </p>

              <Link
                to="/builder"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#181818] px-5 py-2.5 text-[11px] font-medium text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-black"
              >
                Start building
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            LOGOS
        ===================================================== */}

        <section className="border-b border-[#ebe8e0] bg-[#fffefa]">
          <div className="mx-auto flex max-w-[1050px] flex-wrap items-center justify-center gap-x-12 gap-y-6 px-6 py-7 opacity-45 sm:justify-between">
            <span className="text-[18px] font-semibold tracking-[-0.04em]">
              workday
            </span>

            <span className="text-[16px] font-bold tracking-[-0.03em]">
              ◈ NVIDIA
            </span>

            <span className="text-[15px] font-semibold">
              HCA<span className="font-normal"> Healthcare</span>
            </span>

            <span className="text-[14px] font-bold tracking-[0.2em]">
              HEARST
            </span>
          </div>
        </section>

        {/* =====================================================
            HOW ICOGON UNLOCKS SALES
        ===================================================== */}

        <section className="bg-[#f5f2eb]">
          <div className="mx-auto max-w-[1000px] px-6 py-20 sm:py-24 lg:px-10 lg:py-28">
            <div className="max-w-[450px]">
              <h2 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] sm:text-[38px]">
                How ICOGON
                <br />
                unlocks sales teams
              </h2>
            </div>

            <div className="mt-10 space-y-4">
              {salesFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group overflow-hidden rounded-[12px] border border-[#e7e3db] bg-[#fffefa] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(30,25,15,0.06)]"
                  >
                    <div className="grid min-h-[150px] md:grid-cols-[1fr_1.08fr]">
                      {/* Text */}

                      <div className="flex flex-col justify-center p-5 sm:p-7">
                        <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.1em] text-[#aaa69d]">
                          <Icon size={12} />
                          {feature.eyebrow}
                        </div>

                        <h3 className="mt-3 text-[15px] font-medium tracking-[-0.02em] text-[#4f4d48] sm:text-[17px]">
                          {feature.title}
                        </h3>

                        <p className="mt-2 max-w-[370px] text-[10px] leading-[1.5] text-[#99958d] sm:text-[11px]">
                          {feature.description}
                        </p>
                      </div>

                      {/* Fake product preview */}

                      <div className="relative min-h-[150px] overflow-hidden border-t border-[#eeeae2] bg-[#f7f5ef] md:border-l md:border-t-0">
                        {/* DEMO */}

                        {feature.preview === "demo" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#eadde8] bg-white shadow-sm">
                            <div className="flex h-full">
                              <div className="w-[15%] border-r border-[#eee] bg-[#f7f4f8] p-2">
                                <div className="h-2 w-8 rounded bg-[#ddd9df]" />

                                <div className="mt-4 space-y-2">
                                  <div className="h-1.5 rounded bg-[#e8e4e8]" />
                                  <div className="h-1.5 rounded bg-[#e8e4e8]" />
                                  <div className="h-1.5 rounded bg-[#e8e4e8]" />
                                </div>
                              </div>

                              <div className="flex-1 p-4">
                                <div className="h-2 w-24 rounded bg-[#dedbe0]" />
                                <div className="mt-3 h-2 w-32 rounded bg-[#eeebef]" />

                                <div className="mt-6 text-center">
                                  <p className="text-[11px] text-[#aaa5aa]">
                                    Financial operations
                                  </p>

                                  <p className="text-[8px] text-[#c0bbc0]">
                                    for growth businesses
                                  </p>
                                </div>

                                <div className="mx-auto mt-4 h-5 w-16 rounded bg-[#f0edf2]" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* REVENUE */}

                        {feature.preview === "revenue" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#ddd9ed] bg-white shadow-sm">
                            <div className="flex h-full">
                              <div className="w-[12%] bg-[#d9d8e8]" />

                              <div className="flex-1 p-3">
                                <div className="flex gap-2">
                                  <div className="h-4 w-20 rounded bg-[#e8e6f2]" />
                                  <div className="h-4 w-12 rounded bg-[#f1eff7]" />
                                </div>

                                <div className="mt-4 grid grid-cols-4 gap-2">
                                  <div className="h-8 rounded bg-[#f2f1f7]" />
                                  <div className="h-8 rounded bg-[#f2f1f7]" />
                                  <div className="h-8 rounded bg-[#f2f1f7]" />
                                  <div className="h-8 rounded bg-[#f2f1f7]" />
                                </div>

                                <div className="mt-4 grid h-14 grid-cols-7 items-end gap-1">
                                  <div className="h-[30%] rounded-sm bg-[#c9c5df]" />
                                  <div className="h-[55%] rounded-sm bg-[#bbb6dc]" />
                                  <div className="h-[42%] rounded-sm bg-[#d3d0e5]" />
                                  <div className="h-[75%] rounded-sm bg-[#aaa5d4]" />
                                  <div className="h-[50%] rounded-sm bg-[#c4c0df]" />
                                  <div className="h-[85%] rounded-sm bg-[#9f99cf]" />
                                  <div className="h-[65%] rounded-sm bg-[#b6b1da]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ONBOARDING */}

                        {feature.preview === "onboarding" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#e1dff1] bg-white shadow-sm">
                            <div className="flex h-full">
                              <div className="w-[18%] bg-[#d8d5e5] p-2">
                                <div className="h-2 w-8 rounded bg-white/70" />

                                <div className="mt-4 space-y-2">
                                  <div className="h-1.5 rounded bg-white/60" />
                                  <div className="h-1.5 rounded bg-white/60" />
                                  <div className="h-1.5 rounded bg-white/60" />
                                </div>
                              </div>

                              <div className="flex-1 p-4">
                                <div className="h-2 w-28 rounded bg-[#dedbe5]" />

                                <div className="mt-5 flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-[#eeeaf5]" />

                                  <div>
                                    <div className="h-2 w-24 rounded bg-[#ddd9e5]" />
                                    <div className="mt-1.5 h-1.5 w-16 rounded bg-[#eeeaf1]" />
                                  </div>
                                </div>

                                <div className="mt-5 h-6 rounded bg-[#f1eff6]" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ROI */}

                        {feature.preview === "roi" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#dfddf0] bg-white shadow-sm">
                            <div className="p-5 text-center">
                              <div className="mx-auto h-2 w-32 rounded bg-[#ddd9eb]" />

                              <div className="mx-auto mt-3 h-1.5 w-44 rounded bg-[#eeeaf3]" />

                              <div className="mt-6 grid grid-cols-3 gap-3">
                                <div>
                                  <div className="mx-auto h-7 w-14 rounded bg-[#eef1f0]" />
                                  <div className="mx-auto mt-2 h-1.5 w-10 rounded bg-[#e7e5eb]" />
                                </div>

                                <div>
                                  <div className="mx-auto h-7 w-14 rounded bg-[#e8f1ed]" />
                                  <div className="mx-auto mt-2 h-1.5 w-10 rounded bg-[#e7e5eb]" />
                                </div>

                                <div>
                                  <div className="mx-auto h-7 w-14 rounded bg-[#eeeafa]" />
                                  <div className="mx-auto mt-2 h-1.5 w-10 rounded bg-[#e7e5eb]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* DEAL DESK */}

                        {feature.preview === "deal" && (
                          <div className="absolute inset-4 overflow-hidden rounded-md border border-[#dedbed] bg-white shadow-sm">
                            <div className="p-4">
                              <div className="flex justify-between">
                                <div className="h-2 w-24 rounded bg-[#ddd9e5]" />
                                <div className="h-4 w-12 rounded bg-[#eeeaf3]" />
                              </div>

                              <div className="mt-5 grid grid-cols-3 gap-2">
                                <div className="h-9 rounded bg-[#f0eef4]" />
                                <div className="h-9 rounded bg-[#f5f3f7]" />
                                <div className="h-9 rounded bg-[#ebe8f1]" />
                              </div>

                              <div className="mt-4 space-y-2">
                                <div className="h-2 rounded bg-[#f0edf3]" />
                                <div className="h-2 w-[80%] rounded bg-[#f0edf3]" />
                                <div className="h-2 w-[65%] rounded bg-[#f0edf3]" />
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
            ACCELERATE SALES
        ===================================================== */}

        <section className="bg-[#fffefa]">
          <div className="mx-auto max-w-[1000px] px-6 py-24 sm:py-28 lg:px-10">
            <div className="max-w-[500px]">
              <h2 className="text-[30px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[38px]">
                Accelerate sales cycle
                <br />
                and drive revenue
              </h2>

              <p className="mt-4 text-[11px] leading-[1.6] text-[#85827b]">
                Build software around your sales process and give
                your team the tools they need to move faster.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[12px] border border-[#e6e2d9] bg-[#f5f2eb]">
              <div className="grid min-h-[260px] md:grid-cols-[1.15fr_1fr]">
                {/* Builder preview */}

                <div className="flex items-center justify-center p-5">
                  <div className="w-full max-w-[410px] overflow-hidden rounded-lg border border-[#d9d5cc] bg-[#191a1c] shadow-xl">
                    <div className="flex h-7 items-center gap-1.5 border-b border-white/10 px-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    </div>

                    <div className="grid grid-cols-[35%_65%]">
                      <div className="min-h-[175px] border-r border-white/10 p-4">
                        <div className="h-2 w-20 rounded bg-white/20" />

                        <div className="mt-5 space-y-2">
                          <div className="h-1.5 rounded bg-white/10" />
                          <div className="h-1.5 rounded bg-white/10" />
                          <div className="h-1.5 w-[70%] rounded bg-white/10" />
                        </div>
                      </div>

                      <div className="bg-[#faf9f5] p-5">
                        <div className="text-[12px] font-medium">
                          Make everyone a builder
                        </div>

                        <div className="mt-4 h-2 w-28 rounded bg-[#dedbd4]" />
                        <div className="mt-2 h-2 w-40 rounded bg-[#ebe8e1]" />

                        <div className="mt-7 grid grid-cols-2 gap-2">
                          <div className="h-9 rounded bg-[#f0eee8]" />
                          <div className="h-9 rounded bg-[#f0eee8]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text */}

                <div className="flex flex-col justify-center border-t border-[#e5e1d8] p-7 md:border-l md:border-t-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#aaa69d]">
                    Speed
                  </p>

                  <h3 className="mt-3 text-[17px] font-medium tracking-[-0.02em] text-[#4e4c47]">
                    Give your team more time to sell.
                  </h3>

                  <p className="mt-3 text-[10px] leading-[1.55] text-[#918e87]">
                    Replace repetitive manual work with
                    custom workflows and applications built
                    around the way your sales organization works.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CONNECTORS
        ===================================================== */}

        <section className="border-t border-[#ebe7df] bg-[#fffefa]">
          <div className="mx-auto max-w-[1000px] px-6 py-20 sm:py-24 lg:px-10">
            <div className="text-center">
              <h2 className="text-[22px] font-semibold tracking-[-0.035em] sm:text-[27px]">
                Connect to your favorite tools
              </h2>

              <p className="mt-3 text-[10px] text-[#97938b]">
                Plug ICOGON into your sales workflow.
              </p>
            </div>

            <div className="mt-9 overflow-hidden rounded-[12px] border border-[#e5e1d8] bg-[#f5f2eb]">
              <div className="grid min-h-[190px] md:grid-cols-[1fr_1.05fr]">
                <div className="flex items-center justify-center p-5">
                  <div className="relative h-[150px] w-full max-w-[300px] overflow-hidden rounded-lg border border-[#29364c] bg-[#111a29]">
                    <div className="absolute inset-x-0 bottom-0 h-[80px] bg-gradient-to-t from-[#223a6d] to-transparent" />

                    <div className="relative flex h-full items-center justify-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[12px] font-bold">
                        A
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[12px] font-bold">
                        S
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[12px] font-bold">
                        ▣
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[12px] font-bold">
                        ∞
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-0 right-0 text-center text-[8px] text-white/60">
                      50+ connectors
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center border-t border-[#e4e0d7] p-7 md:border-l md:border-t-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#aaa69d]">
                    For sales
                  </p>

                  <h3 className="mt-3 text-[16px] font-medium text-[#53504a]">
                    Bring your existing workflow with you.
                  </h3>

                  <p className="mt-3 text-[10px] leading-[1.55] text-[#918e87]">
                    Connect the systems your sales team already
                    relies on and build experiences around them.
                  </p>

                  <Link
                    to="/connectors"
                    className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#222]"
                  >
                    Explore connectors
                    <ArrowRight size={12} />
                  </Link>
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
              <div className="mx-auto flex h-8 w-8 items-center justify-center text-[#858179]">
                <Sparkles size={14} />
              </div>

              <h2 className="mt-4 text-[27px] font-semibold tracking-[-0.04em]">
                Still have questions?
              </h2>

              <p className="mt-3 text-[10px] text-[#99958c]">
                Can't find what you're looking for?
              </p>
            </div>

            <div className="mt-10 divide-y divide-[#dfdbd2] border-y border-[#dfdbd2]">
              {faqs.map((faq) => (
                <div
                  key={faq}
                  className="flex items-center justify-between py-5"
                >
                  <span className="text-[12px] text-[#5f5c55]">
                    {faq}
                  </span>

                  <ChevronDown
                    size={14}
                    className="shrink-0 text-[#9c988f]"
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
          {/* Gradient background */}

          <div className="absolute inset-x-0 bottom-0 h-[330px] bg-[radial-gradient(ellipse_at_center_bottom,_#ff1b4f_0%,_#ff376b_22%,_#e6a6ff_48%,_#9bc7ff_72%,_transparent_100%)] opacity-95" />

          <div className="relative mx-auto max-w-[1100px] px-6 pb-10 pt-24 sm:pb-16 sm:pt-28">
            <div className="text-center">
              <h2 className="text-[24px] font-semibold tracking-[-0.04em] sm:text-[28px]">
                Ready to bring your idea to life?
              </h2>

              <div className="mx-auto mt-5 flex max-w-[340px] items-center justify-between rounded-lg border border-[#dedbd4] bg-white px-3 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <span className="truncate text-left text-[9px] text-[#9b978e]">
                  Ask ICOGON to create a sales tool
                </span>

                <ArrowRight
                  size={12}
                  className="shrink-0 text-[#77736b]"
                />
              </div>
            </div>

            {/* Footer */}

            <footer className="relative mt-16 overflow-hidden rounded-[10px] border border-[#e2ded5] bg-[#faf9f5] px-6 py-8 shadow-[0_10px_35px_rgba(0,0,0,0.05)] sm:px-10">
              <div className="grid gap-8 sm:grid-cols-[1.2fr_repeat(4,1fr)]">
                {/* Brand */}

                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ff496b] text-[8px] font-bold text-white">
                      I
                    </div>

                    <span className="text-[12px] font-semibold">
                      ICOGON
                    </span>
                  </div>

                  <p className="mt-4 max-w-[170px] text-[9px] leading-[1.5] text-[#99958d]">
                    Build software that moves your business forward.
                  </p>
                </div>

                {/* Product */}

                <div>
                  <p className="text-[9px] font-semibold text-[#5b5852]">
                    Product
                  </p>

                  <div className="mt-3 space-y-2 text-[8px] text-[#918d85]">
                    <Link
                      to="/builder"
                      className="block hover:text-black"
                    >
                      AI Builder
                    </Link>

                    <Link
                      to="/templates"
                      className="block hover:text-black"
                    >
                      Templates
                    </Link>

                    <Link
                      to="/connectors"
                      className="block hover:text-black"
                    >
                      Connectors
                    </Link>

                    <Link
                      to="/academy"
                      className="block hover:text-black"
                    >
                      Academy
                    </Link>
                  </div>
                </div>

                {/* Solutions */}

                <div>
                  <p className="text-[9px] font-semibold text-[#5b5852]">
                    Solutions
                  </p>

                  <div className="mt-3 space-y-2 text-[8px] text-[#918d85]">
                    <Link
                      to="/solutions/founders"
                      className="block hover:text-black"
                    >
                      Founders
                    </Link>

                    <Link
                      to="/solutions/product-managers"
                      className="block hover:text-black"
                    >
                      Product
                    </Link>

                    <Link
                      to="/solutions/designers"
                      className="block hover:text-black"
                    >
                      Designers
                    </Link>

                    <Link
                      to="/solutions/marketers"
                      className="block hover:text-black"
                    >
                      Marketers
                    </Link>
                  </div>
                </div>

                {/* Resources */}

                <div>
                  <p className="text-[9px] font-semibold text-[#5b5852]">
                    Resources
                  </p>

                  <div className="mt-3 space-y-2 text-[8px] text-[#918d85]">
                    <Link
                      to="/blog"
                      className="block hover:text-black"
                    >
                      Blog
                    </Link>

                    <Link
                      to="/guides"
                      className="block hover:text-black"
                    >
                      Guides
                    </Link>

                    <Link
                      to="/docs"
                      className="block hover:text-black"
                    >
                      Docs
                    </Link>

                    <Link
                      to="/partners"
                      className="block hover:text-black"
                    >
                      Partners
                    </Link>
                  </div>
                </div>

                {/* Company */}

                <div>
                  <p className="text-[9px] font-semibold text-[#5b5852]">
                    Company
                  </p>

                  <div className="mt-3 space-y-2 text-[8px] text-[#918d85]">
                    <a
                      href="mailto:info@icogon.com"
                      className="block hover:text-black"
                    >
                      Contact
                    </a>

                    <Link
                      to="/login"
                      className="block hover:text-black"
                    >
                      Login
                    </Link>

                    <Link
                      to="/signup"
                      className="block hover:text-black"
                    >
                      Get started
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer bottom */}

              <div className="mt-8 flex items-center justify-between border-t border-[#e8e4dc] pt-5">
                <span className="text-[8px] text-[#aaa69f]">
                  © {new Date().getFullYear()} ICOGON
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#ddd9d0] text-[8px] text-[#8e8a82]">
                    X
                  </div>

                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#ddd9d0] text-[8px] text-[#8e8a82]">
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

export default SalesPage;