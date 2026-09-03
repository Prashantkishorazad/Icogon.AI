import axios from "axios";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

const getAccessToken = async (): Promise<string> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  return session.access_token;
};


export interface CreateRunRequest {
  project_id: string;
  prompt: string;
}


export interface RunResponse {
  id: string;
  project_id: string;
  status: string;
  created_at?: string;
}


export const createOrchestratorRunApi = async (
  data: CreateRunRequest
): Promise<RunResponse> => {

  const token = await getAccessToken();

  const response = await axios.post<RunResponse>(
    `${API_URL}/orchestrator/runs`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};