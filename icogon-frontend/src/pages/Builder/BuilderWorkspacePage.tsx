import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  cancelOrchestratorRunApi,
  getOrchestratorPreviewApi,
  getOrchestratorRunApi,
  getProjectApi,
  streamOrchestratorEventsApi,
  submitOrchestratorRunApi,
  type OrchestratorRun,
  type OrchestratorRunEvent,
  type OrchestratorRunStep,
  type ProjectResponse,
} from "../../api/projectApi";
import {
  type ChatMessage,
  type DeviceMode,
  type GeneratedFile,
  type PreviewState,
  type RunStage,
  type WorkspaceTab,
  createId,
  extractGeneratedFiles,
  normalizeStage,
} from "./types";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { WorkspaceSidebar } from "./components/WorkspaceSidebar";
import WorkspaceNavigation from "./components/WorkspaceNavigation";
import WorkspaceDeveloperPanel from "./components/WorkspaceDeveloperPanel";
import { WorkspacePreview } from "./components/WorkspacePreview";
import { WorkspaceCodeEditor } from "./components/WorkspaceCodeEditor";
import { WorkspaceStatusBar } from "./components/WorkspaceStatusBar";
import { Loader2, PanelBottom } from "lucide-react";
import { WorkspaceLayout, type WorkspaceLayoutControls } from "./components/WorkspaceLayout";

export const BuilderWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();

  // Project state
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState("");

  // Workspace UI state
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("preview");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [chatOpen, setChatOpen] = useState(true);
  const layoutControlsRef = useRef<WorkspaceLayoutControls | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [prompt, setPrompt] = useState("");

  // Orchestration & Run state
  const [activeRun, setActiveRun] = useState<OrchestratorRun | null>(null);
  const [runStage, setRunStage] = useState<RunStage>("idle");
  const [runError, setRunError] = useState("");
  const [runEvents, setRunEvents] = useState<OrchestratorRunEvent[]>([]);
  const [runSteps, setRunSteps] = useState<OrchestratorRunStep[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState("src/App.tsx");
  const [previewState, setPreviewState] = useState<PreviewState>({
    available: false,
    data: null,
  });
  const [isSending, setIsSending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const eventAbortRef = useRef<AbortController | null>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Welcome to the ICOGON AI Builder workspace. Tell me what application, component, or features you want to create or edit.",
    },
  ]);

  // Load Project on mount
  useEffect(() => {
    let mounted = true;
    eventAbortRef.current?.abort();

    if (!projectId) {
      // A missing projectId is handled by the render path below; avoid
      // synchronously triggering state updates during the effect body.
      return () => {
        mounted = false;
      };
    }

    const load = async () => {
      // Yield before resetting state; effect bodies should not update state synchronously.
      await Promise.resolve();
      if (!mounted) return;

      setProjectLoading(true);
      setProjectError("");
      setProject(null);
      setActiveRun(null);
      setRunStage("idle");
      setRunError("");
      setRunEvents([]);
      setRunSteps([]);
      setGeneratedFiles([]);
      setSelectedFilePath("src/App.tsx");
      setPreviewState({ available: false, data: null });
      setMessages([
        {
          id: "welcome",
          role: "ai",
          content:
            "Welcome to the ICOGON AI Builder workspace. Tell me what application, component, or features you want to create or edit.",
        },
      ]);

      try {
        const data = await getProjectApi(projectId);
        if (mounted) {
          setProject(data);
          if (data.prompt) {
            setMessages((prev) => [
              ...prev,
              {
                id: createId("init-prompt"),
                role: "user",
                content: data.prompt || "",
              },
            ]);
          }
        }
      } catch (err: unknown) {
        console.error("PROJECT LOAD ERROR:", err);
        if (mounted) {
          setProjectError(
            (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail ||
              (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
              (err as { message?: string }).message ||
              "Unable to load project."
          );
        }
      } finally {
        if (mounted) setProjectLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      eventAbortRef.current?.abort();
    };
  }, [projectId]);

  // Apply Run State
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
        // Apply the run's file operations to the single workspace file store.
        // "delete" and "remove" are treated as removals; other operations
        // update or create the corresponding path.
        setGeneratedFiles((previous) => {
          const next = new Map(previous.map((file) => [file.path, file]));

          for (const file of files) {
            const operation = (file.operation || "upsert").toLowerCase();
            if (operation === "delete" || operation === "remove") {
              next.delete(file.path);
              continue;
            }

            next.set(file.path, {
              ...next.get(file.path),
              ...file,
            });
          }

          return Array.from(next.values());
        });

        setSelectedFilePath((current) => {
          const removedCurrent = files.some(
            (file) =>
              file.path === current &&
              ["delete", "remove"].includes((file.operation || "").toLowerCase()),
          );
          if (!removedCurrent) return current;
          const replacement = files.find(
            (file) => !["delete", "remove"].includes((file.operation || "").toLowerCase()),
          );
          if (replacement) return replacement.path;

          const remainingPrevious = generatedFiles.find(
            (file) =>
              !files.some(
                (change) =>
                  change.path === file.path &&
                  ["delete", "remove"].includes((change.operation || "").toLowerCase()),
              ),
          );
          return remainingPrevious?.path || "";
        });
      }

      if (stage === "failed" && run.failure) {
        const failureMsg =
          typeof run.failure === "object" && "message" in run.failure
            ? String((run.failure as { message: unknown }).message)
            : "Generation failed.";
        setRunError(failureMsg);
      } else if (stage === "completed") {
        setRunError("");
      }
    },
    [generatedFiles]
  );

  // Fetch sandbox preview
  const loadPreview = useCallback(async (runId: string) => {
    try {
      const preview = await getOrchestratorPreviewApi(runId);
      const html =
        typeof preview === "object" &&
        preview !== null &&
        "html" in preview &&
        typeof preview.html === "string"
          ? preview.html
          : undefined;

      setPreviewState({
        available: Boolean(html?.trim()),
        data: preview,
        html,
        warnings:
          typeof preview === "object" && preview !== null && "warnings" in preview && Array.isArray(preview.warnings)
            ? (preview.warnings as string[])
            : undefined,
      });
    } catch (err) {
      console.error("PREVIEW LOAD ERROR:", err);
      // Keep the last successful preview visible if refreshing a newer
      // preview fails. The run error is reported separately by the caller.
    }
  }, []);

  // Process SSE events
  const processRunEvent = useCallback((event: OrchestratorRunEvent) => {
    setRunEvents((prev) => {
      if (prev.some((e) => e.sequence === event.sequence)) return prev;
      return [...prev, event];
    });

    const payload = event.payload || {};

    if (event.event_type === "run.status_changed") {
      const target = typeof payload.to === "string" ? payload.to : undefined;
      setRunStage(normalizeStage(target));
    } else if (event.event_type === "step.started") {
      const stepId = typeof payload.step_id === "string" ? payload.step_id : createId("step");
      const name = typeof payload.name === "string" ? payload.name : "processing";
      setRunSteps((prev) => [...prev, { id: stepId, name, status: "running" }]);
    } else if (event.event_type === "step.completed") {
      const stepId = typeof payload.step_id === "string" ? payload.step_id : undefined;
      setRunSteps((prev) =>
        prev.map((step) =>
          step.id === stepId
            ? {
                ...step,
                status: "completed",
                details: typeof payload.details === "object" ? (payload.details as Record<string, unknown>) : {},
              }
            : step
        )
      );
    } else if (event.event_type === "step.failed") {
      const stepId = typeof payload.step_id === "string" ? payload.step_id : undefined;
      setRunSteps((prev) =>
        prev.map((step) =>
          step.id === stepId
            ? {
                ...step,
                status: "failed",
                error: typeof payload.error === "string" ? payload.error : undefined,
              }
            : step
        )
      );
    } else if (event.event_type === "run.failed") {
      const code = typeof payload.code === "string" ? payload.code : "error";
      setRunStage("failed");
      setRunError(`Generation failed (${code}).`);
    }
  }, []);

  // Watch Run via SSE
  const watchRun = useCallback(
    async (runId: string) => {
      eventAbortRef.current?.abort();
      const controller = new AbortController();
      eventAbortRef.current = controller;

      try {
        await streamOrchestratorEventsApi({
          runId,
          after: 0,
          signal: controller.signal,
          onEvent: processRunEvent,
        });
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== "AbortError") {
          console.error("STREAM ERROR:", err);
        }
      }

      if (controller.signal.aborted) return;

      try {
        const finalRun = await getOrchestratorRunApi(runId);
        applyRunState(finalRun);
        const finalStage = normalizeStage(finalRun.status);
        if (finalStage === "completed") {
          await loadPreview(runId);
        }
      } catch (err: unknown) {
        console.error("FINAL RUN LOAD ERROR:", err);
        setRunError((err as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail || (err as { message?: string }).message || "Unable to load final run status.");
      } finally {
        setIsSending(false);
      }
    },
    [applyRunState, loadPreview, processRunEvent]
  );

  // Send user prompt
  const handleSendPrompt = async () => {
    const clean = prompt.trim();
    if (!clean || isSending || !projectId) return;

    eventAbortRef.current?.abort();
    setRunError("");
    setRunEvents([]);
    setRunSteps([]);
    // Keep the last successful files and preview visible while this run works.
    // The new run replaces/updates them only when it returns file changes.

    const userMsg: ChatMessage = {
      id: createId("user"),
      role: "user",
      content: clean,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setIsSending(true);
    setRunStage("queued");

    try {
      const run = await submitOrchestratorRunApi({
        projectId,
        prompt: clean,
        quality: "balanced",
      });

      applyRunState(run);

      setMessages((prev) => [
        ...prev,
        {
          id: createId("ai"),
          role: "ai",
          content: "I've started building your application changes. Tracking progress in real time...",
        },
      ]);

      const currentStage = normalizeStage(run.status);
      if (currentStage === "completed") {
        await loadPreview(run.id);
        setIsSending(false);
        setMessages((prev) => [
          ...prev,
          {
            id: createId("ai-done"),
            role: "ai",
            content: "The build completed. The preview will update when compiled HTML is available.",
          },
        ]);
        return;
      }

      if (currentStage === "failed" || currentStage === "cancelled") {
        setIsSending(false);
        return;
      }

      await watchRun(run.id);
    } catch (err: unknown) {
      console.error("SUBMIT RUN ERROR:", err);
      const msg = (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail || (err as { message?: string }).message || "Unable to start AI generation.";
      setRunError(msg);
      setRunStage("failed");
      setIsSending(false);
      setMessages((prev) => [
        ...prev,
        {
          id: createId("ai-err"),
          role: "ai",
          content: `Could not proceed: ${msg}`,
        },
      ]);
    }
  };

  // Cancel running generation
  const handleCancelRun = async () => {
    if (!activeRun?.id || !isSending || isCancelling) return;
    try {
      setIsCancelling(true);
      eventAbortRef.current?.abort();
      const cancelled = await cancelOrchestratorRunApi(activeRun.id);
      applyRunState(cancelled);
      setRunStage("cancelled");
      setIsSending(false);
      setMessages((prev) => [
        ...prev,
        {
          id: createId("ai-cancel"),
          role: "ai",
          content: "Generation was cancelled.",
        },
      ]);
    } catch (err: unknown) {
      console.error("CANCEL ERROR:", err);
      setRunError((err as { message?: string }).message || "Could not cancel generation.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Refresh sandbox preview
  const handleRefreshPreview = async () => {
    if (!activeRun?.id) return;
    setIsRefreshing(true);
    try {
      const run = await getOrchestratorRunApi(activeRun.id);
      applyRunState(run);
      if (normalizeStage(run.status) === "completed") {
        await loadPreview(run.id);
      }
    } catch (err) {
      console.error("REFRESH ERROR:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectFile = (path: string) => {
    setSelectedFilePath(path);
    setActiveTab("code");
  };

  const displayedProjectError = projectError || (!projectId ? "Project ID is missing." : "");

  if (displayedProjectError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090a0f] text-slate-300 p-4">
        <div className="max-w-md text-center rounded-2xl border border-rose-900/50 bg-[#12141f] p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-rose-400">Project Not Found</h2>
          <p className="mt-2 text-xs text-slate-400">{displayedProjectError}</p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (projectLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090a0f] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-indigo-400" />
          <p className="text-xs font-medium tracking-wide text-slate-400">Loading ICOGON Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen w-full overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-[9999]" : ""
      }`}
    >
      <WorkspaceLayout
        defaultNavigationOpen={true}
        defaultChatOpen={true}
        defaultDeveloperOpen={false}
        navigation={
          <WorkspaceNavigation
            projectName={project?.name || "Current project"}
            activePath={location.pathname}
            onNavigate={navigate}
          />
        }
        chat={
          <WorkspaceSidebar
            sidebarOpen={chatOpen}
            setSidebarOpen={(open: boolean) =>
              layoutControlsRef.current?.setChatOpen(open)
            }
            messages={messages}
            prompt={prompt}
            setPrompt={setPrompt}
            onSendPrompt={handleSendPrompt}
            onCancelRun={handleCancelRun}
            isRunning={isSending}
            isCancelling={isCancelling}
            runStage={runStage}
            runSteps={runSteps}
            runError={runError}
            generatedFiles={generatedFiles}
            onSelectFile={handleSelectFile}
          />
        }
        onLayoutChange={(layout) => setChatOpen(layout.chatOpen)}
        topbar={(controls) => {
          layoutControlsRef.current = controls;
          return (
            <div className="flex min-w-0 items-center gap-2 border-b border-[#1f222e] bg-[#0c0d12] pr-2">
              <div className="min-w-0 flex-1">
                <WorkspaceHeader
                  project={project}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  deviceMode={deviceMode}
                  setDeviceMode={setDeviceMode}
                  runStage={runStage}
                  isRunning={isSending}
                  isFullscreen={isFullscreen}
                  setIsFullscreen={setIsFullscreen}
                  isRefreshing={isRefreshing}
                  onRefreshPreview={handleRefreshPreview}
                  onTriggerRun={handleSendPrompt}
                  fileCount={generatedFiles.length}
                  onToggleNavigation={controls.toggleNavigation}
                  navigationOpen={controls.navigationOpen}
                  onToggleChat={controls.toggleChat}
                  chatOpen={controls.chatOpen}
                />
              </div>
              <button
                type="button"
                onClick={controls.toggleDeveloper}
                aria-pressed={controls.developerOpen}
                title={controls.developerOpen ? "Hide developer workspace" : "Show developer workspace"}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition ${
                  controls.developerOpen
                    ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                    : "border-[#232736] bg-[#141620] text-slate-400 hover:bg-[#1a1d2c] hover:text-white"
                }`}
              >
                <PanelBottom size={14} />
                <span className="hidden md:inline">Developer</span>
              </button>
            </div>
          );
        }}
        main={
          activeTab === "preview" ? (
            <WorkspacePreview
              project={project}
              previewState={previewState}
              deviceMode={deviceMode}
              setDeviceMode={setDeviceMode}
              isRefreshing={isRefreshing}
              onRefreshPreview={handleRefreshPreview}
              isRunning={isSending}
              files={generatedFiles}
              onQuickPrompt={(text: string) => {
                setPrompt(text);
                layoutControlsRef.current?.setChatOpen(true);
              }}
            />
          ) : (
            <WorkspaceCodeEditor
              files={generatedFiles}
              selectedFilePath={selectedFilePath}
              onSelectFile={setSelectedFilePath}
            />
          )
        }
        developer={
          <WorkspaceDeveloperPanel
            files={
              generatedFiles.length > 0 ? (
                <div className="h-full overflow-auto bg-[#0c0e14] p-2 text-slate-300">
                  {generatedFiles.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => handleSelectFile(file.path)}
                      className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition ${
                        selectedFilePath === file.path
                          ? "bg-[#252b3b] text-white"
                          : "text-slate-400 hover:bg-[#1b202c] hover:text-slate-200"
                      }`}
                    >
                      <span className="truncate">{file.path}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  Generated files will appear here after the first build.
                </div>
              )
            }
            defaultTab="files"
            onClose={() => layoutControlsRef.current?.setDeveloperOpen(false)}
            onTabChange={() => {
              // File selection is handled by the file list; the main canvas
              // remains the single place where the code editor is rendered.
            }}
          />
        }
        statusbar={
          <WorkspaceStatusBar
            runStage={runStage}
            isRunning={isSending}
            activeRun={activeRun}
            fileCount={generatedFiles.length}
            eventCount={runEvents.length}
          />
        }
      />
    </div>
  );
};

export default BuilderWorkspacePage;