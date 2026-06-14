"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { signIn } from "next-auth/react";
import { Button, Card, Form, Input, Label, PasswordInput } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { LoginSchema, type LoginInput } from "@/features/auth/schema";
import { DEMO_CREDENTIALS } from "@/features/auth/fixtures";
import { useSession } from "@/lib/auth";
import { homePathFor } from "@/lib/permissions";
import { useLocalizedRouter } from "@/lib/locale";

export function LoginForm() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const { user, hasHydrated } = useSession();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Already signed in → bounce to the role dashboard.
  useEffect(() => {
    if (hasHydrated && user) router.replace(homePathFor(user.role));
  }, [hasHydrated, user, router]);

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });
    if (!result || result.error || !result.ok) {
      setFormError(t("auth.invalid"));
      return;
    }
    // auth/callback reads the session role and redirects to the correct dashboard.
    router.replace("/auth/callback");
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
    setFormError(null);
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-primary mt-6 text-2xl font-semibold tracking-tight">
          {t("auth.title")}
        </h1>
        <p className="text-muted mt-1 text-sm">{t("auth.subtitle")}</p>
      </div>

      <Card variant="default" className="bg-surface rounded-2xl p-6 shadow-primary">
        <Form className="flex flex-col gap-5" validationBehavior="aria" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
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
            {errors.email ? (
              <p className="text-danger text-sm" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder={t("auth.passwordPlaceholder")}
                  aria-invalid={Boolean(errors.password)}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            {errors.password ? (
              <p className="text-danger text-sm" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="-mt-2 text-right">
            <LocaleLink
              href="/forgot-password"
              className="text-primary text-sm font-medium hover:underline"
            >
              {t("auth.forgotLink")}
            </LocaleLink>
          </div>

          {formError ? (
            <div
              className="bg-danger/10 text-danger rounded-lg px-3 py-2 text-sm"
              role="alert"
            >
              {formError}
            </div>
          ) : null}

          <Button type="submit" fullWidth size="lg" isPending={isSubmitting}>
            {isSubmitting ? t("auth.signingIn") : t("auth.submit")}
          </Button>
        </Form>
      </Card>

      <div className="mt-6">
        <p className="text-muted mb-2 text-center text-xs font-medium tracking-wide uppercase">
          {t("auth.demoTitle")}
        </p>
        <div className="flex flex-col gap-2">
          {DEMO_CREDENTIALS.map((c) => (
            <Button
              key={c.email}
              type="button"
              variant="tertiary"
              fullWidth
              onPress={() => fillDemo(c.email, c.password)}
              className="h-auto justify-between px-3 py-2"
            >
              <span className="font-medium">{t(`roles.${c.role}`)}</span>
              <span className="text-muted font-mono text-xs">
                {c.email} · {c.password}
              </span>
            </Button>
          ))}
        </div>
        <p className="text-muted mt-2 text-center text-xs">{t("auth.demoHint")}</p>
      </div>

      <p className="text-muted mt-6 text-center text-sm">
        {t("auth.noAccount")}{" "}
        <LocaleLink href="/register" className="text-primary font-medium hover:underline">
          {t("auth.createAccount")}
        </LocaleLink>
      </p>
    </div>
  );
}
