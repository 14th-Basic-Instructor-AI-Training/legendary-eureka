"use client";

import { useEffect, useState } from "react";
import { useLocalizedRouter } from "@/lib/locale";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Form, InputOTP, REGEXP_ONLY_DIGITS } from "@/ui";
import { OtpSchema, type OtpInput } from "@/features/auth/schema";
import { verifyOtpAction, resendOtpAction } from "@/features/auth/actions";
import { useAuthStore } from "@/features/auth/store";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";

/** Seconds the user must wait before they can request a new OTP. */
const RESEND_COOLDOWN = 60;

export function VerifyOtpForm() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const clearPending = useAuthStore((s) => s.clearPending);
  const [formError, setFormError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);

  // Tick the resend cooldown down to zero, one second at a time.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpInput>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values: OtpInput) => {
    if (!pendingEmail) {
      // Pending email was lost (page refresh) — send back to login.
      router.replace("/login");
      return;
    }
    setFormError(null);
    const result = await verifyOtpAction(pendingEmail, values.code);
    if (!result.ok) {
      setFormError(
        result.error === "invalid_code" ? t("auth.otp.invalid") : t("auth.otp.serverError"),
      );
      return;
    }
    // Account verified — send the user to the login page to sign in.
    clearPending();
    router.replace("/login");
  };

  const handleResend = async () => {
    if (!pendingEmail || resending || secondsLeft > 0) return;
    setResending(true);
    await resendOtpAction(pendingEmail);
    setResending(false);
    setSecondsLeft(RESEND_COOLDOWN);
  };

  return (
    <AuthShell
      title={t("auth.otp.title")}
      subtitle={t("auth.otp.subtitle", { email: pendingEmail ?? "" })}
    >
      <Form className="flex flex-col gap-5" validationBehavior="aria" onSubmit={handleSubmit(onSubmit)}>
        <Field id="code" label={t("auth.otp.codeLabel")} error={errors.code?.message}>
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                autoFocus
                isInvalid={Boolean(errors.code)}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <InputOTP.Group>
                  <InputOTP.Slot index={0} />
                  <InputOTP.Slot index={1} />
                  <InputOTP.Slot index={2} />
                </InputOTP.Group>
                <InputOTP.Separator />
                <InputOTP.Group>
                  <InputOTP.Slot index={3} />
                  <InputOTP.Slot index={4} />
                  <InputOTP.Slot index={5} />
                </InputOTP.Group>
              </InputOTP>
            )}
          />
        </Field>

        {formError ? (
          <div className="bg-danger/10 text-danger rounded-lg px-3 py-2 text-sm" role="alert">
            {formError}
          </div>
        ) : null}

        <Button type="submit" fullWidth size="lg" isPending={isSubmitting}>
          {isSubmitting ? t("auth.otp.submitting") : t("auth.otp.submit")}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || secondsLeft > 0}
            className="text-primary font-medium hover:underline disabled:opacity-60"
          >
            {resending
              ? t("auth.otp.resending")
              : secondsLeft > 0
                ? t("auth.otp.resendIn", { seconds: secondsLeft })
                : t("auth.otp.resend")}
          </button>
          <span className="text-muted text-xs">{t("auth.otp.demoHint")}</span>
        </div>
      </Form>
    </AuthShell>
  );
}
