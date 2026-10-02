import {
  ArrowRight,
  Check,
  ChevronDown,
  Globe2,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";
import { useTheme } from "../../context/ThemeContext";

interface PricingPlan {
  name: string;
  description: string;
  price: number | null;
  custom?: boolean;
  popular?: boolean;
  features: string[];
  button: string;
}

const PricingPage = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const [billing, setBilling] =
    useState<"monthly" | "yearly">("monthly");

  const [usdInr, setUsdInr] =
    useState<number>(95.9);

  const [rateLoading, setRateLoading] =
    useState(true);

  const [openFaq, setOpenFaq] =
    useState<number | null>(0);

  const FALLBACK_USD_INR = 95.9;

  /* ==========================================================
     LIVE USD → INR
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadExchangeRate = async () => {
      try {
        setRateLoading(true);

        const response = await fetch(
          "https://api.frankfurter.app/latest?from=USD&to=INR",
        );

        if (!response.ok) {
          throw new Error(
            "Exchange rate request failed",
          );
        }

        const data = await response.json();

        const rate = Number(
          data?.rates?.INR,
        );

        if (
          mounted &&
          Number.isFinite(rate) &&
          rate > 0
        ) {
          setUsdInr(rate);
        }
      } catch {
        if (mounted) {
          setUsdInr(FALLBACK_USD_INR);
        }
      } finally {
        if (mounted) {
          setRateLoading(false);
        }
      }
    };

    void loadExchangeRate();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     CURRENCY HELPERS
  ========================================================== */

  const convertToINR = (usd: number) =>
    usd * usdInr;

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatUSD = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(amount);

  /* ==========================================================
     PRICING PLANS
  ========================================================== */

  const plans: PricingPlan[] = useMemo(
    () => [
      {
        name: "Free",
        description:
          "Explore what you can build with ICOGON and start creating for free.",
        price: 0,
        features: [
          "Personal projects",
          "AI building credits",
          "Community support",
          "Responsive websites",
          "Basic templates",
          "Preview and iteration",
          "Starter integrations",
        ],
        button: "Get started",
      },
      {
        name: "Pro",
        description:
          "For builders creating products, websites and applications every day.",
        price:
          billing === "monthly" ? 25 : 20,
        popular: true,
        features: [
          "Everything in Free",
          "More AI building credits",
          "Unlimited personal projects",
          "Advanced templates",
          "Custom domains",
          "Advanced integrations",
          "Priority generation",
          "Private projects",
          "Project history",
          "Premium support",
        ],
        button: "Start building",
      },
      {
        name: "Business",
        description:
          "Advanced tools for growing teams building products together.",
        price:
          billing === "monthly" ? 50 : 40,
        features: [
          "Everything in Pro",
          "Team workspace",
          "Shared projects",
          "Role-based access",
          "Team collaboration",
          "Advanced AI workflows",
          "Internal tools",
          "Business dashboards",
          "Priority support",
          "Team management",
        ],
        button: "Get started",
      },
      {
        name: "Enterprise",
        description:
          "Built for organizations with advanced requirements and workflows.",
        price: null,
        custom: true,
        features: [
          "Everything in Business",
          "Enterprise workflows",
          "Advanced governance",
          "Security controls",
          "Custom deployment options",
          "Dedicated support",
          "Advanced integrations",
          "Organization controls",
          "Custom requirements",
          "Enterprise collaboration",
        ],
        button: "Contact sales",
      },
    ],
    [billing],
  );

  /* ==========================================================
     FAQ
  ========================================================== */

  const faqs = [
    {
      question:
        "What is included in the Free plan?",
      answer:
        "The Free plan lets you explore ICOGON and start building personal projects with AI-assisted workflows and starter features.",
    },
    {
      question:
        "What are AI building credits?",
      answer:
        "AI building credits are used for AI-assisted generation and development actions. The exact usage can depend on the type of operation you perform.",
    },
    {
      question:
        "Can I change my plan later?",
      answer:
        "Yes. You can move between plans as your needs change. Your available options may depend on the billing configuration of your account.",
    },
    {
      question:
        "What is the difference between Pro and Business?",
      answer:
        "Pro is designed around individual builders and product creation. Business adds team-oriented capabilities such as shared workspaces, collaboration and organization workflows.",
    },
    {
      question:
        "Does ICOGON support teams?",
      answer:
        "Yes. Business and Enterprise experiences are designed for teams working together on applications, websites, workflows and AI-powered products.",
    },
    {
      question:
        "Is the INR price fixed?",
      answer:
        "No. INR values shown on this page are conversions of the USD list price using the current exchange rate available to the page. Your actual payment provider may apply its own exchange rate, taxes or fees.",
    },
    {
      question:
        "Can I build websites and applications with ICOGON?",
      answer:
        "Yes. ICOGON is designed for building websites, applications, internal tools, dashboards and AI-powered digital experiences.",
    },
    {
      question:
        "How does Enterprise pricing work?",
      answer:
        "Enterprise pricing is customized according to organizational requirements, usage, deployment needs and support requirements.",
    },
  ];

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const handleSignup = () => {
    navigate("/signup");
  };

  const startBuilding = () => {
    navigate("/builder");
  };

  const handlePlan = (
    plan: PricingPlan,
  ) => {
    if (plan.custom) {
      window.location.href =
        "mailto:info@icogon.com?subject=ICOGON%20Enterprise%20Pricing";

      return;
    }

    navigate("/signup");
  };

  /* ==========================================================
     THEME CLASSES
  ========================================================== */

  const pageBg = isDark
    ? "bg-[#0b0d10] text-white"
    : "bg-[#fbfaf5] text-[#17213d]";

  const sectionBg = isDark
    ? "bg-[#0b0d10]"
    : "bg-[#fbfaf5]";

  const heroBg = isDark
    ? "bg-[#0d1117]"
    : "bg-[#f4f8ff]";

  const cardBg = isDark
    ? "bg-[#111418]"
    : "bg-white";

  const border = isDark
    ? "border-white/[0.08]"
    : "border-[#dfe6ef]";

  const heading = isDark
    ? "text-white"
    : "text-[#17213d]";

  const text = isDark
    ? "text-zinc-400"
    : "text-[#68768d]";

  const muted = isDark
    ? "text-zinc-500"
    : "text-[#7b8799]";

  return (
    <div
      className={`min-h-screen overflow-x-hidden font-sans ${pageBg}`}
    >
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <Navbar />

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className={`relative overflow-hidden ${heroBg}`}
      >
        {/* Main glow */}

        <div
          className={`pointer-events-none absolute left-1/2 top-[100px] h-[430px] w-[850px] -translate-x-1/2 rounded-full blur-[100px] ${
            isDark
              ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
              : "bg-gradient-to-r from-[#c6e2ff] via-[#ded6ff] to-[#ffd9ed] opacity-80"
          }`}
        />

        {/* Left glow */}

        <div
          className={`pointer-events-none absolute left-[-130px] top-[280px] h-[320px] w-[320px] rounded-full blur-[90px] ${
            isDark
              ? "bg-blue-500/[0.06]"
              : "bg-[#8bc9ff]/35"
          }`}
        />

        {/* Right glow */}

        <div
          className={`pointer-events-none absolute right-[-130px] top-[300px] h-[320px] w-[320px] rounded-full blur-[90px] ${
            isDark
              ? "bg-purple-500/[0.06]"
              : "bg-[#c2afff]/30"
          }`}
        />

        <div className="relative mx-auto max-w-[1200px] px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-10 lg:pb-20 lg:pt-20">
          {/* HERO CONTENT */}

          <div className="mx-auto max-w-[760px] text-center">
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur ${
                isDark
                  ? "border-white/[0.08] bg-white/[0.04]"
                  : "border-[#dce5f1] bg-white/80 shadow-sm"
              }`}
            >
              <Sparkles
                size={13}
                strokeWidth={1.8}
                className={
                  isDark
                    ? "text-blue-400"
                    : "text-[#6584ad]"
                }
              />

              <span
                className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${
                  isDark
                    ? "text-zinc-400"
                    : "text-[#64748b]"
                }`}
              >
                ICOGON Pricing
              </span>
            </div>

            <h1
              className={`text-[43px] font-semibold leading-[0.94] tracking-[-0.065em] sm:text-[62px] lg:text-[70px] ${heading}`}
            >
              Build more.
              <br />
              Pay simply.
            </h1>

            <p
              className={`mx-auto mt-5 max-w-[550px] text-[12px] leading-5 sm:text-[13px] sm:leading-6 ${text}`}
            >
              Start building for free. Upgrade
              when your projects, team and
              workflows need more power.
            </p>
          </div>

          {/* ==================================================
              BILLING + FX
          ================================================== */}

          <div className="relative mx-auto mt-9 flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
            {/* LIVE USD INR */}

            <div
              className={`flex items-center gap-3 rounded-full border px-3 py-2 backdrop-blur ${
                isDark
                  ? "border-white/[0.08] bg-white/[0.04]"
                  : "border-[#d9e2ee] bg-white/90 shadow-sm"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  isDark
                    ? "bg-blue-500/10"
                    : "bg-[#eef5ff]"
                }`}
              >
                <Globe2
                  size={13}
                  strokeWidth={1.8}
                  className={
                    isDark
                      ? "text-blue-400"
                      : "text-[#6583aa]"
                  }
                />
              </div>

              <div className="text-left">
                <div
                  className={`text-[8px] font-semibold uppercase tracking-[0.08em] ${
                    isDark
                      ? "text-zinc-600"
                      : "text-[#94a3b8]"
                  }`}
                >
                  Live currency
                </div>

                <div
                  className={`mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold ${
                    isDark
                      ? "text-zinc-300"
                      : "text-[#42536f]"
                  }`}
                >
                  <span>1 USD</span>

                  <span
                    className={
                      isDark
                        ? "text-zinc-700"
                        : "text-[#a0aaba]"
                    }
                  >
                    ≈
                  </span>

                  {rateLoading ? (
                    <span className={muted}>
                      Updating...
                    </span>
                  ) : (
                    <span>
                      ₹{usdInr.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <RefreshCw
                size={11}
                strokeWidth={1.8}
                className={`${
                  isDark
                    ? "text-zinc-600"
                    : "text-[#9aa7b9]"
                } ${
                  rateLoading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </div>

            {/* BILLING */}

            <div
              className={`inline-flex items-center rounded-full border p-1 ${
                isDark
                  ? "border-white/[0.08] bg-white/[0.04]"
                  : "border-[#d9e2ee] bg-white shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setBilling("monthly")
                }
                className={`rounded-full px-4 py-1.5 text-[9px] font-medium transition ${
                  billing === "monthly"
                    ? isDark
                      ? "bg-white text-black shadow-sm"
                      : "bg-[#17213d] text-white shadow-sm"
                    : isDark
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-[#718096] hover:text-[#42536f]"
                }`}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() =>
                  setBilling("yearly")
                }
                className={`rounded-full px-4 py-1.5 text-[9px] font-medium transition ${
                  billing === "yearly"
                    ? isDark
                      ? "bg-white text-black shadow-sm"
                      : "bg-[#17213d] text-white shadow-sm"
                    : isDark
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-[#718096] hover:text-[#42536f]"
                }`}
              >
                Yearly
              </button>

              <span
                className={`mr-1 rounded-full px-2 py-1 text-[8px] font-semibold ${
                  isDark
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-[#eef5ff] text-[#6684aa]"
                }`}
              >
                Save 20%
              </span>
            </div>
          </div>

          {/* ==================================================
              PRICING GRID
          ================================================== */}

          <div className="relative mx-auto mt-7 grid max-w-[1120px] gap-3 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col overflow-hidden rounded-xl border ${
                  plan.popular
                    ? isDark
                      ? "border-blue-400/30 shadow-[0_20px_55px_rgba(0,0,0,0.25)]"
                      : "border-[#a9c7eb] shadow-[0_20px_55px_rgba(75,110,160,0.14)]"
                    : isDark
                      ? "border-white/[0.08]"
                      : "border-[#dce4ed] shadow-[0_12px_35px_rgba(50,70,100,0.05)]"
                } ${cardBg}`}
              >
                {/* POPULAR */}

                {plan.popular && (
                  <div
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] ${
                      isDark
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-[#edf5ff] text-[#55759e]"
                    }`}
                  >
                    Most popular
                  </div>
                )}

                {/* PLAN TOP */}

                <div className="min-h-[280px] p-5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        plan.popular
                          ? isDark
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-[#eaf3ff] text-[#6385ae]"
                          : isDark
                            ? "bg-white/[0.04] text-zinc-500"
                            : "bg-[#f5f7fa] text-[#718096]"
                      }`}
                    >
                      {plan.name ===
                      "Enterprise" ? (
                        <ShieldCheck
                          size={13}
                          strokeWidth={1.8}
                        />
                      ) : plan.name ===
                        "Business" ? (
                        <Users
                          size={13}
                          strokeWidth={1.8}
                        />
                      ) : plan.name ===
                        "Pro" ? (
                        <Zap
                          size={13}
                          strokeWidth={1.8}
                        />
                      ) : (
                        <Sparkles
                          size={13}
                          strokeWidth={1.8}
                        />
                      )}
                    </div>

                    <h2
                      className={`text-[13px] font-semibold ${
                        isDark
                          ? "text-zinc-200"
                          : "text-[#26344d]"
                      }`}
                    >
                      {plan.name}
                    </h2>
                  </div>

                  <p
                    className={`mt-4 min-h-[38px] text-[9px] leading-4 ${muted}`}
                  >
                    {plan.description}
                  </p>

                  {/* PRICE */}

                  <div className="mt-5">
                    {plan.custom ? (
                      <>
                        <div
                          className={`text-[25px] font-semibold tracking-[-0.04em] ${heading}`}
                        >
                          Custom
                        </div>

                        <div
                          className={`mt-1 text-[8px] ${muted}`}
                        >
                          Talk to our team
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-end gap-2">
                          <div
                            className={`text-[32px] font-semibold leading-none tracking-[-0.05em] ${heading}`}
                          >
                            $
                            {formatUSD(
                              plan.price ?? 0,
                            )}
                          </div>

                          {plan.price !==
                            0 && (
                            <span
                              className={`mb-0.5 text-[8px] ${muted}`}
                            >
                              / month
                            </span>
                          )}
                        </div>

                        <div
                          className={`mt-2 inline-flex items-center rounded-md px-2 py-1 ${
                            isDark
                              ? "bg-blue-500/[0.07]"
                              : "bg-[#f2f7ff]"
                          }`}
                        >
                          <span
                            className={`text-[9px] font-semibold ${
                              isDark
                                ? "text-blue-400"
                                : "text-[#5e789d]"
                            }`}
                          >
                            ≈{" "}
                            {formatINR(
                              convertToINR(
                                plan.price ??
                                  0,
                              ),
                            )}
                          </span>

                          <span
                            className={`ml-1 text-[7px] ${muted}`}
                          >
                            INR
                          </span>
                        </div>

                        {billing ===
                          "yearly" &&
                          plan.price !==
                            0 && (
                            <div
                              className={`mt-2 text-[8px] ${muted}`}
                            >
                              billed yearly
                            </div>
                          )}
                      </>
                    )}
                  </div>

                  {/* BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      handlePlan(plan)
                    }
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-[9px] font-medium transition ${
                      plan.popular
                        ? isDark
                          ? "border-white bg-white text-black hover:bg-zinc-200"
                          : "border-[#17213d] bg-[#17213d] text-white hover:bg-[#0f172a]"
                        : isDark
                          ? "border-white/[0.09] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                          : "border-[#d7e0eb] bg-white text-[#465671] hover:bg-[#f8fafc]"
                    }`}
                  >
                    {plan.button}

                    <ArrowRight
                      size={11}
                      strokeWidth={1.8}
                    />
                  </button>
                </div>

                {/* FEATURES */}

                <div
                  className={`flex-1 border-t px-5 py-4 ${
                    isDark
                      ? "border-white/[0.07] bg-white/[0.015]"
                      : "border-[#e7ecf2] bg-[#fbfcfd]"
                  }`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        isDark
                          ? "bg-white/[0.04]"
                          : "bg-white"
                      }`}
                    >
                      <Check
                        size={10}
                        strokeWidth={2}
                        className={
                          isDark
                            ? "text-zinc-500"
                            : "text-[#7188a8]"
                        }
                      />
                    </div>

                    <span
                      className={`text-[8px] font-semibold uppercase tracking-[0.08em] ${muted}`}
                    >
                      Included
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {plan.features.map(
                      (feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2"
                        >
                          <Check
                            size={10}
                            strokeWidth={2}
                            className={`mt-[2px] shrink-0 ${
                              isDark
                                ? "text-zinc-500"
                                : "text-[#728baa]"
                            }`}
                          />

                          <span
                            className={`text-[8.5px] leading-4 ${
                              isDark
                                ? "text-zinc-500"
                                : "text-[#66748a]"
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* RATE NOTE */}

          <div
            className={`mx-auto mt-4 flex max-w-[1120px] flex-col gap-1 text-[8px] sm:flex-row sm:items-center sm:justify-between ${muted}`}
          >
            <span>
              INR amounts are indicative
              conversions of the USD list price.
            </span>

            <span>
              1 USD ≈ ₹{usdInr.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================
          SPECIAL PLANS
      ====================================================== */}

      <section className={sectionBg}>
        <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-10">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: "ICOGON for students",
                description:
                  "Build projects, learn AI-assisted development and experiment with new ideas.",
                button: "Get started",
                action: handleSignup,
              },
              {
                icon: Users,
                title: "ICOGON for teams",
                description:
                  "Collaborate on applications, workflows and product ideas in one shared environment.",
                button: "Explore teams",
                action: () =>
                  navigate("/enterprise"),
              },
              {
                icon: ShieldCheck,
                title: "Enterprise",
                description:
                  "Advanced workflows, governance and organization-focused capabilities.",
                button: "Explore enterprise",
                action: () =>
                  navigate("/enterprise"),
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`rounded-xl border p-5 ${cardBg} ${border}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isDark
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-[#eef5ff] text-[#6685aa]"
                    }`}
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.8}
                    />
                  </div>

                  <h3
                    className={`mt-5 text-[12px] font-semibold ${
                      isDark
                        ? "text-zinc-200"
                        : "text-[#334155]"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`mt-2 text-[9px] leading-4 ${muted}`}
                  >
                    {item.description}
                  </p>

                  <button
                    type="button"
                    onClick={item.action}
                    className={`mt-5 flex w-full items-center justify-center gap-1 rounded-md border py-2 text-[8px] font-medium transition ${
                      isDark
                        ? "border-white/[0.08] text-zinc-400 hover:bg-white/[0.04]"
                        : "border-[#d9e2ed] text-[#596b86] hover:bg-[#f8fafc]"
                    }`}
                  >
                    {item.button}

                    <ArrowRight size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          SECURITY
      ====================================================== */}

      <section className={sectionBg}>
        <div className="mx-auto max-w-[1120px] px-4 pb-10 sm:px-6 lg:px-10">
          <div
            className={`rounded-xl border px-5 py-6 shadow-sm sm:px-6 ${
              cardBg
            } ${border}`}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isDark
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-[#eef5ff] text-[#6583aa]"
                  }`}
                >
                  <ShieldCheck
                    size={16}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h3
                    className={`text-[12px] font-semibold ${
                      isDark
                        ? "text-zinc-200"
                        : "text-[#334155]"
                    }`}
                  >
                    Security & enterprise
                    readiness
                  </h3>

                  <p
                    className={`mt-1.5 max-w-[540px] text-[9px] leading-4 ${muted}`}
                  >
                    Explore ICOGON&apos;s security
                    approach and enterprise
                    capabilities for organizations
                    with advanced requirements.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/security")
                }
                className={`inline-flex w-fit items-center gap-2 rounded-md border px-4 py-2 text-[8px] font-medium transition ${
                  isDark
                    ? "border-white/[0.08] text-zinc-400 hover:bg-white/[0.04]"
                    : "border-[#d8e1ec] text-[#596b86] hover:bg-[#f8fafc]"
                }`}
              >
                Learn more
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FAQ
      ====================================================== */}

      <section className={sectionBg}>
        <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-[600px] text-center">
            <p
              className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${muted}`}
            >
              FAQ
            </p>

            <h2
              className={`mt-4 text-[34px] font-semibold leading-[1] tracking-[-0.055em] sm:text-[43px] ${heading}`}
            >
              Frequently asked
              <br />
              questions
            </h2>
          </div>

          <div
            className={`mt-12 divide-y border-y ${
              isDark
                ? "divide-white/[0.07] border-white/[0.07]"
                : "divide-[#dfe6ee] border-[#dfe6ee]"
            }`}
          >
            {faqs.map(
              (faq, index) => {
                const isOpen =
                  openFaq === index;

                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(
                          isOpen
                            ? null
                            : index,
                        )
                      }
                      className="flex w-full items-center justify-between gap-5 py-5 text-left"
                    >
                      <span
                        className={`text-[11px] font-medium ${
                          isDark
                            ? "text-zinc-300"
                            : "text-[#334155]"
                        }`}
                      >
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={14}
                        strokeWidth={1.8}
                        className={`shrink-0 transition-transform ${
                          isDark
                            ? "text-zinc-600"
                            : "text-[#94a3b8]"
                        } ${
                          isOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-5 pr-8">
                        <p
                          className={`max-w-[700px] text-[10px] leading-5 ${muted}`}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>

          {/* RELATED */}

          <div className="mt-8">
            <p
              className={`text-[9px] font-semibold ${
                isDark
                  ? "text-zinc-400"
                  : "text-[#52627c]"
              }`}
            >
              Related resources
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["Guides", "/guides"],
                ["Documentation", "/docs"],
                ["Enterprise", "/enterprise"],
              ].map(([label, path]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    navigate(path)
                  }
                  className={`rounded-md border px-3 py-2 text-[8px] transition ${
                    isDark
                      ? "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:bg-white/[0.04]"
                      : "border-[#dce4ee] bg-white text-[#687891] hover:bg-[#f8fafc]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section
        className={`relative overflow-hidden ${
          isDark
            ? "bg-[#0d1117]"
            : "bg-[#f4f8ff]"
        }`}
      >
        <div
          className={`pointer-events-none absolute bottom-[-170px] left-1/2 h-[310px] w-[850px] -translate-x-1/2 rounded-full blur-[80px] ${
            isDark
              ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
              : "bg-gradient-to-r from-[#88c9ff] via-[#d3c4ff] to-[#ffb7dc] opacity-80"
          }`}
        />

        <div className="relative mx-auto max-w-[850px] px-4 py-20 text-center sm:px-6 lg:py-32">
          <div
            className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${
              isDark
                ? "bg-white/[0.06]"
                : "bg-white shadow-sm"
            }`}
          >
            <Sparkles
              size={15}
              strokeWidth={1.8}
              className={
                isDark
                  ? "text-blue-400"
                  : "text-[#6582a8]"
              }
            />
          </div>

          <h2
            className={`mt-7 text-[37px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[50px] ${heading}`}
          >
            Ready to bring
            <br />
            your idea to life?
          </h2>

          <p
            className={`mx-auto mt-5 max-w-[450px] text-[11px] leading-5 ${text}`}
          >
            Start for free and build your next
            website, application or AI-powered
            product with ICOGON.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleSignup}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-[10px] font-medium shadow-sm transition ${
                isDark
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "bg-[#17213d] text-white hover:bg-[#0f172a]"
              }`}
            >
              Get started
              <ArrowRight size={12} />
            </button>

            <button
              type="button"
              onClick={startBuilding}
              className={`inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-[10px] font-medium transition ${
                isDark
                  ? "border-white/[0.09] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                  : "border-[#d5dfed] bg-white text-[#52627e] hover:bg-[#f8fafc]"
              }`}
            >
              Start building
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer
        className={`relative overflow-hidden border-t ${
          isDark
            ? "border-white/[0.07] bg-[#0b0d10]"
            : "border-[#dfe6ef] bg-[#fbfaf5]"
        }`}
      >
        <div
          className={`pointer-events-none absolute bottom-[-160px] left-1/2 h-[290px] w-[820px] -translate-x-1/2 rounded-full blur-[80px] ${
            isDark
              ? "bg-purple-500/[0.06]"
              : "bg-gradient-to-r from-[#8ac9ff] via-[#d3c4ff] to-[#ffb7dc] opacity-60"
          }`}
        />

        <div className="relative mx-auto max-w-[1180px] px-4 py-12 sm:px-6 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {/* BRAND */}

            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md ${
                    isDark
                      ? "bg-white text-black"
                      : "bg-[#17213d] text-white"
                  }`}
                >
                  <Sparkles size={13} />
                </div>

                <span
                  className={`text-[14px] font-semibold tracking-[-0.03em] ${heading}`}
                >
                  ICOGON
                </span>
              </div>

              <p
                className={`mt-5 max-w-[260px] text-[10px] leading-5 ${muted}`}
              >
                Build websites, applications and
                AI-powered experiences with a
                faster, more flexible workflow.
              </p>

              <button
                type="button"
                onClick={startBuilding}
                className={`mt-5 inline-flex items-center gap-2 text-[10px] font-semibold transition ${
                  isDark
                    ? "text-zinc-400 hover:text-white"
                    : "text-[#425474] hover:text-[#17213d]"
                }`}
              >
                Start building
                <ArrowRight size={12} />
              </button>
            </div>

            {/* COMPANY */}

            <FooterGroup
              title="Company"
              isDark={isDark}
              links={[
                [
                  "Enterprise",
                  "/enterprise",
                ],
                ["Security", "/security"],
                [
                  "Community",
                  "/community",
                ],
                ["Partners", "/partners"],
              ]}
              navigate={navigate}
            />

            {/* PRODUCT */}

            <FooterGroup
              title="Product"
              isDark={isDark}
              links={[
                ["Builder", "/builder"],
                ["Pricing", "/pricing"],
                [
                  "Templates",
                  "/templates",
                ],
                [
                  "Connectors",
                  "/connectors",
                ],
              ]}
              navigate={navigate}
            />

            {/* RESOURCES */}

            <FooterGroup
              title="Resources"
              isDark={isDark}
              links={[
                ["Blog", "/blog"],
                ["Academy", "/academy"],
                ["Guides", "/guides"],
                ["Docs", "/docs"],
              ]}
              navigate={navigate}
            />
          </div>

          {/* COPYRIGHT */}

          <div
            className={`mt-14 flex flex-col gap-3 border-t pt-6 text-[9px] sm:flex-row sm:items-center sm:justify-between ${
              isDark
                ? "border-white/[0.07] text-zinc-600"
                : "border-[#dfe6ef] text-[#a0aaba]"
            }`}
          >
            <p>
              © {new Date().getFullYear()}
              {" "}ICOGON. All rights reserved.
            </p>

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

/* ============================================================
   FOOTER GROUP
============================================================ */

interface FooterGroupProps {
  title: string;
  isDark: boolean;
  links: Array<[string, string]>;
  navigate: (path: string) => void;
}

const FooterGroup = ({
  title,
  isDark,
  links,
  navigate,
}: FooterGroupProps) => {
  return (
    <div>
      <p
        className={`text-[9px] font-semibold uppercase tracking-[0.13em] ${
          isDark
            ? "text-zinc-600"
            : "text-[#94a3b8]"
        }`}
      >
        {title}
      </p>

      <div
        className={`mt-5 space-y-3 text-[10px] ${
          isDark
            ? "text-zinc-500"
            : "text-[#718096]"
        }`}
      >
        {links.map(([label, path]) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              navigate(path)
            }
            className="block transition hover:text-current"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;