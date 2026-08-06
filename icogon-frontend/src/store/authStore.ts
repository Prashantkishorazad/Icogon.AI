import { create } from "zustand";

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

const storedToken = localStorage.getItem("access_token");
const storedUser = localStorage.getItem("user");

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,

  accessToken: storedToken,

  isAuthenticated: !!storedToken,

  isLoading: false,

  login: (token, user) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    set({
      accessToken: token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));