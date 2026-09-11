import { Link } from "react-router-dom";
import logo from "../../assets/logo1.png";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#f8f8f7] px-4 pb-4">

      {/* ================= GRADIENT BACKGROUND ================= */}

      <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[400px] bg-blue-500/40 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[400px] bg-pink-500/40 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-[-200px] left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-violet-500/30 blur-[140px]" />


      {/* ================= FOOTER CARD ================= */}

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          rounded-t-3xl
          border
          border-white/70
          bg-white/90
          px-8
          py-16
          shadow-[0_20px_80px_rgba(15,23,42,0.08)]
          backdrop-blur-xl
          md:px-14
        "
      >

        {/* ================= MAIN GRID ================= */}

        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-5">


          {/* BRAND */}

          <div className="lg:col-span-2">

            <Link
              to="/"
              className="inline-flex items-center"
            >

              <img
                src={logo}
                alt="ICOGON AI"
                className="relative -top-35 h-80 w-auto object-contain"
              />

            </Link>


            <p className="mt-6 max-w-sm text-sm leading-6 text-slate-500">

              Build websites, applications and complete digital products
              using the power of artificial intelligence.

            </p>

          </div>


          {/* PRODUCT */}

          <div>

            <h4 className="text-sm font-semibold text-slate-900">
              Product
            </h4>

            <div className="mt-5 space-y-3">

              <a
                href="#features"
                className="block text-sm text-slate-500 transition hover:text-slate-900"
              >
                Features
              </a>

              <a
                href="#pricing"
                className="block text-sm text-slate-500 transition hover:text-slate-900"
              >
                Pricing
              </a>

              <Link
                to="/dashboard"
                className="block text-sm text-slate-500 transition hover:text-slate-900"
              >
                Dashboard
              </Link>

            </div>

          </div>


          {/* RESOURCES */}

          <div>

            <h4 className="text-sm font-semibold text-slate-900">
              Resources
            </h4>

            <div className="mt-5 space-y-3">

              <a
                href="/"
                className="block text-sm text-slate-500 transition hover:text-slate-900"
              >
                Documentation
              </a>

              <a
                href="/"
                className="block text-sm text-slate-500 transition hover:text-slate-900"
              >
                Tutorials
              </a>

              <a
                href="/"
                className="block text-sm text-slate-500 transition hover:text-slate-900"
              >
                Community
              </a>

            </div>

          </div>


          {/* COMPANY */}

          <div>

            <h4 className="text-sm font-semibold text-slate-900">
              Company
            </h4>

            <div className="mt-5 space-y-3">

              <a
                href="/"
                className="block text-sm text-slate-500 transition hover:text-slate-900"
              >
                About
              </a>

              <a
                href="/"
                className="block text-sm text-slate-500 transition hover:text-slate-900"
              >
                Contact
              </a>

              <a
                href="/"
                className="block text-sm text-slate-500 transition hover:text-slate-900"
              >
                Privacy
              </a>

            </div>

          </div>

        </div>


        {/* ================= BOTTOM ================= */}

        <div className="mt-16 flex flex-col gap-5 border-t border-slate-200 pt-7 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 ICOGON AI. All rights reserved.
          </p>


          <div className="flex gap-6">

            <a
              href="/"
              className="transition hover:text-slate-700"
            >
              Privacy
            </a>

            <a
              href="/"
              className="transition hover:text-slate-700"
            >
              Terms
            </a>

            <span>
              Built with AI
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;