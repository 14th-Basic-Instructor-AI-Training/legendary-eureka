"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Warning2 } from "iconsax-reactjs";
import { Button, Form, Input, Label } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAdminStore } from "../store";
import { SystemSettingsFormSchema, type SystemSettingsFormValues } from "../schema";

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-border border-b pb-3">
      <h3 className="font-semibold">{title}</h3>
      {description ? <p className="text-muted mt-0.5 text-sm">{description}</p> : null}
    </div>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
  danger,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className={["font-medium text-sm cursor-pointer", danger ? "text-danger" : ""].join(" ")}>
          {label}
        </label>
        {description ? <p className="text-muted mt-0.5 text-xs">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2",
          checked
            ? danger
              ? "bg-danger"
              : "bg-primary"
            : "bg-muted/30",
        ].join(" ")}
      >
        <span
          className={[
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export function SystemSettings() {
  const { t } = useTranslation();
  const { role } = useSession();
  const settings = useAdminStore((s) => s.settings);
  const updateSettings = useAdminStore((s) => s.updateSettings);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SystemSettingsFormValues>({
    resolver: zodResolver(SystemSettingsFormSchema),
    defaultValues: {
      commissionRate: String(settings.commissionRate),
      maxPackageDays: String(settings.maxPackageDays),
      minActivityPriceUsd: String(settings.minActivityPriceUsd),
      registrationOpen: settings.registrationOpen,
      bookingEnabled: settings.bookingEnabled,
      maintenanceMode: settings.maintenanceMode,
    },
  });

  useEffect(() => {
    reset({
      commissionRate: String(settings.commissionRate),
      maxPackageDays: String(settings.maxPackageDays),
      minActivityPriceUsd: String(settings.minActivityPriceUsd),
      registrationOpen: settings.registrationOpen,
      bookingEnabled: settings.bookingEnabled,
      maintenanceMode: settings.maintenanceMode,
    });
  }, [settings, reset]);

  const maintenanceMode = watch("maintenanceMode");

  const onSubmit = (values: SystemSettingsFormValues) => {
    updateSettings(role, {
      commissionRate: Number(values.commissionRate),
      maxPackageDays: Number(values.maxPackageDays),
      minActivityPriceUsd: Number(values.minActivityPriceUsd),
      registrationOpen: values.registrationOpen,
      bookingEnabled: values.bookingEnabled,
      maintenanceMode: values.maintenanceMode,
    });
    reset(values);
  };

  return (
    <Form
      className="flex max-w-xl flex-col gap-8"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Section 1: Pricing & Fees */}
      <div className="bg-surface border-border flex flex-col gap-5 rounded-2xl border p-6">
        <SectionHeading
          title={t("admin.settings.sections.pricingFees")}
          description={t("admin.settings.sections.pricingFeesDesc")}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="commissionRate">{t("admin.settings.fields.commissionRate")}</Label>
          <Input
            id="commissionRate"
            type="number"
            min={0}
            max={100}
            step={0.5}
            aria-invalid={Boolean(errors.commissionRate)}
            {...register("commissionRate")}
          />
          {errors.commissionRate ? (
            <p className="text-danger text-sm" role="alert">
              {errors.commissionRate.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="minActivityPriceUsd">
            {t("admin.settings.fields.minActivityPriceUsd")}
          </Label>
          <Input
            id="minActivityPriceUsd"
            type="number"
            min={0}
            step={1}
            aria-invalid={Boolean(errors.minActivityPriceUsd)}
            {...register("minActivityPriceUsd")}
          />
          {errors.minActivityPriceUsd ? (
            <p className="text-danger text-sm" role="alert">
              {errors.minActivityPriceUsd.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* Section 2: Content Policy */}
      <div className="bg-surface border-border flex flex-col gap-5 rounded-2xl border p-6">
        <SectionHeading
          title={t("admin.settings.sections.contentPolicy")}
          description={t("admin.settings.sections.contentPolicyDesc")}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxPackageDays">{t("admin.settings.fields.maxPackageDays")}</Label>
          <Input
            id="maxPackageDays"
            type="number"
            min={1}
            step={1}
            aria-invalid={Boolean(errors.maxPackageDays)}
            {...register("maxPackageDays")}
          />
          {errors.maxPackageDays ? (
            <p className="text-danger text-sm" role="alert">
              {errors.maxPackageDays.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* Section 3: Platform Features */}
      <div className="bg-surface border-border flex flex-col gap-5 rounded-2xl border p-6">
        <SectionHeading
          title={t("admin.settings.sections.platformFeatures")}
          description={t("admin.settings.sections.platformFeaturesDesc")}
        />

        <Controller
          name="registrationOpen"
          control={control}
          render={({ field }) => (
            <ToggleRow
              id="registrationOpen"
              label={t("admin.settings.fields.registrationOpen")}
              description={t("admin.settings.fields.registrationOpenDesc")}
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="bookingEnabled"
          control={control}
          render={({ field }) => (
            <ToggleRow
              id="bookingEnabled"
              label={t("admin.settings.fields.bookingEnabled")}
              description={t("admin.settings.fields.bookingEnabledDesc")}
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="maintenanceMode"
          control={control}
          render={({ field }) => (
            <ToggleRow
              id="maintenanceMode"
              label={t("admin.settings.fields.maintenanceMode")}
              description={t("admin.settings.fields.maintenanceModeDesc")}
              checked={field.value}
              onChange={field.onChange}
              danger
            />
          )}
        />

        {maintenanceMode ? (
          <div className="bg-danger/8 border-danger/20 flex items-start gap-2 rounded-xl border px-4 py-3">
            <Warning2 size={18} color="currentColor" className="text-danger mt-0.5 shrink-0" />
            <p className="text-danger text-sm">{t("admin.settings.maintenanceWarning")}</p>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isDisabled={!isDirty} isPending={isSubmitting}>
          {t("admin.settings.save")}
        </Button>
      </div>
    </Form>
  );
}
