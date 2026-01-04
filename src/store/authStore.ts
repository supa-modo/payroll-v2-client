import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

interface User {
  id: string;
  tenantId: string | null;
  role: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isSystemAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: { email: string; password: string }) => Promise<{
    success: boolean;
    error?: string;
    user?: User;
  }>;
  register: (data: {
    organizationName: string;
    organizationSlug: string;
    organizationEmail?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/login", credentials);
          const { user, accessToken, refreshToken } = response.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

          return { success: true, user };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error || error.message || "Login failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          const currentState = get();
          if (currentState.isLoading) {
            set({ isLoading: false });
          }
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/register", data);
          const { user, accessToken, refreshToken } = response.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

          return { success: true, user };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error || error.message || "Registration failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          const currentState = get();
          if (currentState.isLoading) {
            set({ isLoading: false });
          }
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        delete api.defaults.headers.common["Authorization"];
      },

      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "payroll-auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

