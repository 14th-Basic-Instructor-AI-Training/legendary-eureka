"use client";

import { useState } from "react";
import { useLocalizedRouter } from "@/lib/locale";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Form, Input } from "@/ui";
import { OtpSchema, type OtpInput } from "@/features/auth/schema";
import { verifyOtp } from "@/features/auth/data";
import { useAuthStore } from "@/features/auth/store";
import { homePathFor } from "@/lib/permissions";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";

export function VerifyOtpForm() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const pendingUser = useAuthStore((s) => s.pendingUser);
  const signIn = useAuthStore((s) => s.signIn);
  const clearPending = useAuthStore((s) => s.clearPending);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpInput>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values: OtpInput) => {
    setFormError(null);
    const result = await verifyOtp(values);
    if (!result.ok) {
      setFormError(t("auth.otp.invalid"));
      return;
    }
    // Sign the pending registration in. If the pending state was lost (e.g. a
    // page refresh — it isn't persisted), fall back to the login screen.
    if (pendingUser) {
      signIn(pendingUser);
      clearPending();
      router.replace(homePathFor(pendingUser.role));
    } else {
      router.replace("/login");
    }
  };

  return (
    <AuthShell
      title={t("auth.otp.title")}
      subtitle={t("auth.otp.subtitle", { email: pendingUser?.email ?? "" })}
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
          <button type="button" className="text-primary font-medium hover:underline">
            {t("auth.otp.resend")}
          </button>
          <span className="text-muted text-xs">{t("auth.otp.demoHint")}</span>
        </div>
      </Form>
    </AuthShell>
  );
}
