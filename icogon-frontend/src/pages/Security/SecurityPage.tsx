import {
  ArrowRight,
  ChevronDown,
  CircleCheck,
  Code2,
  Database,
  Eye,
  FileCheck2,
  Globe2,
  LockKeyhole,
  ScanSearch,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const SecurityPage = () => {
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ============================================================
  // FAQ
  // ============================================================

  const faqs = [
    {
      question: "How does ICOGON approach security?",
      answer:
        "ICOGON is designed around security-conscious application development, access controls, protected infrastructure, secure secrets handling and continuous monitoring. Security requirements should be considered throughout the development and deployment lifecycle.",
    },
    {
      question: "How are application secrets handled?",
      answer:
        "Application secrets should be stored through protected environment and secret-management mechanisms rather than exposed directly in application code or public interfaces.",
    },
    {
      question: "Does ICOGON support secure team access?",
      answer:
        "Team-oriented workflows can use controlled access and organization-level permissions so that projects and internal resources can be managed according to the needs of the organization.",
    },
    {
      question: "How does ICOGON handle data?",
      answer:
        "Data handling depends on the specific application, integrations and infrastructure configuration being used. Organizations should review their architecture and data requirements before deploying sensitive workloads.",
    },
    {
      question: "Does ICOGON scan generated applications?",
      answer:
        "Security checks can be incorporated into the application development workflow, including dependency review, configuration checks and other automated validation appropriate to the project.",
    },
    {
      question: "Can I report a security vulnerability?",
      answer:
        "Yes. If you discover a potential security issue involving ICOGON, contact the security team so the issue can be reviewed responsibly.",
    },
  ];

  // ============================================================
  // ACTIONS
  // ============================================================

  const startBuilding = () => {
    navigate("/builder");
  };

  const contactSecurity = () => {
    window.location.href =
      "mailto:security@icogon.com?subject=ICOGON%20Security%20Question";
  };

  const reportSecurityIssue = () => {
    window.location.href =
      "mailto:security@icogon.com?subject=Security%20Vulnerability%20Report";
  };

  // ============================================================
  // SECURITY CONTROLS
  // ============================================================

  const enterpriseControls = [
    {
      icon: UserCheck,
      label: "Access and control",
      title: "Controlled access",
      description:
        "Keep project and organizational access structured around the people and workflows that need it.",
    },
    {
      icon: Code2,
      label: "Build",
      title: "Guardrails for building & publishing",
      description:
        "Security-aware development practices help reduce avoidable risks across the build and publishing workflow.",
    },
    {
      icon: LockKeyhole,
      label: "Secrets",
      title: "Secrets are handled securely",
      description:
        "Keep sensitive credentials and configuration values away from source code and public application interfaces.",
    },
    {
      icon: Globe2,
      label: "Data",
      title: "Data residency",
      description:
        "Plan application architecture and infrastructure around the geographic and regulatory requirements of your organization.",
    },
    {
      icon: ShieldCheck,
      label: "Protection",
      title: "Encryption by design",
      description:
        "Use encrypted connections and protected storage mechanisms as part of a security-conscious application architecture.",
    },
    {
      icon: Eye,
      label: "Monitoring",
      title: "Continuous monitoring & abuse detection",
      description:
        "Monitoring and detection workflows help identify unusual activity and support a more secure operating environment.",
    },
    {
      icon: ScanSearch,
      label: "AI",
      title: "Automatic security scanning",
      description:
        "Automated checks can help identify configuration, dependency and application-level security concerns earlier.",
    },
    {
      icon: Server,
      label: "Infrastructure",
      title: "Protected infrastructure",
      description:
        "Production infrastructure should be isolated, access-controlled and maintained using security-conscious operational practices.",
    },
  ];

  // ============================================================
  // BUILDER SECURITY
  // ============================================================

  const founderSecurity = [
    {
      icon: Shield,
      title: "AI-powered protection",
      description:
        "Build with security-conscious workflows that help you think about protection while developing your product.",
    },
    {
      icon: FileCheck2,
      title: "Security documentation",
      description:
        "Understand the security considerations behind your application and infrastructure before you publish.",
    },
    {
      icon: ScanSearch,
      title: "Find vulnerabilities before they find you",
      description:
        "Use automated checks and responsible review practices to identify potential weaknesses earlier in the development process.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf4] text-[#17213d]">
      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <Navbar
        onLogin={() => navigate("/login")}
        onSignup={() => navigate("/signup")}
      />

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden bg-[#f3f8ff]">
        {/* Soft blue center */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[50px]
            h-[520px]
            w-[850px]
            -translate-x-1/2
            rounded-full
            bg-[#dcefff]
            opacity-75
            blur-[110px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            left-[-180px]
            top-[280px]
            h-[300px]
            w-[400px]
            rounded-full
            bg-[#e7f4ff]
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
            h-[300px]
            w-[400px]
            rounded-full
            bg-[#e9e5ff]
            opacity-55
            blur-[100px]
          "
        />

        <div
          className="
            relative
            mx-auto
            max-w-[1200px]
            px-6
            pb-20
            pt-20
            sm:px-8
            lg:px-10
            lg:pb-24
            lg:pt-28
          "
        >
          <div className="mx-auto max-w-[780px] text-center">
            {/* Badge */}

            <div
              className="
                mx-auto
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#d6e3f2]
                bg-white/85
                px-3.5
                py-1.5
                shadow-sm
                backdrop-blur
              "
            >
              <ShieldCheck
                size={13}
                strokeWidth={1.8}
                className="text-[#5684b8]"
              />

              <span
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-[#68809e]
                "
              >
                ICOGON Security
              </span>
            </div>

            {/* Main heading */}

            <h1
              className="
                mt-7
                text-[48px]
                font-semibold
                leading-[0.94]
                tracking-[-0.065em]
                text-[#17213d]
                sm:text-[62px]
                lg:text-[72px]
              "
            >
              Secure by design.
            </h1>

            {/* Bigger subheading */}

            <p
              className="
                mx-auto
                mt-6
                max-w-[620px]
                text-[13px]
                leading-6
                text-[#65748c]
                sm:text-[14px]
                sm:leading-6
              "
            >
              Security-conscious infrastructure, protected workflows and
              responsible development practices designed to help you build
              with confidence.
            </p>

            {/* Buttons */}

            <div className="mt-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={startBuilding}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#17213d]
                  px-6
                  py-3
                  text-[10px]
                  font-medium
                  text-white
                  shadow-[0_10px_25px_rgba(23,33,61,0.12)]
                  transition
                  hover:-translate-y-[1px]
                  hover:bg-[#0f172a]
                "
              >
                Start building
                <ArrowRight size={12} />
              </button>

              <button
                type="button"
                onClick={contactSecurity}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-[#d8e2ef]
                  bg-white/85
                  px-6
                  py-3
                  text-[10px]
                  font-medium
                  text-[#52657f]
                  transition
                  hover:bg-white
                "
              >
                Contact security
              </button>
            </div>
          </div>

          {/* ====================================================
              HERO SECURITY VISUAL
          ==================================================== */}

          <div className="relative mx-auto mt-16 max-w-[900px]">
            <div
              className="
                pointer-events-none
                absolute
                bottom-[-35px]
                left-1/2
                h-28
                w-[75%]
                -translate-x-1/2
                rounded-full
                bg-[#cce9ff]
                opacity-70
                blur-[45px]
              "
            />

            <div
              className="
                relative
                rounded-[18px]
                border
                border-white
                bg-white/70
                p-3
                shadow-[0_30px_90px_rgba(58,103,153,0.13)]
                backdrop-blur-xl
              "
            >
              <div
                className="
                  overflow-hidden
                  rounded-[13px]
                  border
                  border-[#dce7f3]
                  bg-[#f8fbff]
                "
              >
                {/* Browser */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-[#e3eaf2]
                    bg-white
                    px-4
                    py-3
                  "
                >
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#d6dee9]" />
                    <span className="h-2 w-2 rounded-full bg-[#d6dee9]" />
                    <span className="h-2 w-2 rounded-full bg-[#d6dee9]" />
                  </div>

                  <div
                    className="
                      rounded-full
                      border
                      border-[#e2e9f1]
                      bg-[#f7f9fc]
                      px-10
                      py-1.5
                      text-[7px]
                      text-[#9aa8ba]
                    "
                  >
                    app.icogon.ai
                  </div>

                  <ShieldCheck
                    size={13}
                    className="text-[#7594b7]"
                  />
                </div>

                {/* Dashboard */}

                <div className="grid gap-3 p-4 sm:grid-cols-[1fr_1.5fr]">
                  <div
                    className="
                      rounded-xl
                      border
                      border-[#e0e8f1]
                      bg-white
                      p-5
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-[#edf5ff]
                          text-[#6088b4]
                        "
                      >
                        <ShieldCheck
                          size={14}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div>
                        <div className="text-[9px] font-semibold text-[#3d4d66]">
                          Security status
                        </div>

                        <div className="mt-0.5 text-[8px] text-[#8a98a9]">
                          Protected environment
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2.5">
                      {[
                        "Access controls",
                        "Secrets protection",
                        "Infrastructure",
                        "Monitoring",
                      ].map((item) => (
                        <div
                          key={item}
                          className="
                            flex
                            items-center
                            justify-between
                            rounded-lg
                            bg-[#f7f9fc]
                            px-3
                            py-2.5
                          "
                        >
                          <span className="text-[8px] text-[#66758b]">
                            {item}
                          </span>

                          <CircleCheck
                            size={12}
                            className="text-[#7393b7]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="
                      relative
                      min-h-[225px]
                      overflow-hidden
                      rounded-xl
                      border
                      border-[#e0e8f1]
                      bg-gradient-to-br
                      from-white
                      via-[#f7fbff]
                      to-[#e7f2ff]
                    "
                  >
                    <div
                      className="
                        absolute
                        left-1/2
                        top-1/2
                        h-40
                        w-40
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-[#9bcaff]/25
                        blur-[50px]
                      "
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="
                          flex
                          h-24
                          w-24
                          items-center
                          justify-center
                          rounded-[25px]
                          border
                          border-[#d6e4f2]
                          bg-white/95
                          shadow-[0_20px_50px_rgba(65,105,145,0.12)]
                        "
                      >
                        <LockKeyhole
                          size={32}
                          strokeWidth={1.35}
                          className="text-[#668ab3]"
                        />
                      </div>
                    </div>

                    <div
                      className="
                        absolute
                        bottom-4
                        left-4
                        rounded-full
                        bg-white/90
                        px-3
                        py-1.5
                        text-[7px]
                        font-medium
                        text-[#71839b]
                        shadow-sm
                      "
                    >
                      Secure infrastructure
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          TRUST STRIP
          Small labels intentionally unchanged
      ======================================================== */}

      <section className="bg-[#fbfaf4]">
        <div className="mx-auto max-w-[1050px] px-6 py-12 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-7 opacity-70 sm:grid-cols-4">
            {[
              "Secure by design",
              "Protected infrastructure",
              "Responsible development",
              "Continuous monitoring",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-center text-center"
              >
                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-[#8b98a8]
                  "
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          ENTERPRISE SECURITY CONTROLS
      ======================================================== */}

      <section className="bg-[#fbfaf4]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-[650px]">
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#8a98aa]
              "
            >
              Enterprise security
            </p>

            <h2
              className="
                mt-4
                text-[34px]
                font-semibold
                leading-[0.98]
                tracking-[-0.055em]
                text-[#17213d]
                sm:text-[45px]
              "
            >
              Security controls
              <br />
              built into the workflow.
            </h2>

            {/* Bigger section subheading */}

            <p
              className="
                mt-5
                max-w-[620px]
                text-[12px]
                leading-6
                text-[#748196]
                sm:text-[13px]
              "
            >
              From access and secrets to infrastructure and monitoring,
              security considerations should follow your application through
              the entire development lifecycle.
            </p>
          </div>

          {/* Control cards */}

          <div className="mt-12 grid gap-3 md:grid-cols-2">
            {enterpriseControls.map((control, index) => {
              const Icon = control.icon;

              return (
                <div
                  key={control.title}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[12px]
                    border
                    border-[#e0e6ed]
                    bg-white
                    p-6
                    transition-all
                    duration-300
                    hover:-translate-y-[2px]
                    hover:shadow-[0_18px_45px_rgba(53,79,108,0.07)]
                  "
                >
                  {index === 0 && (
                    <div
                      className="
                        pointer-events-none
                        absolute
                        right-[-70px]
                        top-[-70px]
                        h-[190px]
                        w-[190px]
                        rounded-full
                        bg-[#c7e2ff]/35
                        blur-[50px]
                      "
                    />
                  )}

                  {index === 5 && (
                    <div
                      className="
                        pointer-events-none
                        absolute
                        bottom-[-80px]
                        right-[-40px]
                        h-[180px]
                        w-[220px]
                        rounded-full
                        bg-[#ead8ff]/20
                        blur-[55px]
                      "
                    />
                  )}

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-[#dce6f0]
                          bg-[#f7fbff]
                          text-[#6387b0]
                        "
                      >
                        <Icon
                          size={15}
                          strokeWidth={1.7}
                        />
                      </div>

                      <span
                        className="
                          text-[7px]
                          font-semibold
                          uppercase
                          tracking-[0.12em]
                          text-[#a0aaba]
                        "
                      >
                        {control.label}
                      </span>
                    </div>

                    <h3
                      className="
                        mt-6
                        text-[14px]
                        font-semibold
                        tracking-[-0.02em]
                        text-[#35445d]
                      "
                    >
                      {control.title}
                    </h3>

                    {/* Bigger card description */}

                    <p
                      className="
                        mt-3
                        max-w-[470px]
                        text-[11px]
                        leading-5
                        text-[#7b8799]
                      "
                    >
                      {control.description}
                    </p>

                    <button
                      type="button"
                      onClick={contactSecurity}
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-1.5
                        text-[8px]
                        font-medium
                        text-[#6b83a1]
                      "
                    >
                      Learn more
                      <ArrowRight size={9} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECURITY LIFECYCLE
      ======================================================== */}

      <section className="bg-[#f3f8ff]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Visual */}

            <div
              className="
                relative
                min-h-[390px]
                overflow-hidden
                rounded-[16px]
                border
                border-[#dce7f3]
                bg-white
                shadow-[0_25px_70px_rgba(64,102,145,0.08)]
              "
            >
              <div
                className="
                  absolute
                  left-1/2
                  top-1/2
                  h-[270px]
                  w-[270px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-[#a6d2ff]/30
                  blur-[70px]
                "
              />

              <div
                className="
                  absolute
                  left-1/2
                  top-1/2
                  h-[240px]
                  w-[240px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  border
                  border-[#cdddec]
                "
              />

              <div
                className="
                  absolute
                  left-1/2
                  top-1/2
                  h-[165px]
                  w-[165px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  border
                  border-[#d9e4ef]
                "
              />

              <div
                className="
                  absolute
                  left-1/2
                  top-1/2
                  flex
                  h-[85px]
                  w-[85px]
                  -translate-x-1/2
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-[24px]
                  border
                  border-[#d5e2ee]
                  bg-white
                  shadow-[0_18px_50px_rgba(64,103,146,0.12)]
                "
              >
                <Shield
                  size={30}
                  strokeWidth={1.35}
                  className="text-[#6689b2]"
                />
              </div>

              <div
                className="
                  absolute
                  left-[10%]
                  top-[23%]
                  rounded-xl
                  border
                  border-[#dfe7ef]
                  bg-white/95
                  px-3
                  py-2
                  shadow-sm
                "
              >
                <div className="flex items-center gap-2">
                  <LockKeyhole
                    size={12}
                    className="text-[#718eaf]"
                  />

                  <span className="text-[8px] font-medium text-[#66768c]">
                    Protect
                  </span>
                </div>
              </div>

              <div
                className="
                  absolute
                  right-[9%]
                  top-[31%]
                  rounded-xl
                  border
                  border-[#dfe7ef]
                  bg-white/95
                  px-3
                  py-2
                  shadow-sm
                "
              >
                <div className="flex items-center gap-2">
                  <ScanSearch
                    size={12}
                    className="text-[#718eaf]"
                  />

                  <span className="text-[8px] font-medium text-[#66768c]">
                    Scan
                  </span>
                </div>
              </div>

              <div
                className="
                  absolute
                  bottom-[22%]
                  left-[17%]
                  rounded-xl
                  border
                  border-[#dfe7ef]
                  bg-white/95
                  px-3
                  py-2
                  shadow-sm
                "
              >
                <div className="flex items-center gap-2">
                  <Eye
                    size={12}
                    className="text-[#718eaf]"
                  />

                  <span className="text-[8px] font-medium text-[#66768c]">
                    Monitor
                  </span>
                </div>
              </div>

              <div
                className="
                  absolute
                  bottom-[18%]
                  right-[14%]
                  rounded-xl
                  border
                  border-[#dfe7ef]
                  bg-white/95
                  px-3
                  py-2
                  shadow-sm
                "
              >
                <div className="flex items-center gap-2">
                  <CircleCheck
                    size={12}
                    className="text-[#718eaf]"
                  />

                  <span className="text-[8px] font-medium text-[#66768c]">
                    Validate
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}

            <div>
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-[#8a98aa]
                "
              >
                Security lifecycle
              </p>

              <h2
                className="
                  mt-4
                  text-[34px]
                  font-semibold
                  leading-[0.98]
                  tracking-[-0.055em]
                  text-[#17213d]
                  sm:text-[45px]
                "
              >
                Protection from
                <br />
                idea to production.
              </h2>

              {/* Bigger description */}

              <p
                className="
                  mt-5
                  max-w-[530px]
                  text-[12px]
                  leading-6
                  text-[#748196]
                  sm:text-[13px]
                "
              >
                Security is not only a deployment concern. A strong workflow
                considers access, application design, dependencies, secrets,
                infrastructure and monitoring throughout the product
                lifecycle.
              </p>

              <div className="mt-9 space-y-5">
                {[
                  {
                    icon: Code2,
                    title: "Build securely",
                    text: "Design application workflows with security considerations from the beginning.",
                  },
                  {
                    icon: ScanSearch,
                    title: "Validate continuously",
                    text: "Use automated checks and review practices to surface potential issues earlier.",
                  },
                  {
                    icon: Eye,
                    title: "Monitor responsibly",
                    text: "Observe production environments and investigate unusual activity.",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex gap-4"
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
                          border-[#dbe5ef]
                          bg-white
                          text-[#6789b0]
                        "
                      >
                        <Icon
                          size={15}
                          strokeWidth={1.7}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[#46556d]">
                            {item.title}
                          </span>

                          <span className="text-[7px] text-[#b0bac7]">
                            0{index + 1}
                          </span>
                        </div>

                        <p className="mt-1.5 text-[10px] leading-5 text-[#7d899b]">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOR BUILDERS
      ======================================================== */}

      <section className="bg-[#fbfaf4]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-[650px]">
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#8a98aa]
              "
            >
              For builders
            </p>

            <h2
              className="
                mt-4
                text-[34px]
                font-semibold
                leading-[0.98]
                tracking-[-0.055em]
                text-[#17213d]
                sm:text-[45px]
              "
            >
              Founder security.
            </h2>

            <p
              className="
                mt-5
                max-w-[570px]
                text-[12px]
                leading-6
                text-[#748196]
                sm:text-[13px]
              "
            >
              Security should remain understandable even when you are moving
              quickly. ICOGON helps bring security considerations closer to
              the building workflow.
            </p>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3">
            {founderSecurity.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                    overflow-hidden
                    rounded-[12px]
                    border
                    border-[#e0e6ed]
                    bg-white
                  "
                >
                  <div
                    className="
                      relative
                      h-[165px]
                      overflow-hidden
                      border-b
                      border-[#e5eaf0]
                      bg-gradient-to-br
                      from-white
                      to-[#edf6ff]
                    "
                  >
                    <div
                      className="
                        absolute
                        left-1/2
                        top-1/2
                        h-[140px]
                        w-[140px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-[#9bcfff]/25
                        blur-[40px]
                      "
                    />

                    <div
                      className="
                        absolute
                        left-1/2
                        top-1/2
                        flex
                        h-[68px]
                        w-[68px]
                        -translate-x-1/2
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-[19px]
                        border
                        border-[#d8e5f0]
                        bg-white
                        shadow-[0_14px_35px_rgba(70,105,140,0.10)]
                      "
                    >
                      <Icon
                        size={23}
                        strokeWidth={1.5}
                        className="text-[#6c8caf]"
                      />
                    </div>

                    <div
                      className="
                        absolute
                        bottom-3
                        left-3
                        rounded-full
                        bg-white/90
                        px-2.5
                        py-1
                        text-[6px]
                        font-semibold
                        uppercase
                        tracking-[0.1em]
                        text-[#8291a4]
                      "
                    >
                      0{index + 1}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-[13px] font-semibold text-[#42516a]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-[11px] leading-5 text-[#7c889a]">
                      {item.description}
                    </p>

                    <button
                      type="button"
                      onClick={contactSecurity}
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-1.5
                        text-[8px]
                        font-medium
                        text-[#6882a1]
                      "
                    >
                      Learn more
                      <ArrowRight size={9} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECURITY PRINCIPLES
      ======================================================== */}

      <section className="bg-[#f3f8ff]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="text-center">
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#8a98aa]
              "
            >
              Our approach
            </p>

            <h2
              className="
                mt-4
                text-[34px]
                font-semibold
                tracking-[-0.055em]
                text-[#17213d]
                sm:text-[44px]
              "
            >
              Security principles.
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-[950px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Secure by design",
                text: "Consider security throughout the product lifecycle.",
              },
              {
                icon: LockKeyhole,
                title: "Least privilege",
                text: "Access should be limited to what workflows require.",
              },
              {
                icon: Eye,
                title: "Transparency",
                text: "Security practices should remain understandable and reviewable.",
              },
              {
                icon: Zap,
                title: "Continuous improvement",
                text: "Security practices evolve as threats and systems change.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                    rounded-[10px]
                    border
                    border-[#dce5ef]
                    bg-white
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#eef6ff]
                      text-[#688bb2]
                    "
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h3 className="mt-5 text-[11px] font-semibold text-[#45546b]">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-[10px] leading-5 text-[#7d899b]">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECURITY READINESS
      ======================================================== */}

      <section className="bg-[#fbfaf4]">
        <div className="mx-auto max-w-[950px] px-6 py-20 text-center sm:px-8 lg:py-24">
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[#8a98aa]
            "
          >
            Standards & readiness
          </p>

          <h2
            className="
              mt-4
              text-[32px]
              font-semibold
              tracking-[-0.05em]
              text-[#17213d]
              sm:text-[42px]
            "
          >
            Security you can build on.
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-[650px]
              text-[12px]
              leading-6
              text-[#7a8799]
              sm:text-[13px]
            "
          >
            ICOGON is designed with security-conscious engineering practices
            in mind. For organizations with specific regulatory or compliance
            requirements, security and architecture should be reviewed against
            the requirements of the intended workload.
          </p>

          <div className="mt-11 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Security controls",
              },
              {
                icon: LockKeyhole,
                title: "Protected access",
              },
              {
                icon: Database,
                title: "Data protection",
              },
              {
                icon: Server,
                title: "Infrastructure",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                    flex
                    flex-col
                    items-center
                    rounded-[10px]
                    border
                    border-[#e0e6ed]
                    bg-white
                    px-4
                    py-6
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#d9e3ed]
                      bg-[#f7fbff]
                      text-[#6689b1]
                    "
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.6}
                    />
                  </div>

                  <span className="mt-3 text-[9px] font-semibold text-[#5d6d84]">
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={contactSecurity}
            className="
              mt-9
              inline-flex
              items-center
              gap-2
              text-[9px]
              font-medium
              text-[#6882a1]
            "
          >
            Talk to our security team
            <ArrowRight size={10} />
          </button>
        </div>
      </section>

      {/* ========================================================
          SECURITY RESOURCES
      ======================================================== */}

      <section className="bg-[#f3f8ff]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-3 md:grid-cols-3">
            {/* Docs */}

            <div
              className="
                rounded-[12px]
                border
                border-[#dce5ef]
                bg-white
                p-6
                transition
                hover:-translate-y-[2px]
                hover:shadow-[0_14px_35px_rgba(60,90,120,0.06)]
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#eef6ff]
                  text-[#6689b0]
                "
              >
                <FileCheck2 size={15} />
              </div>

              <h3 className="mt-6 text-[12px] font-semibold text-[#45546c]">
                Security documentation
              </h3>

              <p className="mt-3 text-[11px] leading-5 text-[#7b8799]">
                Learn about security-conscious architecture, development
                practices and deployment considerations.
              </p>

              <button
                type="button"
                onClick={() => navigate("/docs")}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-1.5
                  text-[8px]
                  font-medium
                  text-[#6683a2]
                "
              >
                Read docs
                <ArrowRight size={9} />
              </button>
            </div>

            {/* Guides */}

            <div
              className="
                rounded-[12px]
                border
                border-[#dce5ef]
                bg-white
                p-6
                transition
                hover:-translate-y-[2px]
                hover:shadow-[0_14px_35px_rgba(60,90,120,0.06)]
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#eef6ff]
                  text-[#6689b0]
                "
              >
                <Globe2 size={15} />
              </div>

              <h3 className="mt-6 text-[12px] font-semibold text-[#45546c]">
                Security guides
              </h3>

              <p className="mt-3 text-[11px] leading-5 text-[#7b8799]">
                Practical guidance for building, deploying and operating
                applications with security in mind.
              </p>

              <button
                type="button"
                onClick={() => navigate("/guides")}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-1.5
                  text-[8px]
                  font-medium
                  text-[#6683a2]
                "
              >
                Explore guides
                <ArrowRight size={9} />
              </button>
            </div>

            {/* Report */}

            <div
              className="
                rounded-[12px]
                border
                border-[#dce5ef]
                bg-white
                p-6
                transition
                hover:-translate-y-[2px]
                hover:shadow-[0_14px_35px_rgba(60,90,120,0.06)]
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#eef6ff]
                  text-[#6689b0]
                "
              >
                <ScanSearch size={15} />
              </div>

              <h3 className="mt-6 text-[12px] font-semibold text-[#45546c]">
                Report a vulnerability
              </h3>

              <p className="mt-3 text-[11px] leading-5 text-[#7b8799]">
                Found a potential security issue? Help us investigate it
                responsibly.
              </p>

              <button
                type="button"
                onClick={reportSecurityIssue}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-1.5
                  text-[8px]
                  font-medium
                  text-[#6683a2]
                "
              >
                Report issue
                <ArrowRight size={9} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FAQ
      ======================================================== */}

      <section className="bg-[#fbfaf4]">
        <div className="mx-auto max-w-[900px] px-6 py-20 sm:px-8 lg:py-24">
          <div className="text-center">
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#8a98aa]
              "
            >
              FAQ
            </p>

            <h2
              className="
                mt-4
                text-[34px]
                font-semibold
                tracking-[-0.055em]
                text-[#17213d]
                sm:text-[44px]
              "
            >
              Security questions.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-[#dfe6ed] border-y border-[#dfe6ed]">
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
                    <span className="text-[11px] font-medium text-[#43526a]">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={15}
                      strokeWidth={1.8}
                      className={`
                        shrink-0
                        text-[#8997a9]
                        transition-transform
                        duration-200
                        ${isOpen ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {isOpen && (
                    <div className="pb-6 pr-8">
                      {/* Bigger FAQ answer */}

                      <p
                        className="
                          text-[11px]
                          leading-6
                          text-[#778498]
                          sm:text-[12px]
                        "
                      >
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          FINAL CTA
      ======================================================== */}

      <section className="relative overflow-hidden bg-[#f3f8ff]">
        <div
          className="
            pointer-events-none
            absolute
            bottom-[-160px]
            left-1/2
            h-[350px]
            w-[850px]
            -translate-x-1/2
            rounded-full
            bg-[#dcefff]
            opacity-80
            blur-[90px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-[-80px]
            left-1/2
            h-[220px]
            w-[500px]
            -translate-x-1/2
            rounded-full
            bg-[#e7e0ff]
            opacity-35
            blur-[90px]
          "
        />

        <div
          className="
            relative
            mx-auto
            max-w-[850px]
            px-6
            py-24
            text-center
            sm:px-8
            lg:py-32
          "
        >
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-[#d9e5f0]
              bg-white
              shadow-sm
            "
          >
            <ShieldCheck
              size={18}
              strokeWidth={1.7}
              className="text-[#6689b1]"
            />
          </div>

          <h2
            className="
              mt-7
              text-[36px]
              font-semibold
              leading-[0.98]
              tracking-[-0.055em]
              text-[#17213d]
              sm:text-[50px]
            "
          >
            Build with confidence.
          </h2>

          {/* Bigger CTA subheading */}

          <p
            className="
              mx-auto
              mt-6
              max-w-[570px]
              text-[12px]
              leading-6
              text-[#718096]
              sm:text-[13px]
            "
          >
            Create your next website, application or AI-powered product with
            security-conscious workflows from the start.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={startBuilding}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-[#17213d]
                px-6
                py-3
                text-[10px]
                font-medium
                text-white
                shadow-[0_10px_25px_rgba(23,33,61,0.12)]
                transition
                hover:-translate-y-[1px]
                hover:bg-[#0f172a]
              "
            >
              Start building
              <ArrowRight size={12} />
            </button>

            <button
              type="button"
              onClick={contactSecurity}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-[#d5e0ec]
                bg-white
                px-6
                py-3
                text-[10px]
                font-medium
                text-[#596b84]
                transition
                hover:bg-[#f9fbfd]
              "
            >
              Contact security
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer className="relative overflow-hidden border-t border-[#dfe6ee] bg-[#fbfaf4]">
        <div
          className="
            pointer-events-none
            absolute
            bottom-[-160px]
            left-1/2
            h-[300px]
            w-[850px]
            -translate-x-1/2
            rounded-full
            bg-[#dcefff]
            opacity-60
            blur-[90px]
          "
        />

        <div
          className="
            relative
            mx-auto
            max-w-[1180px]
            px-6
            py-12
            sm:px-8
            lg:px-10
          "
        >
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand */}

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-md
                    bg-[#17213d]
                    text-white
                  "
                >
                  <Sparkles size={13} />
                </div>

                <span
                  className="
                    text-[14px]
                    font-semibold
                    tracking-[-0.03em]
                    text-[#17213d]
                  "
                >
                  ICOGON
                </span>
              </button>

              <p
                className="
                  mt-5
                  max-w-[290px]
                  text-[10px]
                  leading-5
                  text-[#7b8799]
                "
              >
                Build websites, applications and AI-powered experiences with
                security-conscious workflows.
              </p>

              <button
                type="button"
                onClick={startBuilding}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  text-[9px]
                  font-semibold
                  text-[#526985]
                  transition
                  hover:text-[#17213d]
                "
              >
                Start building
                <ArrowRight size={11} />
              </button>
            </div>

            {/* Company */}

            <div>
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.13em]
                  text-[#9aa6b6]
                "
              >
                Company
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-[#718096]">
                <button
                  type="button"
                  onClick={() => navigate("/enterprise")}
                  className="block transition hover:text-[#17213d]"
                >
                  Enterprise
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
                  onClick={() => navigate("/community")}
                  className="block transition hover:text-[#17213d]"
                >
                  Community
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/partners")}
                  className="block transition hover:text-[#17213d]"
                >
                  Partners
                </button>
              </div>
            </div>

            {/* Product */}

            <div>
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.13em]
                  text-[#9aa6b6]
                "
              >
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
                  onClick={() => navigate("/pricing")}
                  className="block transition hover:text-[#17213d]"
                >
                  Pricing
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
              </div>
            </div>

            {/* Resources */}

            <div>
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.13em]
                  text-[#9aa6b6]
                "
              >
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
                  onClick={() => navigate("/docs")}
                  className="block transition hover:text-[#17213d]"
                >
                  Docs
                </button>
              </div>
            </div>
          </div>

          {/* Footer bottom */}

          <div
            className="
              mt-14
              flex
              flex-col
              gap-3
              border-t
              border-[#dfe6ee]
              pt-6
              text-[9px]
              text-[#9aa6b5]
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

export default SecurityPage;