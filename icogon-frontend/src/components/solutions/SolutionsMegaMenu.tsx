import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { solutionGroups } from "../../data/solutionsData";

interface SolutionsMegaMenuProps {
  onClose: () => void;
}

const SolutionsMegaMenu = ({
  onClose,
}: SolutionsMegaMenuProps) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -6,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -6,
      }}
      transition={{
        duration: 0.18,
        ease: "easeOut",
      }}
      className="
        absolute
        left-1/2
        top-[72px]
        z-[60]
        w-[min(920px,calc(100vw-32px))]
        -translate-x-1/2
      "
    >
      <div
        className="
          overflow-hidden
          rounded-[22px]
          border
          border-slate-200
          bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.14)]
        "
      >
        <div className="grid grid-cols-[1.65fr_0.9fr]">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="px-5 py-5">

            {/* HEADER */}

            <div className="mb-3 px-2">
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Solutions
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                Build what your team needs with ICOGON AI.
              </p>
            </div>

            {/* GROUPS */}

            <div className="space-y-3">

              {solutionGroups.map((group) => (
                <div key={group.title}>

                  {/* GROUP TITLE */}

                  <div className="mb-1 px-2">
                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-slate-400
                      "
                    >
                      {group.title}
                    </p>
                  </div>

                  {/* ITEMS */}

                  <div className="grid grid-cols-2 gap-x-1">

                    {group.items.map((solution) => {
                      const Icon = solution.icon;

                      return (
                        <Link
                          key={solution.id}
                          to={solution.path}
                          onClick={onClose}
                          className="
                            group
                            flex
                            items-center
                            gap-2.5
                            rounded-xl
                            px-2
                            py-2
                            transition-all
                            duration-150
                            hover:bg-slate-100/80
                          "
                        >

                          {/* ICON */}

                          <div
                            className="
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              text-slate-600
                              shadow-sm
                              transition
                              group-hover:border-slate-300
                            "
                          >
                            <Icon
                              size={14}
                              strokeWidth={1.7}
                            />
                          </div>

                          {/* TEXT */}

                          <div className="min-w-0">

                            <div className="flex items-center gap-1">

                              <h3
                                className="
                                  text-[12px]
                                  font-semibold
                                  tracking-[-0.01em]
                                  text-slate-900
                                "
                              >
                                {solution.shortTitle}
                              </h3>

                              <ArrowUpRight
                                size={11}
                                strokeWidth={1.8}
                                className="
                                  translate-x-[-2px]
                                  opacity-0
                                  text-slate-400
                                  transition-all
                                  group-hover:translate-x-0
                                  group-hover:opacity-100
                                "
                              />

                            </div>

                            <p
                              className="
                                mt-[2px]
                                line-clamp-2
                                text-[10px]
                                leading-[1.35]
                                text-slate-500
                              "
                            >
                              {solution.description}
                            </p>

                          </div>

                        </Link>
                      );
                    })}

                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* =================================================
              RIGHT FEATURE
          ================================================= */}

          <div
            className="
              border-l
              border-slate-200
              bg-gradient-to-br
              from-slate-50
              via-white
              to-slate-100
              px-5
              py-5
            "
          >

            {/* LABEL */}

            <div
              className="
                inline-flex
                rounded-full
                border
                border-slate-200
                bg-white
                px-2.5
                py-1
                shadow-sm
              "
            >
              <span
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Build with ICOGON
              </span>
            </div>

            {/* HEADING */}

            <h2
              className="
                mt-4
                text-[22px]
                font-semibold
                leading-[1.05]
                tracking-[-0.045em]
                text-slate-950
              "
            >
              Your idea.
              <br />
              Your workflow.
              <br />
              Built with AI.
            </h2>

            {/* DESCRIPTION */}

            <p
              className="
                mt-3
                text-[10.5px]
                leading-[1.45]
                text-slate-500
              "
            >
              Describe what you want to build and let ICOGON
              help turn the idea into a working application.
            </p>

            {/* PREVIEW */}

            <div
              className="
                mt-4
                rounded-xl
                border
                border-slate-200
                bg-white
                p-2
                shadow-sm
              "
            >
              <div
                className="
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  p-2.5
                "
              >

                {/* BROWSER DOTS */}

                <div className="mb-2 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                </div>

                <div className="h-1.5 w-2/3 rounded-full bg-slate-200" />

                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <div className="col-span-2 h-8 rounded-md bg-slate-100" />
                  <div className="h-8 rounded-md bg-slate-100" />
                </div>

              </div>
            </div>

            {/* CTA */}

            <Link
              to="/builder"
              onClick={onClose}
              className="
                mt-4
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                bg-[#20242f]
                px-3.5
                py-2
                text-[10px]
                font-medium
                text-white
                shadow-md
                transition-all
                hover:-translate-y-[1px]
                hover:bg-[#111827]
              "
            >
              Start building

              <ArrowUpRight
                size={12}
                strokeWidth={1.8}
              />
            </Link>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SolutionsMegaMenu;