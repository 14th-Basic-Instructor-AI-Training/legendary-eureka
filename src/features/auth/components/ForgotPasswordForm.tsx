"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button, Form, Input } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocalizedRouter } from "@/lib/locale";
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schema";
import { forgotPasswordAction } from "@/features/auth/actions";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    // Always advance to the "sent" screen — the backend never reveals whether
    // the email is registered, and neither should we.
    await forgotPasswordAction(values.email);
    setSent(true);
  };

  const backToLogin = (
    <LocaleLink href="/login" className="text-primary font-medium hover:underline">
      {t("auth.forgot.backToLogin")}
    </LocaleLink>
  );

  if (sent) {
    return (
      <AuthShell title={t("auth.forgot.title")} footer={backToLogin}>
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="bg-success/10 text-success inline-flex h-12 w-12 items-center justify-center rounded-full">
            <TickCircle size={26} color="currentColor" variant="Bold" />
          </span>
          <p className="text-muted text-sm">{t("auth.forgot.sent")}</p>
          <Button variant="primary" size="lg" fullWidth onPress={() => router.push("/login")}>
            {t("auth.forgot.backToLogin")}
          </Button>
        </div>
      </AuthShell>
    );
  }

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
