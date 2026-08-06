import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export const loginApi = (data: LoginRequest) =>
  api.post("/auth/login", data);

export const signupApi = (data: SignupRequest) =>
  api.post("/auth/signup", data);

export const forgotPasswordApi = (email: string) =>
  api.post("/auth/forgot-password", {
    email,
  });

export const getProfileApi = () =>
  api.get("/auth/me");

export const logoutApi = () =>
  api.post("/auth/logout");