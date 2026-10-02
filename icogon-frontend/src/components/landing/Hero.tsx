import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Code2,
  Cloud,
  Database,
  LayoutDashboard,
  MousePointer2,
  Play,
  Sparkles,
  Wand2,
} from "lucide-react";

import PromptInput from "./PromptInput";

const Hero = () => {
  const scrollToAuth = () => {
    const element = document.getElementById("auth");

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const scrollToFeatures = () => {
    const element = document.getElementById("features");

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section
      id="hero"
      className="
        relative
        overflow-hidden
        bg-[#f7f8fc]
        pb-20
        pt-[120px]
        md:pt-[145px]
      "
    >
      {/* =====================================================
          LIGHT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Blue glow */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[-220px]
            top-[100px]
            h-[600px]
            w-[600px]
            rounded-full
            bg-blue-400/25
            blur-[150px]
          "
        />

        {/* Purple center glow */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.22, 0.35, 0.22],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-1/2
            top-[100px]
            h-[650px]
            w-[700px]
            -translate-x-1/2
            rounded-full
            bg-violet-400/20
            blur-[180px]
          "
        />

        {/* Pink glow */}
        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-[-160px]
            right-[-220px]
            h-[650px]
            w-[650px]
            rounded-full
            bg-pink-400/25
            blur-[160px]
          "
        />

        {/* White overlay */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-white/80
            via-white/20
            to-white/60
          "
        />

        {/* Light grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.22]
            [background-image:linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)]
            [background-size:48px_48px]
            [mask-image:linear-gradient(to_bottom,black,transparent_72%)]
          "
        />
      </div>

      {/* =====================================================
          HERO CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          max-w-7xl
          flex-col
          items-center
          px-5
          text-center
          sm:px-6
        "
      >
        {/* Badge */}

        {/* Title */}
        <motion.h1
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="
            max-w-5xl
            text-[46px]
            font-semibold
            leading-[0.98]
            tracking-[-2.8px]
            text-[#17213a]
            sm:text-[58px]
            md:text-[70px]
            lg:text-[78px]
          "
        >
          Build something{" "}
          <span
            className="
              bg-gradient-to-r
              from-blue-600
              via-violet-500
              to-pink-500
              bg-clip-text
              text-transparent
            "
          >
            incredible
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.15,
          }}
          className="
            mt-6
            max-w-2xl
            text-[15px]
            leading-7
            text-slate-600
            sm:text-[17px]
          "
        >
          Bring your biggest ideas to life with websites,
          apps, and AI-powered products.
        </motion.p>

        {/* Prompt */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
            delay: 0.3,
          }}
          className="
            mt-9
            w-full
            max-w-[770px]
          "
        >
          <div
            className="
              rounded-[26px]
              shadow-[0_20px_70px_rgba(59,130,246,0.10)]
              transition
              duration-300
              hover:-translate-y-1
              hover:shadow-[0_25px_80px_rgba(59,130,246,0.16)]
            "
          >
            <PromptInput />
          </div>

          {/* Example prompts */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {[
              "Build an AI SaaS dashboard",
              "Create an E-commerce website",
              "Build a social media app",
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="
                  rounded-full
                  border
                  border-slate-200
                  bg-white/75
                  px-3
                  py-1.5
                  text-[10px]
                  text-slate-500
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:border-blue-200
                  hover:bg-white
                  hover:text-blue-600
                  hover:shadow-md
                "
              >
                {prompt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            delay: 0.45,
          }}
          className="mt-5 flex items-center gap-3"
        >
          <button
            type="button"
            onClick={scrollToAuth}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-slate-950
              px-5
              py-2.5
              text-xs
              font-semibold
              text-white
              shadow-lg
              shadow-slate-900/15
              transition
              hover:-translate-y-0.5
              hover:shadow-xl
            "
          >
            <Wand2 size={14} />

            Start building

            <ArrowRight size={13} />
          </button>

          <button
            type="button"
            onClick={scrollToFeatures}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              px-4
              py-2.5
              text-xs
              font-medium
              text-slate-500
              transition
              hover:text-slate-900
            "
          >
            <Play size={12} />

            See how it works
          </button>
        </motion.div>
      </div>

      {/* =====================================================
          ONE PLATFORM
      ====================================================== */}

      <section className="relative z-10 mt-28 w-full px-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Heading */}
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.6,
            }}
            className="mb-10 flex flex-col items-center text-center"
          >
            <div
              className="
                mb-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.25em]
                text-blue-500
              "
            >
              ONE PLATFORM
            </div>

            <h2
              className="
                max-w-3xl
                text-[30px]
                font-semibold
                tracking-[-1.4px]
                text-[#1f2937]
                sm:text-[36px]
              "
            >
              From idea to reality—
              <span className="text-blue-500">
                all in one platform.
              </span>
            </h2>

            <p
              className="
                mt-3
                max-w-xl
                text-[14px]
                leading-6
                text-slate-600
              "
            >
              Describe what you want, and bring it to
              life. Create, launch, and manage everything
              effortlessly.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            {/* Card 1 */}
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.5,
              }}
              whileHover={{
                y: -7,
              }}
              className="
                group
                overflow-hidden
                rounded-[20px]
                border
                border-slate-200
                bg-white
                shadow-[0_10px_40px_rgba(15,23,42,0.07)]
                transition-shadow
                hover:border-blue-200
                hover:shadow-[0_20px_55px_rgba(59,130,246,0.14)]
              "
            >
              <div
                className="
                  relative
                  flex
                  h-[210px]
                  items-center
                  justify-center
                  overflow-hidden
                  bg-gradient-to-br
                  from-blue-100
                  via-white
                  to-purple-100
                "
              >
                <motion.div
                  animate={{
                    x: [25, 65, 25],
                    y: [15, -10, 15],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute z-20"
                >
                  <MousePointer2
                    size={19}
                    className="fill-slate-900 text-white"
                  />
                </motion.div>

                <div
                  className="
                    h-[125px]
                    w-[245px]
                    rounded-[16px]
                    border
                    border-slate-200
                    bg-white
                    shadow-xl
                    transition
                    duration-300
                    group-hover:scale-[1.03]
                  "
                >
                  <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-red-300" />
                    <span className="h-2 w-2 rounded-full bg-yellow-300" />
                    <span className="h-2 w-2 rounded-full bg-green-300" />
                  </div>

                  <div className="p-4">
                    <div className="mb-2 h-2 w-20 rounded bg-slate-200" />
                    <div className="h-2 w-32 rounded bg-slate-100" />

                    <div className="mt-4 flex gap-2">
                      <div className="h-9 flex-1 rounded-lg bg-blue-50" />
                      <div className="h-9 flex-1 rounded-lg bg-purple-50" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                    <Sparkles size={14} />
                  </div>

                  <h3 className="text-[14px] font-semibold text-slate-900">
                    You bring the idea.
                  </h3>
                </div>

                <p className="text-[13px] leading-5 text-slate-600">
                  Describe what you want in plain language.
                  ICOGON AI turns your idea into a working
                  product.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
              }}
              whileHover={{
                y: -7,
              }}
              className="
                group
                overflow-hidden
                rounded-[20px]
                border
                border-slate-200
                bg-white
                shadow-[0_10px_40px_rgba(15,23,42,0.07)]
                transition-shadow
                hover:border-cyan-200
                hover:shadow-[0_20px_55px_rgba(6,182,212,0.14)]
              "
            >
              <div
                className="
                  relative
                  flex
                  h-[210px]
                  items-center
                  justify-center
                  overflow-hidden
                  bg-gradient-to-br
                  from-cyan-100
                  via-white
                  to-blue-100
                "
              >
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    w-[225px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-3
                    shadow-xl
                  "
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-medium text-blue-600">
                        Preview
                      </span>

                      <span className="rounded-md bg-slate-50 px-2 py-1 text-slate-400">
                        <Code2 size={10} />
                      </span>
                    </div>

                    <span className="h-2 w-2 rounded-full bg-green-400" />
                  </div>

                  <div className="rounded-lg border border-dashed border-blue-300 p-3">
                    <p className="text-[15px] font-semibold leading-5 text-slate-700">
                      Build products
                      <br />
                      that scale fast
                    </p>
                  </div>

                  <div className="mt-3 h-1.5 w-3/4 rounded bg-slate-100" />
                  <div className="mt-2 h-1.5 w-full rounded bg-slate-100" />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400">
                      Live preview
                    </span>

                    <span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] text-blue-600">
                      Deploy
                    </span>
                  </div>
                </motion.div>
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-500">
                    <Code2 size={14} />
                  </div>

                  <h3 className="text-[14px] font-semibold text-slate-900">
                    Refine and deploy.
                  </h3>
                </div>

                <p className="text-[13px] leading-5 text-slate-600">
                  Iterate on your creation until you're
                  happy with the finished product, then ship
                  it instantly.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
              whileHover={{
                y: -7,
              }}
              className="
                group
                overflow-hidden
                rounded-[20px]
                border
                border-slate-200
                bg-white
                shadow-[0_10px_40px_rgba(15,23,42,0.07)]
                transition-shadow
                hover:border-pink-200
                hover:shadow-[0_20px_55px_rgba(236,72,153,0.14)]
              "
            >
              <div
                className="
                  relative
                  h-[210px]
                  overflow-hidden
                  bg-gradient-to-br
                  from-orange-100
                  via-white
                  to-pink-100
                "
              >
                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-full
                    w-[58%]
                    border-r
                    border-slate-200
                    bg-white/80
                    p-6
                    backdrop-blur
                  "
                >
                  <div className="space-y-3 text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={12} />
                      Analytics
                    </div>

                    <div className="flex items-center gap-2">
                      <Cloud size={12} />
                      Cloud
                    </div>

                    <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Sparkles size={11} />
                        Connectors
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Database size={12} />
                      Database
                    </div>

                    <div className="flex items-center gap-2">
                      <Code2 size={12} />
                      AI integrations
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    absolute
                    right-5
                    top-8
                    h-[145px]
                    w-[105px]
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    shadow-lg
                  "
                >
                  <div className="p-3">
                    <div className="h-2 w-12 rounded bg-slate-200" />

                    <div className="mt-3 h-16 rounded-md bg-gradient-to-br from-blue-50 to-purple-50" />

                    <div className="mt-3 space-y-1.5">
                      <div className="h-1.5 w-full rounded bg-slate-100" />
                      <div className="h-1.5 w-3/4 rounded bg-slate-100" />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
                    <Cloud size={14} />
                  </div>

                  <h3 className="text-[14px] font-semibold text-slate-900">
                    Everything end to end.
                  </h3>
                </div>

                <p className="text-[13px] leading-5 text-slate-600">
                  From frontend and backend to authentication,
                  databases, integrations, and deployment.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Trust line */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            whileInView={{
              opacity: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
            className="
              mt-8
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-6
              gap-y-2
              text-[10px]
              text-slate-400
            "
          >
            <span className="flex items-center gap-1.5">
              <Check
                size={12}
                className="text-green-500"
              />
              AI-powered generation
            </span>

            <span className="flex items-center gap-1.5">
              <Check
                size={12}
                className="text-green-500"
              />
              Live preview
            </span>

            <span className="flex items-center gap-1.5">
              <Check
                size={12}
                className="text-green-500"
              />
              Production-ready code
            </span>
          </motion.div>
        </div>
      </section>
    </section>
  );
};

export default Hero;