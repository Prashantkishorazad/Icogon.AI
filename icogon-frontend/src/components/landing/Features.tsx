import {
  Globe,
  Smartphone,
  Database,
  Bot,
  Rocket,
  Code2,
} from "lucide-react";
import { motion } from "framer-motion";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Globe,
    title: "Websites",
    description:
      "Generate modern, responsive and production-ready websites.",
  },
  {
    icon: Smartphone,
    title: "Applications",
    description:
      "Build powerful web and mobile applications using AI.",
  },
  {
    icon: Database,
    title: "Backend & Database",
    description:
      "Generate APIs, authentication and complete database systems.",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description:
      "Create intelligent AI agents for your product and workflows.",
  },
  {
    icon: Code2,
    title: "Production Code",
    description:
      "Get clean, structured and editable production-ready code.",
  },
  {
    icon: Rocket,
    title: "Deploy Instantly",
    description:
      "Preview, test and deploy your project with a single click.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#f7f8fc] py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-[-250px] top-[100px] h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[150px]" />

      <div className="pointer-events-none absolute right-[-250px] bottom-[50px] h-[500px] w-[500px] rounded-full bg-pink-400/15 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Heading */}

        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">
            One Platform
          </p>

          <h2 className="text-4xl font-semibold tracking-[-1.5px] text-[#17213a] md:text-6xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
              build faster.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            From idea to production — ICOGON brings your entire development
            workflow into one intelligent platform.
          </p>
        </div>

        {/* Features Grid */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="
                  group
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
                {/* Icon */}

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
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
                  <Icon size={26} strokeWidth={1.8} />
                </div>

                {/* Title */}

                <h3 className="mt-7 text-xl font-semibold tracking-[-0.4px] text-[#17213a]">
                  {feature.title}
                </h3>

                {/* Description */}

                <p className="mt-3 text-[15px] leading-7 text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;