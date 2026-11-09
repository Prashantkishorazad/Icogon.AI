// ==========================================================
// ICOGON AI - GMAIL CONNECTORS API
// ==========================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export interface GmailMessage {
  id: string;
  threadId?: string;
  subject?: string;
  sender?: string;
  from?: string;
  snippet?: string;
  date?: string;
}

export interface GmailMessagesResponse {
  messages?: GmailMessage[];
}

export interface GmailProfileResponse {
  email?: string | null;
  connected?: boolean;
  name?: string | null;
}

export interface GmailStatusResponse {
  connected?: boolean;
  email?: string | null;
}

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data?.detail === "string") message = data.detail;
      else if (typeof data?.message === "string") message = data.message;
    } catch {
      // Keep the default HTTP error.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const connectGmail = async (): Promise<void> => {
  window.location.href = `${API_BASE_URL}/api/connectors/gmail/connect`;
};

export const getGmailStatus = async (): Promise<GmailStatusResponse> =>
  apiRequest<GmailStatusResponse>("/api/connectors/gmail/status");

export const getGmailProfile = async (): Promise<GmailProfileResponse> =>
  apiRequest<GmailProfileResponse>("/api/connectors/gmail/profile");

export const getGmailMessages = async (
  query?: string
): Promise<GmailMessagesResponse> => {
  const params = new URLSearchParams();
  if (query?.trim()) params.set("q", query.trim());
  const queryString = params.toString();
  const endpoint = queryString
    ? `/api/connectors/gmail/messages?${queryString}`
    : "/api/connectors/gmail/messages";
  return apiRequest<GmailMessagesResponse>(endpoint);
};

export const disconnectGmail = async (): Promise<void> => {
  await apiRequest<void>("/api/connectors/gmail/disconnect", {
    method: "POST",
  });
};
