import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionUser } from "./schema";

interface AuthState {
  user: SessionUser | null;
  /** True once the persisted session has rehydrated from localStorage. */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
  /**
   * Transient registration carried from the Register step to OTP verification.
   * Not persisted — it lives only for the duration of the sign-up flow.
   */
  pendingUser: SessionUser | null;
  pendingAgencyRequest: boolean;
  setPending: (user: SessionUser, agencyRequested: boolean) => void;
  clearPending: () => void;
}

/**
 * Mock session store — stands in for a real Auth.js session/JWT.
 * Persisted to localStorage so a refresh keeps the user signed in.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      pendingUser: null,
      pendingAgencyRequest: false,
      setPending: (user, agencyRequested) =>
        set({ pendingUser: user, pendingAgencyRequest: agencyRequested }),
      clearPending: () => set({ pendingUser: null, pendingAgencyRequest: false }),
    }),
    {
      name: "jalat-session",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
