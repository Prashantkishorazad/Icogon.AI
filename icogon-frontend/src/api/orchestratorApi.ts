import axios from "axios";
import { supabase } from "../lib/supabase";
import {
  submitOrchestratorRunApi,
  getOrchestratorRunApi,
  getOrchestratorPreviewApi,
  cancelOrchestratorRunApi,
  getOrchestratorEventsApi,
  getOrchestratorRecoveryApi,
  streamOrchestratorEventsApi,
  OrchestratorStreamError,
  type OrchestratorRun,
  type OrchestratorRunEvent,
  type ProjectRequestOptions,
  type OrchestratorRecoveryOptions,
  type OrchestratorRecoveryResponse,
  type StreamOrchestratorEventsOptions,
} from "./projectApi";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

// ============================================================
// EXISTING PUBLIC CONTRACTS
// ============================================================

export interface FileChange {
  path: string;
  content: string;
  operation: "upsert" | "delete";
}

export type BuildQuality = "fast" | "balanced" | "polished";

export interface CreateRunRequest {
  project_id: string;
  prompt: string;
  idempotency_key: string;
  base_run_id?: string;
  quality?: BuildQuality;
}

// Preserve the legacy structured response consumed by GeneratedPreview.
// Nullable fields reflect the FastAPI AgentRun model before completion.
export interface RunResponse extends OrchestratorRun {
  id: string;
  project_id: string;
  prompt: string;
  status: string;
  created_at: string;
  base_run_id?: string | null;
  model_calls: number;
  output_tokens: number;
  repair_attempts: number;
  steps: {
    id: string;
    name: string;
    status: string;
    error?: string | null;
  }[];
  handoffs?: {
    id: string;
    sender: string;
    recipient: string;
    kind: "request" | "artifact" | "feedback" | "decision";
    summary: string;
    artifact?: string | null;
    created_at: string;
  }[];
  plan?: {
    summary: string;
    assumptions: string[];
    tasks: { id: string; title: string; description: string }[];
    blueprint?: {
      project_type: string;
      template: string;
      audience: string | string[];
      visual_direction: string;
      design_tokens: Record<string, unknown>;
      pages: string[];
      interactions: string[];
      acceptance_criteria: string[];
      limitations: string[];
    } | null;
  } | null;
  changes?: { summary: string; files: FileChange[] } | null;
  failure?: { code: string; message: string; retryable?: boolean } | null;
  verification?: {
    passed: boolean;
    checks: Record<string, boolean>;
    feedback: string[];
  } | null;
}

export interface Capabilities {
  provider: string;
  configured: boolean;
  model: string;
  verification: string;
  persistence: string;
  planning_model?: string;
  review_model?: string;
  fallback_model?: string;
  templates?: string[];
  quality_modes?: BuildQuality[];
}

// ============================================================
// RECOVERY CONTRACTS
// ============================================================

export interface RunRecoveryResponse extends OrchestratorRecoveryResponse {
  run: RunResponse;
}

export interface CompiledPreviewResponse {
  html: string;
  warnings: string[];
  compiler: string;
}

// ============================================================
// RESPONSE BOUNDARY
// ============================================================

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFileChange = (value: unknown): value is FileChange =>
  isRecord(value) &&
  typeof value.path === "string" &&
  typeof value.content === "string" &&
  (value.operation === "upsert" || value.operation === "delete");

// The endpoint returns FastAPI's AgentRun model. Check the fields used
// by the existing preview consumer before narrowing its shared API type.
// Other nested artifacts retain their server-defined schema.
function asRunResponse(run: OrchestratorRun): RunResponse {
  if (
    !run ||
    typeof run.id !== "string" ||
    typeof run.project_id !== "string" ||
    typeof run.user_id !== "string" ||
    typeof run.idempotency_key !== "string" ||
    typeof run.prompt !== "string" ||
    typeof run.status !== "string" ||
    typeof run.created_at !== "string" ||
    typeof run.model_calls !== "number" ||
    typeof run.output_tokens !== "number" ||
    typeof run.repair_attempts !== "number" ||
    !Array.isArray(run.steps)
  ) {
    throw new Error("The server returned an incomplete generation run.");
  }

  if (run.changes != null) {
    if (
      !isRecord(run.changes) ||
      typeof run.changes.summary !== "string" ||
      !Array.isArray(run.changes.files) ||
      !run.changes.files.every(isFileChange)
    ) {
      throw new Error("The server returned invalid generated files.");
    }
  }

  return run as RunResponse;
}

// ============================================================
// AUTHENTICATED CAPABILITIES REQUEST
// ============================================================

// projectApi owns the shared run endpoints. Keep this helper only for
// capabilities, which has no corresponding export in projectApi yet.
async function request<T>(
  path: string,
  data?: unknown,
  options: ProjectRequestOptions = {},
): Promise<T> {
  options.signal?.throwIfAborted();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  options.signal?.throwIfAborted();
  if (error) throw error;
  if (!session?.access_token) throw new Error("Please sign in to continue.");

  const response = await axios.request<T>({
    url: `${API_URL}/orchestrator${path}`,
    method: data === undefined ? "GET" : "POST",
    data,
    timeout: 15000,
    signal: options.signal,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  return response.data;
}

// ============================================================
// EXISTING RUN API (COMPATIBILITY FACADE)
// ============================================================

// Keep the original snake_case input for existing callers. The canonical
// API owns validation, authentication, idempotency and route encoding.
export const createOrchestratorRunApi = async (
  data: CreateRunRequest,
  options: ProjectRequestOptions = {},
): Promise<RunResponse> => {
  // Do not generate a fresh key for a legacy submission or recovery.
  if (!data.idempotency_key?.trim()) {
    throw new Error("A reusable idempotency key is required.");
  }

  const run = await submitOrchestratorRunApi({
    projectId: data.project_id,
    prompt: data.prompt,
    idempotencyKey: data.idempotency_key,
    baseRunId: data.base_run_id,
    quality: data.quality,
    signal: options.signal,
  });

  return asRunResponse(run);
};

export const getRunApi = async (
  id: string,
  options: ProjectRequestOptions = {},
): Promise<RunResponse> =>
  asRunResponse(await getOrchestratorRunApi(id, options));

export const getPreviewApi = async (
  id: string,
  options: ProjectRequestOptions = {},
): Promise<CompiledPreviewResponse> => {
  const preview = await getOrchestratorPreviewApi(id, options);

  if (!isRecord(preview) || typeof preview.html !== "string") {
    throw new Error("The compiler did not return an HTML preview.");
  }

  // Preserve extra server fields while normalizing the three legacy fields.
  return {
    ...preview,
    html: preview.html,
    warnings: Array.isArray(preview.warnings)
      ? preview.warnings.filter((warning): warning is string => typeof warning === "string")
      : [],
    compiler: typeof preview.compiler === "string" ? preview.compiler : "Unknown compiler",
  };
};

export const cancelRunApi = async (
  id: string,
  options: ProjectRequestOptions = {},
): Promise<RunResponse> =>
  asRunResponse(await cancelOrchestratorRunApi(id, options));

export const getCapabilitiesApi = async (
  options: ProjectRequestOptions = {},
): Promise<Capabilities> => {
  const capabilities = await request<Capabilities>("/capabilities", undefined, options);

  if (
    !capabilities ||
    typeof capabilities.provider !== "string" ||
    typeof capabilities.configured !== "boolean" ||
    typeof capabilities.model !== "string" ||
    typeof capabilities.verification !== "string" ||
    typeof capabilities.persistence !== "string"
  ) {
    throw new Error("The server returned invalid orchestrator capabilities.");
  }

  return capabilities;
};

// ============================================================
// KNOWN-RUN RECOVERY AND EVENT STREAMING
// ============================================================

export const getRunEventsApi = (
  id: string,
  after = 0,
  options: ProjectRequestOptions = {},
): Promise<OrchestratorRunEvent[]> =>
  getOrchestratorEventsApi(id, after, options);

// Use saved project/run IDs. projectApi checks project ownership of the
// returned run and replays missed events without resubmitting the prompt.
export const recoverRunApi = async (
  options: OrchestratorRecoveryOptions,
): Promise<RunRecoveryResponse> => {
  const recovery = await getOrchestratorRecoveryApi(options);
  return { ...recovery, run: asRunResponse(recovery.run) };
};

export const streamRunEventsApi = (
  options: StreamOrchestratorEventsOptions,
): Promise<void> => streamOrchestratorEventsApi(options);

// A closed stream or a cancellation request is not itself a terminal run.
// Always use the status returned by the server.
export const isTerminalRun = (status: string) =>
  ["completed", "failed", "cancelled"].includes(status.trim().toLowerCase());

// ============================================================
// ERROR HANDLING
// ============================================================

export function apiError(error: unknown): string {
  if (axios.isCancel(error) || (error instanceof Error && error.name === "AbortError")) {
    return "Request cancelled.";
  }

  if (axios.isAxiosError(error)) {
    const body: unknown = error.response?.data;
    if (isRecord(body)) {
      if (typeof body.detail === "string" && body.detail.trim()) return body.detail;
      // FastAPI validation errors can be an array instead of a string.
      if (Array.isArray(body.detail)) {
        const messages = body.detail
          .filter(isRecord)
          .map((entry) => typeof entry.msg === "string" ? entry.msg : "")
          .filter(Boolean);
        if (messages.length > 0) return messages.join("; ");
      }
      if (typeof body.message === "string" && body.message.trim()) return body.message;
    }
    if (error.response?.status === 401) return "Please sign in again to continue.";
  }

  if (error instanceof OrchestratorStreamError) return error.message;

  return error instanceof Error
    ? error.message
    : "Something went wrong. Please retry.";
}
