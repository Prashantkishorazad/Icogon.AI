import axios from "axios";
import { supabase } from "../lib/supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Supabase access token to every API request
api.interceptors.request.use(
  async (config) => {
    try {
      const { data } = await supabase.auth.getSession();

      const session = data.session;

      if (session?.access_token) {
        config.headers.Authorization =
          `Bearer ${session.access_token}`;
      }

      console.log(
        "API REQUEST:",
        config.method?.toUpperCase(),
        config.url
      );

    } catch (error) {
      console.error("SESSION ERROR:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API responses/errors
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    console.error(
      "API ERROR:",
      error?.response?.status,
      error?.config?.url,
      error?.response?.data
    );

    if (error?.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;