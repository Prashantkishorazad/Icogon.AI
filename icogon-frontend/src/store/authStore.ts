import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  accessToken: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  accessToken: null,

  isAuthenticated: false,
  isLoading: true,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      isAuthenticated: !!session,
      isLoading: false,
    });
  },

  setLoading: (loading) => {
    set({
      isLoading: loading,
    });
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
      }
    } finally {
      set({
        user: null,
        session: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));