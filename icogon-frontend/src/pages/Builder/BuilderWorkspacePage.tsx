import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, PanelLeftOpen } from "lucide-react";
import {
  cancelOrchestratorRunApi,
  getOrchestratorPreviewApi,
  getOrchestratorRunApi,
  getProjectApi,
  submitOrchestratorRunApi,
  type OrchestratorRun,
  type ProjectResponse,
} from "../../api/projectApi";
import {
  createId, extractGeneratedFiles, isTerminalRunStage, normalizeStage,
  type ChatMessage, type WorkspaceRunCheckpoint, type PendingRunSubmission,
} from "./types";
import { useAuthStore } from "../../store/authStore";
import { builderStore, useBuilderStore } from "../../store/builderStore";
import { useWorkspacePersistence } from "../../hooks/builder/useWorkspacePersistence";
import {
  inspectWorkspaceRun,
  recoverKnownRun,
  retryUnconfirmedSubmission,
  trackRecoveredRun,
  type RecoveredRunState,
} from "../../hooks/builder/useRunRecovery";
import { WorkspaceHeader } from "./components/WorkspaceHeader";

interface RunRecoveryOptions {
  userId?: string;
  projectId?: string;
  onTerminalRun: (run: OrchestratorRun) => void | Promise<void>;
}

function useRunRecovery({ userId, projectId, onTerminalRun }: RunRecoveryOptions) {
  const recovery = useBuilderStore(state => state.recovery);
  // Only a different run/submission should restart tracking. The checkpoint
  // itself changes after every event, so depending on its object identity
  // would cancel and restart SSE on each progress update.
  const recoveryIdentity = recovery?.kind === "tracking"
    ? `tracking:${recovery.runId}`
    : recovery?.kind === "submitting"
      ? `submitting:${recovery.idempotencyKey}`
      : "none";
  const [status, setStatus] = useState<"idle" | "connecting" | "tracking" | "error">("idle");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const terminalHandledRef = useRef("");

  const applyRecoveredState = useCallback((state: RecoveredRunState) => {
    if (!userId || !projectId) return;
    const scope = { userId, projectId };
    const current = builderStore.getState().recovery;
    // A slow poll or SSE callback must never rewind a newer checkpoint,
    // resurrect a finished run, or replace another run's state.
    if (current?.kind !== "tracking" || current.runId !== state.checkpoint.runId ||
        current.lastEventSequence > state.checkpoint.lastEventSequence) return;
    builderStore.getState().setRecovery(state.checkpoint, scope);
    builderStore.getState().updateRuntime({
      activeRunId: state.checkpoint.runId,
      runStage: state.checkpoint.stage,
      runSteps: state.checkpoint.runSteps,
      runEvents: state.checkpoint.runEvents,
      runError: state.checkpoint.runError,
      isSending: !state.terminal,
    }, scope);
  }, [userId, projectId]);

  const track = useCallback(async (checkpoint: WorkspaceRunCheckpoint, signal?: AbortSignal) => {
    if (!userId || !projectId) return;
    const scope = { userId, projectId };
    setStatus("connecting");
    setError("");
    try {
      const state = await trackRecoveredRun({
        scope,
        checkpoint,
        signal,
        onProgress: applyRecoveredState,
      });
      applyRecoveredState(state);
      setStatus("tracking");
      if (state.terminal && terminalHandledRef.current !== state.run.id) {
        terminalHandledRef.current = state.run.id;
        await onTerminalRun(state.run);
      }
    } catch (caught) {
      if (!signal?.aborted) {
        setStatus("error");
        setError(getErrorMessage(caught, "Generation tracking was interrupted."));
      }
    }
  }, [userId, projectId, applyRecoveredState, onTerminalRun]);

  // A fetch SSE stream can be blocked or silently interrupted by proxies,
  // browser extensions, or a network change. Independently reconcile the
  // authoritative run + missing events so an executing worker cannot leave
  // the workspace visually stuck on the original "queued" event.
  // This never submits another run; it only reads an existing run ID.
  useEffect(() => {
    if (!userId || !projectId || !recoveryIdentity.startsWith("tracking:")) return;
    const runId = recoveryIdentity.slice("tracking:".length);
    const controller = new AbortController();
    const scope = { userId, projectId };
    let inFlight = false;

    const reconcile = async () => {
      if (inFlight || controller.signal.aborted) return;
      const current = builderStore.getState().recovery;
      if (current?.kind !== "tracking" || current.runId !== runId) return;
      // A completed run with a preview error remains available for manual
      // retry, but needs no repeated background terminal reconciliation.
      if (terminalHandledRef.current === runId && current.stage === "completed") return;
      inFlight = true;
      try {
        const state = await recoverKnownRun({
          scope, checkpoint: current, signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const latest = builderStore.getState().recovery;
        if (latest?.kind !== "tracking" || latest.runId !== runId ||
            latest.lastEventSequence > state.checkpoint.lastEventSequence) return;
        applyRecoveredState(state);
        setError("");
        setStatus("tracking");
        if (state.terminal && terminalHandledRef.current !== runId) {
          terminalHandledRef.current = runId;
          // Stop the parallel SSE reader before applying terminal state.
          abortRef.current?.abort();
          await onTerminalRun(state.run);
        }
      } catch (caught) {
        if (!controller.signal.aborted) {
          // Keep polling: a transient network failure is not a failed run.
          setError(getErrorMessage(caught, "Unable to check generation status."));
          setStatus("error");
        }
      } finally {
        inFlight = false;
      }
    };

    // The normal SSE connection remains primary; polling is a safety net.
    const timer = setInterval(() => { void reconcile(); }, 4_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [userId, projectId, recoveryIdentity, applyRecoveredState, onTerminalRun]);

  const reconnect = useCallback(() => {
    const checkpoint = builderStore.getState().recovery;
    if (checkpoint?.kind !== "tracking" || !userId || !projectId) return;
    // A completed run with a broken preview can be deliberately retried.
    if (checkpoint.stage === "completed" && terminalHandledRef.current === checkpoint.runId) {
      terminalHandledRef.current = "";
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    void track(checkpoint, controller.signal);
  }, [track, userId, projectId]);

  const retrySubmission = useCallback(async () => {
    const checkpoint = builderStore.getState().recovery;
    if (checkpoint?.kind !== "submitting" || !userId || !projectId) return;
    const scope = { userId, projectId };
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("connecting");
    setError("");
    try {
      const state = await retryUnconfirmedSubmission({ scope, submission: checkpoint, confirmRetry: true, signal: controller.signal });
      applyRecoveredState(state);
      await track(state.checkpoint, controller.signal);
    } catch (caught) {
      if (!controller.signal.aborted) {
        setStatus("error");
        setError(getErrorMessage(caught, "Unable to retry the submission."));
      }
    }
  }, [track, applyRecoveredState, userId, projectId]);

  useEffect(() => {
    if (!userId || !projectId) {
      queueMicrotask(() => {
        setStatus("idle");
        setError("");
      });
      return;
    }
    const scope = { userId, projectId };
    // Read the latest checkpoint only once when its identity changes.
    // Progress writes must not themselves restart this effect.
    const initialRecovery = builderStore.getState().recovery;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    void inspectWorkspaceRun({ scope, recovery: initialRecovery, signal: controller.signal }).then(async inspection => {
      if (controller.signal.aborted) return;
      if (inspection.status === "none") {
        setStatus("idle");
        setError("");
      } else if (inspection.status === "submission-unconfirmed") {
        setStatus("idle");
        setError(inspection.reason);
      } else {
        applyRecoveredState(inspection.state);
        if (inspection.state.terminal) {
          if (terminalHandledRef.current !== inspection.state.run.id) {
            terminalHandledRef.current = inspection.state.run.id;
            await onTerminalRun(inspection.state.run);
          }
        } else {
          await track(inspection.state.checkpoint, controller.signal);
        }
      }
    }).catch(caught => {
      if (!controller.signal.aborted) {
        setStatus("error");
        setError(getErrorMessage(caught, "Unable to restore generation tracking."));
      }
    });

    return () => controller.abort();
  }, [userId, projectId, recoveryIdentity, applyRecoveredState, track, onTerminalRun]);

  return { status, error, retrySubmission, reconnect };
}

import { WorkspaceSidebar } from "./components/WorkspaceSidebar";
import { WorkspacePreview } from "./components/WorkspacePreview";
import { WorkspaceCodeEditor } from "./components/WorkspaceCodeEditor";
import { WorkspaceStatusBar } from "./components/WorkspaceStatusBar";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      response?: { data?: { detail?: unknown; message?: unknown } };
    };
    const detail = candidate.response?.data?.detail;
    const responseMessage = candidate.response?.data?.message;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (typeof responseMessage === "string" && responseMessage.trim()) return responseMessage;
    if (typeof candidate.message === "string" && candidate.message.trim()) return candidate.message;
  }
  return fallback;
};

/**
 * Explain an authoritative failed run using persisted provider/verification
 * feedback. Older runs can have a terminal status without `failure` because
 * the backend previously saved FAILED before persisting RunFailure.
 * Keep messages concise in the sidebar; the full record stays in the API.
 */
const describeFailedRun = (run: OrchestratorRun): string => {
  const failure = run.failure && typeof run.failure === "object"
    ? run.failure as { code?: unknown; message?: unknown }
    : null;
  const code = typeof failure?.code === "string" && failure.code.trim()
    ? failure.code.trim()
    : "";
  const message = typeof failure?.message === "string" && failure.message.trim()
    ? failure.message.trim()
    : "";

  const lastFailedStep = [...(run.steps ?? [])].reverse().find(
    (step) => typeof step.error === "string" && step.error.trim(),
  );
  const stepError = lastFailedStep?.error?.trim() ?? "";
  const verification = run.verification && typeof run.verification === "object"
    ? run.verification as { feedback?: unknown }
    : null;
  const feedback = Array.isArray(verification?.feedback)
    ? verification.feedback.filter((item): item is string =>
        typeof item === "string" && item.trim().length > 0,
      ).slice(0, 2).join(" | ")
    : "";

  const detail = message || stepError || feedback ||
    "The backend marked this run as failed without returning a reason. Inspect the run's failure and verification fields in the API.";
  // A quality-gate failure message often says only that the repair budget was
  // exhausted. Append the actual verifier diagnostics when available.
  const diagnostic = feedback || stepError;
  const extra = diagnostic && !detail.includes(diagnostic)
    ? ` Verification feedback: ${diagnostic}`
    : "";
  return `${code ? `[${code}] ` : ""}${detail}${extra}`.slice(0, 1600);
};

/** A keyed child prevents user/project state leaking across route transitions. */
export const BuilderWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const userId = useAuthStore((state) => state.user?.id);
  const authLoading = useAuthStore((state) => state.isLoading);

  if (authLoading) {
    return <div className="grid h-screen place-items-center bg-[#090a0f] text-slate-300">Loading session...</div>;
  }
  if (!userId || !projectId) {
    return <div className="grid h-screen place-items-center bg-[#090a0f] text-slate-300">
      <button type="button" onClick={() => navigate(userId ? "/dashboard" : "/login")}>{userId ? "Back to Dashboard" : "Sign in to continue"}</button>
    </div>;
  }
  return <BuilderWorkspaceSession key={JSON.stringify([userId, projectId])} userId={userId} projectId={projectId} />;
};

const BuilderWorkspaceSession: React.FC<{ userId: string; projectId: string }> = ({ userId, projectId }) => {
  const navigate = useNavigate();
  const scope = React.useMemo(() => ({ userId, projectId }), [userId, projectId]);
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState("");

  // Durable data and runtime state live in the same scoped Zustand store.
  const messages = useBuilderStore(s => s.messages);
  const prompt = useBuilderStore(s => s.draftPrompt);
  const activeTab = useBuilderStore(s => s.preferences.activeTab);
  const deviceMode = useBuilderStore(s => s.preferences.deviceMode);
  const sidebarOpen = useBuilderStore(s => s.preferences.sidebarOpen);
  const selectedFilePath = useBuilderStore(s => s.preferences.selectedFilePath);
  const generatedFiles = useBuilderStore(s => s.generatedFiles);
  const previewState = useBuilderStore(s => s.previewState);
  const lastCompletedRunId = useBuilderStore(s => s.lastCompletedRunId);
  const lastSuccessfulBuild = useBuilderStore(s => s.lastSuccessfulBuild);
  const recovery = useBuilderStore(s => s.recovery);
  const runStage = useBuilderStore(s => s.runStage);
  const runError = useBuilderStore(s => s.runError);
  const runEvents = useBuilderStore(s => s.runEvents);
  const runSteps = useBuilderStore(s => s.runSteps);
  const isSending = useBuilderStore(s => s.isSending);
  const isCancelling = useBuilderStore(s => s.isCancelling);
  const isRefreshing = useBuilderStore(s => s.isRefreshing);
  const isFullscreen = useBuilderStore(s => s.isFullscreen);
  const activeRunId = useBuilderStore(s => s.activeRunId);
  const [activeRun, setActiveRun] = useState<OrchestratorRun | null>(null);
  const [submittingNow, setSubmittingNow] = useState(false);

  const setPrompt = useCallback((value: string) => builderStore.getState().setDraftPrompt(value, scope), [scope]);
  const setActiveTab = useCallback((value: "preview" | "code") => builderStore.getState().setActiveTab(value, scope), [scope]);
  const setDeviceMode = useCallback((value: "desktop" | "tablet" | "mobile") => builderStore.getState().setDeviceMode(value, scope), [scope]);
  const setSidebarOpen = useCallback((value: boolean) => builderStore.getState().setSidebarOpen(value, scope), [scope]);
  const setSelectedFilePath = useCallback((value: string) => builderStore.getState().setSelectedFilePath(value, scope), [scope]);
  const setIsFullscreen = useCallback((value: React.SetStateAction<boolean>) => {
    const current = builderStore.getState().isFullscreen;
    const next = typeof value === "function" ? value(current) : value;
    builderStore.getState().updateRuntime({ isFullscreen: next }, scope);
  }, [scope]);
  const mountedRef = useRef(true);
  const submissionRef = useRef(false);
  const cancelRef = useRef(false);
  const refreshRef = useRef<AbortController | null>(null);
  // Autosave changes are expected during SSE progress; only actual storage
  // failures need an interrupting banner. Normal save activity stays silent.
  const { hydrationStatus, storageError, saveNow, retry } = useWorkspacePersistence({ userId, projectId });

  // Never expose locally restored data until server-side project access succeeds.
  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;
    void (async () => {
      try {
        setProjectLoading(true);
        setProjectError("");
        const data = await getProjectApi(projectId);
        if (!mounted) return;
        if (data.id !== projectId || (data.user_id && data.user_id !== userId)) {
          throw new Error("This workspace belongs to another account.");
        }
        setProject(data);
      } catch (error) {
        if (mounted) setProjectError(getErrorMessage(error, "Unable to load project."));
      } finally {
        if (mounted) setProjectLoading(false);
      }
    })();
    return () => {
      mounted = false;
      mountedRef.current = false;
      refreshRef.current?.abort();
    };
  }, [projectId, userId]);

  // Only seed an initial prompt after IndexedDB restoration and project verification.
  useEffect(() => {
    if (projectLoading || projectError || !project || hydrationStatus !== "ready") return;
    const state = builderStore.getState();
    if (state.scope?.userId !== userId || state.scope.projectId !== projectId) return;
    if (state.messages.length > 0) return;
    const welcome: ChatMessage = {
      id: "welcome", role: "ai",
      content: "Welcome to the ICOGON AI Builder workspace. Tell me what application, component, or features you want to create or edit.",
    };
    state.setMessages(project.prompt ? [welcome, { id: "initial-project-prompt", role: "user", content: project.prompt }] : [welcome], scope);
  }, [projectLoading, projectError, project, hydrationStatus, userId, projectId, scope]);

  const loadPreview = useCallback(async (run: OrchestratorRun): Promise<boolean> => {
    const stateBefore = builderStore.getState();
    if (stateBefore.scope?.userId !== userId || stateBefore.scope.projectId !== projectId) return false;
    // Orchestrator changes are incremental. Merge upserts/deletions against the
    // last verified file set rather than dropping unrelated project files.
    const previousFiles = stateBefore.generatedFiles.length > 0
      ? stateBefore.generatedFiles
      : (stateBefore.lastSuccessfulBuild?.generatedFiles ?? []);
    const fileMap = new Map(previousFiles.filter(f => f.operation !== "delete").map(file => [file.path, file]));
    for (const change of extractGeneratedFiles(run)) {
      if (change.operation === "delete") fileMap.delete(change.path);
      else fileMap.set(change.path, change);
    }
    const files = [...fileMap.values()];
    try {
      const preview = await getOrchestratorPreviewApi(run.id);
      if (!mountedRef.current) return false;
      const state = builderStore.getState();
      if (state.scope?.userId !== userId || state.scope.projectId !== projectId) return false;
      if (typeof preview.html !== "string" || !preview.html.trim()) {
        throw new Error("The completed run did not return renderable HTML.");
      }
      const next = {
        available: true, data: preview, html: preview.html,
        warnings: Array.isArray(preview.warnings) ? preview.warnings.filter((w): w is string => typeof w === "string") : undefined,
        compiler: typeof preview.compiler === "string" ? preview.compiler : undefined,
      };
      state.setGeneratedFiles(files, scope);
      const selection = state.preferences.selectedFilePath;
      state.setSelectedFilePath(files.some(f => f.path === selection) ? selection : files[0]?.path ?? "", scope);
      state.setPreviewState(next, scope);
      state.setLastSuccessfulBuild({ runId: run.id, generatedFiles: files, previewState: next, savedAt: new Date().toISOString() }, scope);
      state.setLastCompletedRunId(run.id, scope);
      state.updateRuntime({ runError: "" }, scope);
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      const state = builderStore.getState();
      const rawMessage = getErrorMessage(error, "The generated preview could not be loaded.");
      const httpStatus = (error as { response?: { status?: number } } | null)?.response?.status;
      const message = rawMessage === "Network Error"
        ? `Preview request failed at the network/CORS layer for run ${run.id}. Inspect GET /orchestrator/runs/${run.id}/preview in DevTools and the API server logs.`
        : rawMessage;
      console.error("[ICOGON preview]", { runId: run.id, httpStatus: httpStatus ?? null, message });
      // A successful generation is still saved even when preview compilation
      // or retrieval fails. Preserve any previous working HTML preview.
      state.setGeneratedFiles(files, scope);
      const selection = state.preferences.selectedFilePath;
      state.setSelectedFilePath(files.some(f => f.path === selection) ? selection : files[0]?.path ?? "", scope);
      state.setLastCompletedRunId(run.id, scope);
      state.updateRuntime({ runError: message }, scope);
      if (!state.lastSuccessfulBuild) {
        state.setPreviewState({ available: false, data: { error: message }, error: message }, scope);
      }
      return false;
    }
  }, [projectId, userId, scope]);

  const handleTerminalRun = useCallback(async (run: OrchestratorRun) => {
    if (!mountedRef.current || run.project_id !== projectId || run.user_id !== userId) return;
    const stage = normalizeStage(run.status);
    // Compatibility with older workers: they could publish a terminal FAILED
    // status before persisting RunFailure. Make one authoritative read before
    // finalizing a failure so the user sees actionable diagnostic details.
    let terminalRun = run;
    if (stage === "failed" && !(
      run.failure && typeof run.failure === "object" &&
      typeof (run.failure as { message?: unknown }).message === "string"
    )) {
      try {
        const refreshed = await getOrchestratorRunApi(run.id);
        if (refreshed.id === run.id && refreshed.project_id === projectId && refreshed.user_id === userId) {
          terminalRun = refreshed;
        }
      } catch {
        // The original terminal result remains authoritative if the network
        // is unavailable. Never resubmit a failed run just to get its reason.
      }
    }
    if (!mountedRef.current) return;
    setActiveRun(terminalRun);
    // A completed generation is independent of whether its preview endpoint
    // succeeds. Record the run now so Retry Preview and future edits work.
    if (stage === "completed") {
      builderStore.getState().setLastCompletedRunId(run.id, scope);
    }
    const ready = stage === "completed" ? await loadPreview(terminalRun) : false;
    const failureMessage = stage === "failed" ? describeFailedRun(terminalRun) : "";
    const content = stage === "completed"
      ? ready ? "Application generated. Preview updated!" : "Generation completed, but the new preview could not be loaded. Refresh to retry."
      : stage === "cancelled" ? "Generation was cancelled."
      : `Generation failed: ${failureMessage} Your previous successful build has been retained if available.`;
    const state = builderStore.getState();
    state.appendMessage({
      id: `run-result-${run.id}`, role: "ai", content, timestamp: new Date().toISOString(),
      filesModified: ready ? extractGeneratedFiles(run).filter(f => f.operation !== "delete").map(f => f.path) : undefined,
    }, scope);
    state.updateRuntime({
      isSending: false,
      runStage: stage,
      activeRunId: run.id,
      runError: stage === "failed"
        ? failureMessage
        : stage === "completed" && !ready
          ? state.runError
          : "",
    }, scope);
    // The run is terminal regardless of whether HTML preview loading failed.
    // Preview retry uses lastCompletedRunId; leaving a tracking checkpoint
    // here blocks the next prompt and makes Retry Preview restart SSE instead.
    const currentRecovery = builderStore.getState().recovery;
    if (currentRecovery?.kind === "tracking" && currentRecovery.runId === run.id) {
      builderStore.getState().setRecovery(null, scope);
    }
  }, [userId, projectId, scope, loadPreview]);

  const {
    status: recoveryStatus, error: recoveryError,
    retrySubmission, reconnect,
  } = useRunRecovery({
    // Do not treat THIS tab's in-flight request as an interrupted submission.
    userId: project && !projectError && !submittingNow ? userId : undefined,
    projectId: project && !projectError && !submittingNow ? projectId : undefined,
    onTerminalRun: handleTerminalRun,
  });

  // Keep the run details for the existing status bar and cancel controls.
  useEffect(() => {
    if (!activeRunId || projectLoading || projectError || !project) return;
    let cancelled = false;
    void getOrchestratorRunApi(activeRunId).then(run => {
      if (!cancelled && mountedRef.current && run.project_id === projectId && run.user_id === userId) setActiveRun(run);
    }).catch(() => { /* Stream tracking and error UI are authoritative. */ });
    return () => { cancelled = true; };
  }, [activeRunId, projectLoading, projectError, project, projectId, userId]);

  const handleSendPrompt = async () => {
    const clean = builderStore.getState().draftPrompt.trim();
    const state = builderStore.getState();
    if (!clean || submissionRef.current || isSending || isCancelling || state.recovery ||
        hydrationStatus !== "ready" || projectLoading || projectError || !project) return;
    submissionRef.current = true;
    setSubmittingNow(true);
    const userMessage: ChatMessage = { id: createId("user"), role: "user", content: clean, timestamp: new Date().toISOString() };
    const pending: PendingRunSubmission = {
      kind: "submitting", prompt: clean, idempotencyKey: createId("submission"),
      baseRunId: lastCompletedRunId ?? undefined, quality: "balanced", submittedAt: new Date().toISOString(), messageId: userMessage.id,
    };
    state.appendMessage(userMessage, scope);
    state.setDraftPrompt("", scope);
    state.setRecovery(pending, scope);
    state.updateRuntime({ runStage: "queued", runError: "", runEvents: [], runSteps: [], activeRunId: null, isSending: true }, scope);
    // Durably persist the idempotency key BEFORE sending a request. Abort if saving fails.
    if (!await saveNow()) {
      builderStore.getState().updateRuntime({ isSending: false, runError: "Workspace could not be saved. Generation was not submitted." }, scope);
      submissionRef.current = false;
      setSubmittingNow(false);
      return;
    }
    try {
      const run = await submitOrchestratorRunApi({
        projectId, prompt: pending.prompt, quality: pending.quality,
        baseRunId: pending.baseRunId, idempotencyKey: pending.idempotencyKey,
      });
      if (!mountedRef.current) return;
      if (run.project_id !== projectId || run.user_id !== userId) throw new Error("Generation run belongs to another workspace.");
      setActiveRun(run);
      const checkpoint: WorkspaceRunCheckpoint = {
        kind: "tracking", runId: run.id, stage: normalizeStage(run.status), lastEventSequence: 0,
        runEvents: [], runSteps: run.steps ?? [], runError: "", updatedAt: new Date().toISOString(),
      };
      const latest = builderStore.getState();
      latest.updateRuntime({ activeRunId: run.id, runStage: checkpoint.stage, runSteps: checkpoint.runSteps }, scope);
      latest.setRecovery(checkpoint, scope); // Starts known-run tracking in File 16.
      latest.appendMessage({
        id: `run-start-${run.id}`, role: "ai", content: "I've started building your application changes. Tracking progress in real time...", timestamp: new Date().toISOString(),
      }, scope);
      // Even immediately-completed runs are reconciled through one recovery path.
    } catch (error) {
      if (!mountedRef.current) return;
      const message = getErrorMessage(error, "Unable to start AI generation.");
      const status = (error as { response?: { status?: number } } | null)?.response?.status;
      const current = builderStore.getState();
      current.updateRuntime({ isSending: false, runError: status === 400 || status === 422 ? message : `${message} — retry the original submission to recover safely.` }, scope);
      if (status === 400 || status === 422) {
        current.setRecovery(null, scope);
        current.setDraftPrompt(pending.prompt, scope);
      }
    } finally {
      submissionRef.current = false;
      if (mountedRef.current) setSubmittingNow(false);
    }
  };

  const handleCancelRun = async () => {
    const runId = builderStore.getState().activeRunId ?? (recovery?.kind === "tracking" ? recovery.runId : null);
    if (!runId || cancelRef.current) return;
    cancelRef.current = true;
    builderStore.getState().updateRuntime({ isCancelling: true }, scope);
    try {
      const run = await cancelOrchestratorRunApi(runId);
      if (!mountedRef.current) return;
      if (run.project_id !== projectId || run.user_id !== userId) throw new Error("Cancelled run belongs to another workspace.");
      setActiveRun(run);
      if (isTerminalRunStage(normalizeStage(run.status))) {
        builderStore.getState().setRecovery(null, scope);
        await handleTerminalRun(run);
      } else {
        builderStore.getState().updateRuntime({ runStage: normalizeStage(run.status) }, scope);
      }
    } catch (error) {
      if (mountedRef.current) builderStore.getState().updateRuntime({ runError: getErrorMessage(error, "Could not cancel generation.") }, scope);
    } finally {
      cancelRef.current = false;
      if (mountedRef.current) builderStore.getState().updateRuntime({ isCancelling: false }, scope);
    }
  };

  const handleRefreshPreview = async () => {
    const tracking = recovery?.kind === "tracking" ? recovery : null;
    // Live runs reconnect to progress; completed runs retry the preview GET.
    if (tracking && !isTerminalRunStage(tracking.stage)) { reconnect(); return; }
    const runId = lastCompletedRunId ??
      (tracking?.stage === "completed" ? tracking.runId : null) ??
      lastSuccessfulBuild?.runId;
    if (!runId || isRefreshing || submissionRef.current || isSending || recovery?.kind === "submitting") return;
    const controller = new AbortController();
    refreshRef.current?.abort();
    refreshRef.current = controller;
    builderStore.getState().updateRuntime({ isRefreshing: true }, scope);
    try {
      const run = await getOrchestratorRunApi(runId);
      if (controller.signal.aborted || !mountedRef.current) return;
      if (run.project_id !== projectId || run.user_id !== userId) throw new Error("Preview run belongs to another workspace.");
      setActiveRun(run);
      if (normalizeStage(run.status) !== "completed") {
        throw new Error("The selected run is not completed, so its preview cannot be loaded.");
      }
      builderStore.getState().setLastCompletedRunId(run.id, scope);
      await loadPreview(run);
      // A stale completed checkpoint from an older UI version is not an
      // active generation and should not freeze the workspace.
      const checkpoint = builderStore.getState().recovery;
      if (checkpoint?.kind === "tracking" && checkpoint.runId === run.id) {
        builderStore.getState().setRecovery(null, scope);
      }
    } catch (error) {
      if (!controller.signal.aborted && mountedRef.current) builderStore.getState().updateRuntime({ runError: getErrorMessage(error, "Unable to refresh preview.") }, scope);
    } finally {
      if (!controller.signal.aborted && mountedRef.current) builderStore.getState().updateRuntime({ isRefreshing: false }, scope);
    }
  };

  const handleSelectFile = (path: string) => { setSelectedFilePath(path); setActiveTab("code"); };

  if (hydrationStatus === "error" && !projectLoading && !projectError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090a0f] p-6 text-slate-200">
        <div className="max-w-lg rounded-xl border border-amber-800/60 bg-[#151824] p-6 text-center">
          <h2 className="text-sm font-semibold text-amber-300">Workspace restore needs attention</h2>
          <p className="mt-3 text-xs text-slate-300">{storageError || "Unable to restore saved workspace."}</p>
          <p className="mt-2 text-xs text-slate-400">Your saved data has not been deleted or replaced.</p>
          <button type="button" className="mt-4 rounded-md bg-indigo-600 px-3 py-2 text-xs" onClick={() => void retry()}>Retry restoration</button>
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090a0f] text-slate-300 p-4">
        <div className="max-w-md text-center rounded-2xl border border-rose-900/50 bg-[#12141f] p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-rose-400">Project Not Found</h2>
          <p className="mt-2 text-xs text-slate-400">{projectError}</p>
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

  if (projectLoading || hydrationStatus === "restoring" || hydrationStatus === "idle") {
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
      className={`flex h-screen w-full flex-col bg-[#090a0f] text-slate-200 overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-9999" : ""
      }`}
    >
      {/* TOP HEADER */}
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
      />

      {/* Keep normal IndexedDB autosaves invisible: each streaming event marks
          state dirty for milliseconds, which otherwise flashes a yellow strip.
          Show an actionable warning only if storage actually fails. */}
      {storageError && (
        <div role="alert" className="shrink-0 border-b border-amber-800/40 bg-amber-950/25 px-4 py-2 text-xs text-amber-200">
          <span>Workspace storage: {storageError}</span>
          <button type="button" className="ml-3 underline" onClick={() => void retry()}>Retry storage</button>
        </div>
      )}
      {recovery && (!isSending || recoveryStatus === "error") && (
        <div role="status" className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[#303345] bg-[#151824] px-4 py-2 text-xs">
          <span className="flex-1">{recovery.kind === "submitting" ? "An earlier submission could not be confirmed. Retry with the original request key." : recoveryError || "Generation tracking is paused."}</span>
          <button type="button" className="rounded-md border border-slate-600 px-3 py-1" onClick={() => {
            if (recovery.kind === "submitting") void retrySubmission();
            else reconnect();
          }}>{recovery.kind === "submitting" ? "Retry submission" : "Resume tracking"}</button>
          {recovery.kind === "tracking" && <button type="button" disabled={isCancelling} onClick={() => void handleCancelRun()} className="rounded-md border border-slate-600 px-3 py-1">Cancel run</button>}
        </div>
      )}
      {/* MAIN REGION: SIDEBAR + CONTENT CANVAS */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        {/* COLLAPSED SIDEBAR RESTORE TOGGLE */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            title="Expand AI Assistant"
            className="absolute left-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-[#232738] bg-[#12141e]/90 text-slate-300 shadow-lg backdrop-blur-md hover:bg-[#1a1d2c] hover:text-white transition"
          >
            <PanelLeftOpen size={15} />
          </button>
        )}

        {/* Mobile backdrop keeps the preview visible while the assistant is open. */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close assistant sidebar"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-20 bg-black/50 backdrop-blur-[1px] lg:hidden"
          />
        )}

        {/* LEFT AI SIDEBAR */}
        <WorkspaceSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
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
          recoveryPending={recoveryStatus === "connecting" || recoveryStatus === "tracking"}
          onSelectFile={handleSelectFile}
        />

        {/* MAIN CANVAS: PREVIEW OR CODE */}
        <main className="flex flex-1 min-w-0 flex-col overflow-hidden bg-[#07080c]">
          {activeTab === "preview" ? (
            <WorkspacePreview
              project={project}
              previewState={previewState}
              deviceMode={deviceMode}
              setDeviceMode={setDeviceMode}
              isRefreshing={isRefreshing}
              onRefreshPreview={handleRefreshPreview}
              isRunning={isSending}
              files={generatedFiles}
              onQuickPrompt={(text) => {
                setPrompt(text);
                if (!sidebarOpen) setSidebarOpen(true);
              }}
            />
          ) : (
            <WorkspaceCodeEditor
              files={generatedFiles}
              selectedFilePath={selectedFilePath}
              onSelectFile={setSelectedFilePath}
            />
          )}
        </main>
      </div>

      {/* BOTTOM STATUS BAR */}
      <WorkspaceStatusBar
        runStage={runStage}
        isRunning={isSending}
        activeRun={activeRun}
        fileCount={generatedFiles.length}
        eventCount={runEvents.length}
      />
    </div>
  );
};

export default BuilderWorkspacePage;