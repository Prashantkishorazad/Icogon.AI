import {
  ArrowLeft,
  Code2,
  Eye,
  FileCode2,
  Maximize2,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Rocket,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProjectApi,
  type ProjectResponse,
} from "../../api/projectApi";


type WorkspaceTab = "preview" | "code";


type Message = {
  id: string;
  role: "ai" | "user";
  content: string;
};


const BuilderWorkspacePage = () => {
  const navigate = useNavigate();

  const { projectId } = useParams<{
    projectId: string;
  }>();


  // =====================================================
  // PROJECT
  // =====================================================

  const [project, setProject] =
    useState<ProjectResponse | null>(null);

  const [projectLoading, setProjectLoading] =
    useState<boolean>(true);

  const [projectError, setProjectError] =
    useState<string>("");


  // =====================================================
  // WORKSPACE
  // =====================================================

  const [prompt, setPrompt] =
    useState<string>("");

  const [sidebarOpen, setSidebarOpen] =
    useState<boolean>(true);

  const [activeTab, setActiveTab] =
    useState<WorkspaceTab>("preview");

  const [isFullscreen, setIsFullscreen] =
    useState<boolean>(false);


  // =====================================================
  // CHAT
  // =====================================================

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: "welcome",
        role: "ai",
        content:
          "Hi! I'm ICOGON AI. Tell me what you'd like to build or change in this project.",
      },
    ]);

  const [isSending, setIsSending] =
    useState<boolean>(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);


  // =====================================================
  // LOAD PROJECT
  // =====================================================

  useEffect(() => {
    if (!projectId) {
      setProjectError("Project ID is missing.");
      setProjectLoading(false);
      return;
    }

    let mounted = true;

    const loadProject = async () => {
      try {
        setProjectLoading(true);
        setProjectError("");

        const data =
          await getProjectApi(projectId);

        if (mounted) {
          setProject(data);
        }
      } catch (error: any) {
        console.error(
          "PROJECT LOAD ERROR:",
          error
        );

        if (mounted) {
          setProjectError(
            error?.response?.data?.detail ||
              error?.response?.data?.message ||
              error?.message ||
              "Unable to load project."
          );
        }
      } finally {
        if (mounted) {
          setProjectLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      mounted = false;
    };
  }, [projectId]);


  // =====================================================
  // AUTO SCROLL CHAT
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);


  // =====================================================
  // SEND PROMPT
  // =====================================================

  const handleSendPrompt = () => {
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt || isSending) {
      return;
    }

    const userMessage: Message = {
      id:
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-user`,
      role: "user",
      content: cleanPrompt,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setPrompt("");
    setIsSending(true);


    /*
     * ===================================================
     * FUTURE ICOGON AI ORCHESTRATOR
     * ===================================================
     *
     * Later this section will call:
     *
     * POST /orchestrator/runs
     *
     * {
     *   project_id: projectId,
     *   prompt: cleanPrompt
     * }
     *
     * For now we only simulate the response.
     */


    window.setTimeout(() => {
      const aiMessage: Message = {
        id:
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-ai`,
        role: "ai",
        content:
          "Your request is saved in this workspace. AI generation will be available once the ICOGON orchestration pipeline is connected.",
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);

      setIsSending(false);
    }, 700);
  };


  // =====================================================
  // KEYBOARD
  // =====================================================

  const handlePromptKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSendPrompt();
    }
  };


  // =====================================================
  // LOADING STATE
  // =====================================================

  if (projectLoading) {
    return (
      <div
        className="
          flex
          h-screen
          items-center
          justify-center
          bg-[#050505]
          text-white
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-4
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-pink-500
              via-purple-500
              to-cyan-400
              shadow-lg
              shadow-purple-500/20
            "
          >
            <Sparkles size={21} />
          </div>

          <p
            className="
              text-sm
              text-slate-500
            "
          >
            Loading project...
          </p>
        </div>
      </div>
    );
  }


  // =====================================================
  // ERROR STATE
  // =====================================================

  if (projectError || !project) {
    return (
      <div
        className="
          flex
          h-screen
          items-center
          justify-center
          bg-[#050505]
          px-6
          text-white
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-2xl
            border
            border-white/[0.08]
            bg-[#0a0a0a]
            p-8
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-5
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-red-500/10
              text-red-400
            "
          >
            !
          </div>

          <h2
            className="
              text-lg
              font-semibold
            "
          >
            Project unavailable
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            {projectError ||
              "This project could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-black
              transition
              hover:bg-slate-200
            "
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      className={`
        flex
        h-screen
        w-full
        overflow-hidden
        bg-[#050505]
        text-white
        ${
          isFullscreen
            ? "fixed inset-0 z-[9999]"
            : ""
        }
      `}
    >

      {/* =================================================
          LEFT AI SIDEBAR
      ================================================= */}

      <aside
        className={`
          flex
          shrink-0
          flex-col
          border-r
          border-white/[0.07]
          bg-[#080808]
          transition-all
          duration-300
          ease-in-out
          ${
            sidebarOpen
              ? "w-[360px]"
              : "w-0"
          }
          overflow-hidden
        `}
      >

        {/* =================================================
            SIDEBAR HEADER
        ================================================= */}

        <div
          className="
            flex
            h-[68px]
            shrink-0
            items-center
            justify-between
            border-b
            border-white/[0.06]
            px-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
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
                rounded-xl
                bg-gradient-to-br
                from-pink-500
                via-purple-500
                to-cyan-400
                shadow-lg
                shadow-purple-500/10
              "
            >
              <Sparkles size={17} />
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                ICOGON AI
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-slate-600
                "
              >
                AI Builder
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close AI panel"
            className="
              rounded-lg
              p-2
              text-slate-600
              transition
              hover:bg-white/[0.04]
              hover:text-white
            "
          >
            <PanelLeftClose size={17} />
          </button>
        </div>


        {/* =================================================
            PROJECT INFO
        ================================================= */}

        <div
          className="
            border-b
            border-white/[0.06]
            px-5
            py-4
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-700
            "
          >
            Project
          </p>

          <p
            className="
              mt-1.5
              truncate
              text-sm
              font-medium
              text-slate-300
            "
            title={project.name}
          >
            {project.name}
          </p>
        </div>


        {/* =================================================
            CHAT
        ================================================= */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-4
            py-5
          "
        >
          <div
            className="
              space-y-5
            "
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`
                  flex
                  gap-3
                  ${
                    message.role === "user"
                      ? "justify-end"
                      : ""
                  }
                `}
              >

                {message.role === "ai" && (
                  <div
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-cyan-500/[0.08]
                      text-cyan-400
                    "
                  >
                    <Sparkles size={13} />
                  </div>
                )}

                <div
                  className={`
                    max-w-[275px]
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    leading-6
                    ${
                      message.role === "user"
                        ? `
                          bg-cyan-500/10
                          text-slate-300
                        `
                        : `
                          bg-white/[0.035]
                          text-slate-500
                        `
                    }
                  `}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    bg-cyan-500/[0.08]
                    text-cyan-400
                  "
                >
                  <Sparkles size={13} />
                </div>

                <div
                  className="
                    rounded-2xl
                    bg-white/[0.035]
                    px-4
                    py-3
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-1
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>


        {/* =================================================
            PROMPT INPUT
        ================================================= */}

        <div
          className="
            shrink-0
            border-t
            border-white/[0.06]
            p-4
          "
        >
          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#050505]
              transition
              focus-within:border-cyan-500/30
              focus-within:ring-1
              focus-within:ring-cyan-500/10
            "
          >
            <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              onKeyDown={handlePromptKeyDown}
              placeholder="Ask ICOGON AI..."
              rows={3}
              disabled={isSending}
              className="
                w-full
                resize-none
                bg-transparent
                px-4
                py-3
                text-sm
                leading-6
                text-white
                outline-none
                placeholder:text-slate-700
                disabled:opacity-50
              "
            />

            <div
              className="
                flex
                items-center
                justify-between
                px-3
                pb-3
              "
            >
              <button
                type="button"
                disabled
                title="AI tools will be available later"
                className="
                  rounded-lg
                  p-2
                  text-slate-700
                  opacity-60
                "
              >
                <WandSparkles size={15} />
              </button>

              <button
                type="button"
                onClick={handleSendPrompt}
                disabled={
                  !prompt.trim() ||
                  isSending
                }
                aria-label="Send prompt"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-cyan-500
                  text-black
                  transition
                  hover:bg-cyan-400
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          <p
            className="
              mt-2
              text-center
              text-[10px]
              text-slate-700
            "
          >
            Enter to send · Shift + Enter for new line
          </p>
        </div>
      </aside>


      {/* =================================================
          MAIN WORKSPACE
      ================================================= */}

      <section
        className="
          flex
          min-w-0
          flex-1
          flex-col
          bg-[#050505]
        "
      >

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header
          className="
            flex
            h-[68px]
            shrink-0
            items-center
            justify-between
            border-b
            border-white/[0.07]
            bg-[#080808]
            px-4
            lg:px-5
          "
        >

          {/* LEFT SIDE */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
            "
          >

            {!sidebarOpen && (
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                aria-label="Open AI panel"
                className="
                  rounded-lg
                  p-2
                  text-slate-500
                  transition
                  hover:bg-white/[0.04]
                  hover:text-white
                "
              >
                <PanelLeftOpen size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="
                flex
                items-center
                gap-2
                rounded-lg
                px-2
                py-1.5
                text-sm
                text-slate-500
                transition
                hover:bg-white/[0.04]
                hover:text-white
              "
            >
              <ArrowLeft size={16} />

              <span className="hidden sm:block">
                Dashboard
              </span>
            </button>

            <div
              className="
                mx-1
                h-5
                w-px
                bg-white/[0.08]
              "
            />

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  max-w-[280px]
                  truncate
                  text-sm
                  font-semibold
                  text-white
                "
                title={project.name}
              >
                {project.name}
              </p>

              <p
                className="
                  hidden
                  max-w-[320px]
                  truncate
                  text-[10px]
                  text-slate-700
                  sm:block
                "
              >
                {project.description ||
                  "Project workspace"}
              </p>
            </div>
          </div>


          {/* RIGHT SIDE */}

          <div
            className="
              flex
              items-center
              gap-1.5
            "
          >

            {/* PREVIEW / CODE */}

            <div
              className="
                hidden
                items-center
                rounded-lg
                border
                border-white/[0.06]
                bg-white/[0.02]
                p-1
                md:flex
              "
            >
              <button
                type="button"
                onClick={() =>
                  setActiveTab("preview")
                }
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-md
                  px-3
                  py-1.5
                  text-xs
                  transition
                  ${
                    activeTab === "preview"
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-600 hover:text-slate-300"
                  }
                `}
              >
                <Eye size={14} />
                Preview
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab("code")
                }
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-md
                  px-3
                  py-1.5
                  text-xs
                  transition
                  ${
                    activeTab === "code"
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-600 hover:text-slate-300"
                  }
                `}
              >
                <Code2 size={14} />
                Code
              </button>
            </div>


            {/* RUN */}

            <button
              type="button"
              disabled
              title="Run will be available when runtime is connected"
              className="
                hidden
                items-center
                gap-2
                rounded-lg
                border
                border-white/[0.08]
                px-3
                py-2
                text-xs
                text-slate-600
                opacity-60
                sm:flex
              "
            >
              <Play size={13} />
              Run
            </button>


            {/* DEPLOY */}

            <button
              type="button"
              disabled
              title="Deploy will be available later"
              className="
                flex
                cursor-not-allowed
                items-center
                gap-2
                rounded-lg
                bg-cyan-500
                px-3.5
                py-2
                text-xs
                font-semibold
                text-black
                opacity-40
              "
            >
              <Rocket size={13} />

              <span className="hidden sm:inline">
                Deploy
              </span>
            </button>


            {/* MORE */}

            <button
              type="button"
              aria-label="More options"
              className="
                rounded-lg
                p-2
                text-slate-600
                transition
                hover:bg-white/[0.04]
                hover:text-slate-300
              "
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>


        {/* =================================================
            MOBILE TABS
        ================================================= */}

        <div
          className="
            flex
            shrink-0
            border-b
            border-white/[0.06]
            bg-[#080808]
            px-3
            py-2
            md:hidden
          "
        >
          <button
            type="button"
            onClick={() =>
              setActiveTab("preview")
            }
            className={`
              flex-1
              rounded-lg
              px-3
              py-2
              text-xs
              ${
                activeTab === "preview"
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-600"
              }
            `}
          >
            Preview
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("code")
            }
            className={`
              flex-1
              rounded-lg
              px-3
              py-2
              text-xs
              ${
                activeTab === "code"
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-600"
              }
            `}
          >
            Code
          </button>
        </div>


        {/* =================================================
            WORKSPACE CONTENT
        ================================================= */}

        <div
          className="
            relative
            flex-1
            overflow-hidden
            bg-[#050505]
          "
        >

          {activeTab === "preview" ? (

            /* =================================================
               PREVIEW
            ================================================= */

            <div
              className="
                h-full
                overflow-auto
                p-4
                md:p-6
                lg:p-8
              "
            >
              <div
                className={`
                  mx-auto
                  overflow-hidden
                  border
                  border-white/[0.08]
                  bg-white
                  shadow-2xl
                  shadow-black/40
                  ${
                    isFullscreen
                      ? "h-full rounded-none"
                      : "min-h-full max-w-[1400px] rounded-xl"
                  }
                `}
              >

                {/* PREVIEW TOOLBAR */}

                <div
                  className="
                    flex
                    h-11
                    items-center
                    justify-between
                    border-b
                    border-slate-200
                    bg-white
                    px-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        h-2.5
                        w-2.5
                        rounded-full
                        bg-slate-300
                      "
                    />

                    <span
                      className="
                        text-[11px]
                        font-medium
                        text-slate-500
                      "
                    >
                      Preview
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsFullscreen(
                        !isFullscreen
                      )
                    }
                    aria-label={
                      isFullscreen
                        ? "Exit fullscreen"
                        : "Enter fullscreen"
                    }
                    className="
                      rounded-md
                      p-1.5
                      text-slate-500
                      transition
                      hover:bg-slate-100
                      hover:text-slate-900
                    "
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>


                {/* EMPTY PREVIEW */}

                <div
                  className="
                    flex
                    min-h-[calc(100vh-180px)]
                    flex-col
                    items-center
                    justify-center
                    px-6
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
                      bg-slate-100
                      text-slate-800
                    "
                  >
                    <Sparkles size={27} />
                  </div>

                  <h2
                    className="
                      max-w-xl
                      text-2xl
                      font-bold
                      tracking-tight
                      text-slate-900
                      md:text-3xl
                    "
                  >
                    Your generated website
                    will appear here
                  </h2>

                  <p
                    className="
                      mt-4
                      max-w-lg
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Describe your idea in the ICOGON
                    AI panel. The generated application
                    preview will appear here once the
                    AI generation and runtime pipeline
                    are connected.
                  </p>

                  <div
                    className="
                      mt-7
                      flex
                      flex-wrap
                      justify-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        rounded-full
                        border
                        border-slate-200
                        px-3
                        py-1.5
                        text-[11px]
                        text-slate-500
                      "
                    >
                      AI Generation
                    </span>

                    <span
                      className="
                        rounded-full
                        border
                        border-slate-200
                        px-3
                        py-1.5
                        text-[11px]
                        text-slate-500
                      "
                    >
                      Live Preview
                    </span>

                    <span
                      className="
                        rounded-full
                        border
                        border-slate-200
                        px-3
                        py-1.5
                        text-[11px]
                        text-slate-500
                      "
                    >
                      Code Runtime
                    </span>
                  </div>
                </div>
              </div>
            </div>

          ) : (

            /* =================================================
               CODE
            ================================================= */

            <div
              className="
                h-full
                overflow-auto
                p-4
                md:p-7
              "
            >
              <div
                className="
                  mx-auto
                  max-w-[1400px]
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-[#090909]
                "
              >

                {/* CODE HEADER */}

                <div
                  className="
                    flex
                    h-12
                    items-center
                    justify-between
                    border-b
                    border-white/[0.06]
                    px-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <FileCode2
                      size={15}
                      className="text-cyan-400"
                    />

                    <span
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      App.tsx
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label="Code options"
                    className="
                      rounded-md
                      p-1.5
                      text-slate-600
                      transition
                      hover:bg-white/[0.04]
                      hover:text-slate-300
                    "
                  >
                    <Code2 size={14} />
                  </button>
                </div>


                {/* CODE */}

                <pre
                  className="
                    overflow-auto
                    p-6
                    text-xs
                    leading-6
                    text-slate-500
                  "
                >
{`// ICOGON generated code

export default function App() {
  return (
    <main className="min-h-screen">
      <h1>
        Your generated application
      </h1>

      <p>
        AI generated code will appear here.
      </p>
    </main>
  );
}`}
                </pre>
              </div>
            </div>
          )}
        </div>


        {/* =================================================
            STATUS BAR
        ================================================= */}

        <footer
          className="
            flex
            h-9
            shrink-0
            items-center
            justify-between
            border-t
            border-white/[0.06]
            bg-[#080808]
            px-4
            text-[10px]
            text-slate-700
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-green-500
              "
            />

            Workspace ready
          </div>

          <div
            className="
              hidden
              items-center
              gap-3
              sm:flex
            "
          >
            <span>
              ICOGON AI
            </span>

            <span>
              {project.name}
            </span>
          </div>
        </footer>
      </section>
    </div>
  );
};


export default BuilderWorkspacePage;