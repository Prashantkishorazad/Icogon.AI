// ==========================================================
// ICOGON AI - GMAIL CONNECTORS API
// ==========================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";


// ==========================================================
// TYPES
// ==========================================================

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


// ==========================================================
// API HELPER
// ==========================================================

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      credentials: "include",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  if (!response.ok) {
    let message =
      `Request failed: ${response.status}`;

    try {
      const data =
        await response.json();

      if (
        data?.detail &&
        typeof data.detail === "string"
      ) {
        message = data.detail;
      } else if (
        data?.message &&
        typeof data.message === "string"
      ) {
        message = data.message;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
};


// ==========================================================
// CONNECT GMAIL
// ==========================================================
//
// Opens the backend Gmail OAuth flow.
//
// Expected backend route:
// GET /api/connectors/gmail/connect
//
// The backend should redirect the user to Google OAuth.
// ==========================================================

export const connectGmail =
  async (): Promise<void> => {

    const endpoint =
      `${API_BASE_URL}/api/connectors/gmail/connect`;

    window.location.href = endpoint;
  };


// ==========================================================
// GET GMAIL STATUS
// ==========================================================

export const getGmailStatus =
  async (): Promise<GmailStatusResponse> => {

    return apiRequest<GmailStatusResponse>(
      "/api/connectors/gmail/status"
    );
  };


// ==========================================================
// GET GMAIL PROFILE
// ==========================================================

export const getGmailProfile =
  async (): Promise<GmailProfileResponse> => {

    return apiRequest<GmailProfileResponse>(
      "/api/connectors/gmail/profile"
    );
  };


// ==========================================================
// GET GMAIL MESSAGES
// ==========================================================

export const getGmailMessages =
  async (
    query?: string
  ): Promise<GmailMessagesResponse> => {

    const params =
      new URLSearchParams();

    if (query?.trim()) {
      params.set(
        "q",
        query.trim()
      );
    }

    const queryString =
      params.toString();

    const endpoint =
      queryString
        ? `/api/connectors/gmail/messages?${queryString}`
        : "/api/connectors/gmail/messages";

    return apiRequest<GmailMessagesResponse>(
      endpoint
    );
  };


// ==========================================================
// DISCONNECT GMAIL
// ==========================================================

export const disconnectGmail =
  async (): Promise<void> => {

    await apiRequest(
      "/api/connectors/gmail/disconnect",
      {
        method: "POST",
      }
    );
  };