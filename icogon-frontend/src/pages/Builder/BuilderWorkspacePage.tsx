import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  CircleAlert,
  Code2,
  Copy,
  Eye,
  FileCode2,
  Folder,
  Loader2,
  Maximize2,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Rocket,
  Send,
  Sparkles,
  Square,
  WandSparkles,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProjectApi,
  getOrchestratorPreviewApi,
  getOrchestratorRunApi,
  streamOrchestratorEventsApi,
  submitOrchestratorRunApi,
  cancelOrchestratorRunApi,
  type OrchestratorRun,
  type OrchestratorRunEvent,
  type OrchestratorRunStep,
  type ProjectResponse,
} from "../../api/projectApi";

import { useTheme } from "../../context/ThemeContext";

/* =========================================================
   TYPES
========================================================= */

type WorkspaceTab = "preview" | "code";

type Message = {
  id: string;
  role: "ai" | "user";
  content: string;
};

type RunStage =
  | "idle"
  | "queued"
  | "analyzing"
  | "designing"
  | "planning"
  | "generating"
  | "reviewing"
  | "repairing"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled";

type GeneratedFile = {
  path: string;
  operation?: string;
  content?: string | null;
};

type PreviewState = {
  available: boolean;
  html?: string;
  warnings?: string[];
  compiler?: string;
  data: unknown | null;
};

/* =========================================================
   HELPERS
========================================================= */

const createId = (prefix: string) => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

const stageLabel = (stage: RunStage): string => {
  switch (stage) {
    case "queued":
      return "Queued";

    case "analyzing":
      return "Understanding requirements";

    case "designing":
      return "Designing architecture";

    case "planning":
      return "Planning implementation";

    case "generating":
      return "Generating application";

    case "reviewing":
      return "Reviewing generated code";

    case "repairing":
      return "Improving generated code";

    case "verifying":
      return "Verifying application";

    case "completed":
      return "Generation completed";

    case "failed":
      return "Generation failed";

    case "cancelled":
      return "Generation cancelled";

    default:
      return "Ready";
  }
};

const normalizeStage = (
  value: string | undefined
): RunStage => {
  if (!value) {
    return "idle";
  }

  const normalized = value.toLowerCase();

  const stages: RunStage[] = [
    "queued",
    "analyzing",
    "designing",
    "planning",
    "generating",
    "reviewing",
    "repairing",
    "verifying",
    "completed",
    "failed",
    "cancelled",
  ];

  if (stages.includes(normalized as RunStage)) {
    return normalized as RunStage;
  }

  return "idle";
};

const extractGeneratedFiles = (
  run: OrchestratorRun | null
): GeneratedFile[] => {
  if (!run?.changes) {
    return [];
  }

  if (
    typeof run.changes !== "object" ||
    run.changes === null
  ) {
    return [];
  }

  const changes = run.changes as {
    files?: unknown;
  };

  if (!Array.isArray(changes.files)) {
    return [];
  }

  return changes.files.filter(
    (file): file is GeneratedFile =>
      typeof file === "object" &&
      file !== null &&
      "path" in file &&
      typeof (file as { path?: unknown }).path === "string"
  );
};

const getFileContent = (
  file: GeneratedFile | undefined
): string => {
  if (!file?.content) {
    return "";
  }

  return file.content;
};

const getPreviewMessage = (
  stage: RunStage,
  run: OrchestratorRun | null
): string => {
  if (stage === "completed") {
    const fileCount = extractGeneratedFiles(run).length;

    if (fileCount > 0) {
      return `Your application has been generated successfully with ${fileCount} file${
        fileCount === 1 ? "" : "s"
      }.`;
    }

    return "Your application has been generated successfully.";
  }

  if (stage === "failed") {
    const failure = run?.failure;

    if (
      typeof failure === "object" &&
      failure !== null &&
      "message" in failure &&
      typeof (failure as { message?: unknown }).message === "string"
    ) {
      return (failure as { message: string }).message;
    }

    return "Generation failed. Please try again.";
  }

  if (stage === "cancelled") {
    return "Generation was cancelled.";
  }

  return `ICOGON AI is ${stageLabel(stage).toLowerCase()}...`;
};

/* =========================================================
   PREVIEW DOCUMENT SECURITY
========================================================= */

const PREVIEW_CSP =
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https: data:; font-src https: data:; img-src data: blob: https:; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'">`;

const createSandboxedPreviewDocument = (html: string): string => {
  if (/http-equiv=["']Content-Security-Policy["']/i.test(html)) {
    return html;
  }

  if (/<head(?:\s[^>]*)?>/i.test(html)) {
    return html.replace(/<head((?:\s[^>]*)?)>/i, `<head$1>${PREVIEW_CSP}`);
  }

  return `${PREVIEW_CSP}${html}`;
};

/* =========================================================
   COMPONENT
========================================================= */

const BuilderWorkspacePage: React.FC = () => {
  const navigate = useNavigate();

  const { projectId } = useParams<{
    projectId: string;
  }>();

  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  /* =======================================================
     PROJECT
  ======================================================= */

  const [
    project,
    setProject,
  ] = useState<ProjectResponse | null>(null);

  const [
    projectLoading,
    setProjectLoading,
  ] = useState(true);

  const [
    projectError,
    setProjectError,
  ] = useState("");

  /* =======================================================
     WORKSPACE
  ======================================================= */

  const [
    prompt,
    setPrompt,
  ] = useState("");

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.matchMedia("(min-width: 768px)").matches
  );

  const [
    activeTab,
    setActiveTab,
  ] = useState<WorkspaceTab>("preview");

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  /* =======================================================
     ORCHESTRATOR
  ======================================================= */

  const [
    activeRun,
    setActiveRun,
  ] = useState<OrchestratorRun | null>(null);

  const [
    runStage,
    setRunStage,
  ] = useState<RunStage>("idle");

  const [
    runError,
    setRunError,
  ] = useState("");

  const [
    runEvents,
    setRunEvents,
  ] = useState<OrchestratorRunEvent[]>([]);

  const [
    runSteps,
    setRunSteps,
  ] = useState<OrchestratorRunStep[]>([]);

  const [
    generatedFiles,
    setGeneratedFiles,
  ] = useState<GeneratedFile[]>([]);

  const [
    selectedFilePath,
    setSelectedFilePath,
  ] = useState("App.tsx");

  const [
    previewState,
    setPreviewState,
  ] = useState<PreviewState>({
    available: false,
    html: undefined,
    warnings: [],
    data: null,
  });

  const [previewError, setPreviewError] = useState("");

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    isCancelling,
    setIsCancelling,
  ] = useState(false);

  const eventAbortRef =
    useRef<AbortController | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     CHAT
  ======================================================= */

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Hi! I'm ICOGON AI. Tell me what you'd like to build or change in this project.",
    },
  ]);

  /* =======================================================
     THEME
  ======================================================= */

  const colors = isDark
    ? {
        page: "bg-[#080808] text-white",
        panel: "bg-[#0d0d0d]",
        panelSoft: "bg-[#111111]",
        border: "border-[#242424]",
        borderSoft: "border-[#1c1c1c]",
        text: "text-white",
        secondary: "text-[#b4b4b4]",
        muted: "text-[#777777]",
        faint: "text-[#555555]",
        hover: "hover:bg-[#181818]",
        input: "bg-[#0b0b0b]",
        bubbleAI: "bg-[#161616] text-[#c0c0c0]",
        bubbleUser: "bg-[#20282b] text-[#d8e0e2]",
        active: "bg-[#202020] text-white",
        preview: "bg-[#111111]",
      }
    : {
        page: "bg-[#f7f8fa] text-[#172033]",
        panel: "bg-white",
        panelSoft: "bg-[#fafbfc]",
        border: "border-[#e5e8ed]",
        borderSoft: "border-[#edf0f3]",
        text: "text-[#172033]",
        secondary: "text-[#56657d]",
        muted: "text-[#8290a5]",
        faint: "text-[#a5afbd]",
        hover: "hover:bg-[#f5f7fa]",
        input: "bg-[#fafbfc]",
        bubbleAI: "bg-[#f3f5f7] text-[#526078]",
        bubbleUser: "bg-[#edf8fa] text-[#455b61]",
        active: "bg-[#f0f2f5] text-[#172033]",
        preview: "bg-[#f1f3f6]",
      };

  /* =======================================================
     LOAD PROJECT
  ======================================================= */

  useEffect(() => {
    if (!projectId) {
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
      } catch (error: unknown) {
        console.error(
          "PROJECT LOAD ERROR:",
          error
        );

        if (mounted) {
          const projectLoadError =
            error && typeof error === "object"
              ? (error as {
                  response?: {
                    data?: { detail?: unknown; message?: unknown };
                  };
                  message?: unknown;
                })
              : undefined;
          const errorMessage = [
            projectLoadError?.response?.data?.detail,
            projectLoadError?.response?.data?.message,
            projectLoadError?.message,
          ].find((value): value is string => typeof value === "string");

          setProjectError(
            errorMessage ||
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

  /* =======================================================
     CLEANUP SSE
  ======================================================= */

  useEffect(() => {
    return () => {
      eventAbortRef.current?.abort();
    };
  }, []);

  /* =======================================================
     AUTO SCROLL CHAT
  ======================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, runEvents]);

  /* =======================================================
     APPLY RUN STATE
  ======================================================= */

  const applyRunState = useCallback(
    (run: OrchestratorRun) => {
      setActiveRun(run);

      const stage = normalizeStage(run.status);

      setRunStage(stage);

      if (run.steps) {
        setRunSteps(run.steps);
      }

      const files = extractGeneratedFiles(run);

      if (files.length > 0) {
        setGeneratedFiles(files);

        const selectedStillExists = files.some(
          (file) =>
            file.path === selectedFilePath
        );

        if (!selectedStillExists) {
          setSelectedFilePath(files[0].path);
        }
      }

      if (stage === "failed") {
        setRunError(
          getPreviewMessage(stage, run)
        );
      }

      if (stage === "completed") {
        setRunError("");
      }
    },
    [selectedFilePath]
  );

  /* =======================================================
     PROCESS EVENT
  ======================================================= */

  const processRunEvent = useCallback(
    (event: OrchestratorRunEvent) => {
      setRunEvents((previous) => {
        const exists = previous.some(
          (item) =>
            item.sequence === event.sequence
        );

        if (exists) {
          return previous;
        }

        return [...previous, event];
      });

      const payload =
        event.payload || {};

      if (
        event.event_type ===
        "run.status_changed"
      ) {
        const target =
          typeof payload.to === "string"
            ? payload.to
            : undefined;

        const stage =
          normalizeStage(target);

        setRunStage(stage);
      }

      if (
        event.event_type ===
        "step.started"
      ) {
        const stepId =
          typeof payload.step_id === "string"
            ? payload.step_id
            : createId("step");

        const name =
          typeof payload.name === "string"
            ? payload.name
            : "processing";

        setRunSteps((previous) => [
          ...previous,
          {
            id: stepId,
            name,
            status: "running",
          },
        ]);
      }

      if (
        event.event_type ===
        "step.completed"
      ) {
        const stepId =
          typeof payload.step_id === "string"
            ? payload.step_id
            : undefined;

        setRunSteps((previous) =>
          previous.map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  status: "completed",
                  details:
                    typeof payload.details ===
                    "object"
                      ? (payload.details as Record<
                          string,
                          unknown
                        >)
                      : {},
                }
              : step
          )
        );
      }

      if (
        event.event_type ===
        "step.failed"
      ) {
        const stepId =
          typeof payload.step_id === "string"
            ? payload.step_id
            : undefined;

        setRunSteps((previous) =>
          previous.map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  status: "failed",
                  error:
                    typeof payload.error ===
                    "string"
                      ? payload.error
                      : undefined,
                }
              : step
          )
        );
      }

      if (
        event.event_type ===
        "run.failed"
      ) {
        const code =
          typeof payload.code === "string"
            ? payload.code
            : "orchestration_error";

        setRunStage("failed");
        setRunError(
          `Generation failed (${code}).`
        );
      }

      if (
        event.event_type ===
        "run.recovered"
      ) {
        const checkpoint =
          typeof payload.checkpoint ===
          "string"
            ? payload.checkpoint
            : undefined;

        setRunStage(
          normalizeStage(checkpoint)
        );
      }
    },
    []
  );

  /* =======================================================
     LOAD PREVIEW
  ======================================================= */

  const loadPreview = useCallback(
    async (runId: string) => {
      try {
        const preview =
          await getOrchestratorPreviewApi(
            runId
          );

        const previewRecord =
          preview && typeof preview === "object"
            ? (preview as Record<string, unknown>)
            : {};

        const html =
          typeof previewRecord.html === "string"
            ? previewRecord.html
            : "";

        if (!html.trim()) {
          throw new Error(
            "The preview service returned no renderable HTML."
          );
        }

        setPreviewError("");
        setPreviewState({
          available: true,
          html,
          warnings: Array.isArray(previewRecord.warnings)
            ? previewRecord.warnings.filter(
                (warning): warning is string => typeof warning === "string"
              )
            : [],
          compiler:
            typeof previewRecord.compiler === "string"
              ? previewRecord.compiler
              : undefined,
          data: preview,
        });
      } catch (error) {
        console.error(
          "PREVIEW LOAD ERROR:",
          error
        );

        setPreviewState({
          available: false,
          html: undefined,
          warnings: [],
          data: null,
        });
        setPreviewError(
          error instanceof Error
            ? error.message
            : "Unable to compile the generated application preview."
        );
      }
    },
    []
  );

  /* =======================================================
     WATCH RUN
  ======================================================= */

  const watchRun = useCallback(
    async (runId: string) => {
      eventAbortRef.current?.abort();

      const controller =
        new AbortController();

      eventAbortRef.current =
        controller;

      try {
        await streamOrchestratorEventsApi({
          runId,
          after: 0,
          signal: controller.signal,

          onEvent: (event) => {
            processRunEvent(event);
          },
        });
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "ORCHESTRATOR STREAM ERROR:",
          error
        );
      }

      if (controller.signal.aborted) {
        return;
      }

      try {
        const finalRun =
          await getOrchestratorRunApi(
            runId
          );

        applyRunState(finalRun);

        const finalStage =
          normalizeStage(
            finalRun.status
          );

        if (
          finalStage === "completed"
        ) {
          await loadPreview(runId);
        }
      } catch (error: unknown) {
        console.error(
          "FINAL RUN LOAD ERROR:",
          error
        );

        const requestError = error as {
          response?: {
            data?: {
              detail?: unknown;
            };
          };
          message?: unknown;
        };

        setRunError(
          (typeof requestError.response?.data?.detail === "string" &&
            requestError.response.data.detail) ||
            (typeof requestError.message === "string" &&
              requestError.message) ||
            "Unable to load final run status."
        );
      } finally {
        setIsSending(false);
      }
    },
    [
      applyRunState,
      loadPreview,
      processRunEvent,
    ]
  );

  /* =======================================================
     SUBMIT PROMPT
  ======================================================= */

  const handleSendPrompt = async () => {
    const cleanPrompt =
      prompt.trim();

    if (
      !cleanPrompt ||
      isSending ||
      !projectId
    ) {
      return;
    }

    eventAbortRef.current?.abort();

    setRunError("");
    setRunEvents([]);
    setRunSteps([]);
    setGeneratedFiles([]);
    setPreviewState({
      available: false,
      html: undefined,
      warnings: [],
      data: null,
    });
    setPreviewError("");

    const userMessage: Message = {
      id: createId("user"),
      role: "user",
      content: cleanPrompt,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setPrompt("");
    setIsSending(true);
    setRunStage("queued");

    try {
      const run =
        await submitOrchestratorRunApi({
          projectId,
          prompt: cleanPrompt,
          quality: "balanced",
        });

      applyRunState(run);

      setMessages((previous) => [
        ...previous,
        {
          id: createId("ai"),
          role: "ai",
          content:
            "Your request has been sent to the ICOGON AI orchestration pipeline. I'll show the generation progress here.",
        },
      ]);

      const currentStage =
        normalizeStage(run.status);

      if (
        currentStage === "completed"
      ) {
        await loadPreview(run.id);
        setIsSending(false);

        setMessages((previous) => [
          ...previous,
          {
            id: createId("ai"),
            role: "ai",
            content:
              getPreviewMessage(
                "completed",
                run
              ),
          },
        ]);

        return;
      }

      if (
        currentStage === "failed" ||
        currentStage === "cancelled"
      ) {
        setIsSending(false);

        setMessages((previous) => [
          ...previous,
          {
            id: createId("ai"),
            role: "ai",
            content:
              getPreviewMessage(
                currentStage,
                run
              ),
          },
        ]);

        return;
      }

      await watchRun(run.id);
    } catch (error: unknown) {
      console.error(
        "ORCHESTRATOR SUBMIT ERROR:",
        error
      );

      const apiError = error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
        message?: string;
      };
      const message =
        apiError.response?.data?.detail ||
        apiError.response?.data?.message ||
        apiError.message ||
        "Unable to start AI generation.";

      setRunError(message);
      setRunStage("failed");
      setIsSending(false);

      setMessages((previous) => [
        ...previous,
        {
          id: createId("ai"),
          role: "ai",
          content: `I couldn't start the generation: ${message}`,
        },
      ]);
    }
  };

  /* =======================================================
     CANCEL RUN
  ======================================================= */

  const handleCancelRun = async () => {
    if (
      !activeRun?.id ||
      !isSending ||
      isCancelling
    ) {
      return;
    }

    try {
      setIsCancelling(true);

      const cancellationResult =
        await cancelOrchestratorRunApi(activeRun.id);

      applyRunState(cancellationResult);

      const cancellationStage = normalizeStage(
        cancellationResult.status
      );

      if (cancellationStage === "cancelled") {
        eventAbortRef.current?.abort();
        setRunStage("cancelled");
        setIsSending(false);
        setMessages((previous) => [
          ...previous,
          {
            id: createId("ai"),
            role: "ai",
            content:
              "The current AI generation has been cancelled.",
          },
        ]);
      } else if (cancellationStage === "completed" || cancellationStage === "failed") {
        // The run reached a terminal state while the cancellation request was in flight.
        eventAbortRef.current?.abort();
        setIsSending(false);
      } else {
        // The backend records a cancellation request and may stop at its next safe checkpoint.
        setRunError(
          "Cancellation requested. Waiting for the current generation step to stop safely..."
        );
      }
    } catch (error: unknown) {
      console.error(
        "CANCEL RUN ERROR:",
        error
      );

      let detail: string | undefined;
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = error.response;
        if (
          typeof response === "object" &&
          response !== null &&
          "data" in response
        ) {
          const data = response.data;
          if (
            typeof data === "object" &&
            data !== null &&
            "detail" in data &&
            typeof data.detail === "string"
          ) {
            detail = data.detail;
          }
        }
      }

      setRunError(
        detail ||
          (error instanceof Error ? error.message : undefined) ||
          "Unable to cancel this run."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  /* =======================================================
     KEYBOARD
  ======================================================= */

  const handlePromptKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void handleSendPrompt();
    }
  };

  /* =======================================================
     REFRESH PREVIEW
  ======================================================= */

  const handleRefreshPreview = async () => {
    if (!activeRun?.id) {
      return;
    }

    setIsRefreshing(true);

    try {
      const run =
        await getOrchestratorRunApi(
          activeRun.id
        );

      applyRunState(run);

      if (
        normalizeStage(run.status) ===
        "completed"
      ) {
        await loadPreview(run.id);
      }
    } catch (error) {
      console.error(
        "REFRESH PREVIEW ERROR:",
        error
      );
      setPreviewError(
        error instanceof Error
          ? error.message
          : "Unable to refresh the generated preview."
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  /* =======================================================
     GENERATED FILES
  ======================================================= */

  const selectedFile = useMemo(
    () =>
      generatedFiles.find(
        (file) =>
          file.path === selectedFilePath
      ),
    [
      generatedFiles,
      selectedFilePath,
    ]
  );

  const generatedCode = useMemo(() => {
    if (selectedFile) {
      return getFileContent(
        selectedFile
      );
    }

    if (generatedFiles.length > 0) {
      return getFileContent(
        generatedFiles[0]
      );
    }

    return `// ICOGON AI
// Generated source will appear here after
// the orchestration pipeline completes.

export default function App() {
  return (
    <main className="min-h-screen">
      <h1>Generating your application...</h1>
    </main>
  );
}`;
  }, [
    generatedFiles,
    selectedFile,
  ]);

  /* =======================================================
     COPY CODE
  ======================================================= */

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        generatedCode
      );
    } catch (error) {
      console.error(
        "Unable to copy code:",
        error
      );
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (projectLoading && projectId) {
    return (
      <div
        className={`
          flex
          h-full
          min-h-full
          items-center
          justify-center
          ${colors.page}
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-cyan-500
              via-blue-500
              to-violet-500
              text-white
              shadow-lg
            "
          >
            <Sparkles size={19} />
          </div>

          <div className="text-center">
            <p
              className={`
                text-sm
                font-semibold
                ${colors.text}
              `}
            >
              Loading workspace
            </p>

            <p
              className={`
                mt-1
                text-xs
                ${colors.muted}
              `}
            >
              Preparing your project...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (!projectId || projectError || !project) {
    return (
      <div
        className={`
          flex
          h-full
          min-h-full
          items-center
          justify-center
          px-5
          ${colors.page}
        `}
      >
        <div
          className={`
            w-full
            max-w-md
            rounded-2xl
            border
            p-7
            text-center
            shadow-sm
            ${colors.panel}
            ${colors.border}
          `}
        >
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-red-500/10
              text-red-500
            "
          >
            !
          </div>

          <h2
            className={`
              mt-4
              text-base
              font-semibold
              ${colors.text}
            `}
          >
            Project unavailable
          </h2>

          <p
            className={`
              mt-2
              text-xs
              leading-5
              ${colors.muted}
            `}
          >
            {!projectId
              ? "Project ID is missing."
              : projectError ||
                "This project could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#181818]
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-black
            "
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     PIPELINE PROGRESS
  ======================================================= */

  const pipelineStages: RunStage[] = [
    "analyzing",
    "designing",
    "planning",
    "generating",
    "reviewing",
    "repairing",
    "verifying",
  ];

  const isRunning =
    isSending &&
    runStage !== "completed" &&
    runStage !== "failed" &&
    runStage !== "cancelled";

  const completedStepCount =
    runSteps.filter(
      (step) =>
        step.status === "completed"
    ).length;

  const totalStepCount =
    runSteps.length;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div
      className={`
        flex
        h-full
        min-h-0
        w-full
        overflow-hidden
        ${colors.page}
        ${
          isFullscreen
            ? "fixed inset-0 z-[9999]"
            : ""
        }
      `}
    >
      {/* Mobile AI-panel backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close AI assistant panel"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
        />
      )}

      {/* ===================================================
          AI SIDEBAR
      =================================================== */}

      <aside
        className={`
          flex
          shrink-0
          flex-col
          overflow-hidden
          border-r
          relative
          z-30
          min-h-0
          transition-[width,transform]
          duration-200
          ease-in-out
          ${colors.panel}
          ${colors.border}
          ${
            sidebarOpen
              ? "w-[340px] max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-[min(340px,88vw)] max-md:translate-x-0 max-md:shadow-2xl"
              : "w-0 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-[min(340px,88vw)] max-md:-translate-x-full"
          }
        `}
      >
        {/* SIDEBAR HEADER */}

        <div
          className={`
            flex
            h-[58px]
            shrink-0
            items-center
            justify-between
            border-b
            px-4
            ${colors.border}
          `}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-cyan-500
                via-blue-500
                to-violet-500
                text-white
                shadow-sm
              "
            >
              <Sparkles size={15} />
            </div>

            <div>
              <p
                className={`
                  text-sm
                  font-semibold
                  ${colors.text}
                `}
              >
                ICOGON AI
              </p>

              <p
                className={`
                  text-[10px]
                  ${colors.muted}
                `}
              >
                Build with AI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close AI panel"
            className={`
              rounded-lg
              p-1.5
              transition
              ${colors.muted}
              ${colors.hover}
            `}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* PROJECT SELECTOR */}

        <div
          className={`
            border-b
            px-4
            py-3
            ${colors.border}
          `}
        >
          <button
            type="button"
            className={`
              flex
              w-full
              items-center
              justify-between
              rounded-xl
              border
              px-3
              py-2.5
              text-left
              transition
              ${colors.border}
              ${colors.hover}
            `}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-cyan-500/10
                  text-cyan-500
                "
              >
                <Folder size={14} />
              </div>

              <div className="min-w-0">
                <p
                  className={`
                    truncate
                    text-xs
                    font-semibold
                    ${colors.text}
                  `}
                >
                  {project.name}
                </p>

                <p
                  className={`
                    mt-0.5
                    truncate
                    text-[10px]
                    ${colors.muted}
                  `}
                >
                  Project workspace
                </p>
              </div>
            </div>

            <ChevronDown
              size={14}
              className={colors.muted}
            />
          </button>
        </div>

        {/* PIPELINE */}

        {isRunning && (
          <div
            className={`
              border-b
              px-4
              py-3
              ${colors.border}
            `}
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className={`
                  text-[10px]
                  font-semibold
                  ${colors.text}
                `}
              >
                AI generation
              </span>

              <span className="text-[9px] text-cyan-500">
                {stageLabel(runStage)}
              </span>
            </div>

            <div className="space-y-1.5">
              {pipelineStages.map(
                (stage) => {
                  const currentIndex =
                    pipelineStages.indexOf(
                      runStage
                    );

                  const stageIndex =
                    pipelineStages.indexOf(
                      stage
                    );

                  const done =
                    currentIndex >= 0 &&
                    stageIndex <
                      currentIndex;

                  const current =
                    stage === runStage;

                  return (
                    <div
                      key={stage}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          ${
                            done
                              ? "bg-emerald-500 text-white"
                              : current
                              ? "bg-cyan-500 text-white"
                              : isDark
                              ? "bg-[#1b1b1b] text-[#555]"
                              : "bg-[#edf0f3] text-[#a5afbd]"
                          }
                        `}
                      >
                        {done ? (
                          <Check size={9} />
                        ) : current ? (
                          <Loader2
                            size={9}
                            className="animate-spin"
                          />
                        ) : (
                          <span className="text-[8px]">
                            {stageIndex + 1}
                          </span>
                        )}
                      </div>

                      <span
                        className={`
                          text-[9px]
                          ${
                            current
                              ? "font-semibold text-cyan-500"
                              : colors.muted
                          }
                        `}
                      >
                        {stageLabel(stage)}
                      </span>
                    </div>
                  );
                }
              )}
            </div>

            {totalStepCount > 0 && (
              <div
                className={`
                  mt-3
                  border-t
                  pt-2
                  text-[9px]
                  ${colors.faint}
                  ${colors.border}
                `}
              >
                {completedStepCount}/
                {totalStepCount} pipeline steps
                completed
              </div>
            )}
          </div>
        )}

        {/* CHAT */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-3
            py-5
          "
        >
          <div className="space-y-5">
            {messages.map(
              (message) => (
                <div
                  key={message.id}
                  className={`
                    flex
                    gap-2.5
                    ${
                      message.role ===
                      "user"
                        ? "justify-end"
                        : ""
                    }
                  `}
                >
                  {message.role ===
                    "ai" && (
                    <div
                      className="
                        mt-0.5
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-cyan-500/10
                        text-cyan-500
                      "
                    >
                      <Sparkles size={12} />
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[270px]
                      rounded-2xl
                      px-3.5
                      py-2.5
                      text-xs
                      leading-5
                      ${
                        message.role ===
                        "user"
                          ? colors.bubbleUser
                          : colors.bubbleAI
                      }
                    `}
                  >
                    {message.content}
                  </div>
                </div>
              )
            )}

            {isRunning && (
              <div className="flex gap-2.5">
                <div
                  className="
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-cyan-500/10
                    text-cyan-500
                  "
                >
                  <Sparkles size={12} />
                </div>

                <div
                  className={`
                    flex
                    items-center
                    gap-1
                    rounded-2xl
                    px-4
                    py-3
                    ${colors.bubbleAI}
                  `}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-40" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-80 [animation-delay:240ms]" />
                </div>
              </div>
            )}

            {runError && (
              <div
                className="
                  flex
                  gap-2
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  p-3
                  text-red-600
                "
              >
                <CircleAlert
                  size={14}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-[10px] leading-4">
                  {runError}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* PROMPT COMPOSER */}

        <div
          className={`
            shrink-0
            border-t
            p-3
            ${colors.border}
          `}
        >
          <div
            className={`
              overflow-hidden
              rounded-2xl
              border
              transition
              focus-within:border-cyan-400
              focus-within:ring-2
              focus-within:ring-cyan-400/10
              ${colors.input}
              ${colors.border}
            `}
          >
            <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(
                  event.target.value
                )
              }
              onKeyDown={
                handlePromptKeyDown
              }
              placeholder={
                isRunning
                  ? "AI is working..."
                  : "Ask ICOGON AI to make a change..."
              }
              rows={3}
              disabled={isRunning}
              className={`
                w-full
                resize-none
                bg-transparent
                px-3.5
                py-3
                text-xs
                leading-5
                outline-none
                ${colors.text}
                ${
                  isDark
                    ? "placeholder:text-[#555]"
                    : "placeholder:text-[#9ca5b1]"
                }
              `}
            />

            <div
              className="
                flex
                items-center
                justify-between
                px-2.5
                pb-2.5
              "
            >
              <button
                type="button"
                disabled
                title="AI tools"
                className={`
                  rounded-lg
                  p-1.5
                  opacity-40
                  ${colors.muted}
                `}
              >
                <WandSparkles size={14} />
              </button>

              {isRunning ? (
                <button
                  type="button"
                  onClick={() =>
                    void handleCancelRun()
                  }
                  disabled={isCancelling}
                  aria-label="Stop generation"
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-500
                    text-white
                    transition
                    hover:bg-red-600
                    disabled:opacity-40
                  "
                >
                  {isCancelling ? (
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                  ) : (
                    <Square
                      size={11}
                      fill="currentColor"
                    />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void handleSendPrompt()
                  }
                  disabled={
                    !prompt.trim()
                  }
                  aria-label="Send prompt"
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#181818]
                    text-white
                    transition
                    hover:bg-black
                    disabled:cursor-not-allowed
                    disabled:opacity-25
                  "
                >
                  <Send size={13} />
                </button>
              )}
            </div>
          </div>

          <p
            className={`
              mt-2
              text-center
              text-[9px]
              ${colors.faint}
            `}
          >
            {isRunning
              ? "ICOGON AI is processing your request"
              : "Enter to send · Shift + Enter for new line"}
          </p>
        </div>
      </aside>

      {/* ===================================================
          MAIN WORKSPACE
      =================================================== */}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* TOP HEADER */}

        <header
          className={`
            flex
            h-[58px]
            shrink-0
            items-center
            justify-between
            border-b
            px-3
            sm:px-4
            ${colors.panel}
            ${colors.border}
          `}
        >
          <div className="flex min-w-0 items-center gap-2">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                aria-label="Open AI panel"
                className={`
                  rounded-lg
                  p-1.5
                  ${colors.muted}
                  ${colors.hover}
                `}
              >
                <PanelLeftOpen size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className={`
                flex
                items-center
                gap-1.5
                rounded-lg
                px-2
                py-1.5
                text-xs
                font-medium
                transition
                ${colors.muted}
                ${colors.hover}
              `}
            >
              <ArrowLeft size={14} />

              <span className="hidden sm:block">
                Dashboard
              </span>
            </button>

            <div
              className={`
                mx-1
                h-4
                w-px
                ${
                  isDark
                    ? "bg-[#292929]"
                    : "bg-[#dedede]"
                }
              `}
            />

            <div className="min-w-0">
              <p
                className={`
                  max-w-[230px]
                  truncate
                  text-xs
                  font-semibold
                  ${colors.text}
                `}
                title={project.name}
              >
                {project.name}
              </p>

              <p
                className={`
                  hidden
                  text-[9px]
                  sm:block
                  ${colors.muted}
                `}
              >
                ICOGON AI Builder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div
              className={`
                hidden
                items-center
                rounded-xl
                border
                p-0.5
                md:flex
                ${colors.border}
                ${
                  isDark
                    ? "bg-[#111111]"
                    : "bg-[#f5f6f8]"
                }
              `}
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
                  rounded-lg
                  px-3
                  py-1.5
                  text-[11px]
                  font-medium
                  transition
                  ${
                    activeTab ===
                    "preview"
                      ? colors.active
                      : colors.muted
                  }
                `}
              >
                <Eye size={13} />
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
                  rounded-lg
                  px-3
                  py-1.5
                  text-[11px]
                  font-medium
                  transition
                  ${
                    activeTab === "code"
                      ? colors.active
                      : colors.muted
                  }
                `}
              >
                <Code2 size={13} />
                Code
              </button>
            </div>

            <button
              type="button"
              disabled
              title="Runtime execution is not connected yet"
              className={`
                hidden
                items-center
                gap-1.5
                rounded-xl
                border
                px-3
                py-1.5
                text-[11px]
                font-medium
                opacity-40
                sm:flex
                ${colors.border}
                ${colors.muted}
              `}
            >
              <Rocket size={12} />
              Run
            </button>

            <button
              type="button"
              disabled
              title="Publishing is not connected yet"
              className="
                flex
                cursor-not-allowed
                items-center
                gap-1.5
                rounded-xl
                bg-[#181818]
                px-3
                py-1.5
                text-[11px]
                font-semibold
                text-white
                opacity-35
              "
            >
              <Rocket size={12} />

              <span className="hidden sm:inline">
                Publish
              </span>
            </button>

            <button
              type="button"
              aria-label="More options"
              className={`
                rounded-lg
                p-1.5
                ${colors.muted}
                ${colors.hover}
              `}
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        </header>

        {/* MOBILE TABS */}

        <div
          className={`
            flex
            shrink-0
            border-b
            px-2
            py-1.5
            md:hidden
            ${colors.panel}
            ${colors.border}
          `}
        >
          <button
            type="button"
            onClick={() =>
              setActiveTab("preview")
            }
            className={`
              flex
              flex-1
              items-center
              justify-center
              gap-1.5
              rounded-lg
              px-3
              py-1.5
              text-[11px]
              font-medium
              ${
                activeTab ===
                "preview"
                  ? colors.active
                  : colors.muted
              }
            `}
          >
            <Eye size={13} />
            Preview
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("code")
            }
            className={`
              flex
              flex-1
              items-center
              justify-center
              gap-1.5
              rounded-lg
              px-3
              py-1.5
              text-[11px]
              font-medium
              ${
                activeTab === "code"
                  ? colors.active
                  : colors.muted
              }
            `}
          >
            <Code2 size={13} />
            Code
          </button>
        </div>

        {/* WORKSPACE */}

        <div
          className={`
            relative
            min-h-0
            flex-1
            overflow-hidden
            ${colors.preview}
          `}
        >
          {activeTab === "preview" ? (
            <div className="h-full overflow-auto p-3 sm:p-5">
              <div
                className={`
                  mx-auto
                  flex
                  h-full
                  min-h-full
                  max-w-[1500px]
                  flex-col
                  overflow-hidden
                  border
                  bg-white
                  shadow-[0_15px_50px_rgba(15,23,42,0.08)]
                  ${
                    isFullscreen
                      ? "rounded-none"
                      : "rounded-2xl"
                  }
                  ${
                    isDark
                      ? "border-[#303030]"
                      : "border-[#e1e5ea]"
                  }
                `}
              >
                {/* PREVIEW TOOLBAR */}

                <div
                  className="
                    flex
                    h-11
                    shrink-0
                    items-center
                    justify-between
                    border-b
                    border-slate-200
                    bg-white
                    px-3
                  "
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-300" />
                      <span className="h-2 w-2 rounded-full bg-yellow-300" />
                      <span className="h-2 w-2 rounded-full bg-green-300" />
                    </div>

                    <div
                      className="
                        ml-2
                        hidden
                        h-6
                        min-w-[220px]
                        items-center
                        rounded-md
                        bg-slate-50
                        px-3
                        text-[9px]
                        text-slate-400
                        sm:flex
                      "
                    >
                      {previewState.available
                        ? "ICOGON AI Preview"
                        : "Preview will appear after generation"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        void handleRefreshPreview()
                      }
                      disabled={
                        !activeRun ||
                        runStage !==
                          "completed" ||
                        isRefreshing
                      }
                      aria-label="Refresh preview"
                      className="
                        rounded-lg
                        p-1.5
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-slate-800
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                      "
                    >
                      <RefreshCw
                        size={13}
                        className={
                          isRefreshing
                            ? "animate-spin"
                            : ""
                        }
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setIsFullscreen(
                          (value) =>
                            !value
                        )
                      }
                      aria-label={
                        isFullscreen
                          ? "Exit fullscreen"
                          : "Enter fullscreen"
                      }
                      className="
                        rounded-lg
                        p-1.5
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-slate-800
                      "
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>

                {/* REAL BACKEND-COMPILED APPLICATION PREVIEW */}

                {previewState.available && previewState.html ? (
                  <div className="flex h-full min-h-0 flex-col bg-white">
                    {previewState.warnings && previewState.warnings.length > 0 && (
                      <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        <p className="font-semibold">
                          Preview warnings ({previewState.warnings.length})
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5">
                          {previewState.warnings.map((warning, index) => (
                            <li key={`${index}-${warning}`}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <iframe
                      key={`${activeRun?.id ?? project.id}-${previewState.html.length}`}
                      title={`${project.name} generated application preview`}
                      srcDoc={createSandboxedPreviewDocument(previewState.html)}
                      sandbox="allow-scripts allow-forms allow-modals"
                      referrerPolicy="no-referrer"
                      className="min-h-0 w-full flex-1 border-0 bg-white"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[420px] h-full items-center justify-center bg-white px-6">
                    <div className="max-w-md text-center">
                      <div
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500 text-white shadow-lg"
                      >
                        {isRunning ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : runStage === "failed" || previewError ? (
                          <CircleAlert size={24} />
                        ) : runStage === "cancelled" ? (
                          <X size={24} />
                        ) : (
                          <Sparkles size={24} />
                        )}
                      </div>

                      <h2 className="mt-5 text-lg font-semibold text-slate-900">
                        {previewError ? "Preview unavailable" : stageLabel(runStage)}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {previewError
                          ? previewError
                          : runStage === "idle"
                            ? "Describe what you want to build using the AI composer on the left."
                            : runStage === "failed"
                              ? runError || "The generation pipeline encountered an error."
                              : runStage === "cancelled"
                                ? "Start another request whenever you're ready."
                                : runStage === "completed"
                                  ? "The build completed, but no preview document was returned. Try refreshing the preview."
                                  : "ICOGON AI is processing your request. The live pipeline status is shown in the left panel."}
                      </p>

                      {previewError && activeRun?.id && (
                        <button
                          type="button"
                          onClick={() => void handleRefreshPreview()}
                          disabled={isRefreshing}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                        >
                          <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                          Retry preview
                        </button>
                      )}

                      {isRunning && (
                        <div className="mt-6">
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* =================================================
               CODE
            ================================================= */

            <div className="h-full overflow-auto p-3 sm:p-5">
              <div
                className={`
                  mx-auto
                  max-w-[1500px]
                  overflow-hidden
                  rounded-2xl
                  border
                  ${colors.panel}
                  ${colors.border}
                `}
              >
                <div
                  className={`
                    flex
                    h-12
                    items-center
                    justify-between
                    border-b
                    px-4
                    ${colors.border}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <FileCode2
                      size={14}
                      className="text-cyan-500"
                    />

                    <span
                      className={`
                        text-xs
                        font-medium
                        ${colors.text}
                      `}
                    >
                      {selectedFilePath}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleCopyCode
                    }
                    className={`
                      flex
                      items-center
                      gap-1.5
                      rounded-lg
                      px-2.5
                      py-1.5
                      text-[10px]
                      transition
                      ${colors.muted}
                      ${colors.hover}
                    `}
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>

                <div className="flex min-h-full flex-col sm:flex-row">
                  <div
                    className={`
                      max-h-32
                      w-full
                      shrink-0
                      overflow-y-auto
                      border-b
                      p-3
                      sm:max-h-none
                      sm:w-56
                      sm:border-b-0
                      sm:border-r
                      ${colors.border}
                    `}
                  >
                    <p
                      className={`
                        mb-3
                        px-2
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-wider
                        ${colors.faint}
                      `}
                    >
                      Files
                    </p>

                    <div className="space-y-1">
                      {generatedFiles.length >
                      0 ? (
                        generatedFiles.map(
                          (file) => {
                            const active =
                              file.path ===
                              selectedFilePath;

                            return (
                              <button
                                type="button"
                                key={
                                  file.path
                                }
                                onClick={() =>
                                  setSelectedFilePath(
                                    file.path
                                  )
                                }
                                className={`
                                  flex
                                  w-full
                                  items-center
                                  gap-2
                                  rounded-lg
                                  px-2.5
                                  py-2
                                  text-left
                                  text-[10px]
                                  transition
                                  ${
                                    active
                                      ? colors.active
                                      : colors.muted
                                  }
                                  ${
                                    !active
                                      ? colors.hover
                                      : ""
                                  }
                                `}
                              >
                                <FileCode2
                                  size={12}
                                />

                                <span className="truncate">
                                  {
                                    file.path
                                  }
                                </span>
                              </button>
                            );
                          }
                        )
                      ) : (
                        <>
                          {[
                            "App.tsx",
                            "main.tsx",
                            "index.css",
                          ].map(
                            (file) => (
                              <div
                                key={file}
                                className={`
                                  flex
                                  items-center
                                  gap-2
                                  rounded-lg
                                  px-2.5
                                  py-2
                                  text-[10px]
                                  ${colors.muted}
                                `}
                              >
                                <FileCode2
                                  size={12}
                                />
                                {file}
                              </div>
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <pre
                    className={`
                      min-w-0
                      flex-1
                      overflow-auto
                      p-5
                      font-mono
                      text-[11px]
                      leading-6
                      ${colors.secondary}
                    `}
                  >
                    {generatedCode}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STATUS BAR */}

        <footer
          className={`
            flex
            h-8
            shrink-0
            items-center
            justify-between
            border-t
            px-3
            text-[9px]
            ${colors.panel}
            ${colors.border}
            ${colors.muted}
          `}
        >
          <div className="flex items-center gap-2">
            <span
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${
                  runStage ===
                  "failed"
                    ? "bg-red-500"
                    : runStage ===
                      "cancelled"
                    ? "bg-amber-500"
                    : isRunning
                    ? "animate-pulse bg-cyan-500"
                    : "bg-emerald-500"
                }
              `}
            />

            <span>
              {stageLabel(runStage)}
            </span>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span>
              {activeRun
                ? `Run ${activeRun.id.slice(
                    0,
                    8
                  )}`
                : "No active run"}
            </span>

            <span>
              {generatedFiles.length >
              0
                ? `${generatedFiles.length} files`
                : project.name}
            </span>

            {runEvents.length > 0 && (
              <span>
                {runEvents.length} events
              </span>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
};

export default BuilderWorkspacePage;