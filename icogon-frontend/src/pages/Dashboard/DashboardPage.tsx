import React, {
  useEffect,
  useState,
} from "react";

import PromptInput from "../../components/landing/PromptInput";

import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Code2,
  Globe,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Rocket,
  Sparkles,
  Store,
  User,
  Wand2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

import {
  getProjectsApi,
  type ProjectResponse,
} from "../../api/projectApi";

import {
  useTheme,
} from "../../context/ThemeContext";


// =====================================================
// TEMPLATE TYPE
// =====================================================

interface Template {
  title: string;
  description: string;
  icon: React.ElementType;
  prompt: string;
}


// =====================================================
// DASHBOARD PAGE
// =====================================================

const DashboardPage: React.FC = () => {

  const navigate = useNavigate();


  // ===================================================
  // THEME
  // ===================================================

  const {
    resolvedTheme,
  } = useTheme();

  const isDark =
    resolvedTheme === "dark";


  // ===================================================
  // SIDEBAR
  // ===================================================

  const [
    collapsed,
    setCollapsed,
  ] = useState<boolean>(false);


  // ===================================================
  // PROJECTS
  // ===================================================

  const [
    projects,
    setProjects,
  ] = useState<ProjectResponse[]>([]);


  const [
    projectsLoading,
    setProjectsLoading,
  ] = useState<boolean>(true);


  const [
    projectsError,
    setProjectsError,
  ] = useState<string>("");


  // ===================================================
  // TEMPLATES
  // ===================================================

  const templates: Template[] = [
    {
      title: "Business Website",
      description:
        "Create a professional business website",
      icon: Globe,
      prompt:
        "Build a modern professional business website with a hero section, services, about section, testimonials, pricing and contact form.",
    },

    {
      title: "SaaS Landing Page",
      description:
        "Launch a modern SaaS website",
      icon: Rocket,
      prompt:
        "Build a modern SaaS landing page with a navbar, hero section, features, pricing, testimonials, FAQ and call to action.",
    },

    {
      title: "Portfolio",
      description:
        "Showcase your work",
      icon: User,
      prompt:
        "Build a premium developer portfolio website with hero section, about, skills, projects, experience, testimonials and contact section.",
    },

    {
      title: "E-commerce",
      description:
        "Build an online store",
      icon: Store,
      prompt:
        "Build a modern e-commerce website with product listing, categories, product details, cart, checkout and responsive navigation.",
    },

    {
      title: "AI Application",
      description:
        "Create an AI-powered app",
      icon: Sparkles,
      prompt:
        "Build a modern AI application dashboard with a prompt interface, sidebar navigation, recent projects, usage statistics and settings.",
    },

    {
      title: "Custom Website",
      description:
        "Start from your own idea",
      icon: Wand2,
      prompt: "",
    },
  ];


  // ===================================================
  // LOAD PROJECTS
  // ===================================================

  const loadProjects = async (): Promise<void> => {

    try {

      setProjectsLoading(true);

      setProjectsError("");


      const data =
        await getProjectsApi();


      if (Array.isArray(data)) {

        setProjects(data);

      } else {

        setProjects([]);

      }

    } catch (error: unknown) {

      console.error(
        "Failed to load projects:",
        error
      );


      const message =
        error instanceof Error
          ? error.message
          : "Failed to load projects";


      setProjectsError(message);

      setProjects([]);

    } finally {

      setProjectsLoading(false);

    }

  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    loadProjects();

  }, []);


  // ===================================================
  // TEMPLATE CLICK
  // ===================================================

  const handleTemplateClick = (
    templatePrompt: string
  ): void => {

    const cleanPrompt =
      templatePrompt.trim();


    // CUSTOM WEBSITE
    //
    // Focus the PromptInput from
    // the Landing Page.
    //
    if (!cleanPrompt) {

      setTimeout(() => {

        document
          .getElementById(
            "project-prompt"
          )
          ?.focus();

      }, 50);

      return;
    }


    // PREDEFINED TEMPLATE
    navigate(
      `/builder?prompt=${encodeURIComponent(
        cleanPrompt
      )}`
    );

  };


  // ===================================================
  // OPEN PROJECT
  // ===================================================

  const handleOpenProject = (
    projectId: string
  ): void => {

    navigate(
      `/builder/${projectId}`
    );

  };


  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatProjectDate = (
    project: ProjectResponse
  ): string => {

    const dateValue =
      project.updated_at ||
      project.created_at;


    if (!dateValue) {

      return "Recently";

    }


    const date =
      new Date(dateValue);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

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


  // ===================================================
  // PROJECT INITIAL
  // ===================================================

  const getProjectInitial = (
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


  // ===================================================
  // THEME COLORS
  // ===================================================

  const colors = isDark
    ? {

        page:
          "bg-[#050505] text-white",

        header:
          "border-[#1a1a1a] bg-[#050505]/95",

        button:
          "border-[#222] bg-[#0b0b0b] text-[#bbb]",

        heading:
          "text-[#f5f5f5]",

        paragraph:
          "text-[#777]",

        card:
          "border-[#1b1b1b] bg-[#0a0a0a] text-white",

        promptCard:
          "border-[#242424] bg-[#0a0a0a] shadow-black/30",

        textarea:
          "text-white placeholder:text-[#666]",

        divider:
          "border-[#181818]",

        muted:
          "text-[#666]",

        subtle:
          "text-[#555]",

        loading:
          "border-[#1b1b1b] bg-[#070707] text-[#555]",

        empty:
          "border-[#202020] bg-[#070707]",

        iconBox:
          "border-[#202020] bg-[#0d0d0d] text-[#555]",

        projectCard:
          "border-[#1b1b1b] bg-[#0a0a0a]",

        projectDivider:
          "border-[#181818] text-[#555]",

        disabled:
          "bg-[#1a1a1a] text-[#555]",

      }

    : {

        page:
          "bg-[#f8fafc] text-slate-900",

        header:
          "border-slate-200 bg-white/90",

        button:
          "border-slate-200 bg-white text-slate-600",

        heading:
          "text-slate-900",

        paragraph:
          "text-slate-500",

        card:
          "border-slate-200 bg-white text-slate-900",

        promptCard:
          "border-slate-200 bg-white shadow-slate-200/50",

        textarea:
          "text-slate-900 placeholder:text-slate-400",

        divider:
          "border-slate-100",

        muted:
          "text-slate-500",

        subtle:
          "text-slate-400",

        loading:
          "border-slate-200 bg-white text-slate-400",

        empty:
          "border-slate-300 bg-white",

        iconBox:
          "border-slate-200 bg-slate-50 text-slate-400",

        projectCard:
          "border-slate-200 bg-white",

        projectDivider:
          "border-slate-100 text-slate-400",

        disabled:
          "bg-slate-100 text-slate-400",

      };


  // ===================================================
  // MAIN
  // ===================================================

  return (

    <div
      className={`
        min-h-screen
        w-full
        overflow-x-hidden
        transition-colors
        duration-300
        ${colors.page}
      `}
    >

      {/* ================================================
          SIDEBAR
      ================================================= */}

      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      {/* ================================================
          MAIN APPLICATION
      ================================================= */}

      <div
        className={`
          min-h-screen
          w-full
          transition-all
          duration-300
          ${
            collapsed
              ? "pl-[72px]"
              : "pl-[260px]"
          }
        `}
      >

        {/* ================================================
            TOP BAR
        ================================================= */}

        <header
          className={`
            sticky
            top-0
            z-30
            h-[68px]
            w-full
            border-b
            backdrop-blur-xl
            transition-colors
            duration-300
            ${colors.header}
          `}
        >

          <div
            className="
              flex
              h-full
              items-center
              justify-between
              px-5
              sm:px-7
            "
          >

            {/* LEFT */}

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <button
                type="button"

                onClick={() =>
                  setCollapsed(
                    value => !value
                  )
                }

                aria-label="Toggle sidebar"

                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  transition-all
                  hover:border-cyan-400
                  hover:text-cyan-500
                  ${colors.button}
                `}
              >

                {collapsed ? (

                  <PanelLeftOpen size={18} />

                ) : (

                  <PanelLeftClose size={18} />

                )}

              </button>


              <div>

                <div
                  className={`
                    text-sm
                    font-semibold
                    ${colors.heading}
                  `}
                >
                  Dashboard
                </div>


                <div
                  className={`
                    mt-0.5
                    text-xs
                    ${colors.paragraph}
                  `}
                >
                  Build with ICOGON AI
                </div>

              </div>

            </div>


            {/* RIGHT */}

            <button
              type="button"

              onClick={() =>
                navigate("/projects")
              }

              className={`
                flex
                items-center
                gap-2
                rounded-lg
                border
                px-3.5
                py-2.5
                text-[13px]
                font-medium
                transition-all
                hover:border-cyan-400
                hover:text-cyan-500
                ${colors.button}
              `}
            >

              <LayoutDashboard size={16} />

              <span className="hidden sm:inline">
                My Projects
              </span>

            </button>

          </div>

        </header>


        {/* ================================================
            CONTENT
        ================================================= */}

        <main
          className="
            mx-auto
            w-full
            max-w-[1440px]
            px-5
            pb-20
            pt-10
            sm:px-8
            sm:pt-12
            lg:px-10
          "
        >

          {/* =====================================================
              DASHBOARD HERO
          ===================================================== */}

          <div
            className="
              flex
              w-full
              flex-col
              items-center
              px-6
              pt-14
            "
          >

            {/* ===================================================
                HERO HEADING
            =================================================== */}

            <div
              className="
                flex
                w-full
                max-w-5xl
                flex-col
                items-center
                text-center
              "
            >

              <h1
                className={`
                  max-w-3xl
                  text-5xl
                  font-semibold
                  leading-[1.05]
                  tracking-tight
                  md:text-6xl
                  ${colors.heading}
                `}
              >
               What’s the plan, Prashant?
              </h1>


              <p
                className={`
                  mt-6
                  text-base
                  leading-relaxed
                  md:text-lg
                  ${colors.paragraph}
                `}
              >
                Describe your idea and let ICOGON AI turn it into a
                production-ready website.
              </p>

            </div>


            {/* ===================================================
                PROMPT INPUT
            =================================================== */}

            <div
              className="
                mt-14
                flex
                w-full
                max-w-[830px]
                flex-col
                items-center
              "
            >

              {/* SAME PROMPT INPUT FROM LANDING PAGE */}

              <PromptInput />


              {/* =================================================
                  SUGGESTIONS
              ================================================= */}

              <div
                className="
                  mt-5
                  flex
                  w-full
                  flex-wrap
                  items-center
                  justify-center
                  gap-3
                "
              >

                {/* =================================================
                    SUGGESTION 1
                ================================================= */}



              </div>

            </div>

          </div>


          {/* ==============================================
              QUICK START
          =============================================== */}

          <section className="mt-16">

            <div className="mb-5">

              <h2
                className={`
                  text-xl
                  font-semibold
                  ${colors.heading}
                `} 
              >
                Quick Start
              </h2>


              <p
                className={`
                  mt-2
                  text-[13px]
                  ${colors.paragraph}
                `}
              >
                Start with a template
                or your own idea.
              </p>

            </div>


            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-5
              "
            >

              {templates.map(
                (template) => {

                  const Icon =
                    template.icon;


                  return (

                    <button
                      key={template.title}

                      type="button"

                      onClick={() =>
                        handleTemplateClick(
                          template.prompt
                        )
                      }

                      className={`
                        group
                        min-h-[170px]
                        rounded-2xl
                        border
                        p-5
                        text-left
                        transition-all
                        duration-200
                        hover:-translate-y-1
                        hover:border-cyan-400
                        hover:shadow-xl
                        hover:shadow-cyan-400/5
                        ${colors.card}
                      `}
                    >

                      <div
                        className="
                          mb-4
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-cyan-400/20
                          bg-cyan-400/5
                          text-cyan-500
                          transition-transform
                          group-hover:scale-110
                        "
                      >

                        <Icon size={19} />

                      </div>


                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >

                        <span
                          className="
                            text-sm
                            font-semibold
                          "
                        >
                          {template.title}
                        </span>


                        <ChevronRight
                          size={16}

                          className={`
                            transition-transform
                            group-hover:translate-x-1
                            group-hover:text-cyan-500
                            ${colors.subtle}
                          `}
                        />

                      </div>


                      <p
                        className={`
                          mt-2
                          text-xs
                          leading-5
                          ${colors.paragraph}
                        `}
                      >
                        {template.description}
                      </p>

                    </button>

                  );

                }
              )}

            </div>

          </section>


          {/* ==============================================
              RECENT PROJECTS
          =============================================== */}

          <section className="mt-16">

            {/* HEADER */}

            <div
              className="
                mb-5
                flex
                items-center
                justify-between
              "
            >

              <div>

                <h2
                  className={`
                    text-xl
                    font-semibold
                    ${colors.heading}
                  `}
                >
                  Recent Projects
                </h2>


                <p
                  className={`
                    mt-2
                    text-[13px]
                    ${colors.paragraph}
                  `}
                >
                  Continue working
                  on your projects
                </p>

              </div>


              <button
                type="button"

                onClick={() =>
                  navigate("/projects")
                }

                className="
                  flex
                  items-center
                  gap-1
                  text-[13px]
                  font-semibold
                  text-cyan-500
                  transition-colors
                  hover:text-cyan-400
                "
              >

                View all

                <ArrowRight size={14} />

              </button>

            </div>


            {/* LOADING */}

            {projectsLoading && (

              <div
                className={`
                  flex
                  min-h-[220px]
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  text-sm
                  ${colors.loading}
                `}
              >
                Loading projects...
              </div>

            )}


            {/* ERROR */}

            {!projectsLoading &&
              projectsError && (

                <div
                  className={`
                    flex
                    min-h-[180px]
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-red-300
                    bg-red-50/40
                    p-8
                    text-center

                    ${
                      isDark
                        ? "border-red-500/20 bg-[#090707]"
                        : ""
                    }
                  `}
                >

                  <h3
                    className={`
                      text-[15px]
                      font-semibold
                      ${colors.heading}
                    `}
                  >
                    Unable to load projects
                  </h3>


                  <p
                    className={`
                      mt-2
                      max-w-md
                      text-[13px]
                      ${colors.paragraph}
                    `}
                  >
                    {projectsError}
                  </p>


                  <button
                    type="button"

                    onClick={loadProjects}

                    className={`
                      mt-5
                      rounded-lg
                      border
                      px-4
                      py-2.5
                      text-sm
                      transition-all
                      hover:border-cyan-400
                      hover:text-cyan-500
                      ${colors.button}
                    `}
                  >
                    Try again
                  </button>

                </div>

              )}


            {/* EMPTY STATE */}

            {!projectsLoading &&
              !projectsError &&
              projects.length === 0 && (

                <div
                  className={`
                    flex
                    min-h-[260px]
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-dashed
                    p-10
                    text-center
                    ${colors.empty}
                  `}
                >

                  <div
                    className={`
                      mb-5
                      flex
                      h-[54px]
                      w-[54px]
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      ${colors.iconBox}
                    `}
                  >

                    <Code2 size={24} />

                  </div>


                  <h3
                    className={`
                      text-base
                      font-semibold
                      ${colors.heading}
                    `}
                  >
                    No projects yet
                  </h3>


                  <p
                    className={`
                      mt-2
                      max-w-[420px]
                      text-[13px]
                      leading-6
                      ${colors.paragraph}
                    `}
                  >
                    Start your first project by
                    describing what you want
                    ICOGON AI to build.
                  </p>


                  <button
                    type="button"

                    onClick={() => {

                      document
                        .getElementById(
                          "project-prompt"
                        )
                        ?.focus();

                    }}

                    className="
                      mt-5
                      flex
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-cyan-400/30
                      bg-cyan-400/5
                      px-4
                      py-2.5
                      text-[13px]
                      font-semibold
                      text-cyan-500
                      transition-all
                      hover:bg-cyan-400/10
                    "
                  >

                    <Plus size={16} />

                    Create your first project

                  </button>

                </div>

              )}


            {/* PROJECT LIST */}

            {!projectsLoading &&
              !projectsError &&
              projects.length > 0 && (

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-3
                  "
                >

                  {projects
                    .slice(0, 6)
                    .map((project) => (

                      <button
                        key={project.id}

                        type="button"

                        onClick={() =>
                          handleOpenProject(
                            project.id
                          )
                        }

                        className={`
                          group
                          rounded-2xl
                          border
                          p-5
                          text-left
                          transition-all
                          duration-200
                          hover:-translate-y-1
                          hover:border-cyan-400/60
                          hover:shadow-xl
                          hover:shadow-cyan-400/5
                          ${colors.projectCard}
                        `}
                      >

                        {/* PROJECT TOP */}

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                          "
                        >

                          <div
                            className="
                              flex
                              h-[42px]
                              w-[42px]
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-cyan-400/20
                              bg-cyan-400/5
                              text-[15px]
                              font-bold
                              text-cyan-500
                            "
                          >
                            {getProjectInitial(
                              project.name
                            )}
                          </div>


                          <ChevronRight
                            size={17}

                            className={`
                              transition-all
                              group-hover:translate-x-1
                              group-hover:text-cyan-500
                              ${colors.subtle}
                            `}
                          />

                        </div>


                        {/* NAME */}

                        <h3
                          className={`
                            mt-5
                            truncate
                            text-[15px]
                            font-semibold
                            ${colors.heading}
                          `}
                        >
                          {project.name}
                        </h3>


                        {/* DESCRIPTION */}

                        <p
                          className={`
                            mt-2
                            min-h-[40px]
                            overflow-hidden
                            text-xs
                            leading-5
                            ${colors.paragraph}
                          `}
                        >
                          {project.description ||
                            "No project description"}
                        </p>


                        {/* FOOTER */}

                        <div
                          className={`
                            mt-5
                            flex
                            items-center
                            justify-between
                            border-t
                            pt-3
                            text-[11px]
                            ${colors.projectDivider}
                          `}
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-1.5
                            "
                          >

                            <Clock3 size={12} />

                            {formatProjectDate(
                              project
                            )}

                          </div>


                          <div
                            className="
                              flex
                              items-center
                              gap-1
                              transition-colors
                              group-hover:text-cyan-500
                            "
                          >

                            Open

                            <ArrowRight size={13} />

                          </div>

                        </div>

                      </button>

                    ))}

                </div>

              )}

          </section>


          {/* BOTTOM SPACE */}

          <div className="h-10" />

        </main>

      </div>

    </div>

  );

};


export default DashboardPage;