"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalizedRouter } from "@/lib/locale";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button, Form, PasswordInput } from "@/ui";
import { ResetPasswordSchema, type ResetPasswordInput } from "@/features/auth/schema";
import { resetPasswordAction } from "@/features/auth/authActions";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <AuthShell title={t("auth.reset.title")}>
        <p className="text-muted text-center text-sm">{t("auth.reset.invalidLink")}</p>
      </AuthShell>
    );
  }

  const onSubmit = (values: ResetPasswordInput) => {
    setError(null);
    startTransition(async () => {
      const result = await resetPasswordAction({
        token,
        newPassword: values.password,
      });
      if (result.ok) {
        setDone(true);
      } else if (result.error === "expired_token") {
        setError(t("auth.reset.expiredToken"));
      } else {
        setError(result.message ?? t("auth.reset.failed"));
      }
    });
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

        {error ? (
          <p className="text-danger text-sm" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" fullWidth size="lg" isPending={isPending}>
          {isPending ? t("auth.reset.submitting") : t("auth.reset.submit")}
        </Button>
      </Form>
    </AuthShell>
  );
}
