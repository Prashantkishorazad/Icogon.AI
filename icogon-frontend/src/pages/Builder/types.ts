import type { OrchestratorRun } from "../../api/projectApi";

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