import { Link } from "react-router-dom";
import logo from "../../assets/logo1.png";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white transition-colors duration-500 dark:border-white/10 dark:bg-[#070B14]">

      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}

          <div>

            <Link
              to="/"
              className="flex items-center gap-3"
            >

              <img
                src={logo}
                alt="ICOGON AI"
               className="h-60 w-60 object-contain relative -top-23"
              />

              <div>


              </div>

            </Link>

            <p className="mt-6 leading-7 text-slate-600 dark:text-slate-400">

              Build websites, applications, backend systems and AI agents
              using one intelligent platform.

            </p>

          </div>

          {/* Product */}

          <div>

            <h4 className="font-semibold text-slate-950 dark:text-white">
              Product
            </h4>

            <div className="mt-5 space-y-3 text-sm">

              <a
                href="#features"
                className="block text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                Features
              </a>

              <a
                href="#pricing"
                className="block text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                Pricing
              </a>

              <Link
                to="/dashboard"
                className="block text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                Dashboard
              </Link>

            </div>

          </div>

          {/* Resources */}

          <div>

            <h4 className="font-semibold text-slate-950 dark:text-white">
              Resources
            </h4>

            <div className="mt-5 space-y-3 text-sm">

              <a
                href="#docs"
                className="block text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                Documentation
              </a>

              <a
                href="/"
                className="block text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                Tutorials
              </a>

              <a
                href="/"
                className="block text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                Community
              </a>

            </div>

          </div>

          {/* Company */}

          <div>

            <h4 className="font-semibold text-slate-950 dark:text-white">
              Company
            </h4>

            <div className="mt-5 space-y-3 text-sm">

              <a
                href="/"
                className="block text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                About
              </a>

              <a
                href="/"
                className="block text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                Contact
              </a>

              <a
                href="/"
                className="block text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                Privacy
              </a>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-16 flex flex-col gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 dark:border-white/10 md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 ICOGON AI. All rights reserved.
          </p>

          <p>
            Built for the future of software development.
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;