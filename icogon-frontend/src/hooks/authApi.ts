import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

import {
  loginApi,
  signupApi,
  getProfileApi,
} from "../api/authApi";

export const useAuth = () => {
  const navigate = useNavigate();

  const {
    login,
    logout,
    setUser,
    isAuthenticated,
    user,
    isLoading,
    setLoading,
  } = useAuthStore();

  // LOGIN
  const loginUser = async (
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);

      console.log("LOGIN: Sending request...");

      // Login API
      const response = await loginApi({
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      const token = response.data.access_token;

      if (!token) {
        throw new Error(
          "Backend did not return access_token"
        );
      }

      console.log("TOKEN RECEIVED");

      // Save token before calling /auth/me
      localStorage.setItem(
        "access_token",
        token
      );

      // Get user profile
      const profile = await getProfileApi();

      console.log(
        "PROFILE RESPONSE:",
        profile.data
      );

      // Save authentication state
      login(
        token,
        profile.data
      );

      // Redirect
      navigate("/dashboard");

      return {
        success: true,
      };

    } catch (error: any) {
      console.error(
        "========== LOGIN ERROR =========="
      );

      console.error(error);

      if (error?.response) {
        console.error(
          "STATUS:",
          error.response.status
        );

        console.error(
          "DATA:",
          error.response.data
        );
      }

      console.error(
        "================================="
      );

      return {
        success: false,
      };

    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const signupUser = async (
    full_name: string,
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);

      console.log("SIGNUP: Sending request...");

      await signupApi({
        full_name,
        email,
        password,
      });

      console.log("SIGNUP SUCCESS");

      navigate("/login");

      return {
        success: true,
      };

    } catch (error: any) {
      console.error(
        "========== SIGNUP ERROR =========="
      );

      console.error(error);

      if (error?.response) {
        console.error(
          "STATUS:",
          error.response.status
        );

        console.error(
          "DATA:",
          error.response.data
        );
      }

      console.error(
        "=================================="
      );

      return {
        success: false,
      };

    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logoutUser = () => {
    logout();
    navigate("/login");
  };

  // FETCH PROFILE
  const fetchProfile = async () => {
    try {
      const response =
        await getProfileApi();

      setUser(response.data);

    } catch (error) {
      console.error(
        "PROFILE ERROR:",
        error
      );

      logout();
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,

    loginUser,
    signupUser,

    logoutUser,
    fetchProfile,
  };
};