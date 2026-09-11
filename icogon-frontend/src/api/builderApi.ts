import axios from "axios";

import { supabase } from "../lib/supabase";


// ============================================================
// API CONFIG
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


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
// GET ACCESS TOKEN
// ============================================================

const getAccessToken =
  async (): Promise<string> => {
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
// CREATE IDEMPOTENCY KEY
// ============================================================

export const createIdempotencyKey =
  (): string => {
    return crypto.randomUUID();
  };


// ============================================================
// SUBMIT AI RUN
// ============================================================

export const submitBuilderRun =
  async (
    projectId: string,
    prompt: string,
    options?: {
      idempotencyKey?: string;
      budget?: RunBudget;
    }
  ): Promise<AgentRun> => {

    const token =
      await getAccessToken();

    const idempotencyKey =
      options?.idempotencyKey ||
      createIdempotencyKey();

    const response =
      await axios.post<AgentRun>(
        `${API_URL}/orchestrator/runs`,
        {
          project_id: projectId,

          prompt: prompt.trim(),

          idempotency_key:
            idempotencyKey,

          budget:
            options?.budget || {
              max_model_calls: 6,
              max_repair_attempts: 2,
              max_output_tokens: 20000,
            },
        } satisfies SubmitRunRequest,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };


// ============================================================
// GET RUN
// ============================================================

export const getBuilderRun =
  async (
    runId: string
  ): Promise<AgentRun> => {

    const token =
      await getAccessToken();

    const response =
      await axios.get<AgentRun>(
        `${API_URL}/orchestrator/runs/${runId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };


// ============================================================
// GET RUN EVENTS
// ============================================================

export const getBuilderRunEvents =
  async (
    runId: string,
    after = 0
  ): Promise<RunEvent[]> => {

    const token =
      await getAccessToken();

    const response =
      await axios.get<RunEvent[]>(
        `${API_URL}/orchestrator/runs/${runId}/events`,
        {
          params: {
            after,
          },

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };


// ============================================================
// CANCEL RUN
// ============================================================

export const cancelBuilderRun =
  async (
    runId: string
  ): Promise<AgentRun> => {

    const token =
      await getAccessToken();

    const response =
      await axios.post<AgentRun>(
        `${API_URL}/orchestrator/runs/${runId}/cancel`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };


// ============================================================
// STREAM RUN EVENTS
//
// IMPORTANT:
// Native EventSource cannot send our Supabase
// Authorization header.
//
// Therefore we use fetch() and manually read
// the SSE stream.
// ============================================================

export const streamBuilderRun =
  async function* (
    runId: string,
    after = 0
  ): AsyncGenerator<RunEvent, void, unknown> {

    const token =
      await getAccessToken();

    const response =
      await fetch(
        `${API_URL}/orchestrator/runs/${runId}/events/stream?after=${after}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "text/event-stream",
          },

          cache: "no-store",
        }
      );

    if (!response.ok) {
      throw new Error(
        `Failed to connect to generation stream (${response.status})`
      );
    }

    if (!response.body) {
      throw new Error(
        "Generation stream is not available."
      );
    }

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";

    try {
      while (true) {
        const {
          value,
          done,
        } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        const messages =
          buffer.split("\n\n");

        buffer =
          messages.pop() || "";

        for (const message of messages) {
          const parsed =
            parseSSEMessage(message);

          if (parsed) {
            yield parsed;
          }
        }
      }

      // Parse any remaining event.
      if (buffer.trim()) {
        const parsed =
          parseSSEMessage(buffer);

        if (parsed) {
          yield parsed;
        }
      }

    } finally {
      reader.releaseLock();
    }
  };


// ============================================================
// SSE PARSER
// ============================================================

const parseSSEMessage =
  (
    message: string
  ): RunEvent | null => {

    const lines =
      message.split("\n");

    let eventId = "";

    let eventType = "";

    let data = "";

    for (const rawLine of lines) {
      const line =
        rawLine.trimEnd();

      if (
        line.startsWith("id:")
      ) {
        eventId =
          line.slice(3).trim();
      }

      else if (
        line.startsWith("event:")
      ) {
        eventType =
          line.slice(6).trim();
      }

      else if (
        line.startsWith("data:")
      ) {
        data +=
          line.slice(5).trim();
      }
    }

    if (!data) {
      return null;
    }

    try {
      const parsed =
        JSON.parse(data) as RunEvent;

      return {
        ...parsed,

        id:
          parsed.id ||
          eventId,

        event_type:
          parsed.event_type ||
          eventType,
      };

    } catch (error) {
      console.error(
        "SSE EVENT PARSE ERROR:",
        error
      );

      return null;
    }
  };