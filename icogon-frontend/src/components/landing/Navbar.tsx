import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link
  to="/"
  className="flex items-center gap-3"
>
  <img
    src={logo}
    alt="ICOGON AI Logo"
    className="h-12 w-12 object-contain"
  />

  <div>
    <h1 className="text-xl font-bold text-white">
      ICOGON AI
    </h1>

    <p className="text-xs text-slate-400">
      Build with AI
    </p>
  </div>
</Link>

        {/* Desktop */}

        <div className="hidden items-center gap-10 md:flex">

          <a
            href="#features"
            className="text-slate-300 transition hover:text-white"
          >
            Features
          </a>

          <a
            href="#pricing"
            className="text-slate-300 transition hover:text-white"
          >
            Pricing
          </a>

          <a
            href="#docs"
            className="text-slate-300 transition hover:text-white"
          >
            Docs
          </a>

        </div>

        {/* Right */}

        <div className="hidden items-center gap-4 md:flex">

          <Link
            to="/login"
            className="text-slate-300 hover:text-white"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-medium text-white transition hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Get Started
              <ArrowRight size={18} />
            </span>
          </Link>

        </div>

        {/* Mobile */}

        <button
          onClick={() => setOpen(!open)}
          className="text-white md:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>

      </div>

      {open && (

        <div className="space-y-5 border-t border-white/10 bg-slate-950 px-6 py-6 md:hidden">

          <a href="#features" className="block text-slate-300">
            Features
          </a>

          <a href="#pricing" className="block text-slate-300">
            Pricing
          </a>

          <a href="#docs" className="block text-slate-300">
            Docs
          </a>

          <Link
  to="/"
  className="flex items-center gap-3"
>
  <img
    src={logo}
    alt="ICOGON AI Logo"
    className="h-12 w-12 object-contain"
  />

  <div>
    <h1 className="text-xl font-bold text-white">
      ICOGON AI
    </h1>

    <p className="text-xs text-slate-400">
      Build with AI
    </p>
  </div>
</Link>

        </div>

      )}
    </motion.nav>
  );
};

export default Navbar;