"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Buildings, Routing } from "iconsax-reactjs";
import { Button, Checkbox, Form, Input, PasswordInput } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocalizedRouter } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { RegisterSchema, type AccountType, type RegisterInput } from "@/features/auth/schema";
import { register as registerAccount } from "@/features/auth/data";
import { useAuthStore } from "@/features/auth/store";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";

const ACCOUNT_TYPES: { value: AccountType; labelKey: string; Icon: typeof Routing }[] = [
  { value: "traveler", labelKey: "auth.register.accountTypeTraveler", Icon: Routing },
  { value: "agency", labelKey: "auth.register.accountTypeAgency", Icon: Buildings },
];

export function RegisterForm() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const setPending = useAuthStore((s) => s.setPending);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      accountType: "traveler",
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    const result = await registerAccount(values);
    if (!result.ok) {
      setFormError(t("auth.register.emailTaken"));
      return;
    }
    setPending(result.user, result.agencyRequested);
    router.push("/verify-otp");
  };

  return (
    <AuthShell
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      footer={
        <span className="text-muted">
          {t("auth.register.haveAccount")}{" "}
          <LocaleLink href="/login" className="text-primary font-medium hover:underline">
            {t("auth.register.signIn")}
          </LocaleLink>
        </span>
      }
    >
      <Form className="flex flex-col gap-5" validationBehavior="aria" onSubmit={handleSubmit(onSubmit)}>
        <Field id="name" label={t("auth.register.name")} error={errors.name?.message}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                id="name"
                autoComplete="name"
                placeholder={t("auth.register.namePlaceholder")}
                aria-invalid={Boolean(errors.name)}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </Field>

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

        <Field id="password" label={t("auth.password")} error={errors.password?.message}>
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

        <Controller
          control={control}
          name="accountType"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t("auth.register.accountTypeLabel")}</span>
              <div className="grid grid-cols-2 gap-2">
                {ACCOUNT_TYPES.map(({ value, labelKey, Icon }) => {
                  const active = field.value === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted hover:text-foreground",
                      )}
                    >
                      <Icon size={18} color="currentColor" variant={active ? "Bold" : "Linear"} />
                      {t(labelKey)}
                    </button>
                  );
                })}
              </div>
              {field.value === "agency" ? (
                <p className="text-muted text-xs">{t("auth.register.agencyHint")}</p>
              ) : null}
            </div>
          )}
        />

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <Checkbox
              isSelected={field.value}
              onChange={field.onChange}
              name={field.name}
              isInvalid={Boolean(errors.acceptTerms)}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content className="text-muted text-sm">
                {t("auth.register.acceptTerms")}
              </Checkbox.Content>
            </Checkbox>
          )}
        />
        {errors.acceptTerms ? (
          <p className="text-danger -mt-3 text-sm" role="alert">
            {errors.acceptTerms.message}
          </p>
        ) : null}

        {formError ? (
          <div className="bg-danger/10 text-danger rounded-lg px-3 py-2 text-sm" role="alert">
            {formError}
          </div>
        ) : null}

        <Button type="submit" fullWidth size="lg" isPending={isSubmitting}>
          {isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
        </Button>
      </Form>
    </AuthShell>
  );
}
