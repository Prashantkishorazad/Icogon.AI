import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Code2,
  Database,
  Globe,
  Layers3,
  MessageCircle,
  Plug,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

interface Connector {
  name: string;
  description: string;
  icon: React.ElementType;
}

interface ConnectorCategory {
  title: string;
  description: string;
  items: Connector[];
}

const connectorCategories: ConnectorCategory[] = [
  {
    title: "AI & Automation",
    description: "Bring AI models and automation into your products.",
    items: [
      {
        name: "OpenAI",
        description: "AI models and intelligent workflows",
        icon: Sparkles,
      },
      {
        name: "Anthropic",
        description: "Build with advanced AI models",
        icon: Sparkles,
      },
      {
        name: "Google AI",
        description: "Connect Google's AI capabilities",
        icon: Sparkles,
      },
      {
        name: "Groq",
        description: "Fast AI inference",
        icon: Zap,
      },
      {
        name: "Replicate",
        description: "Run AI models through APIs",
        icon: Layers3,
      },
      {
        name: "Hugging Face",
        description: "Access models and datasets",
        icon: Cloud,
      },
    ],
  },
  {
    title: "Databases",
    description: "Store, query, and manage application data.",
    items: [
      {
        name: "Supabase",
        description: "Database, auth, and storage",
        icon: Database,
      },
      {
        name: "PostgreSQL",
        description: "Powerful relational database",
        icon: Database,
      },
      {
        name: "MySQL",
        description: "Connect your MySQL database",
        icon: Database,
      },
      {
        name: "MongoDB",
        description: "Flexible document database",
        icon: Database,
      },
      {
        name: "Firebase",
        description: "Backend services for applications",
        icon: Cloud,
      },
      {
        name: "Redis",
        description: "Fast in-memory data",
        icon: Database,
      },
    ],
  },
  {
    title: "Communication",
    description: "Keep users and teams connected.",
    items: [
      {
        name: "Slack",
        description: "Send messages and notifications",
        icon: MessageCircle,
      },
      {
        name: "Discord",
        description: "Connect communities and bots",
        icon: MessageCircle,
      },
      {
        name: "Twilio",
        description: "SMS and communication APIs",
        icon: MessageCircle,
      },
      {
        name: "Resend",
        description: "Send transactional emails",
        icon: MessageCircle,
      },
      {
        name: "SendGrid",
        description: "Email delivery platform",
        icon: MessageCircle,
      },
      {
        name: "WhatsApp",
        description: "Connect customer conversations",
        icon: MessageCircle,
      },
    ],
  },
  {
    title: "Productivity",
    description: "Connect the tools your team already uses.",
    items: [
      {
        name: "Google Sheets",
        description: "Read and write spreadsheet data",
        icon: Layers3,
      },
      {
        name: "Google Drive",
        description: "Access files and documents",
        icon: Cloud,
      },
      {
        name: "Notion",
        description: "Work with pages and databases",
        icon: Layers3,
      },
      {
        name: "Airtable",
        description: "Connect structured workspace data",
        icon: Database,
      },
      {
        name: "Microsoft 365",
        description: "Connect Microsoft productivity tools",
        icon: Cloud,
      },
      {
        name: "Linear",
        description: "Connect product workflows",
        icon: Check,
      },
    ],
  },
  {
    title: "Payments",
    description: "Build payment experiences into your products.",
    items: [
      {
        name: "Stripe",
        description: "Payments and subscriptions",
        icon: Zap,
      },
      {
        name: "PayPal",
        description: "Online payments",
        icon: Zap,
      },
      {
        name: "Razorpay",
        description: "Payments for Indian businesses",
        icon: Zap,
      },
      {
        name: "Paddle",
        description: "Billing and subscriptions",
        icon: Zap,
      },
      {
        name: "Lemon Squeezy",
        description: "Payments and digital products",
        icon: Zap,
      },
      {
        name: "Cashfree",
        description: "Indian payment infrastructure",
        icon: Zap,
      },
    ],
  },
  {
    title: "Developer Tools",
    description: "Bring your development workflow into your apps.",
    items: [
      {
        name: "GitHub",
        description: "Repositories and development workflows",
        icon: Code2,
      },
      {
        name: "GitLab",
        description: "Source control and CI/CD",
        icon: Code2,
      },
      {
        name: "Vercel",
        description: "Deploy modern web applications",
        icon: Globe,
      },
      {
        name: "Cloudflare",
        description: "Infrastructure and edge services",
        icon: Cloud,
      },
      {
        name: "Sentry",
        description: "Application monitoring",
        icon: ShieldCheck,
      },
      {
        name: "Postman",
        description: "Work with APIs",
        icon: Plug,
      },
    ],
  },
];

const featuredConnectors = [
  {
    title: "The Google Suite is live",
    description:
      "Connect Google services and bring your existing workflow directly into your ICOGON projects.",
    icon: Cloud,
    gradient:
      "bg-[linear-gradient(135deg,#f7f7f2_0%,#ffffff_45%,#c8d6ff_100%)]",
  },
  {
    title: "Your tools, your workflow",
    description:
      "Connect the services you already use instead of rebuilding everything from scratch.",
    icon: Layers3,
    gradient:
      "bg-[linear-gradient(135deg,#ffffff_0%,#f8f3f5_45%,#e9d9e7_100%)]",
  },
  {
    title: "Build what you need",
    description:
      "Combine connectors with AI and your own application logic to create powerful workflows.",
    icon: Code2,
    gradient:
      "bg-[linear-gradient(135deg,#fff9f5_0%,#ffffff_45%,#f0e1da_100%)]",
  },
  {
    title: "Bring your data together",
    description:
      "Move information between your services and create applications around your existing data.",
    icon: Database,
    gradient:
      "bg-[linear-gradient(135deg,#f8f8f5_0%,#ffffff_45%,#e2ddf0_100%)]",
  },
];

const faqs = [
  {
    question: "What are connectors?",
    answer:
      "Connectors let your ICOGON projects communicate with external services, APIs, databases, and tools.",
  },
  {
    question: "Do I need to code to use a connector?",
    answer:
      "ICOGON is designed to make integrations easier through an AI-first workflow. The exact setup can depend on the service you connect.",
  },
  {
    question: "Can I connect my own API?",
    answer:
      "Custom API connections can be incorporated into application workflows. The exact configuration depends on the API and its authentication requirements.",
  },
  {
    question: "Are connectors available for every project?",
    answer:
      "Connector availability and functionality can depend on the integration and the ICOGON product capabilities available for your project.",
  },
];

const ConnectorsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-slate-950">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        onLogin={() => navigate("/login")}
        onSignup={() => navigate("/signup")}
      />

      <div className="h-[72px]" />

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden px-6 pb-20 pt-20 sm:pb-24 lg:pt-24">
          {/* Decorative connector nodes */}

          <div className="pointer-events-none absolute inset-0">
            <div
              className="
                absolute
                left-[12%]
                top-[95px]
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-[0_8px_25px_rgba(15,23,42,0.08)]
              "
            >
              <Cloud size={18} className="text-slate-500" />
            </div>

            <div
              className="
                absolute
                left-[22%]
                top-[185px]
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-sm
              "
            >
              <Database size={16} className="text-slate-500" />
            </div>

            <div
              className="
                absolute
                right-[18%]
                top-[100px]
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-[0_8px_25px_rgba(15,23,42,0.08)]
              "
            >
              <Sparkles size={18} className="text-slate-500" />
            </div>

            <div
              className="
                absolute
                right-[10%]
                top-[205px]
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-sm
              "
            >
              <MessageCircle
                size={16}
                className="text-slate-500"
              />
            </div>

            {/* dotted connection lines */}

            <div className="absolute left-[17%] top-[130px] h-px w-[80px] border-t border-dashed border-slate-300 rotate-[28deg]" />

            <div className="absolute right-[20%] top-[140px] h-px w-[80px] border-t border-dashed border-slate-300 -rotate-[24deg]" />
          </div>

          <div className="relative mx-auto max-w-[900px] text-center">
            <div
              className="
                mx-auto
                mb-7
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
              "
            >
              <Plug
                size={20}
                strokeWidth={1.7}
              />
            </div>

            <h1
              className="
                text-[46px]
                font-semibold
                leading-[0.98]
                tracking-[-0.055em]
                sm:text-[62px]
                lg:text-[72px]
              "
            >
              Build from what
              <br />
              you already use.
            </h1>

            <p
              className="
                mx-auto
                mt-6
                max-w-[590px]
                text-[15px]
                leading-6
                text-slate-500
                sm:text-[17px]
              "
            >
              Connect your favorite tools, data, and services
              to ICOGON and turn your existing workflow into
              something you can build on.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/builder"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#20242f]
                  px-5
                  py-3
                  text-[12px]
                  font-medium
                  text-white
                  shadow-lg
                  shadow-slate-900/10
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#111827]
                "
              >
                Start building

                <ArrowRight size={14} />
              </Link>

              <a
                href="#connectors"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-3
                  text-[12px]
                  font-medium
                  text-slate-700
                  transition-all
                  hover:border-slate-300
                "
              >
                Explore connectors

                <ChevronDown size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURED WORKFLOW SECTIONS
        ===================================================== */}

        <section className="mx-auto max-w-[1050px] px-6 pb-24 lg:px-10">
          <div className="space-y-16">
            {featuredConnectors.map((item, index) => {
              const Icon = item.icon;
              const reverse = index % 2 === 1;

              return (
                <div
                  key={item.title}
                  className={`
                    grid
                    items-center
                    gap-8
                    lg:grid-cols-2
                    lg:gap-16
                    ${reverse ? "lg:[&>*:first-child]:order-2" : ""}
                  `}
                >
                  {/* Visual */}

                  <div
                    className={`
                      relative
                      min-h-[245px]
                      overflow-hidden
                      rounded-[6px]
                      border
                      border-slate-200
                      ${item.gradient}
                    `}
                  >
                    <div
                      className="
                        absolute
                        left-[14%]
                        top-[16%]
                        h-[120px]
                        w-[72%]
                        rounded-xl
                        border
                        border-white/80
                        bg-white/65
                        shadow-[0_15px_40px_rgba(15,23,42,0.08)]
                        backdrop-blur
                      "
                    >
                      <div className="flex items-center gap-1.5 border-b border-white/70 px-4 py-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Icon size={15} />
                          </div>

                          <div className="h-2 w-[42%] rounded-full bg-slate-200" />
                        </div>

                        <div className="mt-5 space-y-2">
                          <div className="h-2 w-full rounded-full bg-white/80" />
                          <div className="h-2 w-[78%] rounded-full bg-white/80" />
                        </div>
                      </div>
                    </div>

                    <div
                      className="
                        absolute
                        bottom-5
                        right-5
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-white/80
                        bg-white/70
                        shadow-sm
                        backdrop-blur
                      "
                    >
                      <Icon size={17} />
                    </div>
                  </div>

                  {/* Copy */}

                  <div className={reverse ? "lg:order-1" : ""}>
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                      "
                    >
                      <Icon size={18} strokeWidth={1.7} />
                    </div>

                    <h2
                      className="
                        mt-5
                        text-[27px]
                        font-semibold
                        leading-[1.12]
                        tracking-[-0.035em]
                        sm:text-[31px]
                      "
                    >
                      {item.title}
                    </h2>

                    <p
                      className="
                        mt-4
                        max-w-[450px]
                        text-[13px]
                        leading-6
                        text-slate-500
                      "
                    >
                      {item.description}
                    </p>

                    <Link
                      to="#connectors"
                      className="
                        mt-6
                        inline-flex
                        items-center
                        gap-1.5
                        text-[12px]
                        font-semibold
                        text-slate-700
                      "
                    >
                      Learn more

                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            CONNECTOR DIRECTORY
        ===================================================== */}

        <section
          id="connectors"
          className="border-y border-slate-200/80 bg-white"
        >
          <div className="mx-auto max-w-[1050px] px-6 py-20 lg:px-10">
            <div
              className="
                flex
                flex-col
                gap-7
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                  "
                >
                  Explore
                </p>

                <h2
                  className="
                    mt-2
                    text-[32px]
                    font-semibold
                    tracking-[-0.04em]
                  "
                >
                  Browse every connector
                </h2>

                <p
                  className="
                    mt-3
                    max-w-[560px]
                    text-[13px]
                    leading-6
                    text-slate-500
                  "
                >
                  Find the services you need and connect them
                  to your ICOGON workflow.
                </p>
              </div>

              {/* Search */}

              <div
                className="
                  flex
                  h-11
                  w-full
                  max-w-[280px]
                  items-center
                  gap-2.5
                  rounded-xl
                  border
                  border-slate-200
                  bg-[#fbfaf8]
                  px-3.5
                "
              >
                <Search
                  size={16}
                  className="text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search connectors..."
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    text-[12px]
                    outline-none
                    placeholder:text-slate-400
                  "
                />
              </div>
            </div>

            {/* Category sections */}

            <div className="mt-12 space-y-14">
              {connectorCategories.map((category) => (
                <div key={category.title}>
                  <div className="mb-5">
                    <h3
                      className="
                        text-[18px]
                        font-semibold
                        tracking-[-0.02em]
                      "
                    >
                      {category.title}
                    </h3>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {category.description}
                    </p>
                  </div>

                  <div
                    className="
                      grid
                      gap-x-4
                      gap-y-1
                      sm:grid-cols-2
                      lg:grid-cols-3
                    "
                  >
                    {category.items.map((connector) => {
                      const Icon = connector.icon;

                      return (
                        <Link
                          key={connector.name}
                          to="#"
                          className="
                            group
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-3
                            transition-colors
                            hover:bg-slate-50
                          "
                        >
                          <div
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              text-slate-600
                              shadow-sm
                            "
                          >
                            <Icon
                              size={15}
                              strokeWidth={1.7}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className="
                                text-[12px]
                                font-semibold
                                text-slate-800
                              "
                            >
                              {connector.name}
                            </p>

                            <p
                              className="
                                mt-0.5
                                truncate
                                text-[10px]
                                text-slate-400
                              "
                            >
                              {connector.description}
                            </p>
                          </div>

                          <ChevronRight
                            size={13}
                            className="
                              shrink-0
                              text-slate-300
                              opacity-0
                              transition-all
                              group-hover:translate-x-0.5
                              group-hover:opacity-100
                            "
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            CUSTOM CONNECTOR CTA
        ===================================================== */}

        <section className="mx-auto max-w-[1050px] px-6 py-20 lg:px-10">
          <div
            className="
              relative
              overflow-hidden
              rounded-[22px]
              bg-[#20242f]
              px-7
              py-14
              sm:px-12
            "
          >
            <div
              className="
                absolute
                -bottom-28
                left-[8%]
                h-[180px]
                w-[42%]
                rounded-full
                bg-blue-500/30
                blur-[70px]
              "
            />

            <div
              className="
                absolute
                -bottom-28
                right-[5%]
                h-[180px]
                w-[42%]
                rounded-full
                bg-fuchsia-500/30
                blur-[70px]
              "
            />

            <div className="relative">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                  text-white
                "
              >
                <Plug size={20} />
              </div>

              <h2
                className="
                  mt-6
                  max-w-[650px]
                  text-[32px]
                  font-semibold
                  leading-tight
                  tracking-[-0.035em]
                  text-white
                  sm:text-[40px]
                "
              >
                Bring your stack.
                <br />
                Ship the tool.
              </h2>

              <p
                className="
                  mt-4
                  max-w-[570px]
                  text-[13px]
                  leading-6
                  text-slate-400
                "
              >
                Connect the tools you already rely on and
                create workflows that work around your business.
              </p>

              <Link
                to="/builder"
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  py-3
                  text-[12px]
                  font-medium
                  text-slate-900
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-slate-100
                "
              >
                Start building

                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            FAQ
        ===================================================== */}

        <section className="mx-auto max-w-[760px] px-6 pb-24 lg:px-10">
          <div className="text-center">
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-slate-400
              "
            >
              FAQ
            </p>

            <h2
              className="
                mt-2
                text-[30px]
                font-semibold
                tracking-[-0.035em]
              "
            >
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group py-5"
              >
                <summary
                  className="
                    flex
                    cursor-pointer
                    list-none
                    items-center
                    justify-between
                    gap-5
                    text-[13px]
                    font-medium
                    text-slate-800
                  "
                >
                  {faq.question}

                  <ChevronDown
                    size={15}
                    className="
                      shrink-0
                      text-slate-400
                      transition-transform
                      duration-200
                      group-open:rotate-180
                    "
                  />
                </summary>

                <p
                  className="
                    mt-3
                    max-w-[650px]
                    text-[12px]
                    leading-6
                    text-slate-500
                  "
                >
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* =====================================================
            FINAL CTA + GRADIENT
        ===================================================== */}

        <section className="relative overflow-hidden pb-0">
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-[400px]
              bg-[radial-gradient(ellipse_at_center,#ffffff_8%,rgba(91,151,255,0.38)_44%,rgba(255,73,198,0.65)_76%,rgba(255,61,72,0.85)_100%)]
            "
          />

          <div className="relative mx-auto max-w-[1050px] px-6 pb-16 pt-8 text-center">
            <h2
              className="
                text-[25px]
                font-semibold
                tracking-[-0.035em]
                sm:text-[30px]
              "
            >
              Ready to bring your idea to life?
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-[500px]
                text-[12px]
                leading-5
                text-slate-500
              "
            >
              Connect your tools, describe what you want,
              and start building with ICOGON AI.
            </p>

            <Link
              to="/builder"
              className="
                mx-auto
                mt-7
                flex
                max-w-[430px]
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-left
                shadow-[0_14px_35px_rgba(15,23,42,0.12)]
                transition-all
                hover:-translate-y-0.5
              "
            >
              <Sparkles
                size={15}
                className="shrink-0 text-slate-400"
              />

              <span className="flex-1 text-[10px] text-slate-400">
                Ask ICOGON to create an app...
              </span>

              <span
                className="
                  flex
                  items-center
                  gap-1
                  text-[10px]
                  font-medium
                  text-slate-500
                "
              >
                Build

                <ArrowRight size={11} />
              </span>
            </Link>
          </div>

          {/* ===================================================
              FOOTER
          =================================================== */}

          <footer className="relative mx-auto mb-8 max-w-[1220px] px-4 sm:px-6">
            <div
              className="
                rounded-[10px]
                border
                border-white/80
                bg-[#f8f6ef]
                px-7
                py-9
                shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                sm:px-10
              "
            >
              <div
                className="
                  grid
                  gap-9
                  sm:grid-cols-2
                  lg:grid-cols-[1.1fr_repeat(4,1fr)]
                "
              >
                <div>
                  <Link
                    to="/"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-[17px]
                      font-semibold
                      tracking-[-0.04em]
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#20242f]
                        text-[11px]
                        text-white
                      "
                    >
                      I
                    </span>

                    ICOGON
                  </Link>

                  <p
                    className="
                      mt-4
                      max-w-[190px]
                      text-[10px]
                      leading-5
                      text-slate-400
                    "
                  >
                    Build websites, applications, and
                    AI-powered products with ICOGON.
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-900">
                    Company
                  </p>

                  <div className="mt-4 space-y-2">
                    {["About", "Careers", "Contact", "Security"].map(
                      (item) => (
                        <Link
                          key={item}
                          to="#"
                          className="
                            block
                            text-[9px]
                            text-slate-500
                            hover:text-slate-900
                          "
                        >
                          {item}
                        </Link>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-900">
                    Product
                  </p>

                  <div className="mt-4 space-y-2">
                    {[
                      "Pricing",
                      "AI Builder",
                      "Templates",
                      "Changelog",
                    ].map((item) => (
                      <Link
                        key={item}
                        to="#"
                        className="
                          block
                          text-[9px]
                          text-slate-500
                          hover:text-slate-900
                        "
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-900">
                    Resources
                  </p>

                  <div className="mt-4 space-y-2">
                    {[
                      ["Blog", "/blog"],
                      ["Guides", "/guides"],
                      ["Academy", "/academy"],
                      ["Docs", "/docs"],
                      ["Templates", "/templates"],
                      ["Connectors", "/connectors"],
                    ].map(([label, path]) => (
                      <Link
                        key={label}
                        to={path}
                        className="
                          block
                          text-[9px]
                          text-slate-500
                          hover:text-slate-900
                        "
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-900">
                    Legal
                  </p>

                  <div className="mt-4 space-y-2">
                    {[
                      "Privacy Policy",
                      "Terms of Service",
                      "Cookie Policy",
                      "Security",
                    ].map((item) => (
                      <Link
                        key={item}
                        to="#"
                        className="
                          block
                          text-[9px]
                          text-slate-500
                          hover:text-slate-900
                        "
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="
                  mt-9
                  flex
                  flex-col
                  gap-2
                  border-t
                  border-slate-200
                  pt-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <span className="text-[9px] text-slate-400">
                  © {new Date().getFullYear()} ICOGON. All rights reserved.
                </span>

                <span className="text-[9px] text-slate-400">
                  Built with ICOGON AI
                </span>
              </div>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default ConnectorsPage;