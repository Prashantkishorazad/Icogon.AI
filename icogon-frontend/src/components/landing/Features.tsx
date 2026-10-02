import { useState } from "react";
import {
  Globe,
  Smartphone,
  Database,
  Bot,
  Rocket,
  Code2,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  details: string[];
}

const features: Feature[] = [
  {
    icon: Globe,
    title: "Websites",
    description:
      "Generate modern, responsive and production-ready websites.",
    details: [
      "Responsive layouts",
      "Modern UI components",
      "SEO-ready structure",
    ],
  },
  {
    icon: Smartphone,
    title: "Applications",
    description:
      "Build powerful web and mobile applications using AI.",
    details: [
      "Web application flows",
      "Mobile-first interfaces",
      "Interactive user experiences",
    ],
  },
  {
    icon: Database,
    title: "Backend & Database",
    description:
      "Generate APIs, authentication and complete database systems.",
    details: [
      "REST APIs",
      "Authentication systems",
      "Database architecture",
    ],
  },
  {
    icon: Bot,
    title: "AI Agents",
    description:
      "Create intelligent AI agents for your product and workflows.",
    details: [
      "AI-powered workflows",
      "Task automation",
      "Intelligent product features",
    ],
  },
  {
    icon: Code2,
    title: "Production Code",
    description:
      "Get clean, structured and editable production-ready code.",
    details: [
      "Structured codebase",
      "Editable components",
      "Production-ready architecture",
    ],
  },
  {
    icon: Rocket,
    title: "Deploy Instantly",
    description:
      "Preview, test and deploy your project with a single click.",
    details: [
      "Live preview",
      "Fast testing",
      "One-click deployment",
    ],
  },
];

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const selectedFeature = features[activeFeature];
  const SelectedIcon = selectedFeature.icon;

  return (
    <section
      id="features"
      className="
        relative
        overflow-hidden
        bg-[#f7f8fc]
        py-24
        sm:py-28
      "
    >
      {/* ================= BACKGROUND ================= */}

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
          pointer-events-none
          absolute
          left-[-220px]
          top-[80px]
          h-[500px]
          w-[500px]
          rounded-full
          bg-blue-400/20
          blur-[150px]
        "
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          bottom-[-120px]
          right-[-220px]
          h-[500px]
          w-[500px]
          rounded-full
          bg-pink-400/15
          blur-[150px]
        "
      />

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6">
        {/* ================= HEADING ================= */}

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
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div
            className="
              mb-4
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-100
              bg-blue-50
              px-3
              py-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-blue-600
            "
          >
            <Sparkles size={12} />
            One Platform
          </div>

          <h2
            className="
              text-[34px]
              font-semibold
              leading-[1.05]
              tracking-[-1.6px]
              text-[#17213a]
              sm:text-[44px]
              md:text-[54px]
            "
          >
            Everything you need to{" "}
            <span
              className="
                bg-gradient-to-r
                from-blue-600
                via-cyan-500
                to-violet-500
                bg-clip-text
                text-transparent
              "
            >
              build faster.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-[14px]
              leading-7
              text-slate-600
              sm:text-[16px]
            "
          >
            From idea to production — ICOGON brings your
            entire development workflow into one
            intelligent platform.
          </p>
        </motion.div>

        {/* ================= FEATURE GRID ================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = activeFeature === index;

            return (
              <motion.button
                key={feature.title}
                type="button"
                onClick={() =>
                  setActiveFeature(index)
                }
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
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.07,
                }}
                whileHover={{
                  y: -6,
                }}
                whileTap={{
                  scale: 0.985,
                }}
                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-[20px]
                  border
                  bg-white
                  p-6
                  text-left
                  transition-all
                  duration-300
                  ${
                    isActive
                      ? "border-blue-300 shadow-[0_20px_55px_rgba(59,130,246,0.14)]"
                      : "border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.06)] hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(59,130,246,0.11)]"
                  }
                `}
              >
                {/* Active indicator */}
                <motion.div
                  initial={false}
                  animate={{
                    scaleX: isActive ? 1 : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  className="
                    absolute
                    left-0
                    right-0
                    top-0
                    h-[2px]
                    origin-left
                    bg-gradient-to-r
                    from-blue-500
                    via-cyan-400
                    to-violet-500
                  "
                />

                {/* Background glow */}
                <div
                  className={`
                    pointer-events-none
                    absolute
                    -right-12
                    -top-12
                    h-28
                    w-28
                    rounded-full
                    bg-blue-400/10
                    blur-2xl
                    transition-opacity
                    duration-300
                    ${
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }
                  `}
                />

                {/* Icon */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.08 : 1,
                    rotate: isActive ? 2 : 0,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className={`
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    transition-all
                    duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20"
                        : "bg-gradient-to-br from-blue-500/10 via-cyan-400/10 to-violet-500/10 text-blue-600 group-hover:scale-105 group-hover:bg-blue-50"
                    }
                  `}
                >
                  <Icon
                    size={23}
                    strokeWidth={1.8}
                  />
                </motion.div>

                {/* Title */}
                <div className="mt-6 flex items-center justify-between gap-3">
                  <h3
                    className={`
                      text-[17px]
                      font-semibold
                      tracking-[-0.3px]
                      transition-colors
                      ${
                        isActive
                          ? "text-blue-600"
                          : "text-[#17213a] group-hover:text-blue-600"
                      }
                    `}
                  >
                    {feature.title}
                  </h3>

                  <motion.div
                    animate={{
                      x: isActive ? 0 : -3,
                      opacity: isActive ? 1 : 0.45,
                    }}
                    className="shrink-0"
                  >
                    <ArrowRight
                      size={16}
                      className={
                        isActive
                          ? "text-blue-500"
                          : "text-slate-400"
                      }
                    />
                  </motion.div>
                </div>

                {/* Description */}
                <p
                  className="
                    mt-2.5
                    text-[13px]
                    leading-6
                    text-slate-600
                  "
                >
                  {feature.description}
                </p>

                {/* Expanded details */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <div className="space-y-2">
                          {feature.details.map(
                            (detail) => (
                              <div
                                key={detail}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  text-[11px]
                                  font-medium
                                  text-slate-500
                                "
                              >
                                <span
                                  className="
                                    flex
                                    h-4
                                    w-4
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-blue-50
                                    text-blue-500
                                  "
                                >
                                  <Check size={9} />
                                </span>

                                {detail}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* ================= SELECTED FEATURE PREVIEW ================= */}

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFeature.title}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              mx-auto
              mt-10
              max-w-4xl
              rounded-[22px]
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_15px_50px_rgba(15,23,42,0.07)]
              sm:p-6
            "
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <SelectedIcon size={21} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500">
                    Selected capability
                  </p>

                  <h4 className="mt-1 text-sm font-semibold text-[#17213a]">
                    {selectedFeature.title}
                  </h4>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedFeature.details.map(
                  (detail) => (
                    <span
                      key={detail}
                      className="
                        rounded-full
                        border
                        border-slate-200
                        bg-slate-50
                        px-3
                        py-1.5
                        text-[10px]
                        font-medium
                        text-slate-500
                      "
                    >
                      {detail}
                    </span>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom trust line */}
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
            delay: 0.2,
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
            Production-ready code
          </span>

          <span className="flex items-center gap-1.5">
            <Check
              size={12}
              className="text-green-500"
            />
            Instant deployment
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;