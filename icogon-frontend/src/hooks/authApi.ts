import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const navigate = useNavigate();

  const {
    user,
    session,
    accessToken,
    isAuthenticated,
    isLoading,
    setSession,
    setLoading,
    logout,
  } = useAuthStore();

  // Session hydration and onAuthStateChange are centralized in App.tsx.
  // Do not create another listener for each login / signup component.

  // ==========================================
  // EMAIL LOGIN
  // ==========================================

  const loginUser = async (
    email: string,
    password: string
  ) => {

    try {

      setLoading(true);

      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(
          "LOGIN ERROR:",
          error
        );

        return {
          success: false,
          error: error.message,
        };
      }

      if (data.session) {
        setSession(data.session);
      }

      console.log(
        "Login successful"
      );

      navigate("/dashboard");

      return {
        success: true,
        data,
      };

    } catch (error) {

      console.error(
        "LOGIN EXCEPTION:",
        error
      );

      return {
        success: false,
        error: "Login failed",
      };

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // EMAIL SIGNUP
  // ==========================================

  const signupUser = async (
    full_name: string,
    email: string,
    password: string
  ) => {

    try {

      setLoading(true);

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password,

        options: {
          data: {
            full_name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {

        console.error(
          "SIGNUP ERROR:",
          error
        );

        return {
          success: false,
          error: error.message,
        };
      }

      if (data.session) {
        setSession(data.session);

        navigate("/dashboard");
      } else {
        navigate("/login");
      }

      console.log(
        "Signup successful"
      );

      return {
        success: true,
        data,
      };

    } catch (error) {

      console.error(
        "SIGNUP EXCEPTION:",
        error
      );

      return {
        success: false,
        error: "Signup failed",
      };

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const logoutUser = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  // ==========================================
  // RETURN
  // ==========================================

  return {
    user,
    session,
    accessToken,

    loginUser,
    signupUser,

    isAuthenticated,
    isLoading,

    logoutUser,
  };
};