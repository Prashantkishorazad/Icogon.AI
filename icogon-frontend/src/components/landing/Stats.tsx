import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const Stats = () => {
  return (
    <section className="relative overflow-hidden bg-[#f8f8f7] py-24">

      <div className="mx-auto max-w-6xl px-6">

        {/* ================= HEADING ================= */}

        <div className="mx-auto max-w-2xl text-center">

          <p className="text-[12px] font-medium text-slate-400">
            BUILT FOR EVERYONE
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-1.5px] text-[#24262b] md:text-5xl">
            The proof is in production.
          </h2>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            From simple ideas to powerful products, ICOGON helps you turn
            your vision into something real.
          </p>

        </div>


        {/* ================= PRODUCT SHOWCASE ================= */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto mt-20 max-w-4xl"
        >

          {/* LEFT FLOATING CARD */}

          <div className="absolute left-[-70px] top-1/2 hidden h-[150px] w-[180px] -translate-y-1/2 items-center justify-center rounded-2xl border border-slate-200 bg-[#f1f1ef] text-2xl font-medium text-slate-500 shadow-sm md:flex">
            exp
          </div>


          {/* RIGHT FLOATING CARD */}

          <div className="absolute right-[-70px] top-1/2 hidden h-[150px] w-[180px] -translate-y-1/2 items-center justify-center rounded-2xl border border-slate-200 bg-[#f1f1ef] text-2xl font-medium text-slate-500 shadow-sm md:flex">
            ship
          </div>


          {/* MAIN CARD */}

          <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] md:p-10">

            {/* ICON */}

            <div className="flex justify-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                <Sparkles
                  size={18}
                  className="text-slate-700"
                />

              </div>

            </div>


            {/* SMALL TEXT */}

            <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Powered by ICOGON AI
            </p>


            {/* STATS */}

            <div className="mt-8 grid grid-cols-2 divide-x divide-slate-200 md:grid-cols-3">

              <div className="px-4 text-center">

                <p className="text-2xl font-semibold text-slate-900">
                  £130K
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Value created
                </p>

              </div>


              <div className="px-4 text-center">

                <p className="text-2xl font-semibold text-slate-900">
                  250+
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Projects shipped
                </p>

              </div>


              <div className="hidden px-4 text-center md:block">

                <p className="text-2xl font-semibold text-slate-900">
                  £7.5M
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Business impact
                </p>

              </div>

            </div>


            {/* QUESTION */}

            <div className="mt-10 border-t border-slate-100 pt-6">

              <p className="text-center text-sm text-slate-500">
                What will you build with ICOGON?
              </p>

            </div>


            {/* USER */}

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">

              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500" />

              <div>

                <p className="text-sm font-medium text-slate-800">
                  Build your next big idea
                </p>

                <p className="text-xs text-slate-400">
                  Start creating with AI today
                </p>

              </div>

            </div>

          </div>

        </motion.div>


        {/* ================= MILLIONS SECTION ================= */}

        <div className="mt-32">

          <p className="text-[12px] font-medium text-slate-400">
            BUILT WITH ICOGON
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-1px] text-slate-900">
            Millions built on ICOGON
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            A new generation of creators building websites, applications and
            digital products faster than ever.
          </p>


          {/* NUMBERS */}

          <div className="mt-10 space-y-5">

            <div>

              <p className="text-3xl font-semibold text-slate-900">
                12 million
              </p>

              <p className="text-sm text-slate-400">
                Projects created
              </p>

            </div>


            <div>

              <p className="text-3xl font-semibold text-slate-900">
                60 million
              </p>

              <p className="text-sm text-slate-400">
                AI generations
              </p>

            </div>


            <div>

              <p className="text-3xl font-semibold text-slate-900">
                900 million
              </p>

              <p className="text-sm text-slate-400">
                Lines of code generated
              </p>

            </div>

          </div>


          {/* GRAPH */}

          <div className="relative mt-[-180px] ml-auto hidden h-[300px] max-w-[600px] md:block">

            <svg
              viewBox="0 0 600 300"
              className="h-full w-full"
            >

              <defs>

                <linearGradient
                  id="graphGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >

                  <stop
                    offset="0%"
                    stopColor="#cbd5e1"
                    stopOpacity="0.25"
                  />

                  <stop
                    offset="100%"
                    stopColor="#fb7185"
                    stopOpacity="0.35"
                  />

                </linearGradient>

              </defs>


              <path
                d="
                  M0 270
                  C60 270 70 260 120 250
                  C160 240 170 210 220 200
                  C270 190 280 160 330 150
                  C380 140 390 110 440 100
                  C490 90 520 55 600 20
                "
                fill="none"
                stroke="url(#graphGradient)"
                strokeWidth="3"
              />

              <path
                d="
                  M0 270
                  C60 270 70 260 120 250
                  C160 240 170 210 220 200
                  C270 190 280 160 330 150
                  C380 140 390 110 440 100
                  C490 90 520 55 600 20
                  L600 300
                  L0 300
                  Z
                "
                fill="url(#graphGradient)"
                opacity="0.2"
              />

            </svg>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Stats;