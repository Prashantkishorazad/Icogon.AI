import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowUp,
  Sparkles,
  X,
} from "lucide-react";

import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import Workflow from "../../components/landing/Workflow";
import Stats from "../../components/landing/Stats";
import AuthSection from "../../components/landing/AuthSection";
import Footer from "../../components/landing/Footer";
import LoginModal from "../../components/auth/LoginModal";
import SignupModal from "../../components/auth/SignupModal";

type SectionId =
  | "home"
  | "features"
  | "workflow"
  | "stats"
  | "auth";

const LandingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [authModal, setAuthModal] = useState<
    "login" | "signup" | null
  >(null);

  const [activeSection, setActiveSection] =
    useState<SectionId>("home");

  const [showBackToTop, setShowBackToTop] =
    useState(false);

  const [showFloatingCta, setShowFloatingCta] =
    useState(false);

  const [scrollProgress, setScrollProgress] =
    useState(0);

  /*
   * ============================================================
   * OPEN LOGIN MODAL AFTER LOGOUT
   * ============================================================
   *
   * DashboardSidebar navigates to:
   *
   * /
   *
   * with:
   *
   * {
   *   openLogin: true
   * }
   *
   * When LandingPage receives that state,
   * it automatically opens LoginModal.
   */
  /*
 * Open login modal after logout
 */
useEffect(() => {
  const state = location.state as
    | { openLogin?: boolean }
    | null;

  if (state?.openLogin) {
    // Open the login modal
    setAuthModal("login");

    // Remove the navigation state so that
    // refreshing the page does not open the modal again.
    navigate("/", {
      replace: true,
      state: null,
    });
  }
}, [location, navigate]);

  /*
   * ============================================================
   * SCROLL PROGRESS + ACTIVE SECTION
   * ============================================================
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        documentHeight > 0
          ? (scrollTop / documentHeight) * 100
          : 0;

      setScrollProgress(
        Math.min(progress, 100)
      );

      setShowBackToTop(
        scrollTop > 500
      );

      setShowFloatingCta(
        scrollTop > 650
      );

      const sections: SectionId[] = [
        "home",
        "features",
        "workflow",
        "stats",
        "auth",
      ];

      let current: SectionId = "home";

      for (const section of sections) {
        const element =
          document.getElementById(section);

        if (!element) {
          continue;
        }

        const rect =
          element.getBoundingClientRect();

        if (rect.top <= 180) {
          current = section;
        }
      }

      setActiveSection(current);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * ============================================================
   * SMOOTH SECTION NAVIGATION
   * ============================================================
   */
  const scrollToSection = (
    section: SectionId
  ) => {
    const element =
      document.getElementById(section);

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /*
   * ============================================================
   * BACK TO TOP
   * ============================================================
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-x-hidden
        bg-[#f7f8fc]
        text-[#1f2937]
        transition-colors
        duration-300
        dark:bg-[#070B14]
        dark:text-white
      "
    >
      {/* =========================
          SCROLL PROGRESS
      ========================== */}

      <div
        className="
          fixed
          left-0
          top-0
          z-[100]
          h-[2px]
          w-full
          bg-transparent
        "
      >
        <div
          className="
            h-full
            bg-gradient-to-r
            from-blue-500
            via-cyan-400
            to-violet-500
            transition-[width]
            duration-100
          "
          style={{
            width: `${scrollProgress}%`,
          }}
        />
      </div>

      {/* =========================
          NAVBAR
      ========================== */}

      <Navbar
        onLogin={() =>
          setAuthModal("login")
        }
        onSignup={() =>
          setAuthModal("signup")
        }
      />

      {/* =========================
          HOME
      ========================== */}

      <section
        id="home"
        className="scroll-mt-16"
      >
        <Hero />
      </section>

      {/* =========================
          FEATURES
      ========================== */}

      <section
        id="features"
        className="scroll-mt-16"
      >
        <Features />
      </section>

      {/* =========================
          WORKFLOW
      ========================== */}

      <section
        id="workflow"
        className="scroll-mt-16"
      >
        <Workflow />
      </section>

      {/* =========================
          STATS
      ========================== */}

      <section
        id="stats"
        className="scroll-mt-16"
      >
        <Stats />
      </section>

      {/* =========================
          AUTH / CTA
      ========================== */}

      <section
        id="auth"
        className="scroll-mt-16"
      >
        <AuthSection />
      </section>

      {/* =========================
          FOOTER
      ========================== */}

      <Footer />

      {/* =========================
          ACTIVE SECTION NAV
      ========================== */}

      <div
        className="
          fixed
          bottom-5
          left-1/2
          z-40
          hidden
          -translate-x-1/2
          items-center
          gap-1
          rounded-full
          border
          border-slate-200/80
          bg-white/90
          p-1.5
          shadow-lg
          shadow-slate-900/10
          backdrop-blur-xl
          md:flex
          dark:border-slate-800/80
          dark:bg-slate-900/90
          dark:shadow-black/20
        "
      >
        {(
          [
            ["home", "Home"],
            ["features", "Features"],
            ["workflow", "Workflow"],
            ["stats", "Stats"],
            ["auth", "Get Started"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() =>
              scrollToSection(id)
            }
            className={`
              rounded-full
              px-3
              py-1.5
              text-[11px]
              font-medium
              transition
              ${
                activeSection === id
                  ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* =========================
          FLOATING CTA
      ========================== */}

      {showFloatingCta && (
        <div
          className="
            fixed
            bottom-5
            right-5
            z-50
          "
        >
          <div className="group relative">
            <button
              type="button"
              onClick={() =>
                setAuthModal("signup")
              }
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-slate-950
                px-4
                py-3
                text-xs
                font-semibold
                text-white
                shadow-xl
                shadow-slate-900/20
                transition
                duration-200
                hover:-translate-y-0.5
                hover:shadow-2xl
                dark:bg-white
                dark:text-slate-950
              "
            >
              <Sparkles
                size={15}
                className="
                  text-cyan-400
                  dark:text-blue-600
                "
              />

              <span className="hidden sm:inline">
                Build with ICOGON AI
              </span>

              <span className="sm:hidden">
                Build
              </span>
            </button>

            <button
              type="button"
              aria-label="Close floating CTA"
              onClick={(event) => {
                event.stopPropagation();

                setShowFloatingCta(false);
              }}
              className="
                absolute
                -right-1
                -top-1
                flex
                h-4
                w-4
                items-center
                justify-center
                rounded-full
                bg-slate-700
                text-white
                opacity-0
                transition
                group-hover:opacity-100
                dark:bg-slate-300
                dark:text-slate-900
              "
            >
              <X size={9} />
            </button>
          </div>
        </div>
      )}

      {/* =========================
          BACK TO TOP
      ========================== */}

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="
            fixed
            bottom-5
            left-5
            z-50
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-600
            shadow-lg
            transition
            duration-200
            hover:-translate-y-0.5
            hover:bg-slate-50
            hover:text-slate-900
            dark:border-slate-800
            dark:bg-slate-900
            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-white
            md:bottom-20
          "
        >
          <ArrowUp size={17} />
        </button>
      )}

      {/* =========================
          LOGIN MODAL
      ========================== */}

      <LoginModal
        isOpen={authModal === "login"}
        onClose={() =>
          setAuthModal(null)
        }
      />

      {/* =========================
          SIGNUP MODAL
      ========================== */}

      {authModal === "signup" && (
        <SignupModal
          onClose={() =>
            setAuthModal(null)
          }
          onLogin={() =>
            setAuthModal("login")
          }
        />
      )}
    </main>
  );
};

export default LandingPage;