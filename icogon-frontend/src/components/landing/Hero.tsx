import { motion } from "framer-motion";
import PromptInput from "./PromptInput";

const Hero = () => {
  return (
    <section
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#f7f8fc]
        pt-[150px]
        pb-20
      "
    >
      {/* ================= BACKGROUND ================= */}

      {/* Blue Glow - Left */}
      <div
        className="
          pointer-events-none
          absolute
          left-[-180px]
          top-[180px]
          h-[650px]
          w-[650px]
          rounded-full
          bg-blue-500/45
          blur-[160px]
        "
      />

      {/* Purple Center Glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[180px]
          h-[650px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-violet-500/30
          blur-[180px]
        "
      />

      {/* Pink Right Glow */}
      <div
        className="
          pointer-events-none
          absolute
          right-[-180px]
          bottom-[-100px]
          h-[650px]
          w-[650px]
          rounded-full
          bg-pink-500/45
          blur-[170px]
        "
      />

      {/* Soft White Overlay */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-b
          from-white/70
          via-transparent
          to-white/10
        "
      />

      {/* ================= CONTENT ================= */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          max-w-7xl
          flex-col
          items-center
          px-6
          text-center
        "
      >
        {/* HERO TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="
            max-w-5xl
            text-[48px]
            font-semibold
            leading-[1.05]
            tracking-[-2.5px]
            text-[#17213a]
            md:text-[68px]
            lg:text-[78px]
          "
        >
          Build something incredible
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="
            mt-6
            max-w-2xl
            text-[18px]
            leading-relaxed
            text-slate-600
            md:text-[21px]
          "
        >
          Bring your biggest ideas to life with websites, apps, and
          AI-powered products.
        </motion.p>

        {/* PROMPT INPUT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="
            mt-12
            w-full
            max-w-[770px]
          "
        >
          <PromptInput />
        </motion.div>
      </div>

      {/* ================= ONE PLATFORM SECTION ================= */}

      <section className="relative z-10 mt-24 w-full px-6">
        {/* CENTER CONTAINER */}
        <div className="mx-auto flex max-w-6xl flex-col items-center">
          {/* Heading */}
          <div className="mb-12 flex flex-col items-center text-center">
            <h2 className="text-[32px] font-semibold tracking-[-1.2px] text-[#1f2937] md:text-[38px]">
              From idea to reality—all in one platform.
            </h2>

            <p className="mt-3 max-w-md text-[15px] leading-6 text-slate-600">
              Describe what you want, and bring it to life. Create, launch,
              and manage everything effortlessly.
            </p>
          </div>

          {/* CARDS */}
          <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
            {/* ================= CARD 1 ================= */}
            <div className="w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
              {/* Visual */}
              <div className="relative flex h-[220px] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-white to-purple-100">
                <div className="absolute h-[130px] w-[250px] rounded-[18px] border border-slate-300 bg-white shadow-xl">
                  <div className="p-5 text-[15px] text-slate-400">
                    Create an online store...
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-[15px] font-semibold text-slate-900">
                  You bring the idea. ICOGON brings it to life.
                </h3>

                <p className="mt-3 text-[14px] leading-6 text-slate-600">
                  Describe what you want in plain language. ICOGON AI builds
                  production-ready websites and applications in real time.
                </p>
              </div>
            </div>

            {/* ================= CARD 2 ================= */}
            <div className="w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
              {/* Visual */}
              <div className="relative flex h-[220px] items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-100 via-white to-blue-100">
                <div className="w-[220px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-3 flex gap-2 text-xs">
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-600">
                      Preview
                    </span>

                    <span className="text-slate-400">&lt;/&gt;</span>
                  </div>

                  <div className="rounded border border-dashed border-blue-300 p-3">
                    <p className="text-[18px] font-semibold leading-6 text-slate-700">
                      Build products that scale fast
                    </p>
                  </div>

                  <div className="mt-3 h-2 w-3/4 rounded bg-slate-100" />

                  <div className="mt-2 h-2 w-full rounded bg-slate-100" />

                  <button
                    type="button"
                    className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-500"
                  >
                    Get started
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Refine your design and deploy
                </h3>

                <p className="mt-3 text-[14px] leading-6 text-slate-600">
                  Iterate on your creation until you&apos;re happy with the
                  finished product. Then ship your idea instantly.
                </p>
              </div>
            </div>

            {/* ================= CARD 3 ================= */}
            <div className="w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
              {/* Visual */}
              <div className="relative h-[220px] overflow-hidden bg-gradient-to-br from-orange-100 via-white to-pink-100">
                <div className="absolute left-0 top-0 h-full w-[58%] border-r border-slate-200 bg-white/70 p-8">
                  <div className="space-y-4 text-[13px] text-slate-500">
                    <div>📊 Analytics</div>

                    <div>☁️ Cloud</div>

                    <div className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
                      🔗 Connectors
                    </div>

                    <div>🛡 Security</div>

                    <div>◇ AI integrations</div>

                    <div>▣ Payments</div>

                    <div>⌕ Search</div>
                  </div>
                </div>

                <div className="absolute right-6 top-8 h-[150px] w-[120px] rounded-lg border border-slate-200 bg-white shadow-sm" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Everything you need, from end to end
                </h3>

                <p className="mt-3 text-[14px] leading-6 text-slate-600">
                  ICOGON AI gives you the complete platform — from frontend
                  and backend to authentication, databases and deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Hero;