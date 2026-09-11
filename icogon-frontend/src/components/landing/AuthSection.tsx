import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

const AuthSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#f8f8f7] py-32">

      {/* Soft background glow */}

      <div className="pointer-events-none absolute bottom-[-250px] left-[-250px] h-[550px] w-[550px] rounded-full bg-blue-400/25 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-[-250px] right-[-250px] h-[550px] w-[550px] rounded-full bg-pink-400/30 blur-[140px]" />


      <div className="relative mx-auto max-w-4xl px-6 text-center">

        {/* SMALL LABEL */}

        <p className="text-[12px] font-medium text-slate-400">
          WHAT WILL YOU BUILD?
        </p>


        {/* HEADING */}

        <h2 className="mt-5 text-3xl font-semibold tracking-[-1.5px] text-slate-900 md:text-5xl">

          Ready to bring your idea to life?

        </h2>


        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-500">

          Describe your idea and let ICOGON AI transform it into a complete
          website, application or digital product.

        </p>


        {/* PROMPT BOX */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="
            mx-auto
            mt-10
            flex
            max-w-2xl
            items-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-2
            shadow-[0_15px_50px_rgba(15,23,42,0.08)]
          "
        >

          <input
            type="text"
            placeholder="What would you like to build?"
            className="
              min-w-0
              flex-1
              bg-transparent
              px-4
              py-3
              text-sm
              text-slate-800
              outline-none
              placeholder:text-slate-400
            "
          />


          <button
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-slate-900
              text-white
              transition
              hover:scale-105
              hover:bg-slate-700
            "
          >

            <ArrowUp size={18} />

          </button>

        </motion.div>


        {/* SUBTEXT */}

        <p className="mt-5 text-xs text-slate-400">

          Start with a simple idea. ICOGON handles the rest.

        </p>

      </div>

    </section>
  );
};

export default AuthSection;