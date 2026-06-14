import { describe, expect, it } from "vitest";
import { OtpSchema, RegisterSchema, ResetPasswordSchema } from "./schema";

const validRegister = {
  name: "Dara",
  email: "dara@example.com",
  password: "password123",
  confirmPassword: "password123",
  accountType: "traveler" as const,
  acceptTerms: true,
};

describe("RegisterSchema", () => {
  it("accepts a well-formed registration", () => {
    expect(RegisterSchema.safeParse(validRegister).success).toBe(true);
  });

  it("rejects mismatched passwords on the confirmPassword field", () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(true);
    }
  });

  it("requires accepting the terms", () => {
    expect(RegisterSchema.safeParse({ ...validRegister, acceptTerms: false }).success).toBe(
      false,
    );
  });

  it("rejects short passwords", () => {
    expect(
      RegisterSchema.safeParse({ ...validRegister, password: "short", confirmPassword: "short" })
        .success,
    ).toBe(false);
  });
});

describe("OtpSchema", () => {
  it("accepts exactly six digits", () => {
    expect(OtpSchema.safeParse({ code: "123456" }).success).toBe(true);
  });

  it("rejects non-6-digit codes", () => {
    expect(OtpSchema.safeParse({ code: "12345" }).success).toBe(false);
    expect(OtpSchema.safeParse({ code: "abcdef" }).success).toBe(false);
  });
});

describe("ResetPasswordSchema", () => {
  it("requires matching passwords", () => {
    expect(
      ResetPasswordSchema.safeParse({ password: "password123", confirmPassword: "password123" })
        .success,
    ).toBe(true);
    expect(
      ResetPasswordSchema.safeParse({ password: "password123", confirmPassword: "nope12345" })
        .success,
    ).toBe(false);
  });
});
