import {
  MessageSquare,
  Brain,
  Code2,
  Rocket,
} from "lucide-react";

const steps = [
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
    <section className="bg-slate-50 py-28 transition-colors duration-500 dark:bg-[#070B14]">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
            How it works
          </p>

          <h2 className="mt-4 text-4xl font-bold text-slate-950 md:text-6xl dark:text-white">

            From idea to product

            <br />

            <span className="text-slate-400 dark:text-slate-500">
              in minutes.
            </span>

          </h2>

        </div>

        <div className="relative mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {steps.map((step) => {

            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="
                  relative rounded-3xl
                  border border-slate-200
                  bg-white p-7
                  shadow-sm

                  dark:border-white/10
                  dark:bg-white/[0.02]
                  dark:shadow-none
                "
              >

                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {step.number}
                </span>

                <div className="
                  mt-6 flex h-12 w-12 items-center justify-center
                  rounded-xl bg-slate-100 text-slate-950
                  dark:bg-white/5 dark:text-white
                ">
                  <Icon size={24} />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-slate-950 dark:text-white">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
};

export default Workflow;