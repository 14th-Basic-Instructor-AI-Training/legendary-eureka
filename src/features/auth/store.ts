import { create } from "zustand";

/** What the pending OTP step is for — account verification or a password reset. */
export type OtpPurpose = "register" | "reset";

/**
 * Minimal auth store — the transient state shared across the OTP-driven flows
 * (register → verify, and forgot-password → verify → set-new-password). Session
 * state (user, role, token) is owned by Auth.js and read via useSession().
 */
interface AuthState {
  /** Email carried from the register/forgot step into OTP verification. Not persisted. */
  pendingEmail: string | null;
  pendingAgencyRequest: boolean;
  /** Distinguishes the verify page's two flows. */
  pendingPurpose: OtpPurpose;
  /** The verified reset OTP, carried from the verify step to the set-new-password step. */
  resetOtp: string | null;
  /** Begin the register → verify flow. */
  setPending: (email: string, agencyRequested: boolean) => void;
  /** Begin the forgot-password → verify → reset flow. */
  startPasswordReset: (email: string) => void;
  /** Record the OTP once the reset code has been verified. */
  setResetOtp: (otp: string) => void;
  clearPending: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  pendingEmail: null,
  pendingAgencyRequest: false,
  pendingPurpose: "register",
  resetOtp: null,
  setPending: (email, agencyRequested) =>
    set({
      pendingEmail: email,
      pendingAgencyRequest: agencyRequested,
      pendingPurpose: "register",
      resetOtp: null,
    }),
  startPasswordReset: (email) =>
    set({
      pendingEmail: email,
      pendingAgencyRequest: false,
      pendingPurpose: "reset",
      resetOtp: null,
    }),
  setResetOtp: (otp) => set({ resetOtp: otp }),
  clearPending: () =>
    set({
      pendingEmail: null,
      pendingAgencyRequest: false,
      pendingPurpose: "register",
      resetOtp: null,
    }),
}));
