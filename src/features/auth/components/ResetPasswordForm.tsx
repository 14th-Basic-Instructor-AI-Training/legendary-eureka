"use client";

import { useState, useTransition } from "react";
import { useLocalizedRouter } from "@/lib/locale";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TickCircle, Warning2 } from "iconsax-reactjs";
import { Button, Form, PasswordInput } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { ResetPasswordSchema, type ResetPasswordInput } from "@/features/auth/schema";
import { resetPasswordAction } from "@/features/auth/actions";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";

type Props = {
  /** The reset token from the email link (`/reset-password?token=…`). */
  token: string | null;
};

export function ResetPasswordForm({ token }: Props) {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (values: ResetPasswordInput) => {
    if (!token) {
      setFormError(t("auth.reset.invalidToken"));
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(token, values.password);
      if (!result.ok) {
        setFormError(
          result.error === "invalid_token"
            ? t("auth.reset.invalidToken")
            : t("auth.reset.serverError"),
        );
        return;
      }
      setDone(true);
    });
  };

  if (!token) {
    return (
      <AuthShell title={t("auth.reset.invalidTitle")}>
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="bg-danger/10 text-danger inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Warning2 size={26} color="currentColor" variant="Bold" />
          </span>
          <p className="text-muted text-sm">{t("auth.reset.invalidToken")}</p>
          <Button variant="primary" size="lg" fullWidth onPress={() => router.push("/forgot-password")}>
            {t("auth.reset.requestNew")}
          </Button>
          <LocaleLink href="/login" className="text-primary text-sm font-medium hover:underline">
            {t("auth.forgot.backToLogin")}
          </LocaleLink>
        </div>
      </AuthShell>
    );
  }

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

        {formError ? (
          <div className="bg-danger/10 text-danger rounded-lg px-3 py-2 text-sm" role="alert">
            {formError}
          </div>
        ) : null}

        <Button type="submit" fullWidth size="lg" isPending={isPending}>
          {isPending ? t("auth.reset.submitting") : t("auth.reset.submit")}
        </Button>
      </Form>
    </AuthShell>
  );
}
