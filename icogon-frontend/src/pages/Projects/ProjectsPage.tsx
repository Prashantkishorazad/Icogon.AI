import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  Clock3,
  FolderOpen,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

import {
  deleteProjectApi,
  getProjectsApi,
  type ProjectResponse,
} from "../../api/projectApi";

import { useTheme } from "../../context/ThemeContext";

// ============================================================
// PAGE
// ============================================================

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // THEME
  // ----------------------------------------------------------

  const { resolvedTheme } = useTheme();

  const isDark =
    resolvedTheme === "dark";

  // ----------------------------------------------------------
  // SIDEBAR
  // ----------------------------------------------------------

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState<boolean>(false);

  // ----------------------------------------------------------
  // PROJECTS
  // ----------------------------------------------------------

  const [
    projects,
    setProjects,
  ] = useState<ProjectResponse[]>([]);

  const [
    loading,
    setLoading,
  ] = useState<boolean>(true);

  const [
    error,
    setError,
  ] = useState<string>("");

  // ----------------------------------------------------------
  // LOAD PROJECTS
  // ----------------------------------------------------------

  const loadProjects = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const data = await getProjectsApi();

      setProjects(data);
    } catch (err: any) {
      console.error(
        "Failed to load projects:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------------

  useEffect(() => {
    loadProjects();
  }, []);

  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------

  const handleDelete = async (
    projectId: string
  ): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProjectApi(projectId);

      setProjects((current) =>
        current.filter(
          (project) =>
            project.id !== projectId
        )
      );
    } catch (err: any) {
      console.error(
        "Failed to delete project:",
        err
      );

      alert(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to delete project."
      );
    }
  };

  // ----------------------------------------------------------
  // DATE
  // ----------------------------------------------------------

  const formatDate = (
    project: ProjectResponse
  ): string => {
    const value =
      project.updated_at ||
      project.created_at;

    if (!value) {
      return "Recently";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    return date.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ----------------------------------------------------------
  // INITIAL
  // ----------------------------------------------------------

  const getInitial = (
    name: string
  ): string => {
    return (
      name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() ||
      "P"
    );
  };

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
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <DashboardSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div
        className={`
          min-h-screen
          transition-[padding]
          duration-200
          ease-in-out

          ${
            sidebarCollapsed
              ? "pl-[72px]"
              : "pl-[232px]"
          }
        `}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <header
          className={`
            sticky
            top-0
            z-30
            h-[54px]
            border-b
            backdrop-blur-xl
            transition-colors

            ${
              isDark
                ? "border-[#242424] bg-[#080808]/90"
                : "border-slate-200 bg-white/90"
            }
          `}
        >
          <div
            className="
              flex
              h-full
              items-center
              justify-between
              px-5
              lg:px-7
            "
          >
            <div className="flex items-center gap-2.5">
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
                      ? "bg-[#1d1d1d]"
                      : "bg-slate-100"
                  }
                `}
              >
                <FolderOpen
                  size={14}
                  className={
                    isDark
                      ? "text-[#aaa]"
                      : "text-slate-500"
                  }
                />
              </div>

              <div>
                <p
                  className={`
                    text-[12px]
                    font-medium

                    ${
                      isDark
                        ? "text-white"
                        : "text-slate-800"
                    }
                  `}
                >
                  My Projects
                </p>

                <p
                  className={`
                    hidden
                    text-[9px]
                    sm:block

                    ${
                      isDark
                        ? "text-[#666]"
                        : "text-slate-400"
                    }
                  `}
                >
                  {projects.length}{" "}
                  {projects.length === 1
                    ? "project"
                    : "projects"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/builder")
              }
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                px-3
                py-1.5
                text-[11px]
                font-medium
                transition

                ${
                  isDark
                    ? "bg-white text-black hover:bg-[#ddd]"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }
              `}
            >
              <Plus size={13} />

              New project
            </button>
          </div>
        </header>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <main
          className="
            mx-auto
            min-h-[calc(100vh-54px)]
            max-w-[1320px]
            px-5
            py-7
            lg:px-8
          "
        >
          {/* ==================================================
              PAGE INTRO
          ================================================== */}

          <section className="mb-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={14}
                    className={
                      isDark
                        ? "text-[#aaa]"
                        : "text-slate-500"
                    }
                  />

                  <span
                    className={`
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.1em]

                      ${
                        isDark
                          ? "text-[#666]"
                          : "text-slate-400"
                      }
                    `}
                  >
                    Workspace
                  </span>
                </div>

                <h1
                  className={`
                    mt-2
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
                  Projects
                </h1>

                <p
                  className={`
                    mt-1.5
                    max-w-xl
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
                  Build and manage everything
                  you create with ICOGON AI.
                </p>
              </div>

              {projects.length > 0 && (
                <button
                  type="button"
                  onClick={loadProjects}
                  disabled={loading}
                  className={`
                    hidden
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    border
                    transition
                    sm:flex

                    ${
                      isDark
                        ? "border-[#292929] text-[#777] hover:bg-[#181818] hover:text-white"
                        : "border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    }
                  `}
                  title="Refresh projects"
                >
                  <RefreshCw
                    size={13}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />
                </button>
              )}
            </div>
          </section>

          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (
            <div
              className={`
                rounded-xl
                border
                p-5

                ${
                  isDark
                    ? "border-red-500/20 bg-red-500/[0.05]"
                    : "border-red-200 bg-red-50"
                }
              `}
            >
              <h3
                className={`
                  text-xs
                  font-semibold

                  ${
                    isDark
                      ? "text-red-300"
                      : "text-red-700"
                  }
                `}
              >
                Unable to load projects
              </h3>

              <p
                className={`
                  mt-1.5
                  text-xs

                  ${
                    isDark
                      ? "text-red-400/70"
                      : "text-red-600/70"
                  }
                `}
              >
                {error}
              </p>

              <button
                type="button"
                onClick={loadProjects}
                className={`
                  mt-4
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  px-3
                  py-1.5
                  text-[11px]
                  transition

                  ${
                    isDark
                      ? "border-[#333] bg-[#151515] text-[#ccc] hover:bg-[#202020]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                <RefreshCw size={12} />

                Try again
              </button>
            </div>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div
              className="
                grid
                gap-3
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className={`
                      h-[190px]
                      animate-pulse
                      rounded-xl
                      border

                      ${
                        isDark
                          ? "border-[#202020] bg-[#101010]"
                          : "border-slate-200 bg-white"
                      }
                    `}
                  >
                    <div
                      className={`
                        m-4
                        h-9
                        w-9
                        rounded-lg

                        ${
                          isDark
                            ? "bg-[#1b1b1b]"
                            : "bg-slate-100"
                        }
                      `}
                    />

                    <div
                      className={`
                        mx-4
                        h-3
                        w-2/3
                        rounded

                        ${
                          isDark
                            ? "bg-[#1b1b1b]"
                            : "bg-slate-100"
                        }
                      `}
                    />

                    <div
                      className={`
                        mx-4
                        mt-3
                        h-2
                        w-5/6
                        rounded

                        ${
                          isDark
                            ? "bg-[#171717]"
                            : "bg-slate-100"
                        }
                      `}
                    />

                    <div
                      className={`
                        mx-4
                        mt-2
                        h-2
                        w-1/2
                        rounded

                        ${
                          isDark
                            ? "bg-[#171717]"
                            : "bg-slate-100"
                        }
                      `}
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* ==================================================
              EMPTY
          ================================================== */}

          {!loading &&
            !error &&
            projects.length === 0 && (
              <div
                className={`
                  flex
                  min-h-[390px]
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-dashed
                  px-6
                  py-12
                  text-center

                  ${
                    isDark
                      ? "border-[#292929] bg-[#0c0c0c]"
                      : "border-slate-200 bg-white"
                  }
                `}
              >
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl

                    ${
                      isDark
                        ? "bg-[#181818] text-[#888]"
                        : "bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  <FolderOpen size={21} />
                </div>

                <h3
                  className={`
                    mt-4
                    text-sm
                    font-semibold

                    ${
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }
                  `}
                >
                  No projects yet
                </h3>

                <p
                  className={`
                    mt-1.5
                    max-w-sm
                    text-xs
                    leading-5

                    ${
                      isDark
                        ? "text-[#666]"
                        : "text-slate-400"
                    }
                  `}
                >
                  Describe what you want
                  to build and let ICOGON AI
                  create your first project.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/builder")
                  }
                  className={`
                    mt-5
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    px-4
                    py-2
                    text-xs
                    font-medium
                    transition

                    ${
                      isDark
                        ? "bg-white text-black hover:bg-[#ddd]"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }
                  `}
                >
                  <Plus size={13} />

                  Create project
                </button>
              </div>
            )}

          {/* ==================================================
              PROJECT GRID
          ================================================== */}

          {!loading &&
            !error &&
            projects.length > 0 && (
              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                "
              >
                {projects.map(
                  (project) => (
                    <article
                      key={project.id}
                      className={`
                        group
                        relative
                        overflow-hidden
                        rounded-xl
                        border
                        p-4
                        transition-all
                        duration-150

                        ${
                          isDark
                            ? "border-[#242424] bg-[#101010] hover:border-[#353535] hover:bg-[#121212]"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }
                      `}
                    >
                      {/* TOP */}

                      <div className="flex items-start justify-between">
                        <div
                          className={`
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            text-xs
                            font-semibold

                            ${
                              isDark
                                ? "bg-[#1d1d1d] text-[#aaa]"
                                : "bg-slate-100 text-slate-600"
                            }
                          `}
                        >
                          {getInitial(
                            project.name
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              project.id
                            )
                          }
                          className={`
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            opacity-0
                            transition
                            group-hover:opacity-100

                            ${
                              isDark
                                ? "text-[#666] hover:bg-red-500/10 hover:text-red-400"
                                : "text-slate-400 hover:bg-red-50 hover:text-red-500"
                            }
                          `}
                          title="Delete project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* NAME */}

                      <h3
                        className={`
                          mt-4
                          truncate
                          text-[13px]
                          font-semibold

                          ${
                            isDark
                              ? "text-white"
                              : "text-slate-900"
                          }
                        `}
                        title={project.name}
                      >
                        {project.name}
                      </h3>

                      {/* DESCRIPTION */}

                      <p
                        className={`
                          mt-1.5
                          min-h-[40px]
                          line-clamp-2
                          text-[11px]
                          leading-5

                          ${
                            isDark
                              ? "text-[#666]"
                              : "text-slate-400"
                          }
                        `}
                      >
                        {project.description ||
                          "No project description"}
                      </p>

                      {/* FOOTER */}

                      <div
                        className={`
                          mt-4
                          flex
                          items-center
                          justify-between
                          border-t
                          pt-3

                          ${
                            isDark
                              ? "border-[#202020]"
                              : "border-slate-100"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            items-center
                            gap-1.5
                            text-[9px]

                            ${
                              isDark
                                ? "text-[#555]"
                                : "text-slate-400"
                            }
                          `}
                        >
                          <Clock3 size={10} />

                          {formatDate(project)}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/builder/${project.id}`
                            )
                          }
                          className={`
                            flex
                            items-center
                            gap-1
                            text-[10px]
                            font-medium
                            transition

                            ${
                              isDark
                                ? "text-[#777] hover:text-white"
                                : "text-slate-400 hover:text-slate-900"
                            }
                          `}
                        >
                          Open

                          <ArrowRight
                            size={11}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default ProjectsPage;