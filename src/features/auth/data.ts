import { MOCK_USERS } from "./fixtures";
import {
  SessionUserSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type OtpInput,
  type RegisterInput,
  type ResetPasswordInput,
  type SessionUser,
} from "./schema";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export type LoginResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: "invalid_credentials" };

/**
 * Mock login — the single data seam. Today it matches the seeded fixtures;
 * later this becomes a real route handler / server action with the same signature.
 */
export async function login({ email, password }: LoginInput): Promise<LoginResult> {
  await delay();

  const match = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );

  if (!match) return { ok: false, error: "invalid_credentials" };

  // SessionUserSchema omits password, so parsing strips it from the session payload.
  return { ok: true, user: SessionUserSchema.parse(match) };
}

export type RegisterResult =
  | { ok: true; user: SessionUser; agencyRequested: boolean }
  | { ok: false; error: "email_taken" };

/**
 * Mock registration. A new account is always created as a Traveler; choosing the
 * "agency" account type additionally flags a become-an-agency request (the role
 * only flips once an Admin confirms it — see the agency-onboarding flow). The
 * session is NOT signed in here: the flow continues to OTP verification first.
 */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  await delay();

  const taken = MOCK_USERS.some(
    (u) => u.email.toLowerCase() === input.email.trim().toLowerCase(),
  );
  if (taken) return { ok: false, error: "email_taken" };

  const user = SessionUserSchema.parse({
    id: `u-${input.email.split("@")[0]}`,
    name: input.name,
    email: input.email.trim().toLowerCase(),
    role: "traveler",
  });

  return { ok: true, user, agencyRequested: input.accountType === "agency" };
}

export type OtpResult = { ok: true } | { ok: false; error: "invalid_code" };

/** Mock OTP verification. The demo code is 123456. */
export async function verifyOtp({ code }: OtpInput): Promise<OtpResult> {
  await delay();
  return code === "123456" ? { ok: true } : { ok: false, error: "invalid_code" };
}

export type ForgotPasswordResult = { ok: true } | { ok: false; error: "unknown" };

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResult> {
  try {
    const base =
      (typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_API_BASE_URL
        : process.env.NEXT_API_URL) ?? "http://localhost:8080/api/v1";
    const res = await fetch(`${base}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.email }),
    });
    if (!res.ok && res.status !== 204) return { ok: false, error: "unknown" };
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

export type ResetPasswordResult = { ok: true } | { ok: false; error: "expired_token" };

/** @deprecated Use resetPasswordAction from features/auth/actions instead. */
export async function resetPassword(
  _input: ResetPasswordInput,
): Promise<ResetPasswordResult> {
  return { ok: false, error: "expired_token" };
}
