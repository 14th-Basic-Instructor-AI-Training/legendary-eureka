"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Form, Input } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocalizedRouter } from "@/lib/locale";
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schema";
import { forgotPasswordAction } from "@/actions/auth";
import { useAuthStore } from "@/features/auth/store";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const startPasswordReset = useAuthStore((s) => s.startPasswordReset);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    // Fire the request, then always advance to the OTP step — the backend is
    // silent on whether the email is registered, and so are we.
    await forgotPasswordAction(values.email);
    startPasswordReset(values.email);
    router.push("/verify-otp");
  };

  const backToLogin = (
    <LocaleLink href="/login" className="text-primary font-medium hover:underline">
      {t("auth.forgot.backToLogin")}
    </LocaleLink>
  );

  return (
    <AuthShell
      title={t("auth.forgot.title")}
      subtitle={t("auth.forgot.subtitle")}
      footer={backToLogin}
    >
      <Form className="flex flex-col gap-5" validationBehavior="aria" onSubmit={handleSubmit(onSubmit)}>
        <Field id="email" label={t("auth.email")} error={errors.email?.message}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                aria-invalid={Boolean(errors.email)}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </Field>

        <Button type="submit" fullWidth size="lg" isPending={isSubmitting}>
          {isSubmitting ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
        </Button>
      </Form>
    </AuthShell>
  );
}
