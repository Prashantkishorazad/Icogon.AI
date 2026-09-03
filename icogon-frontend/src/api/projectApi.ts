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
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};