import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PromptInput from "./PromptInput";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-32 pb-24">

      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">

        <div className="absolute left-1/2 top-24 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />

        <div className="absolute right-10 top-40 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute left-0 bottom-0 h-[350px] w-[350px] rounded-full bg-violet-500/10 blur-[120px]" />

      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">

        {/* Badge */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-300">

            🚀 AI Software Engineer

          </div>
        </motion.div>

        {/* Heading */}

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl"
        >

          Build

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">

            {" "}Websites{" "}

          </span>

          ,

          <span className="bg-gradient-to-r from-violet-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">

            {" "}Apps{" "}

          </span>

          & AI Agents

          <br />

          using one prompt.

        </motion.h1>

        {/* Subtitle */}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="mt-8 max-w-3xl text-lg leading-8 text-slate-400 md:text-xl"
        >
          Generate complete React websites, Flutter apps,
          FastAPI backends, authentication, database,
          deployment and AI agents in minutes.

        </motion.p>

        {/* CTA Buttons */}
          <PromptInput />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
          }}
          className="mt-12 flex flex-col gap-5 sm:flex-row"
        >

          <button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-lg font-semibold text-white transition hover:scale-105">

            <span className="flex items-center gap-2">

              Get Started

              <ArrowRight size={20} />

            </span>

          </button>

          <button className="rounded-xl border border-slate-700 px-8 py-4 text-lg font-medium text-slate-300 transition hover:border-cyan-500 hover:text-white">

            View Demo

          </button>

        </motion.div>

      </div>

    </section>
  );
};

export default Hero;