import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  accessToken: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  // Identity changes are different from token refreshes. Workspace consumers
  // can use this epoch to invalidate account-scoped asynchronous work.
  sessionEpoch: number;
  isSigningOut: boolean;

  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let pendingLogout: Promise<void> | null = null;

  return {
    user: null,
    session: null,
    accessToken: null,

    isAuthenticated: false,
    isLoading: true,
    sessionEpoch: 0,
    isSigningOut: false,

    setSession: (session) => {
      // Supabase owns session persistence and verification. Do not persist a
      // duplicate copy of tokens in Zustand or workspace snapshots.
      const validSession = session?.user?.id && session.access_token ? session : null;
      set((state) => {
        const user = validSession?.user ?? null;
        const identityChanged = (state.user?.id ?? null) !== (user?.id ?? null);
        return {
          session: validSession,
          user,
          accessToken: validSession?.access_token ?? null,
          isAuthenticated: Boolean(validSession),
          isLoading: false,
          sessionEpoch: state.sessionEpoch + (identityChanged ? 1 : 0),
          isSigningOut: identityChanged ? false : state.isSigningOut,
        };
      });
    },

    setLoading: (loading) => {
      set({
        isLoading: loading,
      });
    },

    logout: () => {
      // One sign-out request at a time. Leave the current identity intact until
      // Supabase confirms sign-out or its existing auth listener clears it.
      if (pendingLogout) return pendingLogout;

      const initialEpoch = get().sessionEpoch;
      const task = Promise.resolve().then(async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          // Never let a late logout completion clear an account that signed in
          // after the original request started. The App auth listener remains
          // the authoritative source of SDK session changes.
          if (get().sessionEpoch === initialEpoch) {
            get().setSession(null);
          }
        } finally {
          pendingLogout = null;
          set({ isSigningOut: false });
        }
      });
      pendingLogout = task;
      set({ isSigningOut: true });
      return task;
    },
  };
});
