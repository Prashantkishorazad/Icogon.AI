const Stats = () => {
  return (
    <section className="relative overflow-hidden bg-white py-28 transition-colors duration-500 dark:bg-[#070B14]">

      <div className="absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-600/10" />

      <div className="relative mx-auto max-w-7xl px-6">

        <div className="
          grid gap-6 rounded-3xl
          border border-slate-200
          bg-slate-50 p-8
          shadow-sm

          dark:border-white/10
          dark:bg-white/[0.02]
          dark:shadow-none

          md:grid-cols-3 md:p-14
        ">

          <div className="text-center">

            <p className="text-5xl font-bold text-slate-950 dark:text-white">
              One
            </p>

            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Prompt to start building
            </p>

          </div>

          <div className="text-center">

            <p className="text-5xl font-bold text-slate-950 dark:text-white">
              Full
            </p>

            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Product generation pipeline
            </p>

          </div>

          <div className="text-center">

            <p className="text-5xl font-bold text-slate-950 dark:text-white">
              Fast
            </p>

            <p className="mt-3 text-slate-600 dark:text-slate-400">
              From idea to deployment
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Stats;