import { useState } from "react";
import {
  MessageSquare,
  Brain,
  Code2,
  Rocket,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  label: string;
  details: string[];
}

const steps: Step[] = [
  {
    number: "01",
    title: "Describe your idea",
    description:
      "Tell ICOGON what you want to build using natural language.",
    icon: MessageSquare,
    label: "Your idea",
    details: [
      "Describe your product",
      "Choose your requirements",
      "Add features naturally",
    ],
  },
  {
    number: "02",
    title: "AI plans everything",
    description:
      "Our AI analyzes your requirements and creates a complete plan.",
    icon: Brain,
    label: "AI planning",
    details: [
      "Analyze requirements",
      "Plan project architecture",
      "Prepare implementation tasks",
    ],
  },
  {
    number: "03",
    title: "Generate your product",
    description:
      "Frontend, backend, database and AI agents are generated.",
    icon: Code2,
    label: "Generation",
    details: [
      "Generate frontend",
      "Build backend & database",
      "Connect product features",
    ],
  },
  {
    number: "04",
    title: "Preview & deploy",
    description:
      "Test your application and deploy it when you're ready.",
    icon: Rocket,
    label: "Launch",
    details: [
      "Preview your application",
      "Test generated product",
      "Deploy when ready",
    ],
  },
];

const Workflow = () => {
  const [activeStep, setActiveStep] =
    useState(0);

  const selectedStep = steps[activeStep];
  const SelectedIcon = selectedStep.icon;

  const progress =
    steps.length > 1
      ? (activeStep / (steps.length - 1)) * 100
      : 0;

  return (
    <section
      id="workflow"
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
          left-[-250px]
          top-[120px]
          h-[500px]
          w-[500px]
          rounded-full
          bg-blue-400/15
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
          bottom-[40px]
          right-[-250px]
          h-[500px]
          w-[500px]
          rounded-full
          bg-violet-400/15
          blur-[150px]
        "
      />

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
          className="mx-auto max-w-3xl text-center"
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
            <Sparkles size={11} />

            How it works
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
            From idea to product
            <br />

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
              in minutes.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-xl
              text-[14px]
              leading-7
              text-slate-600
              sm:text-[16px]
            "
          >
            ICOGON transforms your idea into a complete
            product through a simple AI-powered workflow.
          </p>
        </motion.div>

        {/* ================= PROGRESS ================= */}

        <div className="relative mt-16 hidden px-[12%] lg:block">
          <div
            className="
              absolute
              left-[12%]
              right-[12%]
              top-[17px]
              h-[2px]
              overflow-hidden
              rounded-full
              bg-slate-200
            "
          >
            <motion.div
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.45,
                ease: "easeOut",
              }}
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-blue-500
                via-cyan-400
                to-violet-500
              "
            />
          </div>

          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const completed =
                index <= activeStep;

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() =>
                    setActiveStep(index)
                  }
                  className="group flex flex-col items-center"
                >
                  <motion.div
                    animate={{
                      scale:
                        activeStep === index
                          ? 1.12
                          : 1,
                    }}
                    className={`
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border-4
                      border-[#f7f8fc]
                      text-[10px]
                      font-bold
                      shadow-sm
                      transition-colors
                      ${
                        completed
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-400"
                      }
                    `}
                  >
                    {index < activeStep ? (
                      <Check size={13} />
                    ) : (
                      step.number
                    )}
                  </motion.div>

                  <span
                    className={`
                      mt-2
                      text-[10px]
                      font-medium
                      transition
                      ${
                        activeStep === index
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= STEP CARDS ================= */}

        <div className="relative mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive =
              activeStep === index;
            const isCompleted =
              index < activeStep;

            return (
              <motion.button
                key={step.number}
                type="button"
                onClick={() =>
                  setActiveStep(index)
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
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
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
                      : "border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.06)] hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(59,130,246,0.10)]"
                  }
                `}
              >
                {/* Active top line */}
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

                {/* Card glow */}
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
                    ${
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }
                  `}
                />

                {/* Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`
                      text-[10px]
                      font-bold
                      tracking-[0.18em]
                      ${
                        isActive
                          ? "text-blue-600"
                          : "text-slate-400"
                      }
                    `}
                  >
                    {step.number}
                  </span>

                  {isCompleted && (
                    <span
                      className="
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-green-50
                        text-green-500
                      "
                    >
                      <Check size={11} />
                    </span>
                  )}
                </div>

                {/* Icon */}
                <motion.div
                  animate={{
                    scale:
                      isActive ? 1.08 : 1,
                    rotate:
                      isActive ? 2 : 0,
                  }}
                  className={`
                    mt-5
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20"
                        : "bg-blue-50 text-blue-600 group-hover:scale-105"
                    }
                  `}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                  />
                </motion.div>

                {/* Title */}
                <h3
                  className={`
                    mt-5
                    text-[16px]
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
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className="
                    mt-2.5
                    min-h-[66px]
                    text-[13px]
                    leading-[22px]
                    text-slate-600
                  "
                >
                  {step.description}
                </p>

                {/* Action */}
                <div
                  className={`
                    mt-4
                    flex
                    items-center
                    gap-1.5
                    text-[10px]
                    font-semibold
                    transition
                    ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-blue-600"
                    }
                  `}
                >
                  {isActive
                    ? "Currently viewing"
                    : "View step"}

                  <ArrowRight
                    size={12}
                    className={`
                      transition-transform
                      ${
                        !isActive
                          ? "group-hover:translate-x-1"
                          : ""
                      }
                    `}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ================= INTERACTIVE PREVIEW ================= */}

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStep.number}
            initial={{
              opacity: 0,
              y: 18,
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
              duration: 0.3,
            }}
            className="
              mx-auto
              mt-8
              max-w-4xl
              overflow-hidden
              rounded-[22px]
              border
              border-slate-200
              bg-white
              shadow-[0_15px_50px_rgba(15,23,42,0.07)]
            "
          >
            {/* Preview header */}
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-5
                py-3
              "
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-300" />
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                <span className="h-2 w-2 rounded-full bg-green-300" />
              </div>

              <div className="flex items-center gap-2 text-[9px] font-medium text-slate-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                ICOGON AI workflow
              </div>
            </div>

            <div
              className="
                grid
                gap-6
                p-5
                sm:p-6
                md:grid-cols-[1fr_1.3fr]
              "
            >
              {/* Selected step */}
              <div>
                <div className="flex items-center gap-3">
                  <motion.div
                    key={`icon-${selectedStep.number}`}
                    initial={{
                      scale: 0.8,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-blue-500
                      to-cyan-400
                      text-white
                      shadow-lg
                      shadow-blue-500/15
                    "
                  >
                    <SelectedIcon
                      size={20}
                    />
                  </motion.div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-500">
                      Step {selectedStep.number}
                    </p>

                    <h4 className="mt-1 text-[15px] font-semibold text-[#17213a]">
                      {selectedStep.title}
                    </h4>
                  </div>
                </div>

                <p className="mt-4 text-[12px] leading-6 text-slate-500">
                  {selectedStep.description}
                </p>
              </div>

              {/* Tasks */}
              <div
                className="
                  rounded-2xl
                  border
                  border-slate-100
                  bg-[#fafbfe]
                  p-4
                "
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-700">
                    {selectedStep.label}
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-blue-50
                      px-2
                      py-1
                      text-[9px]
                      font-medium
                      text-blue-600
                    "
                  >
                    AI powered
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedStep.details.map(
                    (detail, index) => (
                      <motion.div
                        key={detail}
                        initial={{
                          opacity: 0,
                          x: 10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.08,
                        }}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-slate-100
                          bg-white
                          px-3
                          py-2.5
                        "
                      >
                        <span
                          className="
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-green-50
                            text-green-500
                          "
                        >
                          <Check size={10} />
                        </span>

                        <span className="text-[11px] font-medium text-slate-600">
                          {detail}
                        </span>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Bottom progress */}
            <div className="h-1 bg-slate-100">
              <motion.div
                animate={{
                  width: `${
                    ((activeStep + 1) /
                      steps.length) *
                    100
                  }%`,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="
                  h-full
                  bg-gradient-to-r
                  from-blue-500
                  via-cyan-400
                  to-violet-500
                "
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Workflow;