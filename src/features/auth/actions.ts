"use server";

import type { AccountType } from "@/features/auth/schema";

const API = process.env.NEXT_API_URL ?? "http://localhost:8080/api/v1";

// ── Register ──────────────────────────────────────────────────────────────────

export type RegisterActionResult =
  | { ok: true }
  | { ok: false; error: "email_taken" | "server_error" };

export async function registerAction(
  name: string,
  email: string,
  password: string,
  accountType: AccountType,
): Promise<RegisterActionResult> {
  let res: Response;
  try {
    res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role: accountType === "agency" ? "TOUR_AGENCY" : "TRAVELER",
      }),
    });
  } catch {
    return { ok: false, error: "server_error" };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg: string = body?.message ?? "";
    if (res.status === 409 || msg.toLowerCase().includes("email")) {
      return { ok: false, error: "email_taken" };
    }
    return { ok: false, error: "server_error" };
  }

  return { ok: true };
}

// ── OTP verification ──────────────────────────────────────────────────────────

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; error: "invalid_code" | "server_error" };

/**
 * Verifies the OTP against the backend, activating the account. The caller then
 * sends the user to the login page to sign in.
 */
export async function verifyOtpAction(email: string, otp: string): Promise<OtpVerifyResult> {
  let res: Response;
  try {
    res = await fetch(`${API}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
  } catch {
    return { ok: false, error: "server_error" };
  }

  if (!res.ok) {
    return { ok: false, error: "invalid_code" };
  }

  return { ok: true };
}

// ── Resend OTP ────────────────────────────────────────────────────────────────

export async function resendOtpAction(email: string): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`${API}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

// ── Forgot / reset password ──────────────────────────────────────────────────

/**
 * Request a password-reset email. Always reports success so the UI never reveals
 * whether an email is registered (the backend responds the same way).
 */
export async function forgotPasswordAction(email: string): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`${API}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export type ResetPasswordActionResult =
  | { ok: true }
  | { ok: false; error: "invalid_token" | "server_error" };

/** Set a new password using the `token` from the reset email link. */
export async function resetPasswordAction(
  token: string,
  newPassword: string,
): Promise<ResetPasswordActionResult> {
  let res: Response;
  try {
    res = await fetch(`${API}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
  } catch {
    return { ok: false, error: "server_error" };
  }

  if (!res.ok) {
    // 400 = invalid/expired token (or a password the backend rejected).
    return { ok: false, error: res.status === 400 ? "invalid_token" : "server_error" };
  }

  return { ok: true };
}
