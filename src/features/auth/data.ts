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

/**
 * Mock "send reset code". Always succeeds (we don't reveal whether an email
 * exists — same UX a real backend should use).
 */
export async function requestPasswordReset(
  _input: ForgotPasswordInput,
): Promise<ForgotPasswordResult> {
  await delay();
  return { ok: true };
}

export type ResetPasswordResult = { ok: true } | { ok: false; error: "expired_token" };

/** Mock set-new-password. */
export async function resetPassword(
  _input: ResetPasswordInput,
): Promise<ResetPasswordResult> {
  await delay();
  return { ok: true };
}
