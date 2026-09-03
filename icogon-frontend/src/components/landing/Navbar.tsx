import { useState } from "react";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import logo from "../../assets/logo1.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="
        fixed
        top-0
        left-0
        right-0
        z-50
        border-b
        border-slate-200/60
        bg-white/75
        backdrop-blur-2xl
        shadow-[0_1px_0_rgba(255,255,255,0.8)]
      "
    >
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-10">

        {/* LOGO */}
        <Link
          to="/"
          className="
            flex
            items-center
            transition
            hover:opacity-80
          "
        >
          <img
            src={logo}
            alt="ICOGON AI"
            className="
              h-[200px]
              w-auto
              object-contain
            "
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-8 lg:flex">

          <button className="flex items-center gap-1 text-[14px] font-medium text-slate-700 transition hover:text-slate-950">
            Solutions
            <ChevronDown size={14} strokeWidth={1.8} />
          </button>

          <button className="flex items-center gap-1 text-[14px] font-medium text-slate-700 transition hover:text-slate-950">
            Resources
            <ChevronDown size={14} strokeWidth={1.8} />
          </button>

          <a
            href="#community"
            className="text-[14px] font-medium text-slate-700 transition hover:text-slate-950"
          >
            Community
          </a>

          <a
            href="#enterprise"
            className="text-[14px] font-medium text-slate-700 transition hover:text-slate-950"
          >
            Enterprise
          </a>

          <a
            href="#pricing"
            className="text-[14px] font-medium text-slate-700 transition hover:text-slate-950"
          >
            Pricing
          </a>

          <a
            href="#security"
            className="text-[14px] font-medium text-slate-700 transition hover:text-slate-950"
          >
            Security
          </a>

        </div>

        {/* RIGHT SIDE */}
        <div className="hidden items-center gap-3 lg:flex">

          <Link
            to="/login"
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white/70
              px-5
              py-3
              text-[14px]
              font-medium
              text-slate-800
              shadow-sm
              transition-all
              hover:bg-white
              hover:shadow-md
            "
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              bg-[#20242f]
              px-6
              py-3
              text-[14px]
              font-medium
              text-white
              shadow-lg
              shadow-slate-900/15
              transition-all
              hover:-translate-y-[1px]
              hover:bg-[#111827]
              hover:shadow-xl
            "
          >
            Get started
            <ArrowRight size={17} />
          </Link>

        </div>

        {/* MOBILE */}
        <button
          onClick={() => setOpen(!open)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            text-slate-800
            transition
            hover:bg-slate-100
            lg:hidden
          "
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="
            border-t
            border-slate-200
            bg-white/95
            px-6
            py-6
            backdrop-blur-xl
            lg:hidden
          "
        >
          <div className="flex flex-col gap-5">

            <a href="#solutions" onClick={() => setOpen(false)}>
              Solutions
            </a>

            <a href="#resources" onClick={() => setOpen(false)}>
              Resources
            </a>

            <a href="#community" onClick={() => setOpen(false)}>
              Community
            </a>

            <a href="#enterprise" onClick={() => setOpen(false)}>
              Enterprise
            </a>

            <a href="#pricing" onClick={() => setOpen(false)}>
              Pricing
            </a>

            <a href="#security" onClick={() => setOpen(false)}>
              Security
            </a>

            <div className="mt-2 flex gap-3">

              <Link
                to="/login"
                className="
                  flex-1
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  py-3
                  text-center
                  font-medium
                "
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#20242f]
                  py-3
                  font-medium
                  text-white
                "
              >
                Get started
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>
        </motion.div>
      )}

    </motion.nav>
  );
};

export default Navbar;