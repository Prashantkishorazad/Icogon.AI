
import { supabase } from "../../lib/supabase";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

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
  next_page_token?: string | null;
  result_size_estimate?: number | null;
}

export interface GmailProfileResponse {
  email_address: string;
  messages_total?: number | null;
  threads_total?: number | null;
  history_id?: string | null;
}

export interface GmailStatusResponse {
  connected: boolean;
  email?: string | null;
  provider?: string;
}

interface GmailAuthorizationResponse {
  authorization_url: string;
}

const getAccessToken = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error("Unable to retrieve your login session.");
  }

  const token = data.session?.access_token;

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return token;
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getAccessToken();

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const data = await response.json();

      if (typeof data?.detail === "string") {
        message = data.detail;
      } else if (typeof data?.message === "string") {
        message = data.message;
      }
    } catch {
      // Retain the default HTTP error.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const connectGmail = async (): Promise<void> => {
  const result =
    await apiRequest<GmailAuthorizationResponse>(
      "/api/connectors/gmail/connect"
    );

  if (!result.authorization_url) {
    throw new Error("Google authorization URL was not returned.");
  }

  const authorizationUrl = new URL(result.authorization_url);

  if (
    authorizationUrl.protocol !== "https:" ||
    authorizationUrl.hostname !== "accounts.google.com"
  ) {
    throw new Error("Invalid Google authorization URL.");
  }

  window.location.assign(authorizationUrl.toString());
};

export const getGmailStatus = async (): Promise<GmailStatusResponse> =>
  apiRequest<GmailStatusResponse>(
    "/api/connectors/gmail/status"
  );

export const getGmailProfile = async (): Promise<GmailProfileResponse> =>
  apiRequest<GmailProfileResponse>(
    "/api/connectors/gmail/profile"
  );

export const getGmailMessages = async (
  query?: string
): Promise<GmailMessagesResponse> => {
  const params = new URLSearchParams();

  if (query?.trim()) {
    params.set("q", query.trim());
  }

  const queryString = params.toString();

  const endpoint = queryString
    ? `/api/connectors/gmail/messages?${queryString}`
    : "/api/connectors/gmail/messages";

  return apiRequest<GmailMessagesResponse>(endpoint);
};

export const disconnectGmail = async (): Promise<void> => {
  await apiRequest<void>(
    "/api/connectors/gmail/disconnect",
    {
      method: "DELETE",
    }
  );
};
