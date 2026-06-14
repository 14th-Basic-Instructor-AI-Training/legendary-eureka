"use client";

import { useState } from "react";
import { useLocalizedRouter, useLocale } from "@/lib/locale";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Form, Input } from "@/ui";
import { OtpSchema, type OtpInput } from "@/features/auth/schema";
import { verifyOtpAndSignIn, resendOtpAction } from "@/features/auth/actions";
import { useAuthStore } from "@/features/auth/store";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";

export function VerifyOtpForm() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const locale = useLocale();
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const clearPending = useAuthStore((s) => s.clearPending);
  const [formError, setFormError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

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
    // On success, the server action throws NEXT_REDIRECT (navigates to auth/callback).
    // On failure, it returns { ok: false, error }.
    const result = await verifyOtpAndSignIn(pendingEmail, values.code, locale);
    if (!result.ok) {
      setFormError(
        result.error === "invalid_code" ? t("auth.otp.invalid") : t("auth.otp.serverError"),
      );
    } else {
      // Unreachable when signIn succeeds (NEXT_REDIRECT fires) — clear state for safety.
      clearPending();
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    await resendOtpAction(pendingEmail);
    setResending(false);
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
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder={t("auth.otp.codePlaceholder")}
                aria-invalid={Boolean(errors.code)}
                className="text-center text-lg tracking-[0.5em]"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
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
            disabled={resending}
            className="text-primary font-medium hover:underline disabled:opacity-60"
          >
            {resending ? t("auth.otp.resending") : t("auth.otp.resend")}
          </button>
          <span className="text-muted text-xs">{t("auth.otp.demoHint")}</span>
        </div>
      </Form>
    </AuthShell>
  );
}
