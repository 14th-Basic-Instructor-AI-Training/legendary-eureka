import { create } from "zustand";

/**
 * Minimal auth store — only the transient state needed for the register → OTP
 * sign-up flow. Session state (user, role, token) is now owned by Auth.js and
 * read via useSession() from @/lib/auth.
 */
interface AuthState {
  /** Email carried from the Register step to OTP verification. Not persisted. */
  pendingEmail: string | null;
  pendingAgencyRequest: boolean;
  setPending: (email: string, agencyRequested: boolean) => void;
  clearPending: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  pendingEmail: null,
  pendingAgencyRequest: false,
  setPending: (email, agencyRequested) =>
    set({ pendingEmail: email, pendingAgencyRequest: agencyRequested }),
  clearPending: () => set({ pendingEmail: null, pendingAgencyRequest: false }),
}));
