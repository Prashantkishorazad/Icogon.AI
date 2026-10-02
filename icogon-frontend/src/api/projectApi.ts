import axios from "axios";
import { supabase } from "../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ============================================================
// TYPES
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

export type OrchestratorQuality =
  | "fast"
  | "balanced"
  | "polished";

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
// GET ACCESS TOKEN
// ============================================================

const getAccessToken = async (): Promise<string> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error(
      "Not authenticated. Please login again."
    );
  }

  return session.access_token;
};

// ============================================================
// AUTH HEADERS
// ============================================================

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// ============================================================
// CREATE PROJECT
// ============================================================

export const createProjectApi = async (
  project: ProjectCreate
): Promise<ProjectResponse> => {
  const token = await getAccessToken();

  const response = await axios.post<ProjectResponse>(
    `${API_URL}/projects`,
    {
      name: project.name.trim(),
      description: project.description.trim(),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

// ============================================================
// GET PROJECTS
// ============================================================

export const getProjectsApi = async (): Promise<
  ProjectResponse[]
> => {
  const token = await getAccessToken();

  const response = await axios.get<ProjectResponse[]>(
    `${API_URL}/projects`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ============================================================
// GET SINGLE PROJECT
// ============================================================

export const getProjectApi = async (
  projectId: string
): Promise<ProjectResponse> => {
  const token = await getAccessToken();

  const response = await axios.get<ProjectResponse>(
    `${API_URL}/projects/${projectId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ============================================================
// DELETE PROJECT
// ============================================================

export const deleteProjectApi = async (
  projectId: string
): Promise<void> => {
  const token = await getAccessToken();

  await axios.delete(
    `${API_URL}/projects/${projectId}`,
    {
      headers: getAuthHeaders(token),
    }
  );
};

// ============================================================
// CREATE IDEMPOTENCY KEY
// ============================================================

const createIdempotencyKey = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `icogon-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

// ============================================================
// SUBMIT ORCHESTRATOR RUN
// ============================================================

export const submitOrchestratorRunApi = async (
  options: SubmitOrchestratorRunOptions
): Promise<OrchestratorRun> => {
  const token = await getAccessToken();

  const prompt = options.prompt.trim();

  if (!prompt) {
    throw new Error("Prompt cannot be empty.");
  }

  const payload: Record<string, unknown> = {
    project_id: options.projectId,
    prompt,
    idempotency_key:
      options.idempotencyKey || createIdempotencyKey(),
    quality: options.quality || "balanced",
  };

  if (options.baseRunId) {
    payload.base_run_id = options.baseRunId;
  }

  const response = await axios.post<OrchestratorRun>(
    `${API_URL}/orchestrator/runs`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

// ============================================================
// GET ORCHESTRATOR RUN
// ============================================================

export const getOrchestratorRunApi = async (
  runId: string
): Promise<OrchestratorRun> => {
  const token = await getAccessToken();

  const response = await axios.get<OrchestratorRun>(
    `${API_URL}/orchestrator/runs/${runId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ============================================================
// GET ORCHESTRATOR EVENTS
// ============================================================

export const getOrchestratorEventsApi = async (
  runId: string,
  after = 0
): Promise<OrchestratorRunEvent[]> => {
  const token = await getAccessToken();

  const response = await axios.get<OrchestratorRunEvent[]>(
    `${API_URL}/orchestrator/runs/${runId}/events`,
    {
      params: {
        after: Math.max(0, after),
      },
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ============================================================
// CANCEL ORCHESTRATOR RUN
// ============================================================

export const cancelOrchestratorRunApi = async (
  runId: string
): Promise<OrchestratorRun> => {
  const token = await getAccessToken();

  const response = await axios.post<OrchestratorRun>(
    `${API_URL}/orchestrator/runs/${runId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

// ============================================================
// GET GENERATED PREVIEW
// ============================================================

export const getOrchestratorPreviewApi = async (
  runId: string
): Promise<PreviewResponse> => {
  const token = await getAccessToken();

  const response = await axios.get<PreviewResponse>(
    `${API_URL}/orchestrator/runs/${runId}/preview`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ============================================================
// STREAM ORCHESTRATOR EVENTS
// ============================================================

export interface StreamOrchestratorEventsOptions {
  runId: string;
  after?: number;
  signal?: AbortSignal;
  onEvent: (event: OrchestratorRunEvent) => void;
}

export const streamOrchestratorEventsApi = async ({
  runId,
  after = 0,
  signal,
  onEvent,
}: StreamOrchestratorEventsOptions): Promise<void> => {
  const token = await getAccessToken();

  const query = new URLSearchParams({
    after: String(Math.max(0, after)),
  });

  const response = await fetch(
    `${API_URL}/orchestrator/runs/${runId}/events/stream?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      signal,
    }
  );

  if (!response.ok) {
    let message = `Unable to stream orchestrator events (${response.status}).`;

    try {
      const body = await response.json();

      if (typeof body?.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  if (!response.body) {
    throw new Error(
      "The server did not provide an event stream."
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      const blocks = buffer.split("\n\n");

      buffer = blocks.pop() || "";

      for (const block of blocks) {
        const event = parseServerSentEvent(block);

        if (event) {
          onEvent(event);
        }
      }
    }

    if (buffer.trim()) {
      const event = parseServerSentEvent(buffer);

      if (event) {
        onEvent(event);
      }
    }
  } finally {
    reader.releaseLock();
  }
};

// ============================================================
// SSE PARSER
// ============================================================

const parseServerSentEvent = (
  block: string
): OrchestratorRunEvent | null => {
  const lines = block.split("\n");

  let eventId = "";
  let data = "";

  for (const line of lines) {
    if (line.startsWith("id:")) {
      eventId = line.slice(3).trim();
    }

    if (line.startsWith("data:")) {
      data += line.slice(5).trim();
    }
  }

  if (!data) {
    return null;
  }

  try {
    const parsed = JSON.parse(data) as OrchestratorRunEvent;

    if (
      parsed &&
      typeof parsed === "object" &&
      "event_type" in parsed
    ) {
      return {
        ...parsed,
        sequence:
          typeof parsed.sequence === "number"
            ? parsed.sequence
            : Number(eventId) || 0,
      };
    }

    return null;
  } catch (error) {
    console.error(
      "Unable to parse orchestrator SSE event:",
      error
    );

    return null;
  }
};