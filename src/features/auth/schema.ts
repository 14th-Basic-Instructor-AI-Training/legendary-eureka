import { z } from "zod";

/** The three Jalat roles (guests are simply unauthenticated). */
export const RoleSchema = z.enum(["admin", "agency", "traveler"]);
export type Role = z.infer<typeof RoleSchema>;

/** Full user record as stored in the mock fixtures (includes password). */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: RoleSchema,
});
export type User = z.infer<typeof UserSchema>;

/** What the session holds — never the password. */
export const SessionUserSchema = UserSchema.omit({ password: true });
export type SessionUser = z.infer<typeof SessionUserSchema>;

/** Login form shape — the single source of truth for the form + (future) server validation. */
export const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * What the new account should become. "traveler" registers a normal traveler;
 * "agency" registers a traveler AND files a become-an-agency request that Admin
 * later confirms (the agency-onboarding flow) — the role only flips on approval.
 */
export const AccountTypeSchema = z.enum(["traveler", "agency"]);
export type AccountType = z.infer<typeof AccountTypeSchema>;

// Mirrors the backend rule: at least 8 chars, 1 uppercase letter, and 1 digit.
const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Z]/, "Include at least 1 uppercase letter")
  .regex(/\d/, "Include at least 1 number");

/** Registration form. */
export const RegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
    accountType: AccountTypeSchema,
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, { message: "Please accept the terms to continue" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof RegisterSchema>;

/** One-time code verification (mock 6-digit). */
export const OtpSchema = z.object({
  code: z
    .string()
    .min(1, "Enter the code")
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type OtpInput = z.infer<typeof OtpSchema>;

/** Forgot-password request. */
export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

/** Set-new-password form. */
export const ResetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
