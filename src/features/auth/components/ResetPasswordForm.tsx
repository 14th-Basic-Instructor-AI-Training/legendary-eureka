"use client";

import { useState } from "react";
import { useLocalizedRouter } from "@/lib/locale";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button, Form, PasswordInput } from "@/ui";
import { ResetPasswordSchema, type ResetPasswordInput } from "@/features/auth/schema";
import { resetPassword } from "@/features/auth/data";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    await resetPassword(values);
    setDone(true);
  };

  if (done) {
    return (
      <AuthShell title={t("auth.reset.title")}>
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="bg-success/10 text-success inline-flex h-12 w-12 items-center justify-center rounded-full">
            <TickCircle size={26} color="currentColor" variant="Bold" />
          </span>
          <p className="text-muted text-sm">{t("auth.reset.success")}</p>
          <Button variant="primary" size="lg" fullWidth onPress={() => router.replace("/login")}>
            {t("auth.reset.goToLogin")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("auth.reset.title")} subtitle={t("auth.reset.subtitle")}>
      <Form className="flex flex-col gap-5" validationBehavior="aria" onSubmit={handleSubmit(onSubmit)}>
        <Field id="password" label={t("auth.reset.newPassword")} error={errors.password?.message}>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder={t("auth.passwordPlaceholder")}
                aria-invalid={Boolean(errors.password)}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </Field>

        <Field
          id="confirmPassword"
          label={t("auth.register.confirmPassword")}
          error={errors.confirmPassword?.message}
        >
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                placeholder={t("auth.register.confirmPasswordPlaceholder")}
                aria-invalid={Boolean(errors.confirmPassword)}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </Field>

        <Button type="submit" fullWidth size="lg" isPending={isSubmitting}>
          {isSubmitting ? t("auth.reset.submitting") : t("auth.reset.submit")}
        </Button>
      </Form>
    </AuthShell>
  );
}
