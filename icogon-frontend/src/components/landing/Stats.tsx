import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface Metric {
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
  description: string;
}

const metrics: Metric[] = [
  {
    value: "130",
    numericValue: 130,
    suffix: "K",
    label: "Value created",
    description:
      "Value generated through products built with ICOGON.",
  },
  {
    value: "250",
    numericValue: 250,
    suffix: "+",
    label: "Projects shipped",
    description:
      "Projects created, refined and shipped through the platform.",
  },
  {
    value: "7.5",
    numericValue: 7.5,
    suffix: "M",
    label: "Business impact",
    description:
      "Reported business impact represented in the showcase.",
  },
];

const growthStats = [
  {
    value: 12,
    suffix: " million",
    label: "Projects created",
  },
  {
    value: 60,
    suffix: " million",
    label: "AI generations",
  },
  {
    value: 900,
    suffix: " million",
    label: "Lines of code generated",
  },
];

const AnimatedNumber = ({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) => {
  const [displayValue, setDisplayValue] =
    useState(0);

  useEffect(() => {
    let frameId: number;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed =
        currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setDisplayValue(
        value * eased
      );

      if (progress < 1) {
        frameId =
          requestAnimationFrame(animate);
      }
    };

    frameId =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [value]);

  return (
    <>
      {displayValue.toFixed(decimals)}
      {suffix}
    </>
  );
};

const Stats = () => {
  const [activeMetric, setActiveMetric] =
    useState(0);

  const selectedMetric =
    metrics[activeMetric];

  return (
    <section
      id="stats"
      className="
        relative
        overflow-hidden
        bg-[#f8f8f7]
        py-24
        sm:py-28
      "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <motion.div
        animate={{
          x: [0, 25, 0],
          y: [0, -15, 0],
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
          top-[100px]
          h-[450px]
          w-[450px]
          rounded-full
          bg-blue-400/10
          blur-[140px]
        "
      />

      <motion.div
        animate={{
          x: [0, -25, 0],
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
          bottom-[-150px]
          right-[-200px]
          h-[500px]
          w-[500px]
          rounded-full
          bg-pink-400/10
          blur-[150px]
        "
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6">
        {/* =====================================================
            HEADING
        ====================================================== */}

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
          className="mx-auto max-w-2xl text-center"
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
            Built for everyone
          </div>

          <h2
            className="
              text-[34px]
              font-semibold
              tracking-[-1.6px]
              text-[#24262b]
              sm:text-[44px]
              md:text-[52px]
            "
          >
            The proof is in{" "}
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
              production.
            </span>
          </h2>

          <p
            className="
              mt-5
              text-[14px]
              leading-7
              text-slate-500
              sm:text-[15px]
            "
          >
            From simple ideas to powerful products,
            ICOGON helps you turn your vision into
            something real.
          </p>
        </motion.div>

        {/* =====================================================
            PRODUCT SHOWCASE
        ====================================================== */}

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
            duration: 0.6,
          }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          {/* LEFT FLOATING CARD */}

          <motion.div
            animate={{
              y: [0, -7, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              absolute
              left-[-65px]
              top-1/2
              hidden
              h-[130px]
              w-[160px]
              -translate-y-1/2
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white/90
              shadow-[0_15px_40px_rgba(15,23,42,0.07)]
              md:flex
            "
          >
            <div className="text-center">
              <BarChart3
                size={18}
                className="mx-auto mb-2 text-blue-500"
              />

              <p className="text-xl font-semibold text-slate-700">
                exp
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                Build & expand
              </p>
            </div>
          </motion.div>

          {/* RIGHT FLOATING CARD */}

          <motion.div
            animate={{
              y: [0, 7, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              absolute
              right-[-65px]
              top-1/2
              hidden
              h-[130px]
              w-[160px]
              -translate-y-1/2
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white/90
              shadow-[0_15px_40px_rgba(15,23,42,0.07)]
              md:flex
            "
          >
            <div className="text-center">
              <ArrowUpRight
                size={18}
                className="mx-auto mb-2 text-violet-500"
              />

              <p className="text-xl font-semibold text-slate-700">
                ship
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                Deploy instantly
              </p>
            </div>
          </motion.div>

          {/* MAIN CARD */}

          <motion.div
            whileHover={{
              y: -4,
            }}
            className="
              relative
              rounded-[28px]
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_20px_70px_rgba(15,23,42,0.08)]
              transition-shadow
              hover:shadow-[0_25px_80px_rgba(59,130,246,0.12)]
              sm:p-8
              md:p-10
            "
          >
            {/* ICON */}

            <motion.div
              animate={{
                rotate: [0, 4, -4, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                mx-auto
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-blue-50
                to-violet-50
                text-blue-600
              "
            >
              <Sparkles size={18} />
            </motion.div>

            {/* SMALL TEXT */}

            <p
              className="
                mt-4
                text-center
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Powered by ICOGON AI
            </p>

            {/* METRIC TABS */}

            <div className="mt-7 flex justify-center gap-2">
              {metrics.map((metric, index) => (
                <button
                  key={metric.label}
                  type="button"
                  onClick={() =>
                    setActiveMetric(index)
                  }
                  className={`
                    rounded-full
                    px-3
                    py-1.5
                    text-[10px]
                    font-medium
                    transition
                    ${
                      activeMetric === index
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                    }
                  `}
                >
                  {metric.label}
                </button>
              ))}
            </div>

            {/* STATS */}

            <div
              className="
                mt-7
                grid
                grid-cols-2
                divide-x
                divide-slate-200
                md:grid-cols-3
              "
            >
              {metrics.map(
                (metric, index) => (
                  <button
                    key={metric.label}
                    type="button"
                    onClick={() =>
                      setActiveMetric(index)
                    }
                    className={`
                      px-3
                      text-center
                      transition
                      ${
                        index === 2
                          ? "hidden md:block"
                          : ""
                      }
                      ${
                        activeMetric === index
                          ? "scale-[1.03]"
                          : "opacity-70 hover:opacity-100"
                      }
                    `}
                  >
                    <p
                      className={`
                        text-2xl
                        font-semibold
                        transition-colors
                        ${
                          activeMetric ===
                          index
                            ? "text-blue-600"
                            : "text-slate-900"
                        }
                      `}
                    >
                      <AnimatedNumber
                        value={
                          metric.numericValue
                        }
                        suffix={
                          metric.suffix
                        }
                        decimals={
                          metric.numericValue %
                            1 !==
                          0
                            ? 1
                            : 0
                        }
                      />
                    </p>

                    <p className="mt-2 text-[11px] text-slate-400">
                      {metric.label}
                    </p>
                  </button>
                )
              )}
            </div>

            {/* ACTIVE METRIC */}

            <motion.div
              key={selectedMetric.label}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                mt-7
                rounded-xl
                border
                border-blue-100
                bg-blue-50/50
                p-3.5
              "
            >
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={14}
                  className="text-blue-500"
                />

                <span className="text-[11px] font-semibold text-slate-700">
                  {selectedMetric.label}
                </span>
              </div>

              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                {selectedMetric.description}
              </p>
            </motion.div>

            {/* QUESTION */}

            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-center text-[13px] text-slate-500">
                What will you build with ICOGON?
              </p>
            </div>

            {/* USER CTA */}

            <motion.div
              whileHover={{
                scale: 1.01,
              }}
              className="
                mt-4
                flex
                items-center
                justify-between
                gap-3
                rounded-xl
                bg-slate-50
                p-3.5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-blue-400
                    to-violet-500
                    text-white
                  "
                >
                  <Sparkles size={14} />
                </div>

                <div>
                  <p className="text-[12px] font-medium text-slate-800">
                    Build your next big idea
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Start creating with AI today
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-slate-400
                  shadow-sm
                "
              >
                <ArrowUpRight size={13} />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* =====================================================
            MILLIONS SECTION
        ====================================================== */}

        <div className="mt-28">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.6,
            }}
            className="grid items-center gap-12 md:grid-cols-[0.8fr_1.2fr]"
          >
            {/* LEFT */}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Built with ICOGON
              </p>

              <h2
                className="
                  mt-4
                  text-[32px]
                  font-semibold
                  tracking-[-1.3px]
                  text-slate-900
                  sm:text-[40px]
                "
              >
                Millions built
                <br />
                on ICOGON.
              </h2>

              <p className="mt-3 max-w-md text-[13px] leading-6 text-slate-500">
                A new generation of creators building
                websites, applications and digital
                products faster than ever.
              </p>

              {/* NUMBERS */}

              <div className="mt-9 space-y-5">
                {growthStats.map(
                  (stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{
                        opacity: 0,
                        x: -15,
                      }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        delay:
                          index * 0.1,
                      }}
                    >
                      <p className="text-[28px] font-semibold tracking-[-0.8px] text-slate-900">
                        <AnimatedNumber
                          value={stat.value}
                          suffix={stat.suffix}
                        />
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {stat.label}
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            </div>

            {/* RIGHT GRAPH */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.7,
              }}
              className="
                relative
                h-[320px]
                overflow-hidden
                rounded-[24px]
                border
                border-slate-200
                bg-white
                p-5
                shadow-[0_15px_50px_rgba(15,23,42,0.06)]
              "
            >
              {/* Graph header */}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Growth
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Product creation
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-green-50
                    px-2.5
                    py-1
                    text-[9px]
                    font-medium
                    text-green-600
                  "
                >
                  <TrendingUp size={10} />
                  Growing
                </div>
              </div>

              {/* Grid */}

              <div
                className="
                  absolute
                  bottom-8
                  left-5
                  right-5
                  top-20
                  opacity-50
                  [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)]
                  [background-size:55px_55px]
                "
              />

              {/* Graph */}

              <svg
                viewBox="0 0 600 260"
                className="
                  absolute
                  bottom-5
                  left-5
                  right-5
                  h-[230px]
                  w-[calc(100%-40px)]
                "
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="statsGraphLine"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor="#93c5fd"
                    />

                    <stop
                      offset="55%"
                      stopColor="#8b5cf6"
                    />

                    <stop
                      offset="100%"
                      stopColor="#fb7185"
                    />
                  </linearGradient>

                  <linearGradient
                    id="statsGraphFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8b5cf6"
                      stopOpacity="0.16"
                    />

                    <stop
                      offset="100%"
                      stopColor="#8b5cf6"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <motion.path
                  d="
                    M0 235
                    C60 235 70 225 120 215
                    C160 205 170 180 220 170
                    C270 160 280 135 330 125
                    C380 115 390 90 440 80
                    C490 70 520 40 600 10
                  "
                  fill="none"
                  stroke="url(#statsGraphLine)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{
                    pathLength: 0,
                  }}
                  whileInView={{
                    pathLength: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 1.8,
                    ease: "easeOut",
                  }}
                />

                <motion.path
                  d="
                    M0 235
                    C60 235 70 225 120 215
                    C160 205 170 180 220 170
                    C270 160 280 135 330 125
                    C380 115 390 90 440 80
                    C490 70 520 40 600 10
                    L600 260
                    L0 260
                    Z
                  "
                  fill="url(#statsGraphFill)"
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
                    duration: 1.2,
                    delay: 0.4,
                  }}
                />

                {/* End point */}

                <motion.circle
                  cx="600"
                  cy="10"
                  r="6"
                  fill="#8b5cf6"
                  initial={{
                    scale: 0,
                  }}
                  whileInView={{
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: 1.5,
                  }}
                />
              </svg>

              {/* Bottom labels */}

              <div
                className="
                  absolute
                  bottom-2
                  left-5
                  right-5
                  flex
                  justify-between
                  text-[8px]
                  text-slate-400
                "
              >
                <span>Start</span>
                <span>Growth</span>
                <span>Scale</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom trust */}

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
          }}
          className="
            mt-16
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
              size={11}
              className="text-green-500"
            />
            AI-powered
          </span>

          <span className="flex items-center gap-1.5">
            <Check
              size={11}
              className="text-green-500"
            />
            Production-ready
          </span>

          <span className="flex items-center gap-1.5">
            <Check
              size={11}
              className="text-green-500"
            />
            Built to scale
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;