import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const AuthSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#070B14] py-24">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute left-10 top-20 h-[250px] w-[250px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute right-10 bottom-10 h-[250px] w-[250px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-xl md:p-14"
        >
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-violet-600/10" />

          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500"
            >
              <Sparkles className="text-white" size={26} />
            </motion.div>

            {/* Heading */}
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Turn your idea into
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                {" "}
                reality.
              </span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
              Start building with ICOGON AI. Describe what you want and let
              AI generate your website, app, backend, database and AI agents.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-4 font-semibold text-white transition hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight size={19} />
                </span>
              </Link>

              <Link
                to="/login"
                className="rounded-xl border border-slate-700 px-7 py-4 font-medium text-slate-300 transition hover:border-cyan-500 hover:text-white"
              >
                Sign In
              </Link>
            </div>

            {/* Bottom text */}
            <p className="mt-6 text-sm text-slate-500">
              No coding required • Build faster with AI
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AuthSection;