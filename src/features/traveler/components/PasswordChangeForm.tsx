"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button, Form, Label, PasswordInput } from "@/ui";
import { changePasswordAction } from "../profileActions";
import { PasswordChangeSchema, type PasswordChangeInput } from "../schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-danger text-sm" role="alert">
      {message}
    </p>
  );
}

/** Settings → change password (logged-in). */
export function PasswordChangeForm() {
  const { t } = useTranslation();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(PasswordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (values: PasswordChangeInput) => {
    setSaveError(null);
    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (result.ok) {
        reset(
          { currentPassword: "", newPassword: "", confirmPassword: "" },
          { keepIsSubmitSuccessful: true },
        );
      } else {
        setSaveError(result.error);
      }
    });
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

      {saveError ? <FieldError message={saveError} /> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" isDisabled={!isDirty} isPending={isPending}>
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
