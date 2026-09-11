import {
  MessageSquare,
  Brain,
  Code2,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Describe your idea",
    description:
      "Tell ICOGON what you want to build using natural language.",
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "AI plans everything",
    description:
      "Our AI analyzes your requirements and creates a complete plan.",
    icon: Brain,
  },
  {
    number: "03",
    title: "Generate your product",
    description:
      "Frontend, backend, database and AI agents are generated.",
    icon: Code2,
  },
  {
    number: "04",
    title: "Preview & deploy",
    description:
      "Test your application and deploy it when you're ready.",
    icon: Rocket,
  },
];

const Workflow = () => {
  return (
    <section className="relative overflow-hidden bg-[#f7f8fc] py-28">

      {/* Background Glow */}
      <div className="pointer-events-none absolute left-[-250px] top-[150px] h-[500px] w-[500px] rounded-full bg-blue-400/15 blur-[150px]" />

      <div className="pointer-events-none absolute right-[-250px] bottom-[100px] h-[500px] w-[500px] rounded-full bg-violet-400/15 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">
            How it works
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-1.5px] text-[#17213a] md:text-6xl">
            From idea to product

            <br />

            <span className="text-slate-400">
              in minutes.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
            ICOGON transforms your idea into a complete product through
            a simple AI-powered workflow.
          </p>

        </div>

        {/* Steps */}
        <div className="relative mt-20 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

          {/* Connecting Line - Desktop */}
          <div className="absolute left-[12%] right-[12%] top-[52px] hidden h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="
                  relative
                  z-10
                  rounded-[20px]
                  border
                  border-slate-200
                  bg-white
                  p-7
                  shadow-[0_10px_40px_rgba(15,23,42,0.06)]
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:border-blue-200
                  hover:shadow-[0_20px_60px_rgba(59,130,246,0.12)]
                "
              >
                {/* Step Number */}
                <span className="text-xs font-bold tracking-[0.15em] text-blue-500">
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className="
                    mt-6
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-blue-500/15
                    via-cyan-400/15
                    to-violet-500/15
                    text-blue-600
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                >
                  <Icon size={23} strokeWidth={1.8} />
                </div>

                {/* Title */}
                <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.3px] text-[#17213a]">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-[14px] leading-7 text-slate-600">
                  {step.description}
                </p>

              </motion.div>
            );
          })}

        </div>

      </div>

    </section>
  );
};

export default Workflow;