import { apiFetch } from "@/lib/api/client";
import type { AuthResponse, MfaSetupResponse } from "@/lib/api/authApi";

export function forgotPassword(email: string): Promise<void> {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export function resetPassword(body: {
  token: string;
  newPassword: string;
}): Promise<void> {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body,
    auth: false,
  });
}

export function changePassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return apiFetch("/auth/change-password", {
    method: "POST",
    body,
  });
}

export function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  return apiFetch("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}

export function logout(refreshToken: string): Promise<void> {
  return apiFetch("/auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}

export function setupMfa(): Promise<MfaSetupResponse> {
  return apiFetch("/auth/mfa/setup", { method: "POST" });
}

export function confirmMfa(code: string): Promise<void> {
  return apiFetch("/auth/mfa/confirm", { method: "POST", body: { code } });
}

export function verifyMfa(mfaToken: string, code: string): Promise<AuthResponse> {
  return apiFetch("/auth/mfa/verify", {
    method: "POST",
    body: { mfaToken, code },
    auth: false,
  });
}

export function disableMfa(password: string): Promise<void> {
  return apiFetch("/auth/mfa/disable", { method: "POST", body: { password } });
}
