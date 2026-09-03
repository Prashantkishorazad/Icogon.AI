import axios from "axios";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

export interface Profile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
}

export interface ProfileResponse {
  profile: Profile;
}

const getAuthHeaders = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error("Not authenticated. Please login again.");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
};


/**
 * GET /profile
 */
export const getMyProfileApi = async (): Promise<{
  data: ProfileResponse;
}> => {
  const headers = await getAuthHeaders();

  return axios.get<ProfileResponse>(
    `${API_URL}/profile`,
    {
      headers,
    }
  );
};


/**
 * PUT /profile
 */
export const updateProfileApi = async (
  profile: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }
): Promise<{
  data: ProfileResponse;
}> => {
  const headers = await getAuthHeaders();

  return axios.put<ProfileResponse>(
    `${API_URL}/profile`,
    profile,
    {
      headers,
    }
  );
};