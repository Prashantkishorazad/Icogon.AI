import axios from "axios";
import { supabase } from "../lib/supabase";

/**
 * Keep the API origin in one place. Removing a trailing slash prevents URLs
 * such as `https://api.example.com//projects` when the env value has a slash.
 */
const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const apiUrl = (path: string): string =>
  `${API_URL}/${path.replace(/^\/+/, "")}`;

// ============================================================
// PROJECT TYPES
// ============================================================

export interface ProjectCreate {
  name: string;
  description: string;
}

export interface ProjectResponse {
  id: string;
  user_id?: string | null;
  name: string;
  description?: string | null;
  prompt?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// ============================================================
// ORCHESTRATOR TYPES
// ============================================================

export type OrchestratorQuality = "fast" | "balanced" | "polished";

export type RunStatus =
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

export interface OrchestratorRun {
  id: string;
  user_id: string;
  project_id: string;
  prompt: string;
  idempotency_key: string;
  status: RunStatus | string;
  base_run_id?: string | null;
  quality?: OrchestratorQuality | string;
  brief?: unknown;
  architecture?: unknown;
  plan?: unknown;
  changes?: unknown;
  review?: unknown;
  verification?: unknown;
  failure?: unknown;
  repair_attempts?: number;
  execution_attempts?: number;
  model_calls?: number;
  input_tokens?: number;
  output_tokens?: number;
  created_at?: string;
  updated_at?: string;
  steps?: OrchestratorRunStep[];
  handoffs?: unknown[];
}

export interface OrchestratorRunStep {
  id: string;
  name: string;
  status: string;
  started_at?: string | null;
  finished_at?: string | null;
  details?: Record<string, unknown>;
  error?: string | null;
}

export interface OrchestratorRunEvent {
  sequence: number;
  run_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at?: string;
}

export interface SubmitOrchestratorRunOptions {
  projectId: string;
  prompt: string;
  baseRunId?: string;
  quality?: OrchestratorQuality;
  idempotencyKey?: string;
}

export interface PreviewResponse {
  [key: string]: unknown;
}

// ============================================================
// AUTHENTICATION & ERROR HANDLING
// ============================================================

const getAccessToken = async (): Promise<string> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  if (!session?.access_token) {
    throw new Error("Not authenticated. Please login again.");
  }

  return session.access_token;
};

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

/** Extract a useful message from Axios, Fetch, or ordinary errors. */
export const getProjectApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: unknown; message?: unknown }
      | undefined;
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

// ============================================================
// PROJECT CRUD
// Backend currently exposes POST /projects, GET /projects,
// GET /projects/{id}, and DELETE /projects/{id}.
// No update endpoint is present in the supplied backend router.
// ============================================================

export const createProjectApi = async (
  project: ProjectCreate
): Promise<ProjectResponse> => {
  const token = await getAccessToken();
  const name = project.name.trim();
  const description = project.description.trim();

  if (!name) throw new Error("Project name is required.");
  if (!description) throw new Error("Project description is required.");

  const response = await axios.post<ProjectResponse>(
    apiUrl("projects"),
    { name, description },
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const getProjectsApi = async (): Promise<ProjectResponse[]> => {
  const token = await getAccessToken();
  const response = await axios.get<ProjectResponse[]>(apiUrl("projects"), {
    headers: getAuthHeaders(token),
  });
  return response.data;
};

export const getProjectApi = async (
  projectId: string
): Promise<ProjectResponse> => {
  if (!projectId.trim()) throw new Error("Project ID is required.");

  const token = await getAccessToken();
  const response = await axios.get<ProjectResponse>(
    apiUrl(`projects/${encodeURIComponent(projectId)}`),
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

export const deleteProjectApi = async (
  projectId: string
): Promise<void> => {
  if (!projectId.trim()) throw new Error("Project ID is required.");

  const token = await getAccessToken();
  await axios.delete(
    apiUrl(`projects/${encodeURIComponent(projectId)}`),
    { headers: getAuthHeaders(token) }
  );
};

// ============================================================
// ORCHESTRATOR HELPERS
// ============================================================

const createIdempotencyKey = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `icogon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const submitOrchestratorRunApi = async (
  options: SubmitOrchestratorRunOptions
): Promise<OrchestratorRun> => {
  const token = await getAccessToken();
  const projectId = options.projectId.trim();
  const prompt = options.prompt.trim();

  if (!projectId) throw new Error("Project ID is required.");
  if (!prompt) throw new Error("Prompt cannot be empty.");

  const payload: Record<string, unknown> = {
    project_id: projectId,
    prompt,
    idempotency_key: options.idempotencyKey || createIdempotencyKey(),
    quality: options.quality || "balanced",
  };

  if (options.baseRunId) payload.base_run_id = options.baseRunId;

  const response = await axios.post<OrchestratorRun>(
    apiUrl("orchestrator/runs"),
    payload,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const getOrchestratorRunApi = async (
  runId: string
): Promise<OrchestratorRun> => {
  if (!runId.trim()) throw new Error("Run ID is required.");
  const token = await getAccessToken();
  const response = await axios.get<OrchestratorRun>(
    apiUrl(`orchestrator/runs/${encodeURIComponent(runId)}`),
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

export const getOrchestratorEventsApi = async (
  runId: string,
  after = 0
): Promise<OrchestratorRunEvent[]> => {
  if (!runId.trim()) throw new Error("Run ID is required.");
  const token = await getAccessToken();
  const response = await axios.get<OrchestratorRunEvent[]>(
    apiUrl(`orchestrator/runs/${encodeURIComponent(runId)}/events`),
    {
      params: { after: Math.max(0, after) },
      headers: getAuthHeaders(token),
    }
  );
  return response.data;
};

export const cancelOrchestratorRunApi = async (
  runId: string
): Promise<OrchestratorRun> => {
  if (!runId.trim()) throw new Error("Run ID is required.");
  const token = await getAccessToken();
  const response = await axios.post<OrchestratorRun>(
    apiUrl(`orchestrator/runs/${encodeURIComponent(runId)}/cancel`),
    {},
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const getOrchestratorPreviewApi = async (
  runId: string
): Promise<PreviewResponse> => {
  if (!runId.trim()) throw new Error("Run ID is required.");
  const token = await getAccessToken();
  const response = await axios.get<PreviewResponse>(
    apiUrl(`orchestrator/runs/${encodeURIComponent(runId)}/preview`),
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

// ============================================================
// SERVER-SENT EVENTS (SSE)
// ============================================================

export interface StreamOrchestratorEventsOptions {
  runId: string;
  after?: number;
  signal?: AbortSignal;
  onEvent: (event: OrchestratorRunEvent) => void;
}

/**
 * Parse one SSE frame. Supports CRLF, comments, and multi-line `data:` fields.
 * The ICOGON backend currently sends JSON in each data field.
 */
const parseServerSentEvent = (
  block: string
): OrchestratorRunEvent | null => {
  let eventId = "";
  const dataLines: string[] = [];

  for (const rawLine of block.split(/\r?\n/)) {
    if (!rawLine || rawLine.startsWith(":")) continue;

    const separator = rawLine.indexOf(":");
    const field = separator === -1 ? rawLine : rawLine.slice(0, separator);
    let value = separator === -1 ? "" : rawLine.slice(separator + 1);
    if (value.startsWith(" ")) value = value.slice(1);

    if (field === "id") eventId = value;
    if (field === "data") dataLines.push(value);
  }

  if (dataLines.length === 0) return null;

  try {
    const parsed: unknown = JSON.parse(dataLines.join("\n"));
    if (!parsed || typeof parsed !== "object" || !("event_type" in parsed)) {
      return null;
    }

    const event = parsed as Partial<OrchestratorRunEvent>;
    return {
      sequence:
        typeof event.sequence === "number"
          ? event.sequence
          : Number(eventId) || 0,
      run_id: typeof event.run_id === "string" ? event.run_id : "",
      event_type: String(event.event_type),
      payload:
        event.payload && typeof event.payload === "object"
          ? event.payload
          : {},
      ...(typeof event.created_at === "string"
        ? { created_at: event.created_at }
        : {}),
    };
  } catch (error) {
    console.error("Unable to parse orchestrator SSE event:", error);
    return null;
  }
};

export const streamOrchestratorEventsApi = async ({
  runId,
  after = 0,
  signal,
  onEvent,
}: StreamOrchestratorEventsOptions): Promise<void> => {
  if (!runId.trim()) throw new Error("Run ID is required.");
  if (signal?.aborted) return;

  const token = await getAccessToken();
  if (signal?.aborted) return;

  const query = new URLSearchParams({
    after: String(Math.max(0, after)),
  });
  const endpoint = apiUrl(
    `orchestrator/runs/${encodeURIComponent(runId)}/events/stream`
  );

  const response = await fetch(`${endpoint}?${query.toString()}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(token),
      Accept: "text/event-stream",
    },
    signal,
  });

  if (!response.ok) {
    let message = `Unable to stream orchestrator events (${response.status}).`;
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "detail" in body) {
        const detail = (body as { detail?: unknown }).detail;
        if (typeof detail === "string") message = detail;
      }
    } catch {
      // Keep the status-based fallback message.
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("The server did not provide an event stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const dispatchFrame = (frame: string) => {
    const event = parseServerSentEvent(frame);
    if (event) onEvent(event);
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // A blank line terminates an SSE frame. Accept both LF and CRLF.
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? "";
      for (const frame of frames) dispatchFrame(frame);
    }

    buffer += decoder.decode();
    if (buffer.trim()) dispatchFrame(buffer);
  } finally {
    reader.releaseLock();
  }
};
