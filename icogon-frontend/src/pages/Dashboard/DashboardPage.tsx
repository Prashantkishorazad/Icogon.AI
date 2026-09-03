import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Code2,
  Globe,
  LayoutDashboard,
  MessageSquare,
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
  // SIDEBAR
  // ===================================================

  const [collapsed, setCollapsed] =
    useState<boolean>(false);


  // ===================================================
  // PROMPT
  // ===================================================

  const [prompt, setPrompt] =
    useState<string>("");


  // ===================================================
  // PROJECTS
  // ===================================================

  const [projects, setProjects] =
    useState<ProjectResponse[]>([]);

  const [projectsLoading, setProjectsLoading] =
    useState<boolean>(true);

  const [projectsError, setProjectsError] =
    useState<string>("");


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

      const data = await getProjectsApi();

      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }

    } catch (error: any) {
      console.error(
        "Failed to load projects:",
        error
      );

      setProjectsError(
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to load projects"
      );

      setProjects([]);

    } finally {
      setProjectsLoading(false);
    }
  };


  // ===================================================
  // LOAD PROJECTS WHEN DASHBOARD OPENS
  // ===================================================

  useEffect(() => {
    loadProjects();
  }, []);


  // ===================================================
  // CREATE / BUILD
  // ===================================================

  const handleCreateProject = (): void => {
    const cleanPrompt =
      prompt.trim();

    if (!cleanPrompt) {
      navigate("/builder");
      return;
    }

    navigate(
      `/builder?prompt=${encodeURIComponent(
        cleanPrompt
      )}`
    );
  };


  // ===================================================
  // TEMPLATE
  // ===================================================

  const handleTemplateClick = (
    templatePrompt: string
  ): void => {

    const cleanPrompt =
      templatePrompt.trim();

    if (!cleanPrompt) {
      setPrompt("");
      setTimeout(() => {
        document
          .getElementById("project-prompt")
          ?.focus();
      }, 50);

      return;
    }

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
  // MAIN
  // ===================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#050505",
        color: "#ffffff",
        overflowX: "hidden",
      }}
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      {/* =================================================
          MAIN APPLICATION
      ================================================= */}

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          paddingLeft: collapsed
            ? "84px"
            : "280px",
          boxSizing: "border-box",
          background: "#050505",
          transition:
            "padding-left 0.3s ease",
        }}
      >

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header
          style={{
            height: "68px",
            width: "100%",
            borderBottom:
              "1px solid #1a1a1a",
            background:
              "rgba(5,5,5,0.94)",
            backdropFilter:
              "blur(14px)",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxSizing: "border-box",
          }}
        >

          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              padding:
                "0 28px",
              boxSizing:
                "border-box",
            }}
          >

            {/* LEFT */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >

              <button
                type="button"
                onClick={() =>
                  setCollapsed(
                    (value) => !value
                  )
                }
                aria-label="Toggle sidebar"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  border:
                    "1px solid #222",
                  background:
                    "#0b0b0b",
                  color: "#999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  cursor: "pointer",
                }}
              >
                {collapsed ? (
                  <PanelLeftOpen
                    size={18}
                  />
                ) : (
                  <PanelLeftClose
                    size={18}
                  />
                )}
              </button>


              <div>

                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#f5f5f5",
                  }}
                >
                  Dashboard
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "2px",
                  }}
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border:
                  "1px solid #222",
                background:
                  "#0b0b0b",
                color: "#bbb",
                padding:
                  "9px 14px",
                borderRadius: "9px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              <LayoutDashboard
                size={16}
              />

              My Projects

            </button>

          </div>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <main
          style={{
            width: "100%",
            maxWidth: "1440px",
            margin: "0 auto",
            padding:
              "48px 40px 80px",
            boxSizing: "border-box",
          }}
        >

          {/* =================================================
              HERO
          ================================================= */}

          <section
            style={{
              textAlign: "center",
              maxWidth: "980px",
              margin:
                "0 auto",
            }}
          >

            {/* BADGE */}



            {/* TITLE */}

            <h1
              style={{
                margin: 0,
                fontSize:
                  "clamp(42px, 5vw, 68px)",
                lineHeight: 1.04,
                fontWeight: 700,
                letterSpacing:
                  "-2.8px",
                color: "#f5f5f5",
              }}
            >
              What do you want
              to build?
            </h1>


            {/* DESCRIPTION */}

            <p
              style={{
                maxWidth: "680px",
                margin:
                  "20px auto 0",
                color: "#777",
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              Describe your idea and
              let ICOGON AI turn it
              into a production-ready
              website.
            </p>

          </section>


          {/* =================================================
              PROMPT BOX
          ================================================= */}

          <section
            style={{
              maxWidth: "920px",
              margin:
                "42px auto 0",
            }}
          >

            <div
              style={{
                border:
                  "1px solid #242424",
                background:
                  "#0a0a0a",
                borderRadius:
                  "18px",
                padding: "18px",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.35)",
              }}
            >

              <textarea
                id="project-prompt"
                value={prompt}
                onChange={(
                  event
                ) =>
                  setPrompt(
                    event.target.value
                  )
                }
                onKeyDown={(
                  event
                ) => {

                  if (
                    event.key ===
                      "Enter" &&
                    (event.metaKey ||
                      event.ctrlKey)
                  ) {

                    event.preventDefault();

                    handleCreateProject();
                  }

                }}
                placeholder="Describe the website or application you want to build..."
                rows={6}
                style={{
                  width: "100%",
                  minHeight:
                    "150px",
                  resize:
                    "vertical",
                  border: "none",
                  outline: "none",
                  background:
                    "transparent",
                  color:
                    "#ffffff",
                  fontSize:
                    "16px",
                  lineHeight: 1.6,
                  fontFamily:
                    "inherit",
                  boxSizing:
                    "border-box",
                }}
              />


              {/* PROMPT FOOTER */}

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  marginTop:
                    "12px",
                  paddingTop:
                    "14px",
                  borderTop:
                    "1px solid #181818",
                  gap: "16px",
                }}
              >

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "7px",
                    color: "#555",
                    fontSize:
                      "12px",
                  }}
                >
                  <MessageSquare
                    size={14}
                  />

                  Press Cmd/Ctrl +
                  Enter to build

                </div>


                <button
                  type="button"
                  onClick={
                    handleCreateProject
                  }
                  disabled={
                    !prompt.trim()
                  }
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "8px",
                    border: "none",
                    borderRadius:
                      "10px",
                    padding:
                      "11px 18px",
                    background:
                      prompt.trim()
                        ? "#00d9ff"
                        : "#1a1a1a",
                    color:
                      prompt.trim()
                        ? "#001014"
                        : "#555",
                    fontWeight: 700,
                    fontSize:
                      "13px",
                    cursor:
                      prompt.trim()
                        ? "pointer"
                        : "not-allowed",
                  }}
                >

                  <Sparkles
                    size={16}
                  />

                  Build with AI

                  <ArrowRight
                    size={16}
                  />

                </button>

              </div>

            </div>

          </section>


          {/* =================================================
              QUICK START
          ================================================= */}

          <section
            style={{
              marginTop:
                "64px",
            }}
          >

            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >

              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "20px",
                  fontWeight: 650,
                  color:
                    "#f2f2f2",
                }}
              >
                Quick Start
              </h2>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  fontSize:
                    "13px",
                  color: "#666",
                }}
              >
                Start with a template
                or your own idea.
              </p>

            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "14px",
              }}
            >

              {templates.map(
                (template) => {

                  const Icon =
                    template.icon;

                  return (
                    <button
                      key={
                        template.title
                      }
                      type="button"
                      onClick={() =>
                        handleTemplateClick(
                          template.prompt
                        )
                      }
                      style={{
                        textAlign:
                          "left",
                        border:
                          "1px solid #1b1b1b",
                        background:
                          "#0a0a0a",
                        borderRadius:
                          "14px",
                        padding:
                          "20px",
                        color:
                          "#ffffff",
                        cursor:
                          "pointer",
                        transition:
                          "all 0.2s ease",
                      }}
                      onMouseEnter={(
                        event
                      ) => {

                        event.currentTarget.style.borderColor =
                          "#00d9ff";

                        event.currentTarget.style.transform =
                          "translateY(-2px)";
                      }}
                      onMouseLeave={(
                        event
                      ) => {

                        event.currentTarget.style.borderColor =
                          "#1b1b1b";

                        event.currentTarget.style.transform =
                          "translateY(0)";
                      }}
                    >

                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius:
                            "10px",
                          background:
                            "rgba(0,217,255,0.07)",
                          border:
                            "1px solid rgba(0,217,255,0.12)",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          color:
                            "#00d9ff",
                          marginBottom:
                            "16px",
                        }}
                      >
                        <Icon
                          size={19}
                        />
                      </div>


                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: "10px",
                        }}
                      >

                        <span
                          style={{
                            fontSize:
                              "14px",
                            fontWeight:
                              600,
                          }}
                        >
                          {
                            template.title
                          }
                        </span>

                        <ChevronRight
                          size={16}
                          color="#555"
                        />

                      </div>


                      <p
                        style={{
                          margin:
                            "8px 0 0",
                          fontSize:
                            "12px",
                          lineHeight:
                            1.5,
                          color:
                            "#666",
                        }}
                      >
                        {
                          template.description
                        }
                      </p>

                    </button>
                  );
                }
              )}

            </div>

          </section>


          {/* =================================================
              RECENT PROJECTS
          ================================================= */}

          <section
            style={{
              marginTop:
                "64px",
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                marginBottom:
                  "20px",
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "20px",
                    fontWeight:
                      650,
                    color:
                      "#f2f2f2",
                  }}
                >
                  Recent Projects
                </h2>

                <p
                  style={{
                    margin:
                      "7px 0 0",
                    color:
                      "#666",
                    fontSize:
                      "13px",
                  }}
                >
                  Continue working
                  on your projects
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/projects"
                  )
                }
                style={{
                  border: "none",
                  background:
                    "transparent",
                  color:
                    "#00d9ff",
                  cursor:
                    "pointer",
                  fontSize:
                    "13px",
                  fontWeight:
                    600,
                }}
              >
                View all →
              </button>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {projectsLoading && (
              <div
                style={{
                  minHeight:
                    "220px",
                  border:
                    "1px solid #1b1b1b",
                  borderRadius:
                    "16px",
                  background:
                    "#070707",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  color:
                    "#555",
                  fontSize:
                    "14px",
                }}
              >
                Loading projects...
              </div>
            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {!projectsLoading &&
              projectsError && (
                <div
                  style={{
                    minHeight:
                      "180px",
                    border:
                      "1px solid rgba(255,80,80,0.18)",
                    borderRadius:
                      "16px",
                    background:
                      "#090707",
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    textAlign:
                      "center",
                    padding:
                      "30px",
                  }}
                >

                  <h3
                    style={{
                      margin: 0,
                      color:
                        "#ddd",
                      fontSize:
                        "15px",
                    }}
                  >
                    Unable to load projects
                  </h3>

                  <p
                    style={{
                      margin:
                        "8px 0 18px",
                      color:
                        "#666",
                      fontSize:
                        "13px",
                    }}
                  >
                    {projectsError}
                  </p>

                  <button
                    type="button"
                    onClick={
                      loadProjects
                    }
                    style={{
                      border:
                        "1px solid #333",
                      background:
                        "#111",
                      color:
                        "#bbb",
                      padding:
                        "9px 14px",
                      borderRadius:
                        "9px",
                      cursor:
                        "pointer",
                    }}
                  >
                    Try again
                  </button>

                </div>
              )}


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!projectsLoading &&
              !projectsError &&
              projects.length ===
                0 && (

                <div
                  style={{
                    minHeight:
                      "260px",
                    border:
                      "1px dashed #202020",
                    borderRadius:
                      "16px",
                    background:
                      "#070707",
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    textAlign:
                      "center",
                    padding:
                      "40px",
                  }}
                >

                  <div
                    style={{
                      width: "54px",
                      height: "54px",
                      borderRadius:
                        "14px",
                      background:
                        "#0d0d0d",
                      border:
                        "1px solid #202020",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      marginBottom:
                        "18px",
                      color:
                        "#555",
                    }}
                  >
                    <Code2
                      size={24}
                    />
                  </div>


                  <h3
                    style={{
                      margin: 0,
                      fontSize:
                        "16px",
                      fontWeight:
                        600,
                      color:
                        "#ddd",
                    }}
                  >
                    No projects yet
                  </h3>


                  <p
                    style={{
                      maxWidth:
                        "420px",
                      margin:
                        "10px 0 22px",
                      color:
                        "#555",
                      fontSize:
                        "13px",
                      lineHeight:
                        1.6,
                    }}
                  >
                    Start your first
                    project by describing
                    what you want ICOGON AI
                    to build.
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
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "8px",
                      border:
                        "1px solid rgba(0,217,255,0.25)",
                      background:
                        "rgba(0,217,255,0.06)",
                      color:
                        "#00d9ff",
                      padding:
                        "10px 16px",
                      borderRadius:
                        "9px",
                      cursor:
                        "pointer",
                      fontSize:
                        "13px",
                      fontWeight:
                        600,
                    }}
                  >
                    <Plus
                      size={16}
                    />

                    Create your first
                    project

                  </button>

                </div>
              )}


            {/* =================================================
                PROJECT LIST
            ================================================= */}

            {!projectsLoading &&
              !projectsError &&
              projects.length > 0 && (

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "14px",
                  }}
                >

                  {projects
                    .slice(0, 6)
                    .map(
                      (
                        project
                      ) => (

                        <div
                          key={
                            project.id
                          }
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            handleOpenProject(
                              project.id
                            )
                          }
                          onKeyDown={(
                            event
                          ) => {

                            if (
                              event.key ===
                                "Enter" ||
                              event.key ===
                                " "
                            ) {

                              event.preventDefault();

                              handleOpenProject(
                                project.id
                              );
                            }
                          }}
                          style={{
                            border:
                              "1px solid #1b1b1b",
                            background:
                              "#0a0a0a",
                            borderRadius:
                              "14px",
                            padding:
                              "20px",
                            cursor:
                              "pointer",
                            transition:
                              "all 0.2s ease",
                            outline:
                              "none",
                          }}
                          onMouseEnter={(
                            event
                          ) => {

                            event.currentTarget.style.borderColor =
                              "rgba(0,217,255,0.35)";

                            event.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onMouseLeave={(
                            event
                          ) => {

                            event.currentTarget.style.borderColor =
                              "#1b1b1b";

                            event.currentTarget.style.transform =
                              "translateY(0)";
                          }}
                        >

                          {/* PROJECT TOP */}

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                            }}
                          >

                            <div
                              style={{
                                width:
                                  "42px",
                                height:
                                  "42px",
                                borderRadius:
                                  "11px",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                background:
                                  "rgba(0,217,255,0.07)",
                                border:
                                  "1px solid rgba(0,217,255,0.12)",
                                color:
                                  "#00d9ff",
                                fontWeight:
                                  700,
                                fontSize:
                                  "15px",
                              }}
                            >
                              {getProjectInitial(
                                project.name
                              )}
                            </div>


                            <ChevronRight
                              size={17}
                              color="#555"
                            />

                          </div>


                          {/* NAME */}

                          <h3
                            style={{
                              margin:
                                "18px 0 0",
                              fontSize:
                                "15px",
                              fontWeight:
                                600,
                              color:
                                "#f1f1f1",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              project.name
                            }
                          </h3>


                          {/* DESCRIPTION */}

                          <p
                            style={{
                              margin:
                                "8px 0 0",
                              minHeight:
                                "40px",
                              color:
                                "#666",
                              fontSize:
                                "12px",
                              lineHeight:
                                1.6,
                              display:
                                "-webkit-box",
                              WebkitLineClamp:
                                2,
                              WebkitBoxOrient:
                                "vertical",
                              overflow:
                                "hidden",
                            }}
                          >
                            {
                              project.description ||
                              "No project description"
                            }
                          </p>


                          {/* FOOTER */}

                          <div
                            style={{
                              marginTop:
                                "18px",
                              paddingTop:
                                "13px",
                              borderTop:
                                "1px solid #181818",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              color:
                                "#555",
                              fontSize:
                                "11px",
                            }}
                          >

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                              }}
                            >
                              <Clock3
                                size={12}
                              />

                              {formatProjectDate(
                                project
                              )}
                            </div>


                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "5px",
                                color:
                                  "#666",
                              }}
                            >
                              Open

                              <ArrowRight
                                size={13}
                              />
                            </div>

                          </div>

                        </div>

                      )
                    )}

                </div>
              )}

          </section>


          {/* BOTTOM SPACE */}

          <div
            style={{
              height: "40px",
            }}
          />

        </main>

      </div>

    </div>
  );
};


export default DashboardPage;