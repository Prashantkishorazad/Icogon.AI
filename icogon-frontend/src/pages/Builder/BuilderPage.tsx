import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lightbulb,
  Sparkles,
  XCircle,
  WandSparkles,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { createProjectApi } from "../../api/projectApi";

import { useTheme } from "../../context/ThemeContext";

// ============================================================
// PAGE
// ============================================================

const BuilderPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const {
    resolvedTheme,
  } = useTheme();

  const isDark =
    resolvedTheme === "dark";

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // GET PROMPT FROM DASHBOARD
  // ==========================================================

  useEffect(() => {
    const dashboardPrompt =
      searchParams.get("prompt");

    if (dashboardPrompt) {
      setDescription(
        dashboardPrompt
      );
    }
  }, [searchParams]);

  // ==========================================================
  // CREATE PROJECT
  // ==========================================================

  const handleCreateProject = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const cleanName =
      name.trim();

    const cleanDescription =
      description.trim();

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!cleanName) {
      setError(
        "Project name is required."
      );
      return;
    }

    if (!cleanDescription) {
      setError(
        "Please describe what you want to build."
      );
      return;
    }

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    try {
      setLoading(true);
      setError("");

      const project =
        await createProjectApi({
          name: cleanName,
          description:
            cleanDescription,
        });

      console.log(
        "Project created:",
        project
      );

      navigate(
        `/builder/${project.id}`
      );
    } catch (err: any) {
      console.error(
        "Create project error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CHARACTER COUNT
  // ==========================================================

  const descriptionLength =
    description.length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className={`
        min-h-screen
        overflow-x-hidden
        transition-colors
        duration-200

        ${
          isDark
            ? "bg-[#080808] text-white"
            : "bg-[#fafafa] text-slate-900"
        }
      `}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className={`
          sticky
          top-0
          z-50
          h-[54px]
          border-b
          backdrop-blur-xl

          ${
            isDark
              ? "border-[#242424] bg-[#080808]/90"
              : "border-slate-200 bg-white/90"
          }
        `}
      >
        <div
          className="
            mx-auto
            flex
            h-full
            max-w-[1200px]
            items-center
            justify-between
            px-4
            sm:px-5
            lg:px-7
          "
        >
          {/* LEFT */}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className={`
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                transition

                ${
                  isDark
                    ? "text-[#777] hover:bg-[#1d1d1d] hover:text-white"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                }
              `}
              title="Back to dashboard"
            >
              <ArrowLeft size={15} />
            </button>

            <div
              className={`
                h-5
                w-px

                ${
                  isDark
                    ? "bg-[#292929]"
                    : "bg-slate-200"
                }
              `}
            />

            <div className="flex items-center gap-2">
              <div
                className={`
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg

                  ${
                    isDark
                      ? "bg-white text-black"
                      : "bg-slate-900 text-white"
                  }
                `}
              >
                <Sparkles size={13} />
              </div>

              <span
                className={`
                  text-xs
                  font-semibold
                  tracking-wide

                  ${
                    isDark
                      ? "text-white"
                      : "text-slate-900"
                  }
                `}
              >
                ICOGON AI
              </span>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2">
            <span
              className={`
                hidden
                text-[10px]
                sm:block

                ${
                  isDark
                    ? "text-[#555]"
                    : "text-slate-400"
                }
              `}
            >
              New project
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative min-h-[calc(100vh-54px)] overflow-hidden">
        {/* BACKGROUND */}

        <div
          className={`
            pointer-events-none
            absolute
            left-1/2
            top-[-180px]
            h-[420px]
            w-[650px]
            -translate-x-1/2
            rounded-full
            blur-[120px]

            ${
              isDark
                ? "bg-cyan-500/[0.035]"
                : "bg-cyan-400/[0.055]"
            }
          `}
        />

        <div
          className={`
            pointer-events-none
            absolute
            right-[-180px]
            top-[40%]
            h-[350px]
            w-[350px]
            rounded-full
            blur-[120px]

            ${
              isDark
                ? "bg-purple-500/[0.025]"
                : "bg-purple-400/[0.035]"
            }
          `}
        />

        {/* CONTENT */}

        <div
          className="
            relative
            z-10
            mx-auto
            max-w-[900px]
            px-4
            py-10
            sm:px-6
            sm:py-12
            lg:px-8
            lg:py-16
          "
        >
          {/* =================================================
              INTRO
          ================================================= */}

          <section className="mx-auto max-w-2xl text-center">
            <div
              className={`
                mx-auto
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl

                ${
                  isDark
                    ? "bg-[#171717] text-[#aaa]"
                    : "bg-white text-slate-500 shadow-sm"
                }
              `}
            >
              <WandSparkles size={18} />
            </div>

            <h1
              className={`
                mt-5
                text-2xl
                font-semibold
                tracking-tight
                sm:text-3xl

                ${
                  isDark
                    ? "text-white"
                    : "text-slate-900"
                }
              `}
            >
              What do you want to build?
            </h1>

            <p
              className={`
                mx-auto
                mt-2
                max-w-lg
                text-xs
                leading-5
                sm:text-sm

                ${
                  isDark
                    ? "text-[#777]"
                    : "text-slate-500"
                }
              `}
            >
              Describe your idea and
              ICOGON AI will use it as the
              foundation for your project.
            </p>
          </section>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={
              handleCreateProject
            }
            className="mx-auto mt-8 max-w-[760px]"
          >
            <div
              className={`
                overflow-hidden
                rounded-2xl
                border
                transition-colors

                ${
                  isDark
                    ? "border-[#292929] bg-[#101010]"
                    : "border-slate-200 bg-white shadow-sm"
                }
              `}
            >
              {/* =================================================
                  PROJECT NAME
              ================================================= */}

              <div
                className={`
                  border-b
                  p-4
                  sm:p-5

                  ${
                    isDark
                      ? "border-[#242424]"
                      : "border-slate-100"
                  }
                `}
              >
                <label
                  htmlFor="project-name"
                  className={`
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-medium

                    ${
                      isDark
                        ? "text-[#ccc]"
                        : "text-slate-700"
                    }
                  `}
                >
                  <FileText
                    size={14}
                    className={
                      isDark
                        ? "text-[#777]"
                        : "text-slate-400"
                    }
                  />

                  Project name
                </label>

                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(
                      e.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="My Restaurant CRM"
                  autoComplete="off"
                  className={`
                    mt-2.5
                    h-10
                    w-full
                    rounded-lg
                    border
                    px-3
                    text-xs
                    outline-none
                    transition

                    ${
                      isDark
                        ? "border-[#292929] bg-[#0b0b0b] text-white placeholder:text-[#555] focus:border-[#444] focus:bg-[#0d0d0d]"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
                    }
                  `}
                />
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label
                      htmlFor="project-description"
                      className={`
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-medium

                        ${
                          isDark
                            ? "text-[#ccc]"
                            : "text-slate-700"
                        }
                      `}
                    >
                      <Sparkles
                        size={14}
                        className={
                          isDark
                            ? "text-[#aaa]"
                            : "text-slate-500"
                        }
                      />

                      What do you want to build?
                    </label>

                    <p
                      className={`
                        mt-1
                        text-[10px]

                        ${
                          isDark
                            ? "text-[#555]"
                            : "text-slate-400"
                        }
                      `}
                    >
                      Describe your product,
                      features and requirements.
                    </p>
                  </div>

                  <span
                    className={`
                      hidden
                      text-[10px]
                      sm:block

                      ${
                        isDark
                          ? "text-[#555]"
                          : "text-slate-400"
                      }
                    `}
                  >
                    {descriptionLength}
                  </span>
                </div>

                {/* TEXTAREA */}

                <div className="relative mt-3">
                  <textarea
                    id="project-description"
                    value={description}
                    onChange={(e) => {
                      setDescription(
                        e.target.value
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder={`Example:

Build a modern restaurant management website with CRM, employee attendance, item listing, orders, analytics dashboard, customer management and an admin panel.`}
                    rows={9}
                    className={`
                      min-h-[210px]
                      w-full
                      resize-y
                      rounded-xl
                      border
                      px-4
                      py-4
                      pb-10
                      text-xs
                      leading-6
                      outline-none
                      transition
                      sm:text-sm

                      ${
                        isDark
                          ? "border-[#292929] bg-[#0b0b0b] text-white placeholder:text-[#555] focus:border-[#444]"
                          : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
                      }
                    `}
                  />

                  {/* TEXTAREA FOOTER */}

                  <div
                    className={`
                      pointer-events-none
                      absolute
                      bottom-3
                      left-4
                      right-4
                      flex
                      items-center
                      justify-between
                    `}
                  >
                    <span
                      className={`
                        flex
                        items-center
                        gap-1.5
                        text-[10px]

                        ${
                          isDark
                            ? "text-[#555]"
                            : "text-slate-400"
                        }
                      `}
                    >
                      <Lightbulb size={11} />

                      More detail helps AI
                    </span>

                    <span
                      className={`
                        text-[10px]

                        ${
                          isDark
                            ? "text-[#555]"
                            : "text-slate-400"
                        }
                      `}
                    >
                      {descriptionLength}
                    </span>
                  </div>
                </div>

                {/* ERROR */}

                {error && (
                  <div
                    className={`
                      mt-3
                      flex
                      items-start
                      gap-2.5
                      rounded-lg
                      border
                      px-3
                      py-2.5
                      text-xs

                      ${
                        isDark
                          ? "border-red-500/15 bg-red-500/[0.05] text-red-400"
                          : "border-red-200 bg-red-50 text-red-600"
                      }
                    `}
                  >
                    <XCircle
                      size={15}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                {/* =================================================
                    NEXT STEPS
                ================================================= */}

                <div
                  className={`
                    mt-4
                    rounded-xl
                    border
                    p-3

                    ${
                      isDark
                        ? "border-[#222] bg-[#0c0c0c]"
                        : "border-slate-100 bg-slate-50"
                    }
                  `}
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          flex
                          h-6
                          w-6
                          shrink-0
                          items-center
                          justify-center
                          rounded-md
                          text-[10px]
                          font-medium

                          ${
                            isDark
                              ? "bg-[#1b1b1b] text-[#aaa]"
                              : "bg-white text-slate-500"
                          }
                        `}
                      >
                        1
                      </div>

                      <span
                        className={`
                          text-[10px]

                          ${
                            isDark
                              ? "text-[#666]"
                              : "text-slate-500"
                          }
                        `}
                      >
                        Create project
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          flex
                          h-6
                          w-6
                          shrink-0
                          items-center
                          justify-center
                          rounded-md
                          text-[10px]
                          font-medium

                          ${
                            isDark
                              ? "bg-[#1b1b1b] text-[#aaa]"
                              : "bg-white text-slate-500"
                          }
                        `}
                      >
                        2
                      </div>

                      <span
                        className={`
                          text-[10px]

                          ${
                            isDark
                              ? "text-[#666]"
                              : "text-slate-500"
                          }
                        `}
                      >
                        AI plans your idea
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          flex
                          h-6
                          w-6
                          shrink-0
                          items-center
                          justify-center
                          rounded-md
                          text-[10px]
                          font-medium

                          ${
                            isDark
                              ? "bg-[#1b1b1b] text-[#aaa]"
                              : "bg-white text-slate-500"
                          }
                        `}
                      >
                        3
                      </div>

                      <span
                        className={`
                          text-[10px]

                          ${
                            isDark
                              ? "text-[#666]"
                              : "text-slate-500"
                          }
                        `}
                      >
                        Start building
                      </span>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div
                  className="
                    mt-5
                    flex
                    flex-col-reverse
                    gap-2.5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard")
                    }
                    disabled={loading}
                    className={`
                      rounded-lg
                      px-4
                      py-2
                      text-xs
                      font-medium
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-50

                      ${
                        isDark
                          ? "text-[#777] hover:bg-[#181818] hover:text-white"
                          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      }
                    `}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`
                      group
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      px-5
                      py-2.5
                      text-xs
                      font-medium
                      transition
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60

                      ${
                        isDark
                          ? "bg-white text-black hover:bg-[#ddd]"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }
                    `}
                  >
                    {loading ? (
                      <>
                        <span
                          className={`
                            h-3.5
                            w-3.5
                            animate-spin
                            rounded-full
                            border-2

                            ${
                              isDark
                                ? "border-black/20 border-t-black"
                                : "border-white/30 border-t-white"
                            }
                          `}
                        />

                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />

                        Create Project

                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================
                FOOTNOTE
            ================================================= */}

            <div
              className={`
                mt-4
                flex
                items-center
                justify-center
                gap-1.5
                text-center
                text-[10px]

                ${
                  isDark
                    ? "text-[#555]"
                    : "text-slate-400"
                }
              `}
            >
              <CheckCircle2 size={11} />

              Your project will be saved to
              your ICOGON workspace.
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BuilderPage;