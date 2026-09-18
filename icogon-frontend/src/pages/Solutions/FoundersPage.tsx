import { ArrowRight, Check, Lightbulb, Rocket, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const FoundersPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Navbar apna login modal handle karta hai.
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const steps = [
    {
      number: "01",
      title: "Start with your idea",
      description:
        "Describe the product, workflow, or business idea you have in mind.",
      icon: Lightbulb,
    },
    {
      number: "02",
      title: "Build with AI",
      description:
        "Turn your idea into a working application without starting everything from scratch.",
      icon: Sparkles,
    },
    {
      number: "03",
      title: "Launch and grow",
      description:
        "Keep improving your product as your business, customers, and requirements grow.",
      icon: Rocket,
    },
  ];

  const useCases = [
    "MVPs and prototypes",
    "Customer portals",
    "Internal business tools",
    "Dashboards and admin panels",
    "Landing pages and websites",
    "AI-powered applications",
  ];

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <main className="pt-[72px]">
        <section className="relative overflow-hidden">
          {/* Background */}

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-180px] top-[-120px] h-[420px] w-[420px] rounded-full bg-blue-100/60 blur-3xl" />
            <div className="absolute right-[-160px] top-[80px] h-[380px] w-[380px] rounded-full bg-violet-100/50 blur-3xl" />
          </div>

          <div
            className="
              relative
              mx-auto
              max-w-[1200px]
              px-6
              pb-24
              pt-24
              lg:px-10
              lg:pb-32
              lg:pt-32
            "
          >
            <div className="mx-auto max-w-[850px] text-center">

              {/* Label */}

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                  shadow-sm
                "
              >
                <Sparkles size={13} />
                For Founders
              </div>

              {/* Heading */}

              <h1
                className="
                  mt-7
                  text-[48px]
                  font-semibold
                  leading-[0.98]
                  tracking-[-0.055em]
                  text-slate-950
                  sm:text-[60px]
                  lg:text-[76px]
                "
              >
                Turn your idea
                <br />
                into a real product.
              </h1>

              {/* Description */}

              <p
                className="
                  mx-auto
                  mt-7
                  max-w-[680px]
                  text-[16px]
                  leading-[1.65]
                  text-slate-500
                  sm:text-[18px]
                "
              >
                ICOGON helps founders turn ideas into working digital
                products with AI — from the first concept to a usable
                application.
              </p>

              {/* CTA */}

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/builder"
                  className="
                    inline-flex
                    items-center
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
                  Start building

                  <ArrowRight size={17} />
                </Link>

                <a
                  href="#how-it-works"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-6
                    py-3.5
                    text-[14px]
                    font-medium
                    text-slate-700
                    shadow-sm
                    transition-all
                    hover:bg-slate-50
                  "
                >
                  See how it works
                </a>
              </div>
            </div>

            {/* =================================================
                PRODUCT PREVIEW
            ================================================= */}

            <div className="mx-auto mt-20 max-w-[1000px]">
              <div
                className="
                  overflow-hidden
                  rounded-[26px]
                  border
                  border-slate-200
                  bg-white
                  p-2
                  shadow-[0_30px_90px_rgba(15,23,42,0.12)]
                "
              >
                <div
                  className="
                    overflow-hidden
                    rounded-[20px]
                    border
                    border-slate-200
                    bg-slate-50
                  "
                >
                  {/* Browser header */}

                  <div
                    className="
                      flex
                      h-11
                      items-center
                      border-b
                      border-slate-200
                      bg-white
                      px-4
                    "
                  >
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                    </div>

                    <div
                      className="
                        mx-auto
                        h-6
                        w-[45%]
                        rounded-lg
                        bg-slate-50
                      "
                    />
                  </div>

                  {/* App preview */}

                  <div className="grid min-h-[330px] grid-cols-[180px_1fr]">

                    {/* Sidebar */}

                    <div
                      className="
                        hidden
                        border-r
                        border-slate-200
                        bg-white
                        p-5
                        sm:block
                      "
                    >
                      <div className="h-5 w-24 rounded bg-slate-200" />

                      <div className="mt-8 space-y-3">
                        <div className="h-8 rounded-lg bg-slate-100" />
                        <div className="h-8 rounded-lg bg-slate-50" />
                        <div className="h-8 rounded-lg bg-slate-50" />
                        <div className="h-8 rounded-lg bg-slate-50" />
                      </div>
                    </div>

                    {/* Main */}

                    <div className="p-6 sm:p-8">

                      <div className="h-6 w-44 rounded bg-slate-200" />

                      <div className="mt-3 h-3 w-64 rounded bg-slate-100" />

                      <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
                        <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
                        <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-[1.4fr_0.8fr]">
                        <div className="h-36 rounded-2xl border border-slate-200 bg-white" />
                        <div className="h-36 rounded-2xl border border-slate-200 bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section
          id="how-it-works"
          className="
            border-t
            border-slate-100
            bg-slate-50/60
          "
        >
          <div
            className="
              mx-auto
              max-w-[1200px]
              px-6
              py-24
              lg:px-10
              lg:py-28
            "
          >
            <div className="max-w-[650px]">
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                How it works
              </p>

              <h2
                className="
                  mt-4
                  text-[38px]
                  font-semibold
                  leading-[1.05]
                  tracking-[-0.045em]
                  text-slate-950
                  sm:text-[48px]
                "
              >
                From idea to product,
                <br />
                without the unnecessary complexity.
              </h2>
            </div>

            <div className="mt-16 grid gap-5 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="
                      rounded-[22px]
                      border
                      border-slate-200
                      bg-white
                      p-7
                      shadow-sm
                    "
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          text-slate-700
                        "
                      >
                        <Icon size={19} strokeWidth={1.7} />
                      </div>

                      <span
                        className="
                          text-[11px]
                          font-semibold
                          tracking-[0.08em]
                          text-slate-300
                        "
                      >
                        {step.number}
                      </span>
                    </div>

                    <h3
                      className="
                        mt-7
                        text-[18px]
                        font-semibold
                        tracking-[-0.02em]
                        text-slate-900
                      "
                    >
                      {step.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        text-[13px]
                        leading-[1.6]
                        text-slate-500
                      "
                    >
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            USE CASES
        ===================================================== */}

        <section>
          <div
            className="
              mx-auto
              max-w-[1200px]
              px-6
              py-24
              lg:px-10
              lg:py-28
            "
          >
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

              <div>
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                  "
                >
                  What founders build
                </p>

                <h2
                  className="
                    mt-4
                    text-[40px]
                    font-semibold
                    leading-[1.05]
                    tracking-[-0.045em]
                    text-slate-950
                  "
                >
                  Build the thing
                  <br />
                  your business needs.
                </h2>

                <p
                  className="
                    mt-5
                    max-w-[470px]
                    text-[14px]
                    leading-[1.65]
                    text-slate-500
                  "
                >
                  Whether you are validating a new idea or building
                  the next version of your product, ICOGON gives you
                  a faster way to move from concept to software.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {useCases.map((item) => (
                  <div
                    key={item}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-5
                      py-5
                      shadow-sm
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-slate-100
                        text-slate-700
                      "
                    >
                      <Check size={15} strokeWidth={2} />
                    </div>

                    <span
                      className="
                        text-[13px]
                        font-medium
                        text-slate-700
                      "
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="border-t border-slate-100">
          <div
            className="
              mx-auto
              max-w-[1000px]
              px-6
              py-24
              text-center
              lg:py-32
            "
          >
            <div
              className="
                rounded-[30px]
                border
                border-slate-200
                bg-slate-50
                px-6
                py-16
                sm:px-12
              "
            >
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Start building
              </p>

              <h2
                className="
                  mx-auto
                  mt-4
                  max-w-[650px]
                  text-[40px]
                  font-semibold
                  leading-[1.02]
                  tracking-[-0.05em]
                  text-slate-950
                  sm:text-[52px]
                "
              >
                Your next product can start with an idea.
              </h2>

              <p
                className="
                  mx-auto
                  mt-5
                  max-w-[550px]
                  text-[14px]
                  leading-[1.6]
                  text-slate-500
                "
              >
                Describe what you want to build and start turning
                your idea into a working application.
              </p>

              <Link
                to="/builder"
                className="
                  mt-8
                  inline-flex
                  items-center
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
                Start building

                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FoundersPage;