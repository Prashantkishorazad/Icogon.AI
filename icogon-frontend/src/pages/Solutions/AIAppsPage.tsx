import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Code2,
  Cpu,
  Database,
  Globe2,
  MessageSquare,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const AIAppsPage = () => {
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

  const appTypes = [
    {
      icon: MessageSquare,
      title: "AI assistants",
      description:
        "Create conversational experiences that help users find information and complete tasks.",
    },
    {
      icon: WandSparkles,
      title: "AI workflows",
      description:
        "Build applications that use AI to transform repetitive processes into useful workflows.",
    },
    {
      icon: Database,
      title: "AI data tools",
      description:
        "Create interfaces that help people explore, understand and work with complex information.",
    },
    {
      icon: Globe2,
      title: "AI-powered products",
      description:
        "Build customer-facing applications where intelligent features are part of the core experience.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Describe the AI experience",
      description:
        "Tell ICOGON what your application should do, who will use it and how AI should fit into the experience.",
    },
    {
      number: "02",
      title: "Generate the application",
      description:
        "Start with an interface, workflow and product structure designed around your idea.",
    },
    {
      number: "03",
      title: "Connect the intelligence",
      description:
        "Shape prompts, workflows, data and AI interactions around the behavior your application needs.",
    },
    {
      number: "04",
      title: "Iterate and ship",
      description:
        "Keep improving the application as you learn what users need and how the product should evolve.",
    },
  ];

  const capabilities = [
    "AI chat interfaces",
    "Prompt-driven workflows",
    "Data-aware experiences",
    "Custom application logic",
    "Responsive interfaces",
    "Reusable components",
    "AI-assisted development",
    "Product-ready structure",
  ];

  const faqs = [
    {
      question: "What can I build with ICOGON AI?",
      answer:
        "You can build AI assistants, AI-powered workflows, data applications, customer-facing AI products and other applications where intelligent behavior is part of the experience.",
    },
    {
      question: "Can I build an AI app from a prompt?",
      answer:
        "Yes. You can describe the application you want to create and use that description as the starting point for generating the product experience.",
    },
    {
      question: "Can an AI app have a custom interface?",
      answer:
        "Yes. AI does not have to mean a simple chat box. You can design the interface around the specific workflow and experience your application needs.",
    },
    {
      question: "Can AI apps work with data?",
      answer:
        "AI applications can be designed around data, workflows and application logic. The exact integration depends on the data source and technical requirements of the project.",
    },
    {
      question: "Do I need to be an AI expert?",
      answer:
        "You can start by explaining what you want the application to do in natural language. More advanced AI behavior may require technical configuration and development knowledge.",
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
        <div className="pointer-events-none absolute left-[-150px] top-[100px] h-[360px] w-[360px] rounded-full bg-[#ff2ca8]/70 blur-[85px]" />

        <div className="pointer-events-none absolute left-[25%] top-[240px] h-[250px] w-[250px] rounded-full bg-[#7555ff]/65 blur-[75px]" />

        <div className="pointer-events-none absolute right-[-130px] top-[390px] h-[380px] w-[380px] rounded-full bg-[#428eff]/65 blur-[90px]" />

        {/* Floating icons */}
        <div className="pointer-events-none absolute left-[6%] top-[120px] hidden sm:block">
          <div className="flex h-10 w-10 rotate-[-8deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#ff3bac] to-[#ff7668] text-white shadow-lg">
            <Bot size={18} />
          </div>
        </div>

        <div className="pointer-events-none absolute left-[13%] top-[220px] hidden sm:block">
          <div className="flex h-9 w-9 rotate-[7deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#5d5aff] to-[#9f8bff] text-white shadow-lg">
            <Cpu size={16} />
          </div>
        </div>

        <div className="pointer-events-none absolute right-[7%] top-[125px] hidden sm:block">
          <div className="flex h-10 w-10 rotate-[8deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#438eff] to-[#765eff] text-white shadow-lg">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="pointer-events-none absolute right-[13%] top-[235px] hidden sm:block">
          <div className="flex h-9 w-9 rotate-[-7deg] items-center justify-center rounded-lg bg-gradient-to-br from-[#ff39b0] to-[#ff7464] text-white shadow-lg">
            <Zap size={16} />
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-6 pb-20 pt-16 sm:px-8 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="mx-auto max-w-[720px] text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-sm">
              <Bot
                size={13}
                strokeWidth={1.7}
                className="text-neutral-600"
              />

              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                AI Apps
              </span>
            </div>

            <h1 className="text-[44px] font-semibold leading-[0.94] tracking-[-0.065em] sm:text-[60px] lg:text-[68px]">
              Build AI apps
              <br />
              around your ideas,
              <br />
              not the other way around.
            </h1>

            <p className="mx-auto mt-5 max-w-[510px] text-[11px] leading-5 text-neutral-600 sm:text-[12px]">
              Create intelligent applications with interfaces, workflows and
              AI capabilities designed around the problem you actually want
              to solve.
            </p>

            <button
              onClick={startBuilding}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#171717] px-5 py-2.5 text-[10px] font-medium text-white transition hover:bg-black"
            >
              Start building
              <ArrowRight size={12} />
            </button>
          </div>

          {/* AI app preview */}
          <div className="relative mx-auto mt-14 max-w-[940px]">
            <div className="absolute -bottom-10 left-1/2 h-16 w-[82%] -translate-x-1/2 bg-gradient-to-r from-[#ff36b8] via-[#ff6418] to-[#438cff] opacity-85 blur-xl" />

            <div className="relative overflow-hidden rounded-[9px] border border-neutral-300 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.15)]">
              <div className="flex h-8 items-center gap-1.5 border-b border-neutral-200 bg-[#f7f7f5] px-3">
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />

                <div className="mx-auto h-4 w-[38%] rounded bg-white" />

                <div className="h-4 w-9 rounded bg-neutral-200" />
              </div>

              <div className="grid min-h-[350px] grid-cols-[0.45fr_1.55fr]">
                {/* Sidebar */}
                <div className="border-r border-neutral-200 bg-[#fafafa] p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-white">
                      <Sparkles size={12} />
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
                  </div>

                  <div className="mt-10 border-t border-neutral-200 pt-4">
                    <div className="h-1.5 w-20 rounded bg-neutral-200" />
                    <div className="mt-3 h-6 rounded bg-white" />
                    <div className="mt-2 h-6 rounded bg-white" />
                  </div>
                </div>

                {/* AI workspace */}
                <div className="bg-[#f2f1ed] p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-2.5 w-28 rounded bg-neutral-800" />
                      <div className="mt-2 h-1.5 w-36 rounded bg-neutral-200" />
                    </div>

                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded bg-white" />
                      <div className="h-6 w-16 rounded bg-neutral-900" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_0.75fr]">
                    {/* Conversation */}
                    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">
                          <Bot size={12} />
                        </div>

                        <div>
                          <div className="h-1.5 w-20 rounded bg-neutral-700" />
                          <div className="mt-1 h-1 w-12 rounded bg-neutral-100" />
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="ml-auto max-w-[75%] rounded-lg bg-neutral-100 p-3">
                          <div className="h-1.5 w-full rounded bg-neutral-300" />
                          <div className="mt-2 h-1.5 w-[70%] rounded bg-neutral-200" />
                        </div>

                        <div className="max-w-[85%] rounded-lg bg-[#f4f3ef] p-3">
                          <div className="h-1.5 w-full rounded bg-neutral-300" />
                          <div className="mt-2 h-1.5 w-[90%] rounded bg-neutral-200" />
                          <div className="mt-2 h-1.5 w-[65%] rounded bg-neutral-200" />
                        </div>

                        <div className="ml-auto max-w-[65%] rounded-lg bg-neutral-100 p-3">
                          <div className="h-1.5 w-full rounded bg-neutral-300" />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2">
                        <span className="flex-1 text-[7px] text-neutral-300">
                          Ask anything...
                        </span>

                        <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-900 text-white">
                          <ArrowRight size={9} />
                        </div>
                      </div>
                    </div>

                    {/* AI output */}
                    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
                          <Sparkles size={11} />
                        </div>

                        <div className="h-2 w-20 rounded bg-neutral-700" />
                      </div>

                      <div className="mt-5 rounded bg-neutral-50 p-3">
                        <div className="h-2 w-16 rounded bg-neutral-300" />

                        <div className="mt-4 h-14 rounded bg-white" />

                        <div className="mt-3 h-2 w-full rounded bg-neutral-100" />
                        <div className="mt-2 h-2 w-[80%] rounded bg-neutral-100" />
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="h-12 rounded bg-neutral-50" />
                        <div className="h-12 rounded bg-neutral-50" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="h-12 rounded-lg bg-white" />
                    <div className="h-12 rounded-lg bg-white" />
                    <div className="h-12 rounded-lg bg-white" />
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
                AI should fit
                <br />
                the product,
                <br />
                not define it.
              </h2>

              <p className="mt-6 max-w-[410px] text-[13px] leading-6 text-neutral-600">
                Build the interface around the user's job. AI can be a
                conversation, a workflow, a recommendation, an automation or
                something completely different.
              </p>
            </div>

            <div className="border-l border-neutral-300 pl-7">
              <div className="space-y-8">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Experience
                  </p>

                  <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                    Design an experience that makes intelligent functionality
                    useful instead of simply adding an AI button.
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Context
                  </p>

                  <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                    Give AI the right context, information and workflow so it
                    can support the task your application is solving.
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Control
                  </p>

                  <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                    Keep people in control of important decisions while AI
                    helps with the work around them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHAT YOU CAN BUILD
      ========================================================= */}
      <section className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mb-12">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              What you can build
            </p>

            <h2 className="mt-4 text-[35px] font-semibold leading-[0.98] tracking-[-0.055em]">
              More than a
              <br />
              chat window.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {appTypes.map((item) => {
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
          AI WORKFLOW
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                The workflow
              </p>

              <h2 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[46px]">
                From prompt
                <br />
                to intelligent
                <br />
                product.
              </h2>

              <p className="mt-6 max-w-[350px] text-[12px] leading-5 text-neutral-500">
                Start with what you want the application to accomplish and
                shape the AI experience around that goal.
              </p>

              <button
                onClick={startBuilding}
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#171717] px-5 py-2.5 text-[10px] font-medium text-white"
              >
                Build an AI app
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
            <div className="pointer-events-none absolute right-[-100px] top-[-110px] h-[330px] w-[330px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute right-[80px] top-[30px] h-[180px] w-[180px] rotate-45 rounded-[25px] border border-white/10" />

            <div className="relative grid gap-12 p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-12">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Intelligent workflows
                </p>

                <h2 className="mt-5 max-w-[370px] text-[31px] font-semibold leading-[0.98] tracking-[-0.045em]">
                  Put AI where
                  <br />
                  the work happens.
                </h2>

                <p className="mt-5 max-w-[340px] text-[11px] leading-5 text-white/50">
                  Instead of separating AI from your application, make it a
                  useful part of the workflow your users already understand.
                </p>

                <button
                  onClick={startBuilding}
                  className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-[10px] font-semibold text-neutral-900"
                >
                  Start building
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="overflow-hidden rounded-md border border-white/10 bg-[#222]">
                <div className="flex h-7 items-center gap-1 border-b border-white/10 px-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                </div>

                <div className="grid min-h-[280px] grid-cols-[0.55fr_1fr]">
                  <div className="border-r border-white/10 p-4">
                    <div className="h-2 w-16 rounded bg-white/15" />

                    <div className="mt-7 space-y-2">
                      <div className="rounded bg-white/10 p-2">
                        <div className="h-1.5 w-14 rounded bg-white/20" />
                      </div>

                      <div className="p-2">
                        <div className="h-1.5 w-20 rounded bg-white/10" />
                      </div>

                      <div className="p-2">
                        <div className="h-1.5 w-16 rounded bg-white/10" />
                      </div>

                      <div className="p-2">
                        <div className="h-1.5 w-18 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="rounded border border-white/10 bg-[#292929] p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                          <Bot size={11} />
                        </div>

                        <div className="h-2 w-24 rounded bg-white/15" />
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="ml-auto h-8 w-[65%] rounded bg-white/10" />

                        <div className="h-12 w-[85%] rounded bg-white/5" />

                        <div className="ml-auto h-8 w-[55%] rounded bg-white/10" />
                      </div>

                      <div className="mt-5 flex h-7 items-center justify-between rounded border border-white/10 px-3">
                        <span className="text-[7px] text-white/25">
                          Ask your AI...
                        </span>

                        <ArrowRight size={9} className="text-white/30" />
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

            <div className="h-3 bg-gradient-to-r from-[#ff32b7] via-[#ff6418] to-[#438cff]" />
          </div>
        </div>
      </section>

      {/* =========================================================
          CAPABILITIES
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                AI capabilities
              </p>

              <h2 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[46px]">
                Build the AI
                <br />
                experience you need.
              </h2>

              <p className="mt-6 max-w-[410px] text-[12px] leading-6 text-neutral-500">
                Use AI as one part of a larger product experience. Combine
                intelligence with interfaces, data and workflows.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4">
                {capabilities.map((capability) => (
                  <div
                    key={capability}
                    className="flex items-center gap-2 text-[10px] text-neutral-600"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                      <Check size={10} />
                    </div>

                    {capability}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#428cff] via-[#a66aff] to-[#ff39b8] opacity-60 blur-[70px]" />

              <div className="relative overflow-hidden rounded-[9px] border border-neutral-200 bg-white p-5 shadow-[0_25px_70px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-white">
                      <Sparkles size={11} />
                    </div>

                    <div className="h-2 w-24 rounded bg-neutral-700" />
                  </div>

                  <div className="h-6 w-16 rounded bg-neutral-100" />
                </div>

                <div className="mt-5 rounded-lg bg-[#f4f3ef] p-4">
                  <div className="flex items-center gap-2">
                    <Bot size={13} className="text-neutral-500" />

                    <span className="text-[8px] font-medium text-neutral-500">
                      AI workflow
                    </span>
                  </div>

                  <div className="mt-5 grid gap-2">
                    <div className="rounded border border-neutral-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <div className="h-1.5 w-24 rounded bg-neutral-300" />
                        <div className="h-4 w-4 rounded bg-neutral-100" />
                      </div>

                      <div className="mt-3 h-1.5 w-[80%] rounded bg-neutral-100" />
                    </div>

                    <div className="mx-auto h-5 w-px bg-neutral-300" />

                    <div className="rounded border border-neutral-200 bg-white p-3">
                      <div className="h-1.5 w-20 rounded bg-neutral-300" />

                      <div className="mt-3 flex gap-2">
                        <div className="h-6 flex-1 rounded bg-neutral-50" />
                        <div className="h-6 flex-1 rounded bg-neutral-50" />
                      </div>
                    </div>

                    <div className="mx-auto h-5 w-px bg-neutral-300" />

                    <div className="rounded border border-neutral-200 bg-white p-3">
                      <div className="h-1.5 w-28 rounded bg-neutral-300" />

                      <div className="mt-3 h-8 rounded bg-neutral-50" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-lg border border-neutral-200 p-3">
                  <div className="h-5 w-5 rounded-full bg-neutral-100" />

                  <div className="flex-1">
                    <div className="h-1.5 w-32 rounded bg-neutral-100" />
                    <div className="mt-1.5 h-1.5 w-20 rounded bg-neutral-50" />
                  </div>

                  <span className="text-[8px] font-medium text-neutral-400">
                    Running
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          USE CASE STRIP
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#f7f5ee]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Cpu
                size={17}
                className="text-neutral-500"
              />

              <h3 className="mt-5 text-[14px] font-semibold">
                Automate repetitive work
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                Turn repeated manual tasks into AI-assisted workflows.
              </p>
            </div>

            <div>
              <Database
                size={17}
                className="text-neutral-500"
              />

              <h3 className="mt-5 text-[14px] font-semibold">
                Make data easier to use
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                Build interfaces that help users work with information more
                naturally.
              </p>
            </div>

            <div>
              <Code2
                size={17}
                className="text-neutral-500"
              />

              <h3 className="mt-5 text-[14px] font-semibold">
                Create new products
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                Turn an AI capability into an actual product experience.
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
        <div className="pointer-events-none absolute bottom-[-140px] left-1/2 h-[280px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#438cff] via-[#ff38bb] to-[#ff6818] opacity-70 blur-[80px]" />

        <div className="relative mx-auto max-w-[850px] px-6 py-24 text-center sm:px-8 lg:py-32">
          <h2 className="text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[48px]">
            Ready to build
            <br />
            something intelligent?
          </h2>

          <p className="mx-auto mt-5 max-w-[430px] text-[11px] leading-5 text-neutral-500">
            Describe the AI application you have in mind and start turning
            your idea into a real product.
          </p>

          <button
            onClick={startBuilding}
            className="group mx-auto mt-8 flex w-full max-w-[510px] items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition hover:border-neutral-300"
          >
            <span className="text-[10px] text-neutral-400">
              Build an AI app for my idea...
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
                Build websites, applications and AI-powered products with
                ICOGON.
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

                <button
                  onClick={() => navigate("/solutions/ai-apps")}
                  className="block hover:text-neutral-900"
                >
                  AI Apps
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

export default AIAppsPage;