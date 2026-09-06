import axios from "axios";
import { supabase } from "../lib/supabase";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
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
export interface RunResponse {
  id: string;
  project_id: string;
  prompt: string;
  status: string;
  created_at: string;
  base_run_id?: string;
  model_calls: number;
  output_tokens: number;
  repair_attempts: number;
  steps: { id: string; name: string; status: string; error?: string }[];
  handoffs?: {
    id: string;
    sender: string;
    recipient: string;
    kind: "request" | "artifact" | "feedback" | "decision";
    summary: string;
    artifact?: string;
    created_at: string;
  }[];
  plan?: {
    summary: string;
    assumptions: string[];
    tasks: { id: string; title: string; description: string }[];
    blueprint?: {
      project_type: string;
      template: string;
      audience: string;
      visual_direction: string;
      design_tokens: Record<string, string>;
      pages: string[];
      interactions: string[];
      acceptance_criteria: string[];
      limitations: string[];
    };
  };
  changes?: { summary: string; files: FileChange[] };
  failure?: { code: string; message: string };
  verification?: {
    passed: boolean;
    checks: Record<string, boolean>;
    feedback: string[];
  };
}
export interface Capabilities {
  provider: string;
  configured: boolean;
  model: string;
  verification: string;
  persistence: string;
}
async function request<T>(path: string, data?: unknown): Promise<T> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error("Please sign in to continue.");
  const response = await axios.request<T>({
    url: `${API_URL}/orchestrator${path}`,
    method: data === undefined ? "GET" : "POST",
    data,
    timeout: 15000,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  return response.data;
}
export const createOrchestratorRunApi = (data: CreateRunRequest) =>
  request<RunResponse>("/runs", data);
export const getRunApi = (id: string) =>
  request<RunResponse>(`/runs/${encodeURIComponent(id)}`);
export const getPreviewApi = (id: string) =>
  request<{ html: string; warnings: string[]; compiler: string }>(
    `/runs/${encodeURIComponent(id)}/preview`,
  );
export const cancelRunApi = (id: string) =>
  request<RunResponse>(`/runs/${encodeURIComponent(id)}/cancel`, {});
export const getCapabilitiesApi = () => request<Capabilities>("/capabilities");
export const isTerminalRun = (status: string) =>
  ["completed", "failed", "cancelled"].includes(status);
export function apiError(error: unknown): string {
  if (
    axios.isAxiosError(error) &&
    typeof error.response?.data?.detail === "string"
  )
    return error.response.data.detail;
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please retry.";
}
