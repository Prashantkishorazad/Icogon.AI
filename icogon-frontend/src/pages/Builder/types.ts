import type {
  OrchestratorRun,
  OrchestratorRunEvent,
  OrchestratorRunStep,
  OrchestratorQuality,
} from "../../api/projectApi";

export type {
  OrchestratorRun,
  OrchestratorRunEvent,
  OrchestratorRunStep,
  ProjectResponse,
} from "../../api/projectApi";

export type WorkspaceTab = "preview" | "code";
export type DeviceMode = "desktop" | "tablet" | "mobile";

export type RunStage =
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

export interface GeneratedFile {
  path: string;
  operation?: string;
  content?: string | null;
}

export interface PreviewState {
  available: boolean;
  html?: string;
  warnings?: string[];
  compiler?: string;
  error?: string;
  data?: unknown | null;
}

export interface ChatMessage {
  id: string;
  role: "ai" | "user" | "system";
  content: string;
  timestamp?: string;
  stage?: RunStage;
  filesModified?: string[];
  planSummary?: string;
}

export const PIPELINE_STAGES: RunStage[] = [
  "queued",
  "analyzing",
  "designing",
  "planning",
  "generating",
  "reviewing",
  "repairing",
  "verifying",
  "completed",
];

export const createId = (prefix: string): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const stageLabel = (stage: RunStage): string => {
  switch (stage) {
    case "queued":
      return "Queued in pipeline";
    case "analyzing":
      return "Analyzing requirements";
    case "designing":
      return "Designing architecture & UI";
    case "planning":
      return "Planning component changes";
    case "generating":
      return "Writing code & modules";
    case "reviewing":
      return "Reviewing quality & syntax";
    case "repairing":
      return "Self-healing & polishing";
    case "verifying":
      return "Testing & sandbox verification";
    case "completed":
      return "Build ready & verified";
    case "failed":
      return "Build failed";
    case "cancelled":
      return "Build cancelled";
    default:
      return "Ready to build";
  }
};

export const normalizeStage = (value: string | undefined): RunStage => {
  if (!value) return "idle";
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

export const extractGeneratedFiles = (run: OrchestratorRun | null): GeneratedFile[] => {
  if (!run?.changes || typeof run.changes !== "object") {
    return [];
  }
  const changes = run.changes as { files?: unknown };
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

export const getFileContent = (file: GeneratedFile | undefined): string => {
  if (!file?.content) return "";
  return file.content;
};

export const getFileName = (file: GeneratedFile | undefined): string => {
  if (!file?.path) return "";
  return file.path;
};

/* =========================================================
   PHASE 1 — WORKSPACE SESSION & PROJECT PERSISTENCE
========================================================= */

/** Bump this when the stored session format changes incompatibly. */
export const WORKSPACE_SESSION_VERSION = 1 as const;

/** The authenticated user and project together identify a session. */
export interface WorkspaceSessionScope {
  userId: string;
  projectId: string;
}

/* =========================================================
   WORKSPACE UI PREFERENCES
========================================================= */

export interface WorkspacePreferences {
  activeTab: WorkspaceTab;
  deviceMode: DeviceMode;
  sidebarOpen: boolean;
  selectedFilePath: string;
}

/* =========================================================
   LAST SUCCESSFUL BUILD

   Keep this snapshot independent of the active generation run.
   A failed or cancelled run must not overwrite a working build.
========================================================= */

export interface WorkspaceBuildSnapshot {
  runId: string;
  generatedFiles: GeneratedFile[];
  previewState: PreviewState;
  savedAt: string;
}

/* =========================================================
   GENERATION SUBMISSION CHECKPOINT

   Persist before sending the request. If a response is lost,
   recover using the original idempotency key, not a new one.
========================================================= */

export interface PendingRunSubmission {
  kind: "submitting";
  prompt: string;
  idempotencyKey: string;
  baseRunId?: string;
  quality: OrchestratorQuality;
  submittedAt: string;
  messageId: string;
}

/* =========================================================
   ACTIVE RUN RECOVERY

   The API remains authoritative for actual run status.
   Resume SSE from the last successfully applied sequence.
========================================================= */

export interface WorkspaceRunCheckpoint {
  kind: "tracking";
  runId: string;
  stage: RunStage;
  lastEventSequence: number;
  runEvents: OrchestratorRunEvent[];
  runSteps: OrchestratorRunStep[];
  runError: string;
  updatedAt: string;
}

export type WorkspaceRunRecovery =
  | PendingRunSubmission
  | WorkspaceRunCheckpoint;

/* =========================================================
   PERSISTED WORKSPACE SESSION

   Contains project-specific durable state only. Do not store
   access tokens, AbortControllers or transient loading flags.
   Preview data and API payloads must be validated and made
   serializable by the persistence layer before writing.
========================================================= */

export interface WorkspaceSessionSnapshot {
  schemaVersion: typeof WORKSPACE_SESSION_VERSION;
  scope: WorkspaceSessionScope;
  savedAt: string;

  messages: ChatMessage[];
  draftPrompt: string;
  preferences: WorkspacePreferences;

  // The currently visible files and preview; these may differ
  // from the last working build during an incremental generation.
  generatedFiles: GeneratedFile[];
  previewState: PreviewState;

  // Last completed generation usable as follow-up context.
  lastCompletedRunId: string | null;

  // Last build with a usable preview; never replace on failure.
  lastSuccessfulBuild: WorkspaceBuildSnapshot | null;

  // Null when there is no submission or run to recover.
  recovery: WorkspaceRunRecovery | null;
}

/* =========================================================
   SESSION RESTORATION & STORAGE RESULTS
========================================================= */

export type WorkspaceHydrationStatus =
  | "idle"
  | "restoring"
  | "ready"
  | "error";

export type WorkspaceSaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "error";

export type WorkspaceRestoreResult =
  | { status: "restored"; snapshot: WorkspaceSessionSnapshot }
  | { status: "missing" }
  | { status: "invalid"; reason: string }
  | { status: "error"; reason: string };

export type WorkspaceWriteResult =
  | { status: "saved" }
  | { status: "error"; reason: string };

/** Storage adapter contract; implementation is supplied in later files. */
export interface WorkspacePersistenceAdapter {
  load(scope: WorkspaceSessionScope): Promise<WorkspaceRestoreResult>;
  save(snapshot: WorkspaceSessionSnapshot): Promise<WorkspaceWriteResult>;
  remove(scope: WorkspaceSessionScope): Promise<void>;
}

/* =========================================================
   RUN LIFECYCLE HELPERS
========================================================= */

export const isTerminalRunStage = (stage: RunStage): boolean => {
  return (
    stage === "completed" ||
    stage === "failed" ||
    stage === "cancelled"
  );
};

export const isActiveRunStage = (stage: RunStage): boolean => {
  return stage !== "idle" && !isTerminalRunStage(stage);
};
