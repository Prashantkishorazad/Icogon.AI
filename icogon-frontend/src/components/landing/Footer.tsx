import { motion } from "framer-motion";
import { ArrowUpRight, Code2, BriefcaseBusiness, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo1.png";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features", type: "anchor" },
    { label: "Pricing", href: "#pricing", type: "anchor" },
    { label: "Dashboard", href: "/dashboard", type: "route" },
  ],
  Resources: [
    { label: "Documentation", href: "/", type: "route" },
    { label: "Tutorials", href: "/", type: "route" },
    { label: "Community", href: "/", type: "route" },
  ],
  Company: [
    { label: "About", href: "/", type: "route" },
    { label: "Contact", href: "/", type: "route" },
    { label: "Privacy", href: "/", type: "route" },
  ],
};

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: Code2,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: BriefcaseBusiness,
  },
  {
    label: "X",
    href: "https://x.com",
    icon: MessageCircle,
  },
];

const Footer = () => {
  const handleAnchorClick = (href: string) => {
    const id = href.replace("#", "");
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[#f8f8f7] px-4 pb-4 pt-10 sm:pt-14">

      {/* Background glows */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-blue-400/20 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-pink-400/20 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-violet-400/15 blur-[130px]" />

      {/* Footer card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
          relative
          mx-auto
          max-w-7xl
          overflow-hidden
          rounded-t-[28px]
          border
          border-slate-200/80
          bg-white/90
          px-6
          py-10
          shadow-[0_20px_70px_rgba(15,23,42,0.07)]
          backdrop-blur-xl
          sm:px-8
          sm:py-12
          md:px-12
          lg:px-14
        "
      >

        {/* Subtle top gradient line */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

        {/* Main grid */}
        <div className="grid gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">

            <Link
              to="/"
              className="group inline-flex items-center"
              aria-label="ICOGON AI Home"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <img
                  src={logo}
                  alt="ICOGON AI"
                  className="h-20 w-auto object-contain sm:h-24"
                />
              </motion.div>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              Build websites, applications and complete digital products
              using the power of artificial intelligence.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.94 }}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-slate-500
                      shadow-sm
                      transition
                      hover:border-slate-300
                      hover:bg-slate-50
                      hover:text-slate-900
                    "
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-slate-900">
                {title}
              </h4>

              <div className="mt-5 space-y-2">
                {links.map((item) => {

                  if (item.type === "anchor") {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleAnchorClick(item.href)}
                        className="
                          group
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-lg
                          py-1
                          text-left
                          text-sm
                          text-slate-500
                          transition
                          hover:text-slate-900
                        "
                      >
                        <span>{item.label}</span>

                        <ArrowUpRight
                          size={13}
                          className="
                            opacity-0
                            -translate-x-1
                            transition-all
                            group-hover:translate-x-0
                            group-hover:opacity-100
                          "
                        />
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="
                        group
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        py-1
                        text-sm
                        text-slate-500
                        transition
                        hover:text-slate-900
                      "
                    >
                      <span>{item.label}</span>

                      <ArrowUpRight
                        size={13}
                        className="
                          opacity-0
                          -translate-x-1
                          transition-all
                          group-hover:translate-x-0
                          group-hover:opacity-100
                        "
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="
            mt-10
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-slate-200
            bg-gradient-to-r
            from-slate-50
            via-white
            to-blue-50/70
            p-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Build your next product with AI.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Turn your idea into a working digital product.
            </p>
          </div>

          <Link
            to="/builder"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-slate-900
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-slate-800
              active:scale-[0.98]
            "
          >
            Start Building
            <ArrowUpRight size={14} />
          </Link>
        </motion.div>

        {/* Bottom */}
        <div
          className="
            mt-8
            flex
            flex-col
            gap-4
            border-t
            border-slate-200
            pt-6
            text-xs
            text-slate-400
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>© 2026 ICOGON AI. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="transition hover:text-slate-700"
            >
              Privacy
            </Link>

            <Link
              to="/"
              className="transition hover:text-slate-700"
            >
              Terms
            </Link>
          </div>
        </div>

      </motion.div>
    </footer>
  );
};

export default Footer;