"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button, Form, Label, PasswordInput } from "@/ui";
import { useSession } from "@/lib/auth";
import { useTravelerStore } from "../store";
import { PasswordChangeSchema, type PasswordChangeInput } from "../schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-danger text-sm" role="alert">
      {message}
    </p>
  );
}

/** Settings → change password. Mock in the static phase (guarded, no persistence). */
export function PasswordChangeForm() {
  const { t } = useTranslation();
  const { role } = useSession();
  const changePassword = useTravelerStore((s) => s.changePassword);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(PasswordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = () => {
    changePassword(role);
    reset(
      { currentPassword: "", newPassword: "", confirmPassword: "" },
      { keepIsSubmitSuccessful: true },
    );
  };

  const fields: { name: keyof PasswordChangeInput; label: string }[] = [
    { name: "currentPassword", label: t("settings.password.current") },
    { name: "newPassword", label: t("settings.password.new") },
    { name: "confirmPassword", label: t("settings.password.confirm") },
  ];

  return (
    <Form
      className="flex flex-col gap-5"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      {fields.map(({ name, label }) => (
        <div key={name} className="flex flex-col gap-1.5">
          <Label htmlFor={`pw-${name}`}>{label}</Label>
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <PasswordInput
                id={`pw-${name}`}
                aria-invalid={Boolean(errors[name])}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <FieldError message={errors[name]?.message} />
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" isDisabled={!isDirty} isPending={isSubmitting}>
          {t("settings.password.save")}
        </Button>
        {isSubmitSuccessful && !isDirty ? (
          <span className="text-success flex items-center gap-1 text-sm">
            <TickCircle size={16} color="currentColor" variant="Bold" />
            {t("settings.password.updated")}
          </span>
        ) : null}
      </div>
    </Form>
  );
}
