"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Warning2 } from "iconsax-reactjs";
import { Button, Form, Input, Label, useConfirm } from "@/ui";
import { updateSettingsAction } from "@/actions/admin";
import type { SystemSettingsResponse } from "@/lib/api/admin";
import {
  SystemSettingsFormSchema,
  type SystemSettingsFormValues,
} from "../schema";

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-border border-b pb-3">
      <h3 className="font-semibold">{title}</h3>
      {description ? (
        <p className="text-muted mt-0.5 text-sm">{description}</p>
      ) : null}
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
        <label
          htmlFor={id}
          className={[
            "font-medium text-sm cursor-pointer",
            danger ? "text-danger" : "",
          ].join(" ")}
        >
          {label}
        </label>
        {description ? (
          <p className="text-muted mt-0.5 text-xs">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2",
          checked ? (danger ? "bg-danger" : "bg-primary") : "bg-muted/30",
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

const toFormValues = (s: SystemSettingsResponse): SystemSettingsFormValues => ({
  commissionRate: String(s.commissionRate),
  registrationOpen: s.registrationOpen,
  bookingEnabled: s.bookingEnabled,
  maintenanceMode: s.maintenanceMode,
  destinationCreationEnabled: s.destinationCreationEnabled,
  tourCreationEnabled: s.tourCreationEnabled,
  reportingEnabled: s.reportingEnabled,
});

type Props = { initial: SystemSettingsResponse | null };

export function SystemSettings({ initial }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const confirm = useConfirm();
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SystemSettingsFormValues>({
    resolver: zodResolver(SystemSettingsFormSchema),
    defaultValues: initial
      ? toFormValues(initial)
      : {
          commissionRate: "0",
          registrationOpen: true,
          bookingEnabled: true,
          maintenanceMode: false,
          destinationCreationEnabled: true,
          tourCreationEnabled: true,
          reportingEnabled: true,
        },
  });

  useEffect(() => {
    if (initial) reset(toFormValues(initial));
  }, [initial, reset]);

  const maintenanceMode = watch("maintenanceMode");

  // The settings fetch failed server-side — offer a retry that re-runs it.
  if (!initial) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="bg-danger/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
          <Warning2 size={22} color="currentColor" className="text-danger" />
        </span>
        <p className="text-muted text-sm">{t("admin.settings.loadError")}</p>
        <Button variant="primary" size="sm" onPress={() => router.refresh()}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  // RHF validates first, then we confirm before the write actually happens. The
  // dialog owns its own loading spinner while the save runs.
  const onSubmit = (values: SystemSettingsFormValues) => {
    setFeedback(null);
    confirm({
      title: t("admin.settings.confirmTitle"),
      description: t("admin.settings.confirmDescription"),
      intent: values.maintenanceMode ? "danger" : "primary",
      confirmLabel: t("admin.settings.save"),
      onConfirm: async () => {
        const res = await updateSettingsAction({
          commissionRate: Number(values.commissionRate),
          registrationOpen: values.registrationOpen,
          bookingEnabled: values.bookingEnabled,
          maintenanceMode: values.maintenanceMode,
          destinationCreationEnabled: values.destinationCreationEnabled,
          tourCreationEnabled: values.tourCreationEnabled,
          reportingEnabled: values.reportingEnabled,
        });
        if (res.ok) {
          setFeedback({ kind: "success", message: t("admin.settings.saved") });
          reset(values);
          router.refresh();
        } else {
          setFeedback({
            kind: "error",
            message: t("admin.settings.saveError"),
          });
        }
      },
    });
  };

  return (
    <Form
      className="flex w-full flex-col gap-8"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Section 1: Pricing & Fees */}
      <div className="w-full bg-surface border-border flex flex-col gap-5 rounded-2xl border p-6">
        <SectionHeading
          title={t("admin.settings.sections.pricingFees")}
          description={t("admin.settings.sections.pricingFeesDesc")}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="commissionRate">
            {t("admin.settings.fields.commissionRate")}
          </Label>
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
      </div>

      <div className="flex justify-between gap-6">
        {/* Section 2: Platform Features */}
        <div className="w-full bg-surface border-border flex flex-col gap-5 rounded-2xl border p-6">
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
              <Warning2
                size={18}
                color="currentColor"
                className="text-danger mt-0.5 shrink-0"
              />
              <p className="text-danger text-sm">
                {t("admin.settings.maintenanceWarning")}
              </p>
            </div>
          ) : null}
        </div>  

        {/* Section 3: Content Moderation */}
        <div className="w-full bg-surface border-border flex flex-col gap-5 rounded-2xl border p-6">
          <SectionHeading
            title={t("admin.settings.sections.contentModeration")}
            description={t("admin.settings.sections.contentModerationDesc")}
          />

          <Controller
            name="destinationCreationEnabled"
            control={control}
            render={({ field }) => (
              <ToggleRow
                id="destinationCreationEnabled"
                label={t("admin.settings.fields.destinationCreationEnabled")}
                description={t(
                  "admin.settings.fields.destinationCreationEnabledDesc",
                )}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="tourCreationEnabled"
            control={control}
            render={({ field }) => (
              <ToggleRow
                id="tourCreationEnabled"
                label={t("admin.settings.fields.tourCreationEnabled")}
                description={t("admin.settings.fields.tourCreationEnabledDesc")}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="reportingEnabled"
            control={control}
            render={({ field }) => (
              <ToggleRow
                id="reportingEnabled"
                label={t("admin.settings.fields.reportingEnabled")}
                description={t("admin.settings.fields.reportingEnabledDesc")}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {feedback ? (
          <p
            className={
              feedback.kind === "success"
                ? "text-green text-sm"
                : "text-danger text-sm"
            }
            role="status"
          >
            {feedback.message}
          </p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          isDisabled={!isDirty || isSubmitting}
          onPress={() => {
            reset();
            setFeedback(null);
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          variant="primary"
          isDisabled={!isDirty}
          isPending={isSubmitting}
        >
          {t("admin.settings.save")}
        </Button>
      </div>
    </Form>
  );
}
