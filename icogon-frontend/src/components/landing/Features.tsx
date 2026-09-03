import {
  Globe,
  Smartphone,
  Database,
  Bot,
  Rocket,
  Code2,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
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
      className="relative overflow-hidden bg-slate-50 py-28 transition-colors duration-500 dark:bg-[#070B14]"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">
            One Platform
          </p>

          <h2 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-6xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">
              build faster.
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            From idea to production — ICOGON brings your entire development
            workflow into one intelligent platform.
          </p>
        </div>

        {/* Features Grid */}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="group rounded-3xl border border-slate-200 bg-white p-8 transition duration-300 hover:-translate-y-2 hover:border-cyan-500/40 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 text-cyan-500 dark:text-cyan-400">
                  <Icon size={27} />
                </div>

                <h3 className="mt-7 text-xl font-semibold text-slate-950 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
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