const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/* =========================
   TYPES
========================= */

export interface CreateProjectPayload {
  name: string;
  prompt: string;
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiErrorResponse {
  message?: string;
}


/* =========================
   CREATE PROJECT
========================= */

export const createProject = async (
  projectData: CreateProjectPayload
): Promise<Project> => {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      error.message || "Failed to create project"
    );
  }

  return response.json() as Promise<Project>;
};


/* =========================
   GET ALL PROJECTS
========================= */

export const getProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_URL}/projects`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json() as Promise<Project[]>;
};


/* =========================
   GET PROJECT BY ID
========================= */

export const getProjectById = async (
  projectId: string
): Promise<Project> => {
  const response = await fetch(
    `${API_URL}/projects/${projectId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }

  return response.json() as Promise<Project>;
};


/* =========================
   DELETE PROJECT
========================= */

export const deleteProject = async (
  projectId: string
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/projects/${projectId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
};