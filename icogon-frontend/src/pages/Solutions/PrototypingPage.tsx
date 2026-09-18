import {
  ArrowRight,
  Check,
  ChevronDown,
  CirclePlay,
  Code2,
  Layers3,
  MousePointer2,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const PrototypingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const buildPrototype = () => {
    navigate("/builder");
  };

  const prototypeTypes = [
    {
      icon: WandSparkles,
      title: "Product concepts",
      description:
        "Turn early ideas into interactive product experiences you can explore and refine.",
    },
    {
      icon: Layers3,
      title: "MVP prototypes",
      description:
        "Create a functional starting point for your next product without building everything from scratch.",
    },
    {
      icon: MousePointer2,
      title: "Interactive flows",
      description:
        "Prototype screens, user journeys and workflows instead of relying only on static designs.",
    },
    {
      icon: Code2,
      title: "Functional prototypes",
      description:
        "Move beyond mockups and create prototypes that behave more like the final product.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Describe the experience",
      description:
        "Explain the product, user flow or feature you want to explore in natural language.",
    },
    {
      number: "02",
      title: "Generate a starting point",
      description:
        "ICOGON turns the idea into screens, components and an interactive product structure.",
    },
    {
      number: "03",
      title: "Interact and iterate",
      description:
        "Click through the experience, identify what needs changing and continue refining it.",
    },
    {
      number: "04",
      title: "Turn the prototype into a product",
      description:
        "Keep developing from the prototype instead of throwing the work away when development starts.",
    },
  ];

  const features = [
    "Interactive screens",
    "User flows",
    "Reusable components",
    "Responsive interfaces",
    "AI-assisted iteration",
    "Functional interactions",
    "Realistic product states",
    "Developer-ready structure",
  ];

  const faqs = [
    {
      question: "What is prototyping with ICOGON?",
      answer:
        "Prototyping with ICOGON means using AI to create an interactive version of a product idea so you can explore screens, flows and functionality before building the complete product.",
    },
    {
      question: "Can I create a prototype from a prompt?",
      answer:
        "Yes. You can describe the product or experience you want and use that description as the starting point for generating an interactive prototype.",
    },
    {
      question: "Can prototypes be interactive?",
      answer:
        "Yes. The goal is to move beyond static screens and create experiences where you can explore navigation, layouts and product flows.",
    },
    {
      question: "Can I continue developing after prototyping?",
      answer:
        "Yes. A prototype can act as the starting point for further development rather than being treated as a disposable design artifact.",
    },
    {
      question: "Who can use ICOGON for prototyping?",
      answer:
        "Founders, product managers, designers, developers, marketers and teams can use prototypes to communicate and test product ideas.",
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
        <div className="pointer-events-none absolute left-[-150px] top-[110px] h-[350px] w-[350px] rounded-full bg-[#ff2aa8]/70 blur-[85px]" />

        <div className="pointer-events-none absolute left-[28%] top-[250px] h-[230px] w-[230px] rounded-full bg-[#7155ff]/65 blur-[70px]" />

        <div className="pointer-events-none absolute right-[-120px] top-[450px] h-[360px] w-[360px] rounded-full bg-[#398fff]/65 blur-[90px]" />

        <div className="relative mx-auto max-w-[1180px] px-6 pb-24 pt-20 sm:px-8 lg:px-10 lg:pt-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-sm">
                <CirclePlay
                  size={13}
                  strokeWidth={1.7}
                  className="text-neutral-600"
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Prototyping
                </span>
              </div>

              <h1 className="max-w-[680px] text-[52px] font-semibold leading-[0.93] tracking-[-0.065em] sm:text-[68px] lg:text-[78px]">
                From rough idea
                <br />
                to interactive
                <br />
                prototype.
              </h1>
            </div>

            <div className="pt-4 lg:pt-14">
              <p className="max-w-[360px] text-[14px] leading-6 text-neutral-600">
                Explore product ideas before committing to a full build.
                Describe an experience and turn it into something you can
                actually click, test and improve.
              </p>

              <button
                onClick={buildPrototype}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#171717] px-5 py-2.5 text-[11px] font-medium text-white transition hover:bg-black"
              >
                Start prototyping
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400 sm:justify-start sm:pl-8">
            <span>Idea</span>
            <span>→</span>
            <span>Prototype</span>
            <span>→</span>
            <span>Validate</span>
            <span>→</span>
            <span>Build</span>
          </div>

          {/* Prototype preview */}
          <div className="relative mx-auto mt-8 max-w-[1030px]">
            <div className="absolute -bottom-10 left-1/2 h-16 w-[82%] -translate-x-1/2 bg-gradient-to-r from-[#ff39b9] via-[#ff6a19] to-[#438cff] opacity-80 blur-xl" />

            <div className="relative overflow-hidden rounded-[9px] border border-neutral-300 bg-white shadow-[0_28px_85px_rgba(0,0,0,0.15)]">
              <div className="flex h-8 items-center gap-1.5 border-b border-neutral-200 bg-[#f7f7f5] px-3">
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />

                <div className="mx-auto h-4 w-[38%] rounded bg-white" />

                <div className="h-4 w-8 rounded bg-neutral-200" />
              </div>

              <div className="grid min-h-[340px] grid-cols-[0.52fr_1.48fr]">
                {/* Sidebar */}
                <div className="border-r border-neutral-200 bg-[#fafafa] p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-neutral-900" />
                    <div className="h-2 w-14 rounded bg-neutral-800" />
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
                  </div>

                  <div className="mt-12 border-t border-neutral-200 pt-4">
                    <div className="h-1.5 w-20 rounded bg-neutral-200" />
                    <div className="mt-3 h-6 rounded bg-white" />
                    <div className="mt-2 h-6 rounded bg-white" />
                  </div>
                </div>

                {/* Prototype canvas */}
                <div className="bg-[#f1f0ec] p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-2 w-24 rounded bg-neutral-800" />
                      <div className="mt-2 h-1.5 w-36 rounded bg-neutral-200" />
                    </div>

                    <div className="flex gap-2">
                      <div className="h-6 w-14 rounded bg-white" />
                      <div className="h-6 w-16 rounded bg-neutral-900" />
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-[1.2fr_0.8fr] gap-4">
                    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                      <div className="h-3 w-24 rounded bg-neutral-300" />

                      <div className="mt-5 h-8 w-[90%] rounded bg-neutral-900" />
                      <div className="mt-2 h-8 w-[65%] rounded bg-neutral-900" />

                      <div className="mt-5 h-2 w-[85%] rounded bg-neutral-100" />
                      <div className="mt-2 h-2 w-[70%] rounded bg-neutral-100" />

                      <div className="mt-6 h-8 w-24 rounded bg-neutral-900" />

                      <div className="mt-7 grid grid-cols-3 gap-2">
                        <div className="h-12 rounded bg-neutral-100" />
                        <div className="h-12 rounded bg-neutral-100" />
                        <div className="h-12 rounded bg-neutral-100" />
                      </div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-neutral-200" />
                        <div className="h-2 w-20 rounded bg-neutral-300" />
                      </div>

                      <div className="mt-5 space-y-2">
                        <div className="h-8 rounded bg-neutral-50" />
                        <div className="h-8 rounded bg-neutral-50" />
                        <div className="h-8 rounded bg-neutral-50" />
                      </div>

                      <div className="mt-6 h-20 rounded bg-neutral-100" />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="h-14 rounded-lg bg-white" />
                    <div className="h-14 rounded-lg bg-white" />
                    <div className="h-14 rounded-lg bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY PROTOTYPE
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <h2 className="max-w-[470px] text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[48px]">
                See the idea
                <br />
                before building
                <br />
                the whole thing.
              </h2>

              <p className="mt-6 max-w-[400px] text-[13px] leading-6 text-neutral-600">
                A prototype makes an idea tangible. Explore the structure,
                understand the flow and find gaps while changes are still
                easy to make.
              </p>
            </div>

            <div className="space-y-7 border-l border-neutral-300 pl-7">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                  Explore
                </p>

                <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                  Turn abstract product requirements into an experience that
                  people can actually interact with.
                </p>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                  Communicate
                </p>

                <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                  Give your team a shared visual representation of the idea
                  before development begins.
                </p>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                  Iterate
                </p>

                <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                  Change the experience quickly as you learn more about what
                  the product needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PROTOTYPING TYPES
      ========================================================= */}
      <section className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mb-12">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              What you can prototype
            </p>

            <h2 className="mt-4 text-[35px] font-semibold leading-[0.98] tracking-[-0.055em]">
              Start with almost
              <br />
              anything.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {prototypeTypes.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group border-t border-neutral-300 pt-5 transition"
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
          WORKFLOW
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                The workflow
              </p>

              <h2 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[46px]">
                Prototype
                <br />
                without
                <br />
                starting over.
              </h2>

              <p className="mt-6 max-w-[340px] text-[12px] leading-5 text-neutral-500">
                Keep your thinking, design and development connected as the
                product moves from concept toward reality.
              </p>

              <button
                onClick={buildPrototype}
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#171717] px-5 py-2.5 text-[10px] font-medium text-white"
              >
                Try ICOGON
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="grid grid-cols-[48px_1fr] gap-5 border-t border-neutral-200 py-6"
                >
                  <div className="text-[9px] font-semibold text-neutral-400">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-[15px] font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-2 max-w-[530px] text-[11px] leading-5 text-neutral-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DARK FEATURE
      ========================================================= */}
      <section className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-[8px] bg-[#171717] text-white">
            <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[330px] w-[330px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute right-[100px] top-[40px] h-[160px] w-[160px] rotate-45 rounded-[25px] border border-white/10" />

            <div className="relative grid gap-12 p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-12">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Interactive by default
                </p>

                <h2 className="mt-5 max-w-[360px] text-[31px] font-semibold leading-[0.98] tracking-[-0.045em]">
                  Don't just show the idea.
                  <br />
                  Let people use it.
                </h2>

                <p className="mt-5 max-w-[340px] text-[11px] leading-5 text-white/50">
                  A useful prototype should help people understand how a
                  product works, not just what it looks like.
                </p>

                <button
                  onClick={buildPrototype}
                  className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-[10px] font-semibold text-neutral-900"
                >
                  Build a prototype
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="overflow-hidden rounded-md border border-white/10 bg-[#222]">
                <div className="flex h-7 items-center gap-1 border-b border-white/10 px-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                </div>

                <div className="grid min-h-[260px] grid-cols-[0.4fr_1fr]">
                  <div className="border-r border-white/10 p-3">
                    <div className="h-2 w-14 rounded bg-white/15" />

                    <div className="mt-7 space-y-2">
                      <div className="h-5 rounded bg-white/10" />
                      <div className="h-5 rounded bg-white/5" />
                      <div className="h-5 rounded bg-white/5" />
                      <div className="h-5 rounded bg-white/5" />
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="rounded border border-white/10 bg-[#292929] p-5">
                      <div className="h-2 w-24 rounded bg-white/20" />

                      <div className="mt-5 h-7 w-[80%] rounded bg-white/10" />
                      <div className="mt-2 h-7 w-[55%] rounded bg-white/10" />

                      <div className="mt-5 h-2 w-[80%] rounded bg-white/5" />
                      <div className="mt-2 h-2 w-[65%] rounded bg-white/5" />

                      <div className="mt-5 flex gap-2">
                        <div className="h-7 w-20 rounded bg-white" />
                        <div className="h-7 w-20 rounded border border-white/10" />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="h-12 rounded bg-white/5" />
                      <div className="h-12 rounded bg-white/5" />
                      <div className="h-12 rounded bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-3 bg-gradient-to-r from-[#ff31b6] via-[#ff6418] to-[#438cff]" />
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Built for iteration
              </p>

              <h2 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[46px]">
                Everything you need
                <br />
                to explore an idea.
              </h2>

              <p className="mt-6 max-w-[420px] text-[12px] leading-6 text-neutral-500">
                Move quickly between product thinking, interface design and
                implementation without losing the context of the original
                idea.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-[10px] text-neutral-600"
                  >
                    <Check size={12} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-1/2 h-[220px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#438cff] via-[#a768ff] to-[#ff3eb8] opacity-55 blur-[70px]" />

              <div className="relative rounded-[10px] border border-neutral-200 bg-white p-5 shadow-[0_25px_70px_rgba(0,0,0,0.10)]">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-neutral-900" />
                    <div className="h-2 w-20 rounded bg-neutral-800" />
                  </div>

                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-md bg-neutral-100" />
                    <div className="h-6 w-6 rounded-md bg-neutral-100" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-lg bg-[#f4f3ef] p-5">
                    <div className="h-2 w-20 rounded bg-neutral-300" />

                    <div className="mt-4 h-7 w-[75%] rounded bg-neutral-800" />

                    <div className="mt-3 h-2 w-[90%] rounded bg-neutral-200" />
                    <div className="mt-2 h-2 w-[70%] rounded bg-neutral-200" />

                    <div className="mt-5 h-7 w-20 rounded bg-neutral-900" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 rounded-lg bg-neutral-100" />
                    <div className="h-20 rounded-lg bg-neutral-100" />
                    <div className="h-20 rounded-lg bg-neutral-100" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-center gap-2">
                    <Zap size={13} className="text-neutral-500" />
                    <span className="text-[9px] text-neutral-500">
                      Prototype generated
                    </span>
                  </div>

                  <span className="text-[9px] font-medium text-neutral-700">
                    Ready
                  </span>
                </div>
              </div>
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
        <div className="pointer-events-none absolute bottom-[-150px] left-1/2 h-[300px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#438cff] via-[#ff39bb] to-[#ff6a1a] opacity-65 blur-[80px]" />

        <div className="relative mx-auto max-w-[850px] px-6 py-24 text-center sm:px-8 lg:py-32">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <Sparkles size={15} />
          </div>

          <h2 className="mt-7 text-[38px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[50px]">
            Have an idea
            <br />
            worth exploring?
          </h2>

          <p className="mx-auto mt-5 max-w-[420px] text-[12px] leading-5 text-neutral-500">
            Start a conversation with ICOGON and turn your product idea into
            something you can actually experience.
          </p>

          <button
            onClick={buildPrototype}
            className="group mx-auto mt-9 flex w-full max-w-[520px] items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition hover:border-neutral-300"
          >
            <span className="text-[11px] text-neutral-400">
              Build a prototype for my idea...
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
                onClick={buildPrototype}
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
                  onClick={buildPrototype}
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
                  onClick={() => navigate("/solutions/designers")}
                  className="block hover:text-neutral-900"
                >
                  Designers
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

export default PrototypingPage;