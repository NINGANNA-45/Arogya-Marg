import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setHydrated: (val: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      setHydrated: (val: boolean) => set({ isHydrated: val }),
      login: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("am_token", token);
          localStorage.setItem("am_user", JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true, isHydrated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("am_token");
          localStorage.removeItem("am_user");
        }
        set({ user: null, token: null, isAuthenticated: false, isHydrated: true });
      },
    }),
    {
      name: "am-auth",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
