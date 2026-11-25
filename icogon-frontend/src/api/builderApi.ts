import axios from "axios";

import { supabase } from "../lib/supabase";
import {
  createIdempotencyKey as createSharedIdempotencyKey,
  getOrchestratorRunApi,
  getOrchestratorEventsApi,
  getOrchestratorRecoveryApi,
  getOrchestratorPreviewApi,
  cancelOrchestratorRunApi,
  streamOrchestratorEventsApi,
  type OrchestratorRun,
  type OrchestratorRunEvent,
  type OrchestratorQuality,
  type OrchestratorRecoveryOptions,
  type ProjectRequestOptions,
  type PreviewResponse,
} from "./projectApi";


// ============================================================
// API CONFIG
// ============================================================

const API_URL =
  (import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000").replace(/\/+$/, "");


// ============================================================
// TYPES
// ============================================================

export type RunStatus =
  | "queued"
  | "analyzing"
  | "designing"
  | "planning"
  | "generating"
  | "reviewing"
  | "verifying"
  | "repairing"
  | "completed"
  | "failed"
  | "cancelled";


export interface RunBudget {
  max_model_calls?: number;
  max_repair_attempts?: number;
  max_output_tokens?: number;
}


export interface SubmitRunRequest {
  project_id: string;
  prompt: string;
  idempotency_key: string;
  budget?: RunBudget;
  base_run_id?: string;
  quality?: OrchestratorQuality;
}


export interface RunStep {
  id: string;
  name: string;
  status: string;
  started_at: string;
  finished_at?: string | null;
  details?: Record<string, unknown>;
  error?: string | null;
}


export interface RunFailure {
  code: string;
  message: string;
  retryable: boolean;
}


export interface RunEvent {
  id: string;
  run_id: string;
  sequence: number;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}


export interface AgentRun {
  id: string;

  user_id: string;

  project_id: string;

  prompt: string;

  idempotency_key: string;

  status: RunStatus;

  base_run_id?: string | null;

  quality?: OrchestratorQuality;

  budget: {
    max_model_calls: number;
    max_repair_attempts: number;
    max_output_tokens: number;
  };

  model_calls: number;

  input_tokens: number;

  output_tokens: number;

  repair_attempts: number;

  brief?: Record<string, unknown> | null;

  architecture?: Record<string, unknown> | null;

  plan?: Record<string, unknown> | null;

  changes?: Record<string, unknown> | null;

  review?: Record<string, unknown> | null;

  verification?: Record<string, unknown> | null;

  steps: RunStep[];

  failure?: RunFailure | null;

  cancel_requested_at?: string | null;

  created_at: string;

  updated_at: string;

  version: number;
}


// ============================================================
// PERSISTENCE AND RECOVERY CONTRACTS
// ============================================================

export interface SubmitBuilderRunOptions extends ProjectRequestOptions {
  idempotencyKey?: string;
  budget?: RunBudget;
  baseRunId?: string;
  quality?: OrchestratorQuality;
}

export interface BuilderRunRecovery {
  run: AgentRun;
  events: RunEvent[];
  lastSequence: number;
}

const DEFAULT_BUDGET: Required<RunBudget> = {
  max_model_calls: 12,
  max_repair_attempts: 2,
  max_output_tokens: 100000,
};

const BUDGET_LIMITS: Record<keyof RunBudget, readonly [number, number]> = {
  max_model_calls: [1, 50],
  max_repair_attempts: [0, 20],
  max_output_tokens: [256, 200000],
};

const RUN_STATUSES: ReadonlySet<string> = new Set<RunStatus>([
  "queued", "analyzing", "designing", "planning", "generating",
  "reviewing", "verifying", "repairing", "completed", "failed", "cancelled",
]);

export const isTerminalBuilderRun = (status: string): boolean =>
  status === "completed" || status === "failed" || status === "cancelled";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCounter = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

// The shared API exposes a deliberately broad run contract. Validate the
// fields required by legacy builder consumers instead of inventing defaults.
const asAgentRun = (run: OrchestratorRun): AgentRun => {
  const raw: unknown = run;
  if (
    !isRecord(raw) ||
    typeof raw.id !== "string" || !raw.id ||
    typeof raw.user_id !== "string" ||
    typeof raw.project_id !== "string" ||
    typeof raw.prompt !== "string" ||
    typeof raw.idempotency_key !== "string" ||
    typeof raw.status !== "string" || !RUN_STATUSES.has(raw.status) ||
    typeof raw.created_at !== "string" ||
    typeof raw.updated_at !== "string" ||
    !isCounter(raw.version) ||
    !isCounter(raw.model_calls) || !isCounter(raw.input_tokens) ||
    !isCounter(raw.output_tokens) || !isCounter(raw.repair_attempts) ||
    !isRecord(raw.budget) ||
    !isCounter(raw.budget.max_model_calls) ||
    !isCounter(raw.budget.max_repair_attempts) ||
    !isCounter(raw.budget.max_output_tokens) ||
    !Array.isArray(raw.steps) ||
    !raw.steps.every(step => isRecord(step) && typeof step.id === "string" &&
      typeof step.name === "string" && typeof step.status === "string" &&
      typeof step.started_at === "string")
  ) {
    throw new Error("The server returned an incomplete Builder run.");
  }
  if (raw.failure != null && (!isRecord(raw.failure) ||
    typeof raw.failure.code !== "string" || typeof raw.failure.message !== "string" ||
    typeof raw.failure.retryable !== "boolean")) {
    throw new Error("The server returned invalid run failure details.");
  }

  return raw as unknown as AgentRun;
};

const asRunEvent = (event: OrchestratorRunEvent): RunEvent => {
  // The server supplies id and created_at even though the shared API only
  // requires the sequence. Never manufacture a server event or timestamp.
  const raw = event as OrchestratorRunEvent & { id?: unknown };
  if (typeof raw.id !== "string" || !raw.id || typeof raw.created_at !== "string") {
    throw new Error("The server returned an incomplete Builder event.");
  }
  return { ...event, id: raw.id, created_at: raw.created_at };
};

const validateBudget = (budget: RunBudget): RunBudget => {
  for (const key of Object.keys(budget)) {
    if (!Object.prototype.hasOwnProperty.call(BUDGET_LIMITS, key)) {
      throw new Error(`Unknown generation budget field: ${key}.`);
    }
    const field = key as keyof RunBudget;
    const value = budget[field];
    if (value === undefined) continue;
    const [minimum, maximum] = BUDGET_LIMITS[field];
    if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
      throw new Error(`${field} must be an integer between ${minimum} and ${maximum}.`);
    }
  }
  return budget;
};

// ============================================================
// GET ACCESS TOKEN
// ============================================================

// Keep this private helper only for budget-aware submissions. The shared
// project API currently has no budget option. All other transport is shared.
const getAccessToken = async (signal?: AbortSignal): Promise<{ token: string; userId: string }> => {
  signal?.throwIfAborted();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  signal?.throwIfAborted();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error(
      "Not authenticated. Please login again."
    );
  }

  return { token: session.access_token, userId: session.user.id };
};

// ============================================================
// CREATE IDEMPOTENCY KEY
// ============================================================

export const createIdempotencyKey = createSharedIdempotencyKey;

// ============================================================
// SUBMIT AI RUN
// ============================================================

// Preserve the existing budget payload and default 6/2/20000 limits.
// A retry after an ambiguous network failure must reuse the original key,
// project, prompt, base run and budget. Aborting HTTP does not cancel a run.
export const submitBuilderRun = async (
  projectId: string,
  prompt: string,
  options: SubmitBuilderRunOptions = {},
): Promise<AgentRun> => {
  const cleanPrompt = prompt.trim();
  const length = Array.from(cleanPrompt).length;
  if (!projectId.trim()) throw new Error("Project ID is required.");
  if (length < 3 || length > 20000) {
    throw new Error("Prompt must contain between 3 and 20,000 characters.");
  }

  const idempotencyKey = options.idempotencyKey ?? createIdempotencyKey();
  if (!idempotencyKey.trim() || idempotencyKey.length < 8 || idempotencyKey.length > 200) {
    throw new Error("Idempotency key must contain between 8 and 200 characters.");
  }

  const budget = validateBudget(options.budget ?? { ...DEFAULT_BUDGET });
  const payload: SubmitRunRequest = {
    project_id: projectId,
    prompt: cleanPrompt,
    idempotency_key: idempotencyKey,
    budget,
    ...(options.baseRunId ? { base_run_id: options.baseRunId } : {}),
    ...(options.quality ? { quality: options.quality } : {}),
  };

  const { token, userId } = await getAccessToken(options.signal);
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

  const run = asAgentRun(response.data);
  if (run.project_id !== projectId || run.user_id !== userId || run.idempotency_key !== idempotencyKey) {
    throw new Error("Generation response does not match the requested submission.");
  }
  return run;
};

// ============================================================
// GET RUN
// ============================================================

export const getBuilderRun = async (
  runId: string,
  options: ProjectRequestOptions = {},
): Promise<AgentRun> => asAgentRun(await getOrchestratorRunApi(runId, options));

// ============================================================
// GET RUN EVENTS
// ============================================================

export const getBuilderRunEvents = async (
  runId: string,
  after = 0,
  options: ProjectRequestOptions = {},
): Promise<RunEvent[]> => {
  const events = await getOrchestratorEventsApi(runId, after, options);
  return events.map(asRunEvent);
};

// ============================================================
// CANCEL RUN
// ============================================================

export const cancelBuilderRun = async (
  runId: string,
  options: ProjectRequestOptions = {},
): Promise<AgentRun> => asAgentRun(await cancelOrchestratorRunApi(runId, options));

// ============================================================
// GET LAST GENERATED PREVIEW
// ============================================================

export const getBuilderPreview = (
  runId: string,
  options: ProjectRequestOptions = {},
): Promise<PreviewResponse> => getOrchestratorPreviewApi(runId, options);

// ============================================================
// RECOVER AN EXISTING RUN
// ============================================================

// Reads a saved run ID and replays missed events. No POST or new AI run.
export const recoverBuilderRun = async (
  options: OrchestratorRecoveryOptions,
): Promise<BuilderRunRecovery> => {
  const recovered = await getOrchestratorRecoveryApi(options);
  return {
    run: asAgentRun(recovered.run),
    events: recovered.events.map(asRunEvent),
    lastSequence: recovered.lastSequence,
  };
};

// ============================================================
// STREAM RUN EVENTS
//
// IMPORTANT:
// Native EventSource cannot send our Supabase Authorization header.
// Reuse the shared authenticated fetch/SSE parser. Adapt its callback
// interface to the original async generator without a second parser.
// ============================================================

// The shared SSE callback cannot apply asynchronous backpressure. Bound its
// queue and fail explicitly if a consumer falls behind; never drop events.
// The caller can replay from the last sequence it actually processed.
const MAX_BUFFERED_EVENTS = 1024;

export const streamBuilderRun = async function* (
  runId: string,
  after = 0,
  options: ProjectRequestOptions = {},
): AsyncGenerator<RunEvent, void, unknown> {
  const controller = new AbortController();
  const queue: RunEvent[] = [];
  let outcome: { ok: true } | { ok: false; error: unknown } | null = null;
  let notify: (() => void) | undefined;

  const wake = () => {
    const resolve = notify;
    notify = undefined;
    resolve?.();
  };

  const abort = () => {
    controller.abort(options.signal?.reason);
    wake();
  };

  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) abort();

  // Attach both success and error handlers immediately. This prevents a
  // rejected producer promise becoming an unhandled rejection while yielding.
  const producer = streamOrchestratorEventsApi({
    runId,
    after,
    signal: controller.signal,
    onEvent: (event) => {
      controller.signal.throwIfAborted();
      if (queue.length >= MAX_BUFFERED_EVENTS) {
        throw new Error("Builder event buffer is full. Resume from the last processed sequence.");
      }
      queue.push(asRunEvent(event));
      wake();
    },
  }).then(
    () => { outcome = { ok: true }; wake(); },
    (error: unknown) => { outcome = { ok: false, error }; wake(); },
  );

  try {
    for (; ;) {
      controller.signal.throwIfAborted();
      const next = queue.shift();
      if (next) {
        yield next;
        continue;
      }

      if (outcome !== null) {
        // TS control-flow analysis does not model asynchronous assignments.
        const result = outcome as { ok: true } | { ok: false; error: unknown };
        if (!result.ok) throw result.error;
        return;
      }

      await new Promise<void>((resolve) => { notify = resolve; });
    }
  } finally {
    // Breaking out of for-await releases the underlying fetch stream.
    // To interrupt a pending next() call, pass and abort options.signal.
    controller.abort();
    options.signal?.removeEventListener("abort", abort);
    queue.length = 0;
    wake();
    await producer;
  }
};