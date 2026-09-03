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
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

import {
  deleteProjectApi,
  getProjectsApi,
  type ProjectResponse,
} from "../../api/projectApi";


// ============================================================
// PAGE
// ============================================================

const ProjectsPage: React.FC = () => {

  const navigate = useNavigate();

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
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#050505]
        text-white
      "
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
          duration-300
          ease-in-out

          ${
            sidebarCollapsed
              ? "pl-[84px]"
              : "pl-[280px]"
          }
        `}
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header
          className="
            sticky
            top-0
            z-30

            h-[82px]

            border-b
            border-white/[0.06]

            bg-[#050505]/95
            backdrop-blur-xl
          "
        >

          <div
            className="
              flex
              h-full
              items-center
              justify-between

              px-6
              lg:px-10
              xl:px-12
            "
          >

            <div>

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                ICOGON AI
              </p>

              <h1
                className="
                  mt-0.5
                  text-base
                  font-semibold
                  text-white
                "
              >
                My Projects
              </h1>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate("/builder")
              }
              className="
                inline-flex
                items-center
                gap-2

                rounded-xl

                border
                border-cyan-500/20

                bg-cyan-500/[0.08]

                px-4
                py-2.5

                text-sm
                font-medium
                text-cyan-400

                transition

                hover:border-cyan-500/40
                hover:bg-cyan-500/[0.14]
                hover:text-cyan-300
              "
            >

              <Plus size={16} />

              New Project

            </button>

          </div>

        </header>


        {/* ====================================================
            CONTENT
        ==================================================== */}

        <main
          className="
            mx-auto
            min-h-[calc(100vh-82px)]
            max-w-[1500px]

            px-6
            py-10

            lg:px-10
            xl:px-12
          "
        >

          {/* ==================================================
              TITLE
          ================================================== */}

          <section
            className="
              mb-8
            "
          >

            <p
              className="
                text-sm
                font-medium
                text-cyan-400
              "
            >
              Workspace
            </p>

            <h2
              className="
                mt-2
                text-3xl
                font-semibold
                tracking-tight

                md:text-4xl
              "
            >
              Projects
            </h2>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-slate-500

                md:text-base
              "
            >
              Build and manage your AI projects
              in one place.
            </p>

          </section>


          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (

            <div
              className="
                rounded-2xl
                border
                border-red-500/20

                bg-red-500/[0.05]

                p-6
              "
            >

              <h3
                className="
                  text-sm
                  font-semibold
                  text-red-300
                "
              >
                Unable to load projects
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  text-red-400/80
                "
              >
                {error}
              </p>

              <button
                type="button"
                onClick={loadProjects}
                className="
                  mt-4
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-white/[0.04]

                  px-4
                  py-2

                  text-sm
                  text-slate-300

                  hover:bg-white/[0.08]
                "
              >
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
                gap-4

                sm:grid-cols-2
                lg:grid-cols-3
              "
            >

              {[1, 2, 3].map(
                (item) => (

                  <div
                    key={item}
                    className="
                      h-[230px]

                      animate-pulse

                      rounded-2xl
                      border
                      border-white/[0.06]

                      bg-[#0a0a0a]
                    "
                  />

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
                className="
                  flex
                  min-h-[430px]

                  flex-col
                  items-center
                  justify-center

                  rounded-[28px]

                  border
                  border-dashed
                  border-white/[0.08]

                  bg-[#080808]

                  px-6
                  py-12

                  text-center
                "
              >

                <div
                  className="
                    mb-6

                    flex
                    h-16
                    w-16

                    items-center
                    justify-center

                    rounded-2xl

                    border
                    border-cyan-500/10

                    bg-cyan-500/[0.06]

                    text-cyan-400
                  "
                >

                  <FolderOpen size={27} />

                </div>


                <h3
                  className="
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  No projects yet
                </h3>


                <p
                  className="
                    mt-2
                    max-w-md

                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  Start your first project by
                  describing what you want
                  ICOGON AI to build.
                </p>


                <button
                  type="button"
                  onClick={() =>
                    navigate("/builder")
                  }
                  className="
                    mt-6

                    inline-flex
                    items-center
                    gap-2

                    rounded-xl

                    border
                    border-cyan-500/20

                    bg-cyan-500/[0.08]

                    px-5
                    py-2.5

                    text-sm
                    font-medium
                    text-cyan-400

                    transition

                    hover:border-cyan-500/40
                    hover:bg-cyan-500/[0.14]
                  "
                >

                  <Plus size={16} />

                  Create your first project

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
                  gap-5

                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >

                {projects.map(
                  (project) => (

                    <article
                      key={project.id}
                      className="
                        group

                        relative
                        overflow-hidden

                        rounded-2xl

                        border
                        border-white/[0.07]

                        bg-[#0a0a0a]

                        p-5

                        transition-all
                        duration-200

                        hover:-translate-y-1
                        hover:border-cyan-500/20
                        hover:bg-[#0d0d0d]
                      "
                    >

                      {/* TOP */}

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                        "
                      >

                        <div
                          className="
                            flex
                            h-11
                            w-11

                            items-center
                            justify-center

                            rounded-xl

                            border
                            border-cyan-500/10

                            bg-cyan-500/[0.06]

                            text-sm
                            font-semibold
                            text-cyan-400
                          "
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
                          className="
                            rounded-lg
                            p-2

                            text-slate-700

                            transition

                            hover:bg-red-500/10
                            hover:text-red-400
                          "
                          title="Delete project"
                        >

                          <Trash2 size={16} />

                        </button>

                      </div>


                      {/* NAME */}

                      <h3
                        className="
                          mt-5

                          truncate

                          text-base
                          font-semibold
                          text-white
                        "
                      >
                        {project.name}
                      </h3>


                      {/* DESCRIPTION */}

                      <p
                        className="
                          mt-2

                          min-h-[48px]

                          line-clamp-2

                          text-sm
                          leading-6
                          text-slate-600
                        "
                      >
                        {project.description ||
                          "No project description"}
                      </p>


                      {/* FOOTER */}

                      <div
                        className="
                          mt-5

                          flex
                          items-center
                          justify-between

                          border-t
                          border-white/[0.05]

                          pt-4
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5

                            text-[11px]
                            text-slate-700
                          "
                        >

                          <Clock3 size={12} />

                          {formatDate(project)}

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/builder/${project.id}`
                            )
                          }
                          className="
                            flex
                            items-center
                            gap-1

                            text-xs
                            font-medium
                            text-slate-500

                            transition

                            group-hover:text-cyan-400
                          "
                        >

                          Open

                          <ArrowRight
                            size={13}
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