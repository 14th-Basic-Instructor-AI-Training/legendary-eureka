"use server";

import { signIn } from "@/auth";
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

// ── OTP verification + auto sign-in ──────────────────────────────────────────

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; error: "invalid_code" | "server_error" };

/**
 * Verifies the OTP against the backend, then signs the user in immediately.
 * On success this function never returns — Auth.js throws NEXT_REDIRECT,
 * which Next.js resolves as a browser navigation to the callback page.
 */
export async function verifyOtpAndSignIn(
  email: string,
  otp: string,
  locale: string,
): Promise<OtpVerifyResult> {
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

  const data = (await res.json()).data;

  try {
    await signIn("credentials", {
      email: data.email,
      _verifiedAccessToken: data.accessToken,
      _refreshToken: data.refreshToken,
      redirectTo: `/${locale}/auth/callback`,
    });
  } catch (e) {
    // Auth.js signals a successful redirect by throwing NEXT_REDIRECT — re-throw it
    // so Next.js can issue the 302. Any other error means sign-in failed.
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const msg = String(e);
    if (msg.includes("NEXT_REDIRECT")) throw e;
    return { ok: false, error: "server_error" };
  }

  // Unreachable (signIn with redirectTo always throws NEXT_REDIRECT on success)
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
