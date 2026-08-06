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

  const loginUser = async (
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);

      const response = await loginApi({
        email,
        password,
      });

      const token = response.data.access_token;

      const profile = await getProfileApi();

      login(token, profile.data);

      navigate("/dashboard");

      return {
        success: true,
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const signupUser = async (
    full_name: string,
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);

      await signupApi({
        full_name,
        email,
        password,
      });

      navigate("/login");

      return {
        success: true,
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    logout();
    navigate("/login");
  };

  const fetchProfile = async () => {
    try {
      const response = await getProfileApi();

      setUser(response.data);
    } catch {
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