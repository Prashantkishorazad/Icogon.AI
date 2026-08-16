import api from "./axios";

export interface CreateProfileData {
  full_name: string;
  phone?: string;
  avatar_url?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

// GET MY PROFILE
export const getMyProfileApi = () => {
  return api.get("/user/me");
};

// CREATE PROFILE
export const createProfileApi = (
  data: CreateProfileData
) => {
  return api.post("/user/profile", data);
};

// UPDATE PROFILE
export const updateProfileApi = (
  data: UpdateProfileData
) => {
  return api.put("/user/profile", data);
};