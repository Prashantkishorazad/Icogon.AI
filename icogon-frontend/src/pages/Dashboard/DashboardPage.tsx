import {
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type FC,
} from "react";

import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Code2,
  Globe,
  Grid2X2,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Store,
  User,
  Wand2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import PromptInput from "../../components/landing/PromptInput";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

import {
  getProjectsApi,
  type ProjectResponse,
} from "../../api/projectApi";

import { useTheme } from "../../context/ThemeContext";

/* =========================================================
   TEMPLATE TYPE
========================================================= */

interface Template {
  title: string;
  description: string;
  icon: ElementType;
  prompt: string;
}

/* =========================================================
   EXPLORE TAB
========================================================= */

type ExploreTab =
  | "search"
  | "projects"
  | "recent"
  | "templates";

/* =========================================================
   DASHBOARD PAGE
========================================================= */

const DashboardPage: FC = () => {
  const navigate = useNavigate();

  /* =======================================================
     THEME
  ======================================================= */

  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const [collapsed, setCollapsed] = useState(false);

  /* =======================================================
     PROJECTS
  ======================================================= */

  const [projects, setProjects] = useState<ProjectResponse[]>([]);

  const [projectsLoading, setProjectsLoading] = useState(true);

  const [projectsError, setProjectsError] = useState("");

  /* =======================================================
     EXPLORE
  ======================================================= */

  const [activeTab, setActiveTab] =
    useState<ExploreTab>("projects");

  const [searchQuery, setSearchQuery] = useState("");

  /* =======================================================
     TEMPLATES
  ======================================================= */

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

  /* =======================================================
     LOAD PROJECTS
  ======================================================= */

  const loadProjects = async (): Promise<void> => {
    try {
      setProjectsLoading(true);
      setProjectsError("");

      const data = await getProjectsApi();

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

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadProjects();
  }, []);

  /* =======================================================
     TEMPLATE CLICK
  ======================================================= */

  const handleTemplateClick = (
    templatePrompt: string
  ): void => {
    const cleanPrompt =
      templatePrompt.trim();

    if (!cleanPrompt) {
      document
        .getElementById("project-prompt")
        ?.focus();

      return;
    }

    navigate(
      `/builder?prompt=${encodeURIComponent(
        cleanPrompt
      )}`
    );
  };

  /* =======================================================
     OPEN PROJECT
  ======================================================= */

  const handleOpenProject = (
    projectId: string
  ): void => {
    navigate(`/builder/${projectId}`);
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatProjectDate = (
    project: ProjectResponse
  ): string => {
    const dateValue =
      project.updated_at ||
      project.created_at;

    if (!dateValue) {
      return "Recently";
    }

    const date = new Date(dateValue);

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

  /* =======================================================
     PROJECT INITIAL
  ======================================================= */

  const getProjectInitial = (
    name: string
  ): string => {
    return (
      name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || "P"
    );
  };

  /* =======================================================
     FILTER PROJECTS
  ======================================================= */

  const filteredProjects = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.name
          ?.toLowerCase()
          .includes(query) ||
        project.description
          ?.toLowerCase()
          .includes(query)
    );
  }, [projects, searchQuery]);

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        page:
          "bg-[#050505] text-white",

        heading:
          "text-[#f5f5f5]",

        paragraph:
          "text-[#858585]",

        card:
          "border-[#202020] bg-[#0b0b0b] text-white",

        projectCard:
          "border-[#202020] bg-[#0b0b0b]",

        projectDivider:
          "border-[#1c1c1c] text-[#777]",

        subtle:
          "text-[#666]",

        empty:
          "border-[#202020] bg-[#090909]",

        tab:
          "border-[#252525] bg-[#0b0b0b] text-[#858585]",

        activeTab:
          "border-[#303030] bg-[#161616] text-white",
      }
    : {
        page:
          "bg-[#f8fafc] text-slate-900",

        heading:
          "text-slate-900",

        paragraph:
          "text-slate-500",

        card:
          "border-slate-200 bg-white text-slate-900",

        projectCard:
          "border-slate-200 bg-white",

        projectDivider:
          "border-slate-100 text-slate-400",

        subtle:
          "text-slate-400",

        empty:
          "border-slate-300 bg-white",

        tab:
          "border-slate-200 bg-white text-slate-500",

        activeTab:
          "border-slate-200 bg-white text-slate-900 shadow-sm",
      };

  /* =======================================================
     MAIN
  ======================================================= */

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
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* ===================================================
          MAIN APPLICATION
      =================================================== */}

      <div
        className={`
          min-h-screen
          w-full
          transition-all
          duration-300
          ${
            collapsed
              ? "pl-[72px]"
              : "pl-[232px]"
          }
        `}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <DashboardHeader
          collapsed={collapsed}
          onToggleSidebar={() =>
            setCollapsed(
              (value) => !value
            )
          }
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <main
          className="
            mx-auto
            w-full
            max-w-[1440px]
            px-5
            pb-20
            pt-8
            sm:px-8
            lg:px-10
          "
        >
          {/* =================================================
              HERO
          ================================================= */}

          <section
            className="
              flex
              w-full
              flex-col
              items-center
              px-4
              pt-10
              sm:pt-14
            "
          >
            <div
              className="
                flex
                w-full
                max-w-4xl
                flex-col
                items-center
                text-center
              "
            >
              <h1
                className={`
                  max-w-3xl
                  text-4xl
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.04em]
                  sm:text-5xl
                  md:text-6xl
                  ${colors.heading}
                `}
              >
                What’s the plan,
                Prashant?
              </h1>

              <p
                className={`
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-6
                  sm:text-base
                  ${colors.paragraph}
                `}
              >
                Describe your idea and
                let ICOGON AI turn it into
                a production-ready website.
              </p>
            </div>

            <div
              className="
                mt-10
                flex
                w-full
                max-w-[830px]
                flex-col
                items-center
                sm:mt-12
              "
            >
              <PromptInput />
            </div>
          </section>

          {/* =================================================
              QUICK START
          ================================================= */}

          <section className="mt-16 sm:mt-20">
            <div className="mb-6 flex flex-col gap-1">
              <h2
                className={`
                  text-xl
                  font-semibold
                  tracking-[-0.02em]
                  ${colors.heading}
                `}
              >
                Quick Start
              </h2>

              <p
                className={`
                  text-[13px]
                  leading-5
                  ${colors.paragraph}
                `}
              >
                Start with a template or turn
                your own idea into a project.
              </p>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-6
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
                        relative
                        min-h-[150px]
                        overflow-hidden
                        rounded-2xl
                        border
                        p-4
                        text-left
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-cyan-400/50
                        hover:shadow-[0_12px_35px_rgba(34,211,238,0.10)]
                        active:scale-[0.98]
                        ${colors.card}
                      `}
                    >
                      <div
                        className="
                          pointer-events-none
                          absolute
                          -right-10
                          -top-10
                          h-24
                          w-24
                          rounded-full
                          bg-cyan-400/10
                          opacity-0
                          blur-2xl
                          transition-opacity
                          duration-300
                          group-hover:opacity-100
                        "
                      />

                      <div
                        className="
                          relative
                          mb-5
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-cyan-400/20
                          bg-cyan-400/[0.06]
                          text-cyan-500
                          transition-all
                          duration-300
                          group-hover:scale-105
                          group-hover:border-cyan-400/40
                          group-hover:bg-cyan-400/10
                        "
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="relative">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="
                              text-[13px]
                              font-semibold
                            "
                          >
                            {template.title}
                          </span>

                          <ChevronRight
                            size={15}
                            className={`
                              shrink-0
                              transition-all
                              duration-300
                              group-hover:translate-x-1
                              group-hover:text-cyan-500
                              ${colors.subtle}
                            `}
                          />
                        </div>

                        <p
                          className={`
                            mt-2
                            text-[11px]
                            leading-[1.55]
                            ${colors.paragraph}
                          `}
                        >
                          {template.description}
                        </p>
                      </div>

                      <div
                        className="
                          absolute
                          bottom-0
                          left-4
                          right-4
                          h-px
                          origin-left
                          scale-x-0
                          bg-gradient-to-r
                          from-cyan-400
                          to-blue-500
                          transition-transform
                          duration-300
                          group-hover:scale-x-100
                        "
                      />
                    </button>
                  );
                }
              )}
            </div>
          </section>

          {/* =================================================
              PROJECT DISCOVERY
          ================================================= */}

          <section
            className="
              relative
              mt-16
              -mx-5
              overflow-hidden
              px-5
              py-20
              sm:-mx-8
              sm:px-8
              lg:-mx-10
              lg:px-10
            "
          >
            {/* =================================================
                GRADIENT BACKGROUND
            ================================================= */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-br
                from-blue-500
                via-fuchsia-500
                to-orange-400
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.9),transparent_42%)]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-[300px]
                w-[600px]
                -translate-x-1/2
                rounded-full
                bg-white/40
                blur-[100px]
              "
            />

            {/* =================================================
                WHITE PROJECT CONTAINER
            ================================================= */}

            <div
              className="
                relative
                mx-auto
                max-w-[1380px]
                rounded-[30px]
                bg-white
                p-5
                shadow-[0_30px_100px_rgba(15,23,42,0.20)]
                sm:p-7
                lg:p-8
              "
            >
              {/* =================================================
                  TOP BAR
              ================================================= */}

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  xl:flex-row
                  xl:items-center
                  xl:justify-between
                "
              >
                {/* TABS */}

                <div
                  className="
                    flex
                    w-fit
                    flex-wrap
                    items-center
                    gap-1
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-1
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab("search")
                    }
                    className={`
                      flex
                      h-9
                      items-center
                      gap-2
                      rounded-xl
                      px-3
                      text-[13px]
                      font-medium
                      transition
                      ${
                        activeTab ===
                        "search"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }
                    `}
                  >
                    <Search size={15} />
                    Search
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab("projects")
                    }
                    className={`
                      flex
                      h-9
                      items-center
                      gap-2
                      rounded-xl
                      px-3
                      text-[13px]
                      font-medium
                      transition
                      ${
                        activeTab ===
                        "projects"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }
                    `}
                  >
                    <Grid2X2 size={15} />
                    My Projects
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab("recent")
                    }
                    className={`
                      flex
                      h-9
                      items-center
                      gap-2
                      rounded-xl
                      px-3
                      text-[13px]
                      font-medium
                      transition
                      ${
                        activeTab ===
                        "recent"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }
                    `}
                  >
                    <Clock3 size={15} />
                    Recently viewed
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab("templates")
                    }
                    className={`
                      flex
                      h-9
                      items-center
                      gap-2
                      rounded-xl
                      px-3
                      text-[13px]
                      font-medium
                      transition
                      ${
                        activeTab ===
                        "templates"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }
                    `}
                  >
                    <Sparkles size={15} />
                    ICOGON templates
                  </button>
                </div>

                {/* BROWSE ALL */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/projects")
                  }
                  className="
                    group
                    flex
                    w-fit
                    items-center
                    gap-1.5
                    text-[13px]
                    font-semibold
                    text-slate-900
                    transition
                    hover:text-cyan-500
                  "
                >
                  Browse all

                  <ArrowRight
                    size={15}
                    className="
                      transition-transform
                      duration-200
                      group-hover:translate-x-1
                    "
                  />
                </button>
              </div>

              {/* =================================================
                  SEARCH
              ================================================= */}

              {activeTab === "search" && (
                <div className="mt-5">
                  <div
                    className="
                      flex
                      h-12
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                    "
                  >
                    <Search
                      size={17}
                      className="text-slate-400"
                    />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(
                          event.target.value
                        )
                      }
                      placeholder="Search your projects..."
                      autoFocus
                      className="
                        w-full
                        bg-transparent
                        text-sm
                        text-slate-900
                        outline-none
                        placeholder:text-slate-400
                      "
                    />
                  </div>
                </div>
              )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {(activeTab === "projects" ||
                activeTab === "search" ||
                activeTab === "recent") &&
                projectsLoading && (
                  <div
                    className="
                      mt-7
                      grid
                      grid-cols-1
                      gap-7
                      sm:grid-cols-2
                    "
                  >
                    {[1, 2].map(
                      (item) => (
                        <div
                          key={item}
                          className="
                            animate-pulse
                          "
                        >
                          <div
                            className="
                              h-[240px]
                              rounded-2xl
                              bg-slate-100
                            "
                          />

                          <div className="mt-4 flex gap-3">
                            <div
                              className="
                                h-10
                                w-10
                                rounded-full
                                bg-slate-100
                              "
                            />

                            <div className="flex-1">
                              <div
                                className="
                                  h-4
                                  w-2/3
                                  rounded
                                  bg-slate-100
                                "
                              />

                              <div
                                className="
                                  mt-2
                                  h-3
                                  w-1/3
                                  rounded
                                  bg-slate-100
                                "
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {(activeTab === "projects" ||
                activeTab === "search" ||
                activeTab === "recent") &&
                !projectsLoading &&
                projectsError && (
                  <div
                    className="
                      mt-7
                      flex
                      min-h-[250px]
                      flex-col
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-red-200
                      bg-red-50
                      p-8
                      text-center
                    "
                  >
                    <h3
                      className="
                        text-[15px]
                        font-semibold
                        text-slate-900
                      "
                    >
                      Unable to load projects
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-md
                        text-[13px]
                        leading-5
                        text-slate-500
                      "
                    >
                      {projectsError}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        void loadProjects()
                      }
                      className="
                        mt-5
                        rounded-xl
                        bg-slate-900
                        px-4
                        py-2.5
                        text-[13px]
                        font-semibold
                        text-white
                        transition
                        hover:bg-slate-800
                      "
                    >
                      Try again
                    </button>
                  </div>
                )}

              {/* =================================================
                  EMPTY
              ================================================= */}

              {(activeTab === "projects" ||
                activeTab === "search" ||
                activeTab === "recent") &&
                !projectsLoading &&
                !projectsError &&
                filteredProjects.length ===
                  0 && (
                  <div
                    className="
                      mt-7
                      flex
                      min-h-[320px]
                      flex-col
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-dashed
                      border-slate-300
                      bg-white
                      p-8
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-[68px]
                        w-[68px]
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-cyan-200
                        bg-cyan-50
                        text-cyan-500
                      "
                    >
                      <Code2
                        size={28}
                        strokeWidth={1.7}
                      />
                    </div>

                    <h3
                      className="
                        mt-6
                        text-lg
                        font-semibold
                        tracking-tight
                        text-slate-900
                      "
                    >
                      {activeTab ===
                      "search"
                        ? "No matching projects"
                        : "No projects yet"}
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-[500px]
                        text-sm
                        leading-6
                        text-slate-500
                      "
                    >
                      {activeTab ===
                      "search"
                        ? "Try another search term."
                        : "Create your first project by describing what you want ICOGON AI to build."}
                    </p>

                    {activeTab !==
                      "search" && (
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(
                              "project-prompt"
                            )
                            ?.focus()
                        }
                        className="
                          mt-6
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-cyan-200
                          bg-cyan-50
                          px-5
                          py-3
                          text-[13px]
                          font-semibold
                          text-cyan-600
                          transition
                          hover:bg-cyan-100
                        "
                      >
                        <Plus size={16} />
                        Create your first project
                      </button>
                    )}
                  </div>
                )}

              {/* =================================================
                  PROJECT CARDS
              ================================================= */}

              {(activeTab === "projects" ||
                activeTab === "search" ||
                activeTab === "recent") &&
                !projectsLoading &&
                !projectsError &&
                filteredProjects.length >
                  0 && (
                  <div
                    className="
                      mt-7
                      grid
                      grid-cols-1
                      gap-x-7
                      gap-y-8
                      sm:grid-cols-2
                    "
                  >
                    {filteredProjects
                      .slice(0, 6)
                      .map(
                        (project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() =>
                              handleOpenProject(
                                project.id
                              )
                            }
                            className="
                              group
                              text-left
                            "
                          >
                            {/* PREVIEW */}

                            <div
                              className="
                                relative
                                h-[240px]
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-100
                                transition-all
                                duration-300
                                group-hover:-translate-y-1
                                group-hover:border-slate-300
                                group-hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]
                              "
                            >
                              {/* Browser bar */}

                              <div
                                className="
                                  absolute
                                  left-0
                                  right-0
                                  top-0
                                  z-10
                                  flex
                                  h-8
                                  items-center
                                  border-b
                                  border-slate-200
                                  bg-white
                                  px-3
                                "
                              >
                                <div className="flex gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                                </div>

                                <div
                                  className="
                                    mx-auto
                                    h-3
                                    w-1/3
                                    rounded-full
                                    bg-slate-100
                                  "
                                />
                              </div>

                              {/* Website mockup */}

                              <div
                                className="
                                  absolute
                                  inset-x-8
                                  top-14
                                  bottom-6
                                  overflow-hidden
                                  rounded-xl
                                  border
                                  border-slate-200
                                  bg-white
                                  shadow-sm
                                "
                              >
                                <div
                                  className="
                                    flex
                                    h-7
                                    items-center
                                    justify-between
                                    border-b
                                    border-slate-100
                                    px-3
                                  "
                                >
                                  <div
                                    className="
                                      h-2
                                      w-14
                                      rounded-full
                                      bg-slate-800
                                    "
                                  />

                                  <div className="flex gap-2">
                                    <span className="h-1.5 w-5 rounded-full bg-slate-200" />
                                    <span className="h-1.5 w-5 rounded-full bg-slate-200" />
                                    <span className="h-1.5 w-5 rounded-full bg-slate-200" />
                                  </div>
                                </div>

                                <div className="p-4">
                                  <div
                                    className="
                                      h-4
                                      w-3/5
                                      rounded-full
                                      bg-slate-800
                                    "
                                  />

                                  <div
                                    className="
                                      mt-2
                                      h-2
                                      w-4/5
                                      rounded-full
                                      bg-slate-200
                                    "
                                  />

                                  <div
                                    className="
                                      mt-1.5
                                      h-2
                                      w-3/5
                                      rounded-full
                                      bg-slate-200
                                    "
                                  />

                                  <div
                                    className="
                                      mt-5
                                      h-16
                                      rounded-xl
                                      bg-gradient-to-br
                                      from-blue-100
                                      via-purple-100
                                      to-pink-100
                                    "
                                  />

                                  <div className="mt-4 grid grid-cols-3 gap-2">
                                    <div className="h-8 rounded-lg bg-slate-100" />
                                    <div className="h-8 rounded-lg bg-slate-100" />
                                    <div className="h-8 rounded-lg bg-slate-100" />
                                  </div>
                                </div>
                              </div>

                              {/* Hover overlay */}

                              <div
                                className="
                                  absolute
                                  inset-0
                                  flex
                                  items-center
                                  justify-center
                                  bg-slate-900/0
                                  transition
                                  duration-300
                                  group-hover:bg-slate-900/5
                                "
                              >
                                <span
                                  className="
                                    translate-y-2
                                    rounded-xl
                                    bg-white
                                    px-4
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-slate-900
                                    opacity-0
                                    shadow-lg
                                    transition-all
                                    duration-300
                                    group-hover:translate-y-0
                                    group-hover:opacity-100
                                  "
                                >
                                  Open project
                                </span>
                              </div>
                            </div>

                            {/* PROJECT INFO */}

                            <div
                              className="
                                mt-3
                                flex
                                items-center
                                gap-3
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  border-slate-200
                                  bg-slate-100
                                  text-xs
                                  font-bold
                                  text-slate-600
                                "
                              >
                                {getProjectInitial(
                                  project.name
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3
                                  className="
                                    truncate
                                    text-[14px]
                                    font-semibold
                                    text-slate-900
                                  "
                                >
                                  {project.name}
                                </h3>

                                <div
                                  className="
                                    mt-0.5
                                    flex
                                    items-center
                                    gap-1
                                    text-[12px]
                                    text-slate-500
                                  "
                                >
                                  <span>
                                    Edited
                                  </span>

                                  <span>
                                    {formatProjectDate(
                                      project
                                    )}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight
                                size={16}
                                className="
                                  text-slate-300
                                  transition-all
                                  group-hover:translate-x-1
                                  group-hover:text-slate-600
                                "
                              />
                            </div>
                          </button>
                        )
                      )}
                  </div>
                )}

              {/* =================================================
                  TEMPLATES
              ================================================= */}

              {activeTab ===
                "templates" && (
                <div
                  className="
                    mt-7
                    grid
                    grid-cols-1
                    gap-7
                    sm:grid-cols-2
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
                          className="
                            group
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            text-left
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:border-slate-300
                            hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]
                          "
                        >
                          <div
                            className="
                              relative
                              h-[240px]
                              overflow-hidden
                              bg-gradient-to-br
                              from-blue-50
                              via-purple-50
                              to-pink-50
                            "
                          >
                            <div
                              className="
                                absolute
                                left-8
                                right-8
                                top-8
                                overflow-hidden
                                rounded-xl
                                border
                                border-white
                                bg-white
                                shadow-lg
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-7
                                  items-center
                                  gap-1.5
                                  border-b
                                  border-slate-100
                                  px-3
                                "
                              >
                                <span className="h-2 w-2 rounded-full bg-slate-200" />
                                <span className="h-2 w-2 rounded-full bg-slate-200" />
                                <span className="h-2 w-2 rounded-full bg-slate-200" />
                              </div>

                              <div className="p-5">
                                <div
                                  className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-cyan-50
                                    text-cyan-500
                                  "
                                >
                                  <Icon size={19} />
                                </div>

                                <div
                                  className="
                                    mt-4
                                    h-3
                                    w-2/3
                                    rounded-full
                                    bg-slate-800
                                  "
                                />

                                <div
                                  className="
                                    mt-2
                                    h-2
                                    w-4/5
                                    rounded-full
                                    bg-slate-200
                                  "
                                />

                                <div
                                  className="
                                    mt-5
                                    h-8
                                    w-24
                                    rounded-lg
                                    bg-slate-900
                                  "
                                />
                              </div>
                            </div>
                          </div>

                          <div className="p-4">
                            <div className="flex items-center justify-between gap-3">
                              <h3
                                className="
                                  text-[14px]
                                  font-semibold
                                  text-slate-900
                                "
                              >
                                {template.title}
                              </h3>

                              <ChevronRight
                                size={15}
                                className="
                                  text-slate-400
                                  transition-transform
                                  group-hover:translate-x-1
                                  group-hover:text-cyan-500
                                "
                              />
                            </div>

                            <p
                              className="
                                mt-1.5
                                text-[12px]
                                leading-5
                                text-slate-500
                              "
                            >
                              {template.description}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="h-10" />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;