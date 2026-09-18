import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Cloud,
  Code2,
  Database,
  Globe2,
  Layers3,
  Lock,
  MessageSquare,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const EnterprisePage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const startBuilding = () => {
    navigate("/builder");
  };

  // ============================================================
  // ENTERPRISE FEATURES
  // ============================================================

  const enterpriseFeatures = [
    {
      icon: Workflow,
      title: "Build around your workflows",
      description:
        "Create applications around the processes your organization already uses instead of forcing teams into generic software.",
    },
    {
      icon: Users,
      title: "Designed for teams",
      description:
        "Give product, design, engineering and business teams a shared place to turn ideas into working experiences.",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise-ready foundation",
      description:
        "Build with security, governance and organizational requirements in mind from the beginning.",
    },
    {
      icon: Zap,
      title: "Move from idea to execution",
      description:
        "Reduce the distance between an idea, a prototype and a working internal or customer-facing application.",
    },
  ];

  // ============================================================
  // USE CASES
  // ============================================================

  const useCases = [
    {
      number: "01",
      title: "Internal tools",
      description:
        "Create dashboards, admin tools, operations systems and custom workflows for your organization.",
      icon: Layers3,
    },
    {
      number: "02",
      title: "Customer experiences",
      description:
        "Build polished customer portals, product experiences and web applications around your business.",
      icon: Globe2,
    },
    {
      number: "03",
      title: "AI applications",
      description:
        "Bring AI-powered workflows, assistants and intelligent features into real products.",
      icon: Sparkles,
    },
    {
      number: "04",
      title: "Rapid prototypes",
      description:
        "Turn product concepts into interactive experiences that teams can test and iterate on quickly.",
      icon: Code2,
    },
  ];

  // ============================================================
  // CAPABILITIES
  // ============================================================

  const capabilities = [
    "Custom application experiences",
    "AI-powered workflows",
    "Internal business tools",
    "Customer-facing applications",
    "Data-driven dashboards",
    "Team collaboration",
    "Reusable components",
    "Workflow automation",
    "Integration-ready architecture",
    "Rapid prototyping",
    "Responsive web experiences",
    "Scalable product foundations",
  ];

  // ============================================================
  // FAQ
  // ============================================================

  const faqs = [
    {
      question: "What is ICOGON Enterprise?",
      answer:
        "ICOGON Enterprise is designed for organizations that want to use AI-assisted building across teams to create internal tools, customer experiences, prototypes and AI-powered applications.",
    },
    {
      question: "Who is ICOGON Enterprise for?",
      answer:
        "It can support product, engineering, design, operations, marketing, sales and other teams that need to turn ideas and workflows into working digital experiences.",
    },
    {
      question: "Can teams build internal tools?",
      answer:
        "Yes. Internal dashboards, admin interfaces, workflow applications and custom business tools are some of the use cases ICOGON can support.",
    },
    {
      question: "Can ICOGON be used for customer-facing products?",
      answer:
        "Yes. ICOGON can be used as a starting point for customer-facing websites, applications and AI-powered product experiences.",
    },
    {
      question: "Can enterprise teams work with their existing systems?",
      answer:
        "Applications can be designed around existing data, workflows and integrations. Specific integration and deployment requirements depend on the organization's technical environment.",
    },
    {
      question: "How do we get started?",
      answer:
        "Start by exploring ICOGON or contact the team to discuss your organization's requirements and the types of applications you want to build.",
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fcfbf7] text-[#17213d]">
      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <Navbar
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden bg-[#f8fbff]">
        {/* Soft sky-blue glow */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[40px]
            h-[480px]
            w-[900px]
            -translate-x-1/2
            rounded-full
            bg-[#dcefff]
            opacity-70
            blur-[110px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            left-[-180px]
            top-[360px]
            h-[380px]
            w-[380px]
            rounded-full
            bg-[#e5f4ff]
            opacity-80
            blur-[100px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-[-180px]
            top-[250px]
            h-[380px]
            w-[380px]
            rounded-full
            bg-[#edf0ff]
            opacity-70
            blur-[110px]
          "
        />

        {/* Floating icons */}

        <div className="pointer-events-none absolute left-[7%] top-[155px] hidden sm:block">
          <div
            className="
              flex
              h-11
              w-11
              rotate-[-7deg]
              items-center
              justify-center
              rounded-xl
              border
              border-white
              bg-white/90
              text-[#6c8caf]
              shadow-[0_15px_35px_rgba(60,90,130,0.09)]
            "
          >
            <Network size={18} strokeWidth={1.7} />
          </div>
        </div>

        <div className="pointer-events-none absolute left-[14%] top-[285px] hidden sm:block">
          <div
            className="
              flex
              h-10
              w-10
              rotate-[6deg]
              items-center
              justify-center
              rounded-xl
              border
              border-[#dceeff]
              bg-[#fafdff]
              text-[#78a7d2]
              shadow-[0_12px_30px_rgba(80,120,160,0.08)]
            "
          >
            <Database size={17} strokeWidth={1.7} />
          </div>
        </div>

        <div className="pointer-events-none absolute right-[7%] top-[160px] hidden sm:block">
          <div
            className="
              flex
              h-11
              w-11
              rotate-[7deg]
              items-center
              justify-center
              rounded-xl
              border
              border-white
              bg-white/90
              text-[#6c8caf]
              shadow-[0_15px_35px_rgba(60,90,130,0.09)]
            "
          >
            <Cloud size={18} strokeWidth={1.7} />
          </div>
        </div>

        <div className="pointer-events-none absolute right-[14%] top-[290px] hidden sm:block">
          <div
            className="
              flex
              h-10
              w-10
              rotate-[-6deg]
              items-center
              justify-center
              rounded-xl
              border
              border-[#dceeff]
              bg-[#fafdff]
              text-[#78a7d2]
              shadow-[0_12px_30px_rgba(80,120,160,0.08)]
            "
          >
            <ShieldCheck size={17} strokeWidth={1.7} />
          </div>
        </div>

        <div className="relative mx-auto max-w-[1180px] px-6 pb-20 pt-16 sm:px-8 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="mx-auto max-w-[820px] text-center">
            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#dce8f3]
                bg-white/90
                px-3.5
                py-1.5
                shadow-sm
                backdrop-blur
              "
            >
              <Sparkles
                size={13}
                strokeWidth={1.7}
                className="text-[#6f91b4]"
              />

              <span
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-[#64748b]
                "
              >
                ICOGON Enterprise
              </span>
            </div>

            <h1
              className="
                text-[46px]
                font-semibold
                leading-[0.93]
                tracking-[-0.065em]
                text-[#17213d]
                sm:text-[63px]
                lg:text-[72px]
              "
            >
              Build something
              <br />
              incredible together
            </h1>

            <p
              className="
                mx-auto
                mt-6
                max-w-[600px]
                text-[12px]
                leading-5
                text-[#64748b]
                sm:text-[13px]
                sm:leading-6
              "
            >
              Bring your teams, workflows and ideas together with an
              AI-powered platform for building websites, applications and
              custom digital experiences.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleSignup}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#17213d]
                  px-6
                  py-3
                  text-[10px]
                  font-medium
                  text-white
                  shadow-[0_10px_25px_rgba(23,33,61,0.12)]
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[#0f172a]
                  active:translate-y-0
                "
              >
                Get started
                <ArrowRight size={12} strokeWidth={1.8} />
              </button>

              <button
                type="button"
                onClick={startBuilding}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-[#d7e2ed]
                  bg-white
                  px-6
                  py-3
                  text-[10px]
                  font-medium
                  text-[#52627e]
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[#fafdff]
                  active:translate-y-0
                "
              >
                Start building
              </button>
            </div>
          </div>

          {/* =====================================================
              HERO PRODUCT PREVIEW
          ===================================================== */}

          <div className="relative mx-auto mt-16 max-w-[970px]">
            <div
              className="
                pointer-events-none
                absolute
                bottom-[-25px]
                left-1/2
                h-24
                w-[80%]
                -translate-x-1/2
                rounded-full
                bg-[#d8edff]
                opacity-80
                blur-[38px]
              "
            />

            <div
              className="
                relative
                overflow-hidden
                rounded-[14px]
                border
                border-[#d9e4ee]
                bg-white
                shadow-[0_30px_90px_rgba(45,70,110,0.12)]
              "
            >
              {/* Browser bar */}

              <div
                className="
                  flex
                  h-9
                  items-center
                  gap-1.5
                  border-b
                  border-[#e7ecf3]
                  bg-[#fcfdff]
                  px-4
                "
              >
                <span className="h-2 w-2 rounded-full bg-[#d5dee8]" />
                <span className="h-2 w-2 rounded-full bg-[#d5dee8]" />
                <span className="h-2 w-2 rounded-full bg-[#d5dee8]" />

                <div className="mx-auto h-5 w-[38%] rounded-md border border-[#edf1f6] bg-white" />

                <div className="h-5 w-12 rounded-md bg-[#f1f5f9]" />
              </div>

              <div className="grid min-h-[380px] grid-cols-[0.36fr_1fr]">
                {/* Sidebar */}

                <div className="border-r border-[#e7ecf3] bg-[#f8fafc] p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#17213d] text-white">
                      <Sparkles size={12} />
                    </div>

                    <div>
                      <div className="h-2 w-16 rounded bg-[#334155]" />
                      <div className="mt-1 h-1 w-10 rounded bg-[#dbe3ee]" />
                    </div>
                  </div>

                  <div className="mt-8 space-y-1.5">
                    {[
                      "Overview",
                      "Projects",
                      "Workflows",
                      "Analytics",
                      "Team",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`
                          rounded-md
                          px-2.5
                          py-2
                          text-[7px]
                          ${
                            index === 0
                              ? "bg-white text-[#475569] shadow-sm"
                              : "text-[#94a3b8]"
                          }
                        `}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-[#e6ebf2] pt-4">
                    <div className="h-1.5 w-16 rounded bg-[#d5dce7]" />

                    <div className="mt-4 space-y-2">
                      <div className="h-6 rounded bg-white" />
                      <div className="h-6 rounded bg-white" />
                      <div className="h-6 rounded bg-white" />
                    </div>
                  </div>
                </div>

                {/* Main dashboard */}

                <div className="bg-[#f2f6fa] p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-2.5 w-28 rounded bg-[#273449]" />
                      <div className="mt-2 h-1.5 w-40 rounded bg-[#d8e0eb]" />
                    </div>

                    <div className="flex gap-2">
                      <div className="h-7 w-16 rounded-md bg-white" />
                      <div className="h-7 w-20 rounded-md bg-[#17213d]" />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2.5">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="
                          rounded-lg
                          border
                          border-[#e1e7ef]
                          bg-white
                          p-3
                        "
                      >
                        <div className="h-1.5 w-16 rounded bg-[#cbd5e1]" />
                        <div className="mt-3 h-4 w-14 rounded bg-[#334155]" />
                        <div className="mt-3 h-1.5 w-full rounded bg-[#eef2f7]" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="rounded-lg border border-[#e1e7ef] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="h-2 w-20 rounded bg-[#475569]" />
                        <div className="h-5 w-12 rounded bg-[#f1f5f9]" />
                      </div>

                      <div className="mt-5 flex h-28 items-end gap-2">
                        {[40, 65, 48, 78, 55, 90, 70, 82].map(
                          (height, index) => (
                            <div
                              key={index}
                              className="flex-1 rounded-t bg-[#c9e5fb]"
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          ),
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#e1e7ef] bg-white p-4">
                      <div className="h-2 w-20 rounded bg-[#475569]" />

                      <div className="mt-5 space-y-3">
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2"
                          >
                            <div className="h-6 w-6 rounded-full bg-[#edf5fc]" />

                            <div className="flex-1">
                              <div className="h-1.5 w-full rounded bg-[#e4e9f0]" />
                              <div className="mt-1.5 h-1.5 w-[65%] rounded bg-[#f0f3f7]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="h-10 rounded-lg bg-white"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-2 bg-[#d9efff]" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ENTERPRISE INTRO
      ======================================================== */}

      <section className="bg-[#fcfbf7]">
        <div className="mx-auto max-w-[1080px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
                Built for organizations
              </p>

              <h2 className="mt-4 text-[37px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17213d] sm:text-[48px]">
                One place to
                <br />
                turn ideas
                <br />
                into reality.
              </h2>
            </div>

            <div className="border-l border-[#dbe3ec] pl-7 lg:pt-7">
              <p className="text-[14px] leading-6 text-[#64748b]">
                Modern teams need to move quickly without losing control.
                ICOGON gives teams a common environment to explore ideas,
                create experiences and build applications around the work they
                actually do.
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-[22px] font-semibold text-[#17213d]">
                    Faster
                  </div>

                  <p className="mt-2 text-[10px] leading-5 text-[#7c899d]">
                    Shorten the path between an idea and a usable product.
                  </p>
                </div>

                <div>
                  <div className="text-[22px] font-semibold text-[#17213d]">
                    Flexible
                  </div>

                  <p className="mt-2 text-[10px] leading-5 text-[#7c899d]">
                    Build experiences around your organization's unique
                    workflows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ENTERPRISE FEATURES
      ======================================================== */}

      <section className="border-y border-[#e3eaf1] bg-[#f5faff]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[600px] text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
              Why ICOGON
            </p>

            <h2 className="mt-4 text-[35px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17213d] sm:text-[44px]">
              Make your teams
              <br />
              more capable.
            </h2>

            <p className="mt-5 text-[11px] leading-5 text-[#718096]">
              Give teams the tools to explore, create and ship without
              unnecessary friction.
            </p>
          </div>

          <div className="mt-14 grid gap-3 md:grid-cols-2">
            {enterpriseFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="
                    rounded-[12px]
                    border
                    border-[#dce7f1]
                    bg-white
                    p-6
                    shadow-[0_10px_35px_rgba(60,80,110,0.045)]
                    transition-all
                    duration-200
                    hover:-translate-y-[2px]
                    hover:shadow-[0_16px_40px_rgba(60,80,110,0.07)]
                  "
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef7ff] text-[#6385b5]">
                    <Icon size={17} strokeWidth={1.6} />
                  </div>

                  <h3 className="mt-6 text-[14px] font-semibold text-[#25334c]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 max-w-[430px] text-[10px] leading-5 text-[#778398]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          TEAM WORKFLOW
      ======================================================== */}

      <section className="bg-[#fcfbf7]">
        <div className="mx-auto max-w-[1080px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
                One connected workflow
              </p>

              <h2 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17213d] sm:text-[46px]">
                From first idea
                <br />
                to something
                <br />
                your team can use.
              </h2>

              <p className="mt-6 max-w-[400px] text-[11px] leading-5 text-[#718096]">
                Connect the people who understand the problem with the people
                who build the solution.
              </p>
            </div>

            <div className="relative">
              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[230px]
                  w-[480px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-[#e2f2ff]
                  opacity-80
                  blur-[75px]
                "
              />

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[12px]
                  border
                  border-[#dce5ef]
                  bg-white
                  p-5
                  shadow-[0_25px_65px_rgba(50,70,105,0.08)]
                "
              >
                <div className="flex items-center justify-between border-b border-[#edf1f5] pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef7ff] text-[#6483ae]">
                      <Workflow size={13} />
                    </div>

                    <div>
                      <div className="h-2 w-24 rounded bg-[#475569]" />
                      <div className="mt-1.5 h-1.5 w-32 rounded bg-[#e3e8ef]" />
                    </div>
                  </div>

                  <div className="h-6 w-16 rounded-md bg-[#f1f5f9]" />
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      icon: Sparkles,
                      title: "Product idea",
                      text: "Define the problem and experience",
                    },
                    {
                      icon: Users,
                      title: "Team collaboration",
                      text: "Explore and iterate together",
                    },
                    {
                      icon: Code2,
                      title: "Build",
                      text: "Turn the concept into an application",
                    },
                    {
                      icon: Zap,
                      title: "Launch",
                      text: "Move the experience into real use",
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title}>
                        <div className="flex items-center gap-3 rounded-lg border border-[#e8edf3] bg-[#fafcff] p-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Icon
                              size={14}
                              className="text-[#6984a8]"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="text-[9px] font-semibold text-[#475569]">
                              {item.title}
                            </div>

                            <div className="mt-1 text-[8px] text-[#9aa5b5]">
                              {item.text}
                            </div>
                          </div>

                          <Check
                            size={13}
                            className="text-[#8aa1bf]"
                          />
                        </div>

                        {index < 3 && (
                          <div className="mx-auto h-3 w-px bg-[#dce4ed]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          USE CASES
      ======================================================== */}

      <section className="border-y border-[#e3e9ef] bg-white">
        <div className="mx-auto max-w-[1100px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mb-12">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
              What teams build
            </p>

            <h2 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17213d] sm:text-[46px]">
              Built around
              <br />
              real business needs.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;

              return (
                <div
                  key={useCase.title}
                  className="
                    group
                    rounded-[12px]
                    border
                    border-[#dfe6ef]
                    bg-[#fcfdff]
                    p-6
                    transition-all
                    duration-200
                    hover:-translate-y-[2px]
                    hover:bg-[#f9fcff]
                    hover:shadow-[0_15px_40px_rgba(70,100,130,0.06)]
                  "
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef7ff] text-[#6884aa]">
                      <Icon size={17} strokeWidth={1.6} />
                    </div>

                    <span className="text-[9px] font-semibold text-[#b0bac8]">
                      {useCase.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-[15px] font-semibold text-[#26344d]">
                    {useCase.title}
                  </h3>

                  <p className="mt-3 max-w-[430px] text-[10px] leading-5 text-[#788498]">
                    {useCase.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-[9px] font-semibold text-[#637c9e]">
                    Explore use case
                    <ArrowRight
                      size={11}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          PRODUCT SECTION
      ======================================================== */}

      <section className="bg-[#f5faff]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div
            className="
              relative
              overflow-hidden
              rounded-[14px]
              border
              border-[#d9e5ef]
              bg-[#edf7ff]
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                right-[-120px]
                top-[-120px]
                h-[320px]
                w-[320px]
                rounded-full
                bg-[#d9efff]
                opacity-80
                blur-[75px]
              "
            />

            <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[0.75fr_1.25fr] lg:p-12">
              <div className="flex flex-col justify-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8a9ab0]">
                  Build with confidence
                </p>

                <h2 className="mt-5 text-[31px] font-semibold leading-[0.98] tracking-[-0.045em] text-[#1d2a43]">
                  Powerful enough
                  <br />
                  for your teams.
                </h2>

                <p className="mt-5 max-w-[350px] text-[11px] leading-5 text-[#718096]">
                  Give teams a flexible foundation for creating the tools and
                  experiences that generic software cannot provide.
                </p>

                <button
                  type="button"
                  onClick={startBuilding}
                  className="
                    mt-7
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#17213d]
                    px-5
                    py-2.5
                    text-[10px]
                    font-medium
                    text-white
                    transition-all
                    hover:-translate-y-[1px]
                    hover:bg-[#0f172a]
                  "
                >
                  Start building
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Preview */}

              <div
                className="
                  overflow-hidden
                  rounded-[10px]
                  border
                  border-[#d9e2ed]
                  bg-white
                  shadow-[0_20px_60px_rgba(60,80,110,0.09)]
                "
              >
                <div className="flex h-8 items-center gap-1.5 border-b border-[#e7ecf2] bg-[#fafbfd] px-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d3dbe6]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d3dbe6]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d3dbe6]" />
                </div>

                <div className="grid min-h-[280px] grid-cols-[0.4fr_1fr]">
                  <div className="border-r border-[#e8edf3] bg-[#f8fafc] p-3">
                    <div className="h-2 w-16 rounded bg-[#64748b]" />

                    <div className="mt-6 space-y-2">
                      <div className="h-5 rounded bg-white" />
                      <div className="h-5 rounded bg-white" />
                      <div className="h-5 rounded bg-[#eaf5ff]" />
                      <div className="h-5 rounded bg-white" />
                    </div>
                  </div>

                  <div className="bg-[#f3f6fa] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-2 w-24 rounded bg-[#475569]" />
                        <div className="mt-1.5 h-1.5 w-32 rounded bg-[#dce3ec]" />
                      </div>

                      <div className="h-6 w-14 rounded bg-[#17213d]" />
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="rounded-md border border-[#e2e8f0] bg-white p-3"
                        >
                          <div className="h-1.5 w-10 rounded bg-[#d8e0ea]" />
                          <div className="mt-3 h-3 w-8 rounded bg-[#475569]" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 rounded-md border border-[#e2e8f0] bg-white p-3">
                      <div className="h-2 w-20 rounded bg-[#64748b]" />

                      <div className="mt-4 grid grid-cols-5 items-end gap-2">
                        {[30, 55, 40, 75, 62].map(
                          (height, index) => (
                            <div
                              key={index}
                              className="rounded-t bg-[#c9e5fb]"
                              style={{
                                height: `${height}px`,
                              }}
                            />
                          ),
                        )}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="h-14 rounded-md bg-white" />
                      <div className="h-14 rounded-md bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-2 bg-[#d9efff]" />
          </div>
        </div>
      </section>

      {/* ========================================================
          CAPABILITIES
      ======================================================== */}

      <section className="bg-[#fcfbf7]">
        <div className="mx-auto max-w-[1050px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
                Platform capabilities
              </p>

              <h2 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17213d] sm:text-[46px]">
                Everything you need
                <br />
                to build.
              </h2>

              <p className="mt-6 max-w-[380px] text-[11px] leading-5 text-[#718096]">
                Create digital experiences around your business, your users
                and the way your teams work.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
              {capabilities.map((capability) => (
                <div
                  key={capability}
                  className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-[#e4e9ef]
                    py-3
                  "
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef7ff]">
                    <Check
                      size={10}
                      className="text-[#6685ad]"
                    />
                  </div>

                  <span className="text-[10px] text-[#59677d]">
                    {capability}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECURITY / GOVERNANCE
      ======================================================== */}

      <section className="border-y border-[#e1e8f0] bg-white">
        <div className="mx-auto max-w-[1080px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-10 md:grid-cols-3">
            <div
              className="
                rounded-[12px]
                border
                border-[#dfe7f0]
                bg-[#f7fbff]
                p-6
                transition
                hover:shadow-[0_12px_35px_rgba(70,100,130,0.05)]
              "
            >
              <Lock
                size={18}
                strokeWidth={1.7}
                className="text-[#6482a8]"
              />

              <h3 className="mt-6 text-[14px] font-semibold text-[#26344d]">
                Security-minded
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-[#788598]">
                Build applications with security and organizational
                requirements considered from the start.
              </p>
            </div>

            <div
              className="
                rounded-[12px]
                border
                border-[#dfe7f0]
                bg-[#fcfbf7]
                p-6
                transition
                hover:shadow-[0_12px_35px_rgba(70,100,130,0.05)]
              "
            >
              <ShieldCheck
                size={18}
                strokeWidth={1.7}
                className="text-[#6482a8]"
              />

              <h3 className="mt-6 text-[14px] font-semibold text-[#26344d]">
                Governance
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-[#788598]">
                Establish clear workflows around how teams create and manage
                their applications.
              </p>
            </div>

            <div
              className="
                rounded-[12px]
                border
                border-[#dfe7f0]
                bg-[#f7fbff]
                p-6
                transition
                hover:shadow-[0_12px_35px_rgba(70,100,130,0.05)]
              "
            >
              <Network
                size={18}
                strokeWidth={1.7}
                className="text-[#6482a8]"
              />

              <h3 className="mt-6 text-[14px] font-semibold text-[#26344d]">
                Connected systems
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-[#788598]">
                Design applications that fit into the broader tools and data
                systems your organization already uses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          QUOTE
      ======================================================== */}

      <section className="relative overflow-hidden bg-[#f5faff]">
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[250px]
            w-[650px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[#dcefff]
            opacity-80
            blur-[80px]
          "
        />

        <div className="relative mx-auto max-w-[850px] px-6 py-24 text-center sm:px-8 lg:py-28">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <MessageSquare
              size={16}
              strokeWidth={1.7}
              className="text-[#6b83a5]"
            />
          </div>

          <blockquote className="mx-auto mt-7 max-w-[730px] text-[21px] font-medium leading-[1.3] tracking-[-0.025em] text-[#35445f] sm:text-[28px]">
            “The teams that move fastest aren't always the teams with the
            most resources. They're the teams that can turn ideas into action.”
          </blockquote>

          <div className="mt-7">
            <div className="mx-auto h-8 w-8 rounded-full bg-[#d9edff]" />

            <p className="mt-3 text-[9px] font-semibold text-[#64748b]">
              Enterprise builder
            </p>

            <p className="mt-1 text-[8px] text-[#9aa5b5]">
              Product & Technology
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          INTEGRATIONS
      ======================================================== */}

      <section className="bg-[#fcfbf7]">
        <div className="mx-auto max-w-[1050px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[600px] text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
              Integrations & ecosystem
            </p>

            <h2 className="mt-4 text-[35px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17213d] sm:text-[44px]">
              Fit ICOGON into
              <br />
              your existing stack.
            </h2>

            <p className="mt-5 text-[11px] leading-5 text-[#718096]">
              Connect applications, data and workflows so your teams can
              build around the systems they already use.
            </p>
          </div>

          <div
            className="
              mt-14
              rounded-[12px]
              border
              border-[#dfe6ef]
              bg-white
              p-5
              shadow-[0_15px_45px_rgba(50,70,100,0.045)]
              sm:p-7
            "
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                "Data",
                "Cloud",
                "APIs",
                "Authentication",
                "Analytics",
                "Automation",
                "Databases",
                "AI Models",
              ].map((item, index) => (
                <div
                  key={item}
                  className="
                    flex
                    h-20
                    flex-col
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#e8edf3]
                    bg-[#fafcff]
                    transition
                    hover:bg-[#f5faff]
                  "
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eef7ff] text-[#6c86aa]">
                    {index % 4 === 0 && <Database size={13} />}
                    {index % 4 === 1 && <Cloud size={13} />}
                    {index % 4 === 2 && <Code2 size={13} />}
                    {index % 4 === 3 && <Network size={13} />}
                  </div>

                  <span className="mt-2 text-[8px] font-medium text-[#758399]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          RESOURCES
      ======================================================== */}

      <section className="border-y border-[#e2e8f0] bg-[#f5faff]">
        <div className="mx-auto max-w-[1050px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
                Useful resources
              </p>

              <h2 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17213d]">
                Learn how teams
                <br />
                build with ICOGON.
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/guides")}
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                text-[10px]
                font-semibold
                text-[#566e91]
                transition
                hover:text-[#17213d]
              "
            >
              Explore guides
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate("/docs")}
              className="
                rounded-[12px]
                border
                border-[#dce5ef]
                bg-white
                p-5
                text-left
                transition-all
                hover:-translate-y-[2px]
                hover:border-[#cbd8e7]
                hover:shadow-[0_12px_35px_rgba(60,80,110,0.06)]
              "
            >
              <Code2
                size={16}
                strokeWidth={1.7}
                className="text-[#6684aa]"
              />

              <h3 className="mt-5 text-[12px] font-semibold text-[#26344d]">
                Documentation
              </h3>

              <p className="mt-3 text-[9px] leading-5 text-[#7b879a]">
                Understand the platform and explore how applications can be
                built.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/academy")}
              className="
                rounded-[12px]
                border
                border-[#dce5ef]
                bg-white
                p-5
                text-left
                transition-all
                hover:-translate-y-[2px]
                hover:border-[#cbd8e7]
                hover:shadow-[0_12px_35px_rgba(60,80,110,0.06)]
              "
            >
              <BarChart3
                size={16}
                strokeWidth={1.7}
                className="text-[#6684aa]"
              />

              <h3 className="mt-5 text-[12px] font-semibold text-[#26344d]">
                Academy
              </h3>

              <p className="mt-3 text-[9px] leading-5 text-[#7b879a]">
                Learn practical ways to use AI-assisted building in your
                workflow.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/customer-stories")}
              className="
                rounded-[12px]
                border
                border-[#dce5ef]
                bg-white
                p-5
                text-left
                transition-all
                hover:-translate-y-[2px]
                hover:border-[#cbd8e7]
                hover:shadow-[0_12px_35px_rgba(60,80,110,0.06)]
              "
            >
              <Users
                size={16}
                strokeWidth={1.7}
                className="text-[#6684aa]"
              />

              <h3 className="mt-5 text-[12px] font-semibold text-[#26344d]">
                Customer stories
              </h3>

              <p className="mt-3 text-[9px] leading-5 text-[#7b879a]">
                See how teams turn ideas, workflows and problems into useful
                digital experiences.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          FAQ
      ======================================================== */}

      <section className="bg-[#fcfbf7]">
        <div className="mx-auto max-w-[900px] px-6 py-20 sm:px-8 lg:py-24">
          <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
                FAQ
              </p>

              <h2 className="mt-4 text-[31px] font-semibold leading-[1] tracking-[-0.05em] text-[#17213d]">
                Frequently
                <br />
                asked questions
              </h2>
            </div>

            <div className="divide-y divide-[#dfe6ee] border-y border-[#dfe6ee]">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-5
                        py-5
                        text-left
                      "
                    >
                      <span className="text-[11px] font-medium text-[#34445f]">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={14}
                        strokeWidth={1.8}
                        className={`
                          shrink-0
                          text-[#94a3b8]
                          transition-transform
                          duration-200
                          ${isOpen ? "rotate-180" : ""}
                        `}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-5 pr-8">
                        <p className="text-[10px] leading-5 text-[#718096]">
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

      {/* ========================================================
          FINAL CTA
      ======================================================== */}

      <section className="relative overflow-hidden bg-[#f5faff]">
        <div
          className="
            pointer-events-none
            absolute
            bottom-[-150px]
            left-1/2
            h-[320px]
            w-[850px]
            -translate-x-1/2
            rounded-full
            bg-[#dcefff]
            opacity-80
            blur-[85px]
          "
        />

        <div className="relative mx-auto max-w-[850px] px-6 py-24 text-center sm:px-8 lg:py-32">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <Sparkles
              size={15}
              strokeWidth={1.7}
              className="text-[#6581a7]"
            />
          </div>

          <h2 className="mt-7 text-[37px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17213d] sm:text-[50px]">
            Ready to build
            <br />
            what's next?
          </h2>

          <p className="mx-auto mt-5 max-w-[450px] text-[11px] leading-5 text-[#718096]">
            Bring your team, your workflows and your biggest ideas to ICOGON
            and start building something real.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleSignup}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#17213d]
                px-6
                py-3
                text-[10px]
                font-medium
                text-white
                shadow-[0_10px_25px_rgba(23,33,61,0.12)]
                transition-all
                hover:-translate-y-[1px]
                hover:bg-[#0f172a]
              "
            >
              Get started
              <ArrowRight size={12} />
            </button>

            <button
              type="button"
              onClick={startBuilding}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-[#d5dfed]
                bg-white
                px-6
                py-3
                text-[10px]
                font-medium
                text-[#52627e]
                transition-all
                hover:-translate-y-[1px]
                hover:bg-[#fafdff]
              "
            >
              Start building
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer className="relative overflow-hidden border-t border-[#dfe6ef] bg-[#fcfbf7]">
        <div
          className="
            pointer-events-none
            absolute
            bottom-[-170px]
            left-1/2
            h-[300px]
            w-[850px]
            -translate-x-1/2
            rounded-full
            bg-[#e1f2ff]
            opacity-70
            blur-[85px]
          "
        />

        <div className="relative mx-auto max-w-[1180px] px-6 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand */}

            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#17213d] text-white">
                  <Sparkles size={13} />
                </div>

                <span className="text-[14px] font-semibold tracking-[-0.03em] text-[#17213d]">
                  ICOGON
                </span>
              </div>

              <p className="mt-5 max-w-[250px] text-[10px] leading-5 text-[#7b8799]">
                Build websites, applications and AI-powered experiences with
                your team.
              </p>

              <button
                type="button"
                onClick={startBuilding}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  text-[#425474]
                  transition
                  hover:text-[#17213d]
                "
              >
                Start building
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Product */}

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#94a3b8]">
                Product
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-[#718096]">
                <button
                  type="button"
                  onClick={startBuilding}
                  className="block transition hover:text-[#17213d]"
                >
                  Builder
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/templates")}
                  className="block transition hover:text-[#17213d]"
                >
                  Templates
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/connectors")}
                  className="block transition hover:text-[#17213d]"
                >
                  Connectors
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/docs")}
                  className="block transition hover:text-[#17213d]"
                >
                  Docs
                </button>
              </div>
            </div>

            {/* Enterprise */}

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#94a3b8]">
                Enterprise
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-[#718096]">
                <button
                  type="button"
                  onClick={() => navigate("/community")}
                  className="block transition hover:text-[#17213d]"
                >
                  Community
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/pricing")}
                  className="block transition hover:text-[#17213d]"
                >
                  Pricing
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/security")}
                  className="block transition hover:text-[#17213d]"
                >
                  Security
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/enterprise")}
                  className="block transition hover:text-[#17213d]"
                >
                  Enterprise
                </button>
              </div>
            </div>

            {/* Resources */}

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#94a3b8]">
                Resources
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-[#718096]">
                <button
                  type="button"
                  onClick={() => navigate("/blog")}
                  className="block transition hover:text-[#17213d]"
                >
                  Blog
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/academy")}
                  className="block transition hover:text-[#17213d]"
                >
                  Academy
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/guides")}
                  className="block transition hover:text-[#17213d]"
                >
                  Guides
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/customer-stories")}
                  className="block transition hover:text-[#17213d]"
                >
                  Customer stories
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}

          <div
            className="
              mt-14
              flex
              flex-col
              gap-3
              border-t
              border-[#dfe6ef]
              pt-6
              text-[9px]
              text-[#a0aaba]
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p>
              © {new Date().getFullYear()} ICOGON. All rights reserved.
            </p>

            <div className="flex gap-5">
              <span>Privacy</span>
              <span>Terms</span>
              <button
                type="button"
                onClick={() => navigate("/security")}
                className="transition hover:text-[#17213d]"
              >
                Security
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnterprisePage;