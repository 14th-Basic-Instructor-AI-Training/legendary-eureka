"use server";

import { resetPassword } from "@/lib/api/authApi";
import { ApiError } from "@/lib/api/client";

export type ResetPasswordActionResult =
  | { ok: true }
  | { ok: false; error: "expired_token" | "unknown"; message?: string };

export async function resetPasswordAction(input: {
  token: string;
  newPassword: string;
}): Promise<ResetPasswordActionResult> {
  try {
    await resetPassword(input);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 400) {
        return { ok: false, error: "expired_token", message: e.message };
      }
      return { ok: false, error: "unknown", message: e.message };
    }
    return { ok: false, error: "unknown" };
  }
}
