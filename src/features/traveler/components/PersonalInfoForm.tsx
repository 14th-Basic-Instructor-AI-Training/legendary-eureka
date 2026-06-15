"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button, Form, Input, Label, TextArea } from "@/ui";
import { useSession } from "@/lib/auth";
import { useTravelerStore } from "../store";
import { PersonalInfoSchema, type PersonalInfoFormValues } from "../schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-danger text-sm" role="alert">
      {message}
    </p>
  );
}

/** Settings → personal info (name, email, phone, bio, avatar URL). RHF + Zod. */
export function PersonalInfoForm() {
  const { t } = useTranslation();
  const { role, user } = useSession();
  const profile = useTravelerStore((s) => s.profile);
  const updateProfile = useTravelerStore((s) => s.updateProfile);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: {
      name: profile.name,
      email: user?.email ?? "",
      phone: "",
      bio: profile.bio,
      avatar: profile.avatar,
    },
  });

  const onSubmit = (values: PersonalInfoFormValues) => {
    updateProfile(role, PersonalInfoSchema.parse(values));
    reset(values, { keepIsSubmitSuccessful: true });
  };

  return (
    <Form
      className="flex flex-col gap-5"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pi-name">{t("settings.personalInfo.name")}</Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              id="pi-name"
              aria-invalid={Boolean(errors.name)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pi-email">{t("settings.personalInfo.email")}</Label>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              id="pi-email"
              type="email"
              aria-invalid={Boolean(errors.email)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pi-phone">{t("settings.personalInfo.phone")}</Label>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              id="pi-phone"
              type="tel"
              placeholder={t("settings.personalInfo.phonePlaceholder")}
              aria-invalid={Boolean(errors.phone)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <FieldError message={errors.phone?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pi-avatar">{t("settings.personalInfo.avatar")}</Label>
        <Controller
          control={control}
          name="avatar"
          render={({ field }) => (
            <Input
              id="pi-avatar"
              type="url"
              placeholder="https://…"
              aria-invalid={Boolean(errors.avatar)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <FieldError message={errors.avatar?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pi-bio">{t("settings.personalInfo.bio")}</Label>
        <Controller
          control={control}
          name="bio"
          render={({ field }) => (
            <TextArea
              id="pi-bio"
              maxLength={280}
              aria-invalid={Boolean(errors.bio)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <FieldError message={errors.bio?.message} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" isDisabled={!isDirty} isPending={isSubmitting}>
          {t("settings.personalInfo.save")}
        </Button>
        {isSubmitSuccessful && !isDirty ? (
          <span className="text-success flex items-center gap-1 text-sm">
            <TickCircle size={16} color="currentColor" variant="Bold" />
            {t("settings.saved")}
          </span>
        ) : null}
      </div>
    </Form>
  );
}
