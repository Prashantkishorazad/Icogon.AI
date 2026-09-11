import { useState } from "react";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import logo from "../../assets/logo1.png";

interface NavbarProps {
  onLogin: () => void;
  onSignup: () => void;
}

const Navbar = ({
  onLogin,
  onSignup,
}: NavbarProps) => {
  const [open, setOpen] = useState(false);

  const handleLogin = () => {
    setOpen(false);
    onLogin();
  };

  const handleSignup = () => {
    setOpen(false);
    onSignup();
  };

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
        bg-white/80
        backdrop-blur-2xl
        shadow-[0_1px_0_rgba(255,255,255,0.8)]
      "
    >
      {/* ================= NAVBAR CONTENT ================= */}

      <div
        className="
          mx-auto
          flex
          h-[72px]
          max-w-[1400px]
          items-center
          justify-between
          px-6
          lg:px-10
        "
      >
        {/* ================= LOGO ================= */}

        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center"
        >
          <img
            src={logo}
            alt="ICOGON AI"
            className="
              h-11
    w-auto
    max-w-[510px]
    scale-[5.5]
    origin-left
    object-contain
    object-left
            "
          />
        </Link>


        {/* ================= DESKTOP NAV ================= */}

        <div className="hidden items-center gap-7 lg:flex">

          <button
            type="button"
            className="
              flex
              items-center
              gap-1
              text-[14px]
              font-medium
              text-slate-700
              transition
              hover:text-slate-950
            "
          >
            Solutions
            <ChevronDown size={14} strokeWidth={1.8} />
          </button>


          <button
            type="button"
            className="
              flex
              items-center
              gap-1
              text-[14px]
              font-medium
              text-slate-700
              transition
              hover:text-slate-950
            "
          >
            Resources
            <ChevronDown size={14} strokeWidth={1.8} />
          </button>


          <a
            href="#community"
            className="
              text-[14px]
              font-medium
              text-slate-700
              transition
              hover:text-slate-950
            "
          >
            Community
          </a>


          <a
            href="#enterprise"
            className="
              text-[14px]
              font-medium
              text-slate-700
              transition
              hover:text-slate-950
            "
          >
            Enterprise
          </a>


          <a
            href="#pricing"
            className="
              text-[14px]
              font-medium
              text-slate-700
              transition
              hover:text-slate-950
            "
          >
            Pricing
          </a>


          <a
            href="#security"
            className="
              text-[14px]
              font-medium
              text-slate-700
              transition
              hover:text-slate-950
            "
          >
            Security
          </a>

        </div>


        {/* ================= DESKTOP BUTTONS ================= */}

        <div className="hidden items-center gap-3 lg:flex">

          {/* LOGIN */}

          <button
            type="button"
            onClick={handleLogin}
            className="
              rounded-xl
              border
              border-slate-200
              bg-white/70
              px-5
              py-2.5
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
          </button>


          {/* SIGNUP */}

          <button
            type="button"
            onClick={handleSignup}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-[#20242f]
              px-5
              py-2.5
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

          </button>

        </div>


        {/* ================= MOBILE MENU BUTTON ================= */}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
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
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>


      {/* ================= MOBILE MENU ================= */}

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
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

              <a
                href="#solutions"
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-slate-700"
              >
                Solutions
              </a>

              <a
                href="#resources"
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-slate-700"
              >
                Resources
              </a>

              <a
                href="#community"
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-slate-700"
              >
                Community
              </a>

              <a
                href="#enterprise"
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-slate-700"
              >
                Enterprise
              </a>

              <a
                href="#pricing"
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-slate-700"
              >
                Pricing
              </a>

              <a
                href="#security"
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-slate-700"
              >
                Security
              </a>


              {/* ================= MOBILE AUTH BUTTONS ================= */}

              <div
                className="
                  mt-3
                  flex
                  gap-3
                  border-t
                  border-slate-200
                  pt-5
                "
              >

                <button
                  type="button"
                  onClick={handleLogin}
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    py-3
                    text-center
                    text-[14px]
                    font-medium
                    text-slate-800
                  "
                >
                  Log in
                </button>


                <button
                  type="button"
                  onClick={handleSignup}
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#20242f]
                    py-3
                    text-[14px]
                    font-medium
                    text-white
                  "
                >
                  Get started

                  <ArrowRight size={16} />

                </button>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </motion.nav>
  );
};

export default Navbar;