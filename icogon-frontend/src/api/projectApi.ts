import axios from "axios";
import { supabase } from "../lib/supabase";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

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
  // Aborting the HTTP request does not cancel a server-side run.
  signal?: AbortSignal;
}

export interface PreviewResponse {
  [key: string]: unknown;
}

// ============================================================
// REQUEST AND RECOVERY CONTRACTS
// ============================================================

export interface ProjectRequestOptions {
  signal?: AbortSignal;
}

export interface OrchestratorRecoveryOptions extends ProjectRequestOptions {
  projectId: string;
  runId: string;
  after?: number;
}

export interface OrchestratorRecoveryResponse {
  run: OrchestratorRun;
  events: OrchestratorRunEvent[];
  lastSequence: number;
}

// Keep HTTP status available for recovery decisions. Axios errors retain
// their existing shape; this class is used for the native fetch stream.
export class OrchestratorStreamError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OrchestratorStreamError";
    this.status = status;
  }
}

const normalizeCursor = (after: number): number =>
  Number.isSafeInteger(after) && after >= 0 ? after : 0;

const encodeId = (value: string): string => {
  if (!value.trim()) throw new Error("A project or run ID is required.");
  return encodeURIComponent(value);
};

const throwIfAborted = (signal?: AbortSignal): void => {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Request aborted", "AbortError");
  }
};

// ============================================================
// GET ACCESS TOKEN
// ============================================================

const getAccessToken = async (signal?: AbortSignal): Promise<string> => {
  throwIfAborted(signal);
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  throwIfAborted(signal);

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

export const getProjectsApi = async (
  options: ProjectRequestOptions = {},
): Promise<
  ProjectResponse[]
> => {
  const token = await getAccessToken(options.signal);

  const response = await axios.get<ProjectResponse[]>(
    `${API_URL}/projects`,
    {
      headers: getAuthHeaders(token),
      signal: options.signal,
    }
  );

  return response.data;
};

// ============================================================
// GET SINGLE PROJECT
// ============================================================

export const getProjectApi = async (
  projectId: string,
  options: ProjectRequestOptions = {},
): Promise<ProjectResponse> => {
  const token = await getAccessToken(options.signal);

  const response = await axios.get<ProjectResponse>(
    `${API_URL}/projects/${encodeId(projectId)}`,
    {
      headers: getAuthHeaders(token),
      signal: options.signal,
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
    `${API_URL}/projects/${encodeId(projectId)}`,
    {
      headers: getAuthHeaders(token),
    }
  );
};

// ============================================================
// RENAME PROJECT
// ============================================================

export const updateProjectNameApi = async (
  projectId: string,
  name: string,
): Promise<ProjectResponse> => {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Project name cannot be empty.");
  if (cleanName.length > 120) throw new Error("Project name must be 120 characters or fewer.");

  const token = await getAccessToken();
  const response = await axios.patch<ProjectResponse>(
    `${API_URL}/projects/${encodeId(projectId)}`,
    { name: cleanName },
    { headers: { ...getAuthHeaders(token), "Content-Type": "application/json" } },
  );
  return response.data;
};

// ============================================================
// CREATE IDEMPOTENCY KEY
// ============================================================

export const createIdempotencyKey = (): string => {
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
  const token = await getAccessToken(options.signal);

  const prompt = options.prompt.trim();

  if (!prompt) {
    throw new Error("Prompt cannot be empty.");
  }

  // Match the archived FastAPI SubmitRunRequest validation limits.
  const promptLength = Array.from(prompt).length;
  if (promptLength < 3 || promptLength > 20_000) {
    throw new Error("Prompt must contain between 3 and 20,000 characters.");
  }
  if (!options.projectId.trim()) throw new Error("Project ID is required.");

  // Preserve the exact supplied key on recovery. Never silently replace it.
  const idempotencyKey = options.idempotencyKey ?? createIdempotencyKey();
  if (idempotencyKey.length < 8 || idempotencyKey.length > 200 || !idempotencyKey.trim()) {
    throw new Error("Idempotency key must contain between 8 and 200 characters.");
  }

  const payload: Record<string, unknown> = {
    project_id: options.projectId,
    prompt,
    idempotency_key: idempotencyKey,
    quality: options.quality || "balanced",
  };

  if (options.baseRunId) {
    payload.base_run_id = options.baseRunId;
  }

  const response = await axios.post<OrchestratorRun>(
    `${API_URL}/orchestrator/runs`,
    payload,
    {
      signal: options.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const run = response.data;
  if (!run?.id || run.project_id !== options.projectId || run.idempotency_key !== idempotencyKey) {
    throw new Error("Generation response does not match the requested project and submission.");
  }

  return run;
};

// ============================================================
// GET ORCHESTRATOR RUN
// ============================================================

export const getOrchestratorRunApi = async (
  runId: string,
  options: ProjectRequestOptions = {},
): Promise<OrchestratorRun> => {
  const token = await getAccessToken(options.signal);

  const response = await axios.get<OrchestratorRun>(
    `${API_URL}/orchestrator/runs/${encodeId(runId)}`,
    {
      headers: getAuthHeaders(token),
      signal: options.signal,
    }
  );

  if (response.data?.id !== runId) {
    throw new Error("The server returned a different generation run.");
  }

  return response.data;
};

// ============================================================
// GET ORCHESTRATOR EVENTS
// ============================================================

export const getOrchestratorEventsApi = async (
  runId: string,
  after = 0,
  options: ProjectRequestOptions = {},
): Promise<OrchestratorRunEvent[]> => {
  const token = await getAccessToken(options.signal);

  const response = await axios.get<OrchestratorRunEvent[]>(
    `${API_URL}/orchestrator/runs/${encodeId(runId)}/events`,
    {
      params: {
        after: normalizeCursor(after),
      },
      headers: getAuthHeaders(token),
      signal: options.signal,
    }
  );

  return validateEventHistory(response.data, runId, normalizeCursor(after));
};

// ============================================================
// CANCEL ORCHESTRATOR RUN
// ============================================================

export const cancelOrchestratorRunApi = async (
  runId: string,
  options: ProjectRequestOptions = {},
): Promise<OrchestratorRun> => {
  const token = await getAccessToken(options.signal);

  const response = await axios.post<OrchestratorRun>(
    `${API_URL}/orchestrator/runs/${encodeId(runId)}/cancel`,
    {},
    {
      signal: options.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data?.id !== runId) {
    throw new Error("The server returned a different generation run.");
  }

  return response.data;
};

// ============================================================
// GET GENERATED PREVIEW
// ============================================================

export const getOrchestratorPreviewApi = async (
  runId: string,
  options: ProjectRequestOptions = {},
): Promise<PreviewResponse> => {
  const token = await getAccessToken(options.signal);

  const response = await axios.get<PreviewResponse>(
    `${API_URL}/orchestrator/runs/${encodeId(runId)}/preview`,
    {
      headers: getAuthHeaders(token),
      signal: options.signal,
    }
  );

  return response.data;
};

// ============================================================
// RECOVER A KNOWN GENERATION RUN
// ============================================================

// The backend currently supports reads by run ID, not listing runs by project.
// Call this with a previously saved checkpoint. Never submit a new run here.
export const getOrchestratorRecoveryApi = async ({
  projectId,
  runId,
  after = 0,
  signal,
}: OrchestratorRecoveryOptions): Promise<OrchestratorRecoveryResponse> => {
  const cursor = normalizeCursor(after);
  const run = await getOrchestratorRunApi(runId, { signal });

  if (run.project_id !== projectId) {
    throw new Error("Generation run does not belong to this project.");
  }

  const events = await getOrchestratorEventsApi(runId, cursor, { signal });
  throwIfAborted(signal);

  return {
    run,
    events,
    lastSequence: events.at(-1)?.sequence ?? cursor,
  };
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
  const token = await getAccessToken(signal);
  let cursor = normalizeCursor(after);

  const query = new URLSearchParams({
    after: String(cursor),
  });

  const response = await fetch(
    `${API_URL}/orchestrator/runs/${encodeId(runId)}/events/stream?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      cache: "no-store",
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

    throwIfAborted(signal);
    throw new OrchestratorStreamError(message, response.status);
  }

  if (!response.body) {
    throw new Error(
      "The server did not provide an event stream."
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!/^text\/event-stream(?:\s*;|$)/i.test(contentType)) {
    await response.body.cancel().catch(() => undefined);
    throw new Error("The server returned an invalid event stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let lines: string[] = [];

  // Parse individual lines rather than splitting on two LF characters.
  // This handles LF, CRLF, CR and delimiters split across network chunks.
  const consume = (chunk: string, final = false) => {
    buffer += chunk;
    let offset = 0;

    while (offset < buffer.length) {
      const end = buffer.slice(offset).search(/[\r\n]/);
      if (end === -1) break;
      const index = offset + end;
      if (!final && buffer[index] === "\r" && index === buffer.length - 1) break;

      const line = buffer.slice(offset, index);
      offset = index + (buffer[index] === "\r" && buffer[index + 1] === "\n" ? 2 : 1);

      if (line === "") {
        if (lines.length === 0) continue;
        const event = parseServerSentEvent(lines.join("\n"), runId);
        lines = [];
        throwIfAborted(signal);
        if (event && event.sequence > cursor) {
          onEvent(event);
          // Commit the cursor only after the consumer accepts the event.
          cursor = event.sequence;
        }
      } else {
        lines.push(line);
      }
    }

    buffer = buffer.slice(offset);
  };

  try {
    while (true) {
      throwIfAborted(signal);
      const { done, value } = await reader.read();
      throwIfAborted(signal);

      if (done) {
        // Flush pending UTF-8 bytes. Never deliver a partial SSE message.
        consume(decoder.decode(), true);
        if (buffer.trim() || lines.some(line => line.startsWith("data:"))) {
          throw new Error("Event stream ended mid-message; reconnect from the last saved sequence.");
        }
        break;
      }

      consume(decoder.decode(value, { stream: true }));
    }
  } finally {
    // Release resources on abort, parsing error, or callback failure.
    try {
      await reader.cancel();
    } catch {
      // The browser may already have cancelled the request.
    }
    reader.releaseLock();
  }
};

// ============================================================
// EVENT VALIDATION AND REPLAY
// ============================================================

const validateRunEvent = (
  value: unknown,
  runId: string,
  fallbackSequence?: number,
): OrchestratorRunEvent => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid orchestrator event.");
  }

  const parsed = value as Partial<OrchestratorRunEvent>;
  const sequence = parsed.sequence ?? fallbackSequence;

  if (
    parsed.run_id !== runId ||
    typeof parsed.event_type !== "string" ||
    !parsed.event_type.trim() ||
    typeof sequence !== "number" ||
    !Number.isSafeInteger(sequence) ||
    sequence < 0 ||
    !parsed.payload ||
    typeof parsed.payload !== "object" ||
    Array.isArray(parsed.payload)
  ) {
    throw new Error("Invalid or mismatched orchestrator event.");
  }

  return {
    ...parsed,
    run_id: runId,
    sequence,
    event_type: parsed.event_type,
    payload: parsed.payload,
  };
};

const validateEventHistory = (
  value: unknown,
  runId: string,
  after: number,
): OrchestratorRunEvent[] => {
  if (!Array.isArray(value)) throw new Error("Invalid orchestrator event history.");

  const unique = new Map<number, OrchestratorRunEvent>();
  for (const raw of value) {
    const event = validateRunEvent(raw, runId);
    if (event.sequence > after && !unique.has(event.sequence)) {
      unique.set(event.sequence, event);
    }
  }
  return [...unique.values()].sort((a, b) => a.sequence - b.sequence);
};

// ============================================================
// SSE PARSER
// ============================================================

const parseServerSentEvent = (
  block: string,
  runId: string,
): OrchestratorRunEvent | null => {
  const lines = block.split("\n");

  let eventId = "";
  const data: string[] = [];

  for (const line of lines) {
    // Ignore heartbeat comments and unknown SSE fields.
    if (line.startsWith("id:")) {
      eventId = line.slice(3).trim();
    }

    if (line.startsWith("data:")) {
      // SSE joins multiple data lines with LF, not concatenation.
      data.push(line.slice(5).replace(/^ /, ""));
    }
  }

  if (!data.length || !data.join("\n").trim()) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(data.join("\n"));
  } catch {
    // Do not silently skip a corrupted event and advance the cursor.
    throw new Error("Unable to parse orchestrator SSE event.");
  }

  const fallbackSequence = /^\d+$/.test(eventId) ? Number(eventId) : undefined;
  return validateRunEvent(parsed, runId, fallbackSequence);
};
