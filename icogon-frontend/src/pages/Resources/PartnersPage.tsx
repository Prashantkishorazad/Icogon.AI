import {
  ArrowRight,
  Check,
  Handshake,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const PartnersPage = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Sparkles,
      title: "Grow with AI",
      description:
        "Help businesses adopt AI-powered software while expanding your own services.",
    },
    {
      icon: Users,
      title: "Reach more customers",
      description:
        "Work with businesses that are looking for modern websites, applications, and AI solutions.",
    },
    {
      icon: Handshake,
      title: "Build together",
      description:
        "Partner with ICOGON to deliver faster, smarter, and more scalable digital experiences.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Apply",
      description:
        "Tell us about your company, expertise, and the kind of work you want to build with ICOGON.",
    },
    {
      number: "02",
      title: "Connect",
      description:
        "Our team reviews your application and connects with you to understand how we can work together.",
    },
    {
      number: "03",
      title: "Build",
      description:
        "Start creating AI-powered solutions for your customers with ICOGON.",
    },
  ];

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

      {/* =====================================================
          HERO
      ===================================================== */}

      <main>
        <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 lg:px-10 lg:pt-28">
          <div className="mx-auto max-w-[850px] text-center">
            {/* LABEL */}

            <div
              className="
                mx-auto
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-slate-200
                bg-white
                px-4
                py-2
                text-[12px]
                font-medium
                text-slate-600
                shadow-sm
              "
            >
              <Handshake
                size={15}
                strokeWidth={1.8}
              />

              ICOGON Partner Program
            </div>

            {/* HEADING */}

            <h1
              className="
                text-[48px]
                font-semibold
                leading-[1.02]
                tracking-[-0.05em]
                text-slate-950
                sm:text-[62px]
                lg:text-[76px]
              "
            >
              Build more.
              <br />
              Together.
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                mx-auto
                mt-7
                max-w-[680px]
                text-[17px]
                leading-7
                text-slate-500
                sm:text-[18px]
              "
            >
              Join the ICOGON partner ecosystem and help businesses
              build powerful websites, applications, and AI-powered
              experiences faster.
            </p>

            {/* CTA */}

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#apply"
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
                  hover:shadow-xl
                "
              >
                Become a partner

                <ArrowRight size={17} />
              </a>

              <a
                href="#benefits"
                className="
                  inline-flex
                  items-center
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
                Learn more
              </a>
            </div>
          </div>

          {/* =================================================
              HERO VISUAL
          ================================================= */}

          <div
            className="
              mt-20
              overflow-hidden
              rounded-[30px]
              border
              border-slate-200
              bg-white
              shadow-[0_20px_60px_rgba(15,23,42,0.08)]
            "
          >
            <div
              className="
                relative
                min-h-[380px]
                overflow-hidden
                bg-[linear-gradient(135deg,#eeece7_0%,#faf9f6_48%,#dedbd4_100%)]
                sm:min-h-[480px]
              "
            >
              {/* Decorative shapes */}

              <div
                className="
                  absolute
                  left-[10%]
                  top-[18%]
                  h-32
                  w-32
                  rounded-[28px]
                  border
                  border-white/70
                  bg-white/40
                  shadow-xl
                  backdrop-blur-md
                  sm:h-44
                  sm:w-44
                "
              />

              <div
                className="
                  absolute
                  right-[12%]
                  top-[14%]
                  h-24
                  w-24
                  rounded-full
                  border
                  border-white/70
                  bg-white/45
                  shadow-xl
                  backdrop-blur-md
                  sm:h-32
                  sm:w-32
                "
              />

              <div
                className="
                  absolute
                  bottom-[12%]
                  left-1/2
                  h-40
                  w-[55%]
                  -translate-x-1/2
                  rounded-[32px]
                  border
                  border-white/70
                  bg-white/50
                  shadow-2xl
                  backdrop-blur-xl
                "
              />

              {/* Center content */}

              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  p-6
                "
              >
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-white
                      bg-white/80
                      shadow-lg
                      backdrop-blur
                    "
                  >
                    <Handshake
                      size={29}
                      strokeWidth={1.5}
                    />
                  </div>

                  <p
                    className="
                      mt-5
                      text-[20px]
                      font-semibold
                      tracking-[-0.02em]
                      text-slate-900
                    "
                  >
                    ICOGON × Partners
                  </p>

                  <p
                    className="
                      mt-2
                      text-[13px]
                      text-slate-500
                    "
                  >
                    Build the future together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            BENEFITS
        ===================================================== */}

        <section
          id="benefits"
          className="
            border-y
            border-slate-200/80
            bg-white
          "
        >
          <div className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10">
            <div className="max-w-[650px]">
              <p
                className="
                  text-[12px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-slate-400
                "
              >
                Why partner with ICOGON
              </p>

              <h2
                className="
                  mt-3
                  text-[34px]
                  font-semibold
                  leading-tight
                  tracking-[-0.035em]
                  text-slate-950
                  sm:text-[42px]
                "
              >
                Turn AI into
                <br />
                new opportunities.
              </h2>

              <p
                className="
                  mt-5
                  text-[16px]
                  leading-7
                  text-slate-500
                "
              >
                Combine your expertise with ICOGON's AI-powered
                development platform to create better outcomes
                for your customers.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="
                      rounded-[24px]
                      border
                      border-slate-200
                      bg-[#fbfaf8]
                      p-7
                    "
                  >
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
                        bg-white
                        shadow-sm
                      "
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.7}
                      />
                    </div>

                    <h3
                      className="
                        mt-6
                        text-[19px]
                        font-semibold
                        tracking-[-0.02em]
                      "
                    >
                      {benefit.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        text-[14px]
                        leading-6
                        text-slate-500
                      "
                    >
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p
                className="
                  text-[12px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-slate-400
                "
              >
                How it works
              </p>

              <h2
                className="
                  mt-3
                  text-[34px]
                  font-semibold
                  leading-tight
                  tracking-[-0.035em]
                  sm:text-[42px]
                "
              >
                From partnership
                <br />
                to production.
              </h2>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="
                    grid
                    gap-5
                    py-8
                    sm:grid-cols-[70px_1fr]
                  "
                >
                  <span
                    className="
                      text-[13px]
                      font-semibold
                      text-slate-400
                    "
                  >
                    {step.number}
                  </span>

                  <div>
                    <h3
                      className="
                        text-[20px]
                        font-semibold
                        tracking-[-0.02em]
                      "
                    >
                      {step.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-[560px]
                        text-[14px]
                        leading-6
                        text-slate-500
                      "
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            PARTNER TYPES
        ===================================================== */}

        <section
          className="
            border-y
            border-slate-200/80
            bg-white
          "
        >
          <div className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10">
            <div className="mx-auto max-w-[700px] text-center">
              <p
                className="
                  text-[12px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-slate-400
                "
              >
                Built for different teams
              </p>

              <h2
                className="
                  mt-3
                  text-[34px]
                  font-semibold
                  tracking-[-0.035em]
                  sm:text-[42px]
                "
              >
                Bring your expertise.
                <br />
                We bring the platform.
              </h2>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {[
                "Digital agencies",
                "Freelancers & consultants",
                "Technology companies",
                "Business solution providers",
              ].map((type) => (
                <div
                  key={type}
                  className="
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-slate-200
                    bg-[#fbfaf8]
                    px-6
                    py-5
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
                      rounded-full
                      bg-slate-900
                      text-white
                    "
                  >
                    <Check size={16} />
                  </div>

                  <span
                    className="
                      text-[15px]
                      font-medium
                      text-slate-800
                    "
                  >
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section
          id="apply"
          className="
            mx-auto
            max-w-[1200px]
            px-6
            py-24
            lg:px-10
          "
        >
          <div
            className="
              overflow-hidden
              rounded-[30px]
              bg-[#20242f]
              px-7
              py-16
              text-center
              sm:px-12
              lg:py-20
            "
          >
            <p
              className="
                text-[12px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-slate-400
              "
            >
              Let's build together
            </p>

            <h2
              className="
                mx-auto
                mt-4
                max-w-[700px]
                text-[38px]
                font-semibold
                leading-tight
                tracking-[-0.04em]
                text-white
                sm:text-[48px]
              "
            >
              Ready to become an
              ICOGON partner?
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-[580px]
                text-[15px]
                leading-6
                text-slate-400
              "
            >
              Tell us about your business and let's explore
              what's possible together.
            </p>

            <a
              href="mailto:info@icogon.com?subject=ICOGON Partner Program"
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-white
                px-6
                py-3.5
                text-[14px]
                font-medium
                text-slate-900
                transition-all
                hover:-translate-y-[1px]
                hover:bg-slate-100
              "
            >
              Apply to partner

              <ArrowRight size={17} />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PartnersPage;