import axios from "axios";
import { supabase } from "../lib/supabase";
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const getHeaders = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session?.access_token) throw new Error("Not authenticated. Please login again.");
  return { Authorization: `Bearer ${session.access_token}` };
};
export type ProjectShare = { id: string; permission: "view" | "edit"; created_at?: string; expires_at?: string | null; revoked_at?: string | null };
export async function createProjectShare(projectId: string, permission: "view" | "edit" = "view", expiresAt?: string) {
  const headers = await getHeaders();
  const response = await axios.post(`${API_URL}/projects/${encodeURIComponent(projectId)}/shares`, { permission, expires_at: expiresAt || null }, { headers });
  return response.data as { id: string; token: string; permission: "view" | "edit"; expires_at: string | null };
}
export async function listProjectShares(projectId: string) {
  const headers = await getHeaders();
  const response = await axios.get<ProjectShare[]>(`${API_URL}/projects/${encodeURIComponent(projectId)}/shares`, { headers });
  return response.data;
}
export async function revokeProjectShare(projectId: string, shareId: string) {
  const headers = await getHeaders();
  await axios.delete(`${API_URL}/projects/${encodeURIComponent(projectId)}/shares/${encodeURIComponent(shareId)}`, { headers });
}
export async function resolveProjectShare(token: string) {
  const response = await axios.get(`${API_URL}/projects/shared/${encodeURIComponent(token)}`);
  return response.data as { project: { id: string; name: string; description?: string }; permission: "view" | "edit" };
}
