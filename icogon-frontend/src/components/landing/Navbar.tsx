import { useEffect, useState } from "react";

import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import logo from "../../assets/logo1.png";

import SolutionsMegaMenu from "../solutions/SolutionsMegaMenu";
import { solutionsData } from "../../data/solutionsData";

import ResourcesMegaMenu from "../resources/ResourcesMegaMenu";
import ResourceItem from "../resources/ResourceItem";
import { resourcesData } from "../../data/resourcesData";

import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";

interface NavbarProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

const Navbar = (_props: NavbarProps) => {
  const location = useLocation();

  // ============================================================
  // NAVBAR STATE
  // ============================================================

  const [open, setOpen] = useState(false);

  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const [mobileSolutionsOpen, setMobileSolutionsOpen] =
    useState(false);

  const [mobileResourcesOpen, setMobileResourcesOpen] =
    useState(false);

  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  // ============================================================
  // SCROLL EFFECT
  // ============================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ============================================================
  // ESC KEY
  // ============================================================

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setSolutionsOpen(false);
      setResourcesOpen(false);

      setMobileSolutionsOpen(false);
      setMobileResourcesOpen(false);

      setOpen(false);
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ============================================================
  // LOCK BODY SCROLL WHEN MOBILE MENU IS OPEN
  // ============================================================

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ============================================================
  // CLOSE ALL MENUS
  // ============================================================

  const closeMenus = () => {
    setSolutionsOpen(false);
    setResourcesOpen(false);

    setMobileSolutionsOpen(false);
    setMobileResourcesOpen(false);

    setOpen(false);
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = () => {
    closeMenus();

    setSignupOpen(false);
    setLoginOpen(true);
  };

  // ============================================================
  // SIGNUP
  // ============================================================

  const handleSignup = () => {
    closeMenus();

    setLoginOpen(false);
    setSignupOpen(true);
  };

  // ============================================================
  // CLOSE LOGIN
  // ============================================================

  const handleCloseLogin = () => {
    setLoginOpen(false);
  };

  // ============================================================
  // CLOSE SIGNUP
  // ============================================================

  const handleCloseSignup = () => {
    setSignupOpen(false);
  };

  // ============================================================
  // SIGNUP -> LOGIN
  // ============================================================

  const handleSignupLogin = () => {
    setSignupOpen(false);
    setLoginOpen(true);
  };

  // ============================================================
  // SOLUTIONS
  // ============================================================

  const handleSolutions = () => {
    setSolutionsOpen((prev) => !prev);

    setResourcesOpen(false);

    setMobileSolutionsOpen(false);
    setMobileResourcesOpen(false);

    setOpen(false);
  };

  // ============================================================
  // RESOURCES
  // ============================================================

  const handleResources = () => {
    setResourcesOpen((prev) => !prev);

    setSolutionsOpen(false);

    setMobileSolutionsOpen(false);
    setMobileResourcesOpen(false);

    setOpen(false);
  };

  // ============================================================
  // MOBILE MENU
  // ============================================================

  const handleMobileMenu = () => {
    setOpen((prev) => !prev);

    setSolutionsOpen(false);
    setResourcesOpen(false);

    setLoginOpen(false);
    setSignupOpen(false);
  };

  // ============================================================
  // ACTIVE ROUTE
  // ============================================================

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  // ============================================================
  // NAV LINK CLASS
  // ============================================================

  const navLinkClass = (path: string) => {
    return `
      relative
      text-[14px]
      font-medium
      transition-colors
      duration-200
      ${
        isActive(path)
          ? "text-slate-950"
          : "text-slate-700 hover:text-slate-950"
      }
    `;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ========================================================
          DESKTOP / GLOBAL BACKDROP
      ======================================================== */}

      <AnimatePresence>
        {(solutionsOpen || resourcesOpen) && (
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeMenus}
            className="
              fixed
              inset-0
              top-[72px]
              z-40
              hidden
              bg-slate-950/[0.025]
              backdrop-blur-[1px]
              lg:block
            "
          />
        )}
      </AnimatePresence>

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <motion.nav
        initial={{
          y: -30,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className={`
          fixed
          left-0
          right-0
          top-0
          z-[70]
          border-b
          transition-all
          duration-300
          ${
            scrolled
              ? `
                border-slate-200/80
                bg-white/90
                shadow-[0_8px_30px_rgba(15,23,42,0.06)]
              `
              : `
                border-slate-200/60
                bg-white/80
                shadow-[0_1px_0_rgba(255,255,255,0.8)]
              `
          }
          backdrop-blur-2xl
        `}
      >
        {/* ======================================================
            NAVBAR CONTENT
        ====================================================== */}

        <div
          className="
            relative
            mx-auto
            flex
            h-[72px]
            w-full
            max-w-[1400px]
            items-center
            justify-between
            px-5
            sm:px-6
            lg:px-10
          "
        >
          {/* ====================================================
              LOGO
          ==================================================== */}

          <Link
            to="/"
            onClick={closeMenus}
            aria-label="ICOGON AI Home"
            className="
              relative
              z-[2]
              flex
              h-10
              w-[132px]
              shrink-0
              items-center
              overflow-visible
            "
          >
            <img
              src={logo}
              alt="ICOGON AI"
              className="
                h-auto
                w-full
                max-w-none
                object-contain
                object-left
              "
            />
          </Link>

          {/* ====================================================
              DESKTOP NAVIGATION
          ==================================================== */}

          <div
            className="
              hidden
              items-center
              gap-6
              lg:flex
              xl:gap-7
            "
          >
            {/* ==================================================
                SOLUTIONS
            ================================================== */}

            <button
              type="button"
              onClick={handleSolutions}
              aria-expanded={solutionsOpen}
              aria-haspopup="true"
              className={`
                group
                flex
                items-center
                gap-1
                text-[14px]
                font-medium
                transition-colors
                duration-200
                ${
                  solutionsOpen
                    ? "text-slate-950"
                    : "text-slate-700 hover:text-slate-950"
                }
              `}
            >
              <span>Solutions</span>

              <ChevronDown
                size={14}
                strokeWidth={1.8}
                className={`
                  transition-transform
                  duration-200
                  ${
                    solutionsOpen
                      ? "rotate-180"
                      : "group-hover:translate-y-[1px]"
                  }
                `}
              />
            </button>

            {/* ==================================================
                RESOURCES
            ================================================== */}

            <button
              type="button"
              onClick={handleResources}
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              className={`
                group
                flex
                items-center
                gap-1
                text-[14px]
                font-medium
                transition-colors
                duration-200
                ${
                  resourcesOpen
                    ? "text-slate-950"
                    : "text-slate-700 hover:text-slate-950"
                }
              `}
            >
              <span>Resources</span>

              <ChevronDown
                size={14}
                strokeWidth={1.8}
                className={`
                  transition-transform
                  duration-200
                  ${
                    resourcesOpen
                      ? "rotate-180"
                      : "group-hover:translate-y-[1px]"
                  }
                `}
              />
            </button>

            {/* ==================================================
                COMMUNITY
            ================================================== */}

            <Link
              to="/community"
              onClick={closeMenus}
              className={navLinkClass("/community")}
            >
              Community

              {isActive("/community") && (
                <span
                  className="
                    absolute
                    -bottom-[9px]
                    left-1/2
                    h-[2px]
                    w-4
                    -translate-x-1/2
                    rounded-full
                    bg-slate-900
                  "
                />
              )}
            </Link>

            {/* ==================================================
                ENTERPRISE
            ================================================== */}

            <Link
              to="/enterprise"
              onClick={closeMenus}
              className={navLinkClass("/enterprise")}
            >
              Enterprise

              {isActive("/enterprise") && (
                <span
                  className="
                    absolute
                    -bottom-[9px]
                    left-1/2
                    h-[2px]
                    w-4
                    -translate-x-1/2
                    rounded-full
                    bg-slate-900
                  "
                />
              )}
            </Link>

            {/* ==================================================
                PRICING
            ================================================== */}

            <Link
              to="/pricing"
              onClick={closeMenus}
              className={navLinkClass("/pricing")}
            >
              Pricing

              {isActive("/pricing") && (
                <span
                  className="
                    absolute
                    -bottom-[9px]
                    left-1/2
                    h-[2px]
                    w-4
                    -translate-x-1/2
                    rounded-full
                    bg-slate-900
                  "
                />
              )}
            </Link>

            {/* ==================================================
                SECURITY
            ================================================== */}

            <Link
              to="/security"
              onClick={closeMenus}
              className={navLinkClass("/security")}
            >
              Security

              {isActive("/security") && (
                <span
                  className="
                    absolute
                    -bottom-[9px]
                    left-1/2
                    h-[2px]
                    w-4
                    -translate-x-1/2
                    rounded-full
                    bg-slate-900
                  "
                />
              )}
            </Link>
          </div>

          {/* ====================================================
              DESKTOP AUTH
          ==================================================== */}

          <div
            className="
              hidden
              items-center
              gap-2.5
              lg:flex
            "
          >
            {/* ==================================================
                LOGIN
            ================================================== */}

            <button
              type="button"
              onClick={handleLogin}
              className="
                rounded-xl
                border
                border-slate-200
                bg-white/70
                px-4
                py-2.5
                text-[14px]
                font-medium
                text-slate-800
                shadow-sm
                transition-all
                duration-200
                hover:border-slate-300
                hover:bg-white
                hover:shadow-md
                active:scale-[0.98]
              "
            >
              Log in
            </button>

            {/* ==================================================
                GET STARTED
            ================================================== */}

            <button
              type="button"
              onClick={handleSignup}
              className="
                group
                flex
                items-center
                gap-2
                rounded-xl
                bg-[#20242f]
                px-4.5
                py-2.5
                text-[14px]
                font-medium
                text-white
                shadow-[0_8px_24px_rgba(32,36,47,0.18)]
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:bg-[#111827]
                hover:shadow-[0_12px_28px_rgba(32,36,47,0.22)]
                active:translate-y-0
              "
            >
              <span>Get started</span>

              <ArrowRight
                size={16}
                strokeWidth={1.9}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />
            </button>
          </div>

          {/* ====================================================
              MOBILE MENU BUTTON
          ==================================================== */}

          <button
            type="button"
            onClick={handleMobileMenu}
            aria-label={
              open
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={open}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-slate-800
              transition-all
              duration-200
              hover:bg-slate-100
              active:scale-95
              lg:hidden
            "
          >
            <AnimatePresence
              mode="wait"
              initial={false}
            >
              {open ? (
                <motion.span
                  key="close"
                  initial={{
                    opacity: 0,
                    rotate: -45,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: 45,
                    scale: 0.8,
                  }}
                >
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{
                    opacity: 0,
                    rotate: 45,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: -45,
                    scale: 0.8,
                  }}
                >
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* ========================================================
            DESKTOP SOLUTIONS MEGA MENU
        ======================================================== */}

        <AnimatePresence>
          {solutionsOpen && (
            <SolutionsMegaMenu
              onClose={() => {
                setSolutionsOpen(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* ========================================================
            DESKTOP RESOURCES MEGA MENU
        ======================================================== */}

        <AnimatePresence>
          {resourcesOpen && (
            <ResourcesMegaMenu
              onClose={() => {
                setResourcesOpen(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* ========================================================
            MOBILE MENU
        ======================================================== */}

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "calc(100vh - 72px)",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
              className="
                absolute
                left-0
                right-0
                top-[72px]
                overflow-y-auto
                border-t
                border-slate-200
                bg-white/95
                backdrop-blur-2xl
                lg:hidden
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  min-h-full
                  w-full
                  max-w-[720px]
                  flex-col
                  px-5
                  py-6
                  sm:px-6
                "
              >
                {/* ==================================================
                    MOBILE SOLUTIONS
                ================================================== */}

                <div className="border-b border-slate-100 pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSolutionsOpen(
                        (prev) => !prev
                      );

                      setMobileResourcesOpen(false);
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      text-left
                      text-[15px]
                      font-medium
                      text-slate-800
                    "
                  >
                    <span>Solutions</span>

                    <ChevronDown
                      size={17}
                      strokeWidth={1.8}
                      className={`
                        transition-transform
                        duration-200
                        ${
                          mobileSolutionsOpen
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {mobileSolutionsOpen && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="overflow-hidden"
                      >
                        <div
                          className="
                            mt-3
                            space-y-1
                            border-l
                            border-slate-200
                            pl-2
                          "
                        >
                          {solutionsData.map(
                            (solution) => {
                              const Icon =
                                solution.icon;

                              return (
                                <Link
                                  key={
                                    solution.id
                                  }
                                  to={
                                    solution.path
                                  }
                                  onClick={
                                    closeMenus
                                  }
                                  className="
                                    group
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3
                                    py-2.5
                                    transition
                                    hover:bg-slate-50
                                  "
                                >
                                  <div
                                    className="
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-lg
                                      border
                                      border-slate-200
                                      bg-white
                                      text-slate-600
                                    "
                                  >
                                    <Icon
                                      size={15}
                                      strokeWidth={1.7}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p
                                      className="
                                        text-[12px]
                                        font-semibold
                                        text-slate-800
                                      "
                                    >
                                      {
                                        solution.shortTitle
                                      }
                                    </p>

                                    <p
                                      className="
                                        mt-0.5
                                        text-[10px]
                                        leading-4
                                        text-slate-500
                                      "
                                    >
                                      {
                                        solution.description
                                      }
                                    </p>
                                  </div>
                                </Link>
                              );
                            }
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ==================================================
                    MOBILE RESOURCES
                ================================================== */}

                <div className="border-b border-slate-100 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileResourcesOpen(
                        (prev) => !prev
                      );

                      setMobileSolutionsOpen(false);
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      text-left
                      text-[15px]
                      font-medium
                      text-slate-800
                    "
                  >
                    <span>Resources</span>

                    <ChevronDown
                      size={17}
                      strokeWidth={1.8}
                      className={`
                        transition-transform
                        duration-200
                        ${
                          mobileResourcesOpen
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {mobileResourcesOpen && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="overflow-hidden"
                      >
                        <div
                          className="
                            mt-3
                            space-y-1
                            border-l
                            border-slate-200
                            pl-2
                          "
                        >
                          {resourcesData.map(
                            (resource) => (
                              <ResourceItem
                                key={
                                  resource.id
                                }
                                resource={
                                  resource
                                }
                                onClose={
                                  closeMenus
                                }
                              />
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ==================================================
                    MOBILE STANDARD LINKS
                ================================================== */}

                <div className="flex flex-col">
                  {/* COMMUNITY */}

                  <Link
                    to="/community"
                    onClick={closeMenus}
                    className="
                      border-b
                      border-slate-100
                      py-4
                      text-[15px]
                      font-medium
                      text-slate-800
                      transition
                      hover:text-slate-950
                    "
                  >
                    Community
                  </Link>

                  {/* ENTERPRISE */}

                  <Link
                    to="/enterprise"
                    onClick={closeMenus}
                    className="
                      border-b
                      border-slate-100
                      py-4
                      text-[15px]
                      font-medium
                      text-slate-800
                      transition
                      hover:text-slate-950
                    "
                  >
                    Enterprise
                  </Link>

                  {/* PRICING */}

                  <Link
                    to="/pricing"
                    onClick={closeMenus}
                    className="
                      border-b
                      border-slate-100
                      py-4
                      text-[15px]
                      font-medium
                      text-slate-800
                      transition
                      hover:text-slate-950
                    "
                  >
                    Pricing
                  </Link>

                  {/* SECURITY */}

                  <Link
                    to="/security"
                    onClick={closeMenus}
                    className="
                      border-b
                      border-slate-100
                      py-4
                      text-[15px]
                      font-medium
                      text-slate-800
                      transition
                      hover:text-slate-950
                    "
                  >
                    Security
                  </Link>
                </div>

                {/* ==================================================
                    MOBILE AUTH
                ================================================== */}

                <div
                  className="
                    mt-auto
                    flex
                    gap-3
                    border-t
                    border-slate-200
                    pt-6
                  "
                >
                  {/* LOGIN */}

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
                      shadow-sm
                      transition-all
                      hover:bg-slate-50
                      hover:shadow-md
                      active:scale-[0.98]
                    "
                  >
                    Log in
                  </button>

                  {/* GET STARTED */}

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
                      shadow-lg
                      transition-all
                      hover:bg-[#111827]
                      active:scale-[0.98]
                    "
                  >
                    Get started

                    <ArrowRight
                      size={16}
                      strokeWidth={1.9}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ========================================================
          LOGIN MODAL
      ======================================================== */}

      <LoginModal
        isOpen={loginOpen}
        onClose={handleCloseLogin}
      />

      {/* ========================================================
          SIGNUP MODAL
      ======================================================== */}

      <AnimatePresence>
        {signupOpen && (
          <SignupModal
            onClose={handleCloseSignup}
            onLogin={handleSignupLogin}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;