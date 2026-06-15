"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button, Form, Input, Label, TextArea } from "@/ui";
import { useSession } from "@/lib/auth";
import { saveTravelerProfileAction, uploadTravelerAvatarAction } from "@/actions/travelerProfile";
import { useTravelerProfileData } from "../context";
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
  const router = useRouter();
  const { user } = useSession();
  const { profile, phone: initialPhone } = useTravelerProfileData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: {
      name: profile.name,
      email: user?.email ?? "",
      phone: initialPhone,
      bio: profile.bio,
      avatar: profile.avatar,
    },
  });

  const onSubmit = (values: PersonalInfoFormValues) => {
    const parsed = PersonalInfoSchema.parse(values);
    setSaveError(null);
    startTransition(async () => {
      const result = await saveTravelerProfileAction({
        name: parsed.name,
        phone: parsed.phone,
        bio: parsed.bio,
        avatarUrl: parsed.avatar || undefined,
      });
      if (result.ok) {
        reset(values, { keepIsSubmitSuccessful: true });
        router.refresh();
      } else {
        setSaveError(result.error);
      }
    });
  };

  const onAvatarSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    setSaveError(null);
    startTransition(async () => {
      const result = await uploadTravelerAvatarAction(formData);
      if (result.ok) {
        router.refresh();
      } else {
        setSaveError(result.error);
      }
    });
    e.target.value = "";
  };

  return (
    <Form
      className="flex flex-col gap-5"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onAvatarSelected}
      />

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
              readOnly
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
        <div className="flex flex-wrap items-center gap-2">
          <Controller
            control={control}
            name="avatar"
            render={({ field }) => (
              <Input
                id="pi-avatar"
                type="url"
                placeholder="https://…"
                className="min-w-0 flex-1"
                aria-invalid={Boolean(errors.avatar)}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onPress={() => fileInputRef.current?.click()}
            isPending={isPending}
          >
            {t("settings.personalInfo.upload")}
          </Button>
        </div>
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

      {saveError ? <FieldError message={saveError} /> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" isDisabled={!isDirty} isPending={isPending}>
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
