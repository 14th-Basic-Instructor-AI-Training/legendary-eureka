"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Briefcase,
  Calendar,
  Camera,
  CloseCircle,
  DollarCircle,
  Eye,
  Global,
  InfoCircle,
  Location,
  People,
  ReceiptText,
  ShieldTick,
  TickCircle,
  ArrowLeft2,
  ArrowRight2,
  Link21,
  Clock,
} from "iconsax-reactjs";
import { Button, Form, Input, Label, ListBox, Select, TextArea } from "@/ui";
import { CAMBODIA_PROVINCE_CODES, TravelTypeSchema } from "@/features/destinations/schema";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { Province, TravelType } from "@/lib/api/client";
import { createPackageAction, updatePackageAction } from "@/actions/tours";
import type { DestinationResponse } from "@/lib/api/destinations";
import {
  NewPackageSchema,
  type NewPackageFormValues,
  type NewPackageInput,
} from "../schema";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PROVINCES = CAMBODIA_PROVINCE_CODES;
const TRAVEL_TYPES = TravelTypeSchema.options;
const CANCELLATION_OPTIONS = ["free", "nonRefundable"] as const;

type StepId = 1 | 2 | 3 | 4;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STEP_CONFIGS: { n: StepId; labelKey: string; Icon: React.ComponentType<any> }[] = [
  { n: 1, labelKey: "tours.packages.form.steps.identity",  Icon: Briefcase },
  { n: 2, labelKey: "tours.packages.form.steps.logistics", Icon: Calendar },
  { n: 3, labelKey: "tours.packages.form.steps.story",     Icon: Camera },
  { n: 4, labelKey: "tours.packages.form.steps.review",    Icon: Eye },
];

// Fields to validate before advancing from each step
const STEP_FIELDS: Record<StepId, (keyof NewPackageFormValues)[]> = {
  1: ["title", "tagline", "province", "travelType"],
  2: ["days", "priceFrom", "groupSizeMax", "cancellationPolicy", "languages"],
  3: ["coverImageUrl", "description", "highlights", "included", "excluded"],
  4: [],
};

const SLIDE_VARIANTS: Variants = {
  initial: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  animate: { x: 0, opacity: 1, transition: { duration: 0.26, ease: "easeOut" } },
  exit:    (dir: number) => ({ x: dir * -48, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

function IconInput({
  icon,
  suffix,
  children,
}: {
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <span className="text-muted pointer-events-none absolute left-3 z-10 flex items-center">
        {icon}
      </span>
      <div className={`w-full [&_input]:pl-9 ${suffix ? "[&_input]:pr-16" : ""}`}>{children}</div>
      {suffix && (
        <span className="text-muted pointer-events-none absolute right-3 text-xs">{suffix}</span>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-danger mt-1 flex items-center gap-1 text-xs font-medium" role="alert">
      <CloseCircle size={12} color="currentColor" variant="Bold" />
      {message}
    </p>
  );
}

function OptionalTag({ label }: { label: string }) {
  return <span className="text-muted ml-1 text-xs font-normal">— {label}</span>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface border-border shadow-primary rounded-2xl border p-6">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: StepId }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start mb-8">
      {STEP_CONFIGS.map((s, i) => {
        const done   = step > s.n;
        const active = step === s.n;
        const { Icon } = s;
        return (
          <div key={s.n} className="flex items-start flex-1 last:flex-none">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  done || active
                    ? "border-primary bg-primary"
                    : "border-border bg-surface"
                }`}
              >
                {done ? (
                  <TickCircle size={18} color="#fff" variant="Bold" />
                ) : (
                  <Icon
                    size={18}
                    color={active ? "#fff" : "currentColor"}
                    variant={active ? "Bold" : "Linear"}
                  />
                )}
              </div>
              <span
                className={`text-[10.5px] font-semibold whitespace-nowrap text-center transition-colors duration-200 ${
                  active ? "text-primary" : done ? "text-primary/50" : "text-muted"
                }`}
              >
                {t(s.labelKey)}
              </span>
            </div>

            {/* Connector line */}
            {i < STEP_CONFIGS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-3 mt-5 transition-colors duration-500"
                style={{ background: step > s.n ? "var(--color-primary)" : "var(--color-border)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Identity
// ─────────────────────────────────────────────────────────────────────────────

type StepProps = {
  control: ReturnType<typeof useForm<NewPackageFormValues, unknown, NewPackageInput>>["control"];
  errors: ReturnType<typeof useForm<NewPackageFormValues, unknown, NewPackageInput>>["formState"]["errors"];
  watch?: ReturnType<typeof useForm<NewPackageFormValues, unknown, NewPackageInput>>["watch"];
};

function Step1Identity({ control, errors }: StepProps) {
  const { t } = useTranslation();

  return (
    <SectionCard>
      <div className="mb-5 flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Briefcase size={18} color="currentColor" variant="Bold" />
        </div>
        <div>
          <p className="text-muted text-[10px] font-semibold uppercase tracking-widest">01</p>
          <h2 className="text-foreground text-sm font-semibold">
            {t("tours.packages.form.sections.identity.title")}
          </h2>
          <p className="text-muted mt-0.5 text-xs leading-relaxed">
            {t("tours.packages.form.sections.identity.description")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="p-title">
            {t("tours.packages.form.name")}
            <span className="text-danger ml-0.5" aria-hidden="true">*</span>
          </Label>
          <IconInput icon={<ReceiptText size={16} color="currentColor" />}>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Input
                  id="p-title"
                  placeholder={t("tours.packages.form.namePlaceholder")}
                  aria-invalid={Boolean(errors.title)}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </IconInput>
          <FieldError message={errors.title?.message} />
        </div>

        {/* Tagline */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="p-tagline">
            {t("tours.packages.form.tagline")}
            <OptionalTag label={t("common.optional")} />
          </Label>
          <Controller
            control={control}
            name="tagline"
            render={({ field }) => (
              <Input
                id="p-tagline"
                placeholder={t("tours.packages.form.taglinePlaceholder")}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>

        {/* Province + Travel type */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="p-province">
              {t("tours.destinations.form.province")}
              <OptionalTag label={t("common.optional")} />
            </Label>
            <Controller
              control={control}
              name="province"
              render={({ field }) => (
                <Select
                  id="p-province"
                  aria-label={t("tours.destinations.form.province")}
                  selectedKey={field.value ?? null}
                  onSelectionChange={(key) => key !== null && field.onChange(String(key))}
                  onBlur={field.onBlur}
                >
                  <Select.Trigger>
                    <span className="flex items-center gap-2">
                      <Location size={15} color="currentColor" className="text-muted shrink-0" />
                      <Select.Value>
                        {() =>
                          field.value
                            ? t(`destinations.provinces.${field.value}`)
                            : t("tours.packages.form.selectProvince")
                        }
                      </Select.Value>
                    </span>
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {PROVINCES.map((p) => (
                        <ListBox.Item key={p} id={p} textValue={t(`destinations.provinces.${p}`)}>
                          {t(`destinations.provinces.${p}`)}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="p-travel">
              {t("tours.destinations.form.travelType")}
              <OptionalTag label={t("common.optional")} />
            </Label>
            <Controller
              control={control}
              name="travelType"
              render={({ field }) => (
                <Select
                  id="p-travel"
                  aria-label={t("tours.destinations.form.travelType")}
                  selectedKey={field.value ?? null}
                  onSelectionChange={(key) => key !== null && field.onChange(String(key))}
                  onBlur={field.onBlur}
                >
                  <Select.Trigger>
                    <Select.Value>
                      {() =>
                        field.value
                          ? t(`destinations.travelTypes.${field.value}`)
                          : t("tours.packages.form.selectTravelType")
                      }
                    </Select.Value>
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {TRAVEL_TYPES.map((tt) => (
                        <ListBox.Item
                          key={tt}
                          id={tt}
                          textValue={t(`destinations.travelTypes.${tt}`)}
                        >
                          {t(`destinations.travelTypes.${tt}`)}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Logistics
// ─────────────────────────────────────────────────────────────────────────────

function Step2Logistics({ control, errors, watch }: StepProps) {
  const { t } = useTranslation();
  const watchedDays         = Number(watch?.("days") ?? 1);
  const watchedCancellation = watch?.("cancellationPolicy") ?? "free";

  return (
    <SectionCard>
      <div className="mb-5 flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Calendar size={18} color="currentColor" variant="Bold" />
        </div>
        <div>
          <p className="text-muted text-[10px] font-semibold uppercase tracking-widest">02</p>
          <h2 className="text-foreground text-sm font-semibold">
            {t("tours.packages.form.sections.logistics.title")}
          </h2>
          <p className="text-muted mt-0.5 text-xs leading-relaxed">
            {t("tours.packages.form.sections.logistics.description")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Duration + Price */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="p-days">
              {t("tours.packages.form.days")}
              <span className="text-danger ml-0.5" aria-hidden="true">*</span>
            </Label>
            <IconInput
              icon={<Clock size={16} color="currentColor" />}
              suffix={watchedDays === 1 ? t("tours.packages.form.dayUnit") : t("tours.packages.form.daysUnit")}
            >
              <Controller
                control={control}
                name="days"
                render={({ field }) => (
                  <Input
                    id="p-days"
                    type="number"
                    min={1}
                    aria-invalid={Boolean(errors.days)}
                    value={String(field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </IconInput>
            <FieldError message={errors.days?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="p-price">
              {t("tours.packages.form.price")}
              <span className="text-danger ml-0.5" aria-hidden="true">*</span>
            </Label>
            <IconInput icon={<DollarCircle size={16} color="currentColor" />} suffix="USD">
              <Controller
                control={control}
                name="priceFrom"
                render={({ field }) => (
                  <Input
                    id="p-price"
                    type="number"
                    min={0}
                    aria-invalid={Boolean(errors.priceFrom)}
                    value={String(field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </IconInput>
            <FieldError message={errors.priceFrom?.message} />
          </div>
        </div>

        {/* Group size + Cancellation */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="p-group-size">
              {t("tours.packages.form.groupSizeMax")}
              <OptionalTag label={t("common.optional")} />
            </Label>
            <IconInput icon={<People size={16} color="currentColor" />} suffix={t("tours.packages.form.peopleUnit")}>
              <Controller
                control={control}
                name="groupSizeMax"
                render={({ field }) => (
                  <Input
                    id="p-group-size"
                    type="number"
                    min={1}
                    placeholder="12"
                    value={String(field.value ?? "")}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </IconInput>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="p-cancel">{t("tours.packages.form.cancellationPolicy")}</Label>
            <Controller
              control={control}
              name="cancellationPolicy"
              render={({ field }) => (
                <Select
                  id="p-cancel"
                  aria-label={t("tours.packages.form.cancellationPolicy")}
                  selectedKey={field.value}
                  onSelectionChange={(key) => key !== null && field.onChange(String(key))}
                  onBlur={field.onBlur}
                >
                  <Select.Trigger>
                    <span className="flex items-center gap-2">
                      {watchedCancellation === "free" ? (
                        <ShieldTick size={15} color="currentColor" variant="Bold" className="shrink-0 text-emerald-600" />
                      ) : (
                        <CloseCircle size={15} color="currentColor" variant="Bold" className="text-danger shrink-0" />
                      )}
                      <Select.Value>
                        {() =>
                          field.value === "free"
                            ? t("tours.packages.form.cancellationFree")
                            : t("tours.packages.form.cancellationNonRefundable")
                        }
                      </Select.Value>
                    </span>
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {CANCELLATION_OPTIONS.map((opt) => (
                        <ListBox.Item
                          key={opt}
                          id={opt}
                          textValue={t(opt === "free" ? "tours.packages.form.cancellationFree" : "tours.packages.form.cancellationNonRefundable")}
                        >
                          <span className="flex items-center gap-2">
                            {opt === "free" ? (
                              <ShieldTick size={14} color="currentColor" variant="Bold" className="text-emerald-600" />
                            ) : (
                              <CloseCircle size={14} color="currentColor" variant="Bold" className="text-danger" />
                            )}
                            {t(opt === "free" ? "tours.packages.form.cancellationFree" : "tours.packages.form.cancellationNonRefundable")}
                          </span>
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Languages */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="p-languages">
            {t("tours.packages.form.languages")}
            <OptionalTag label={t("common.optional")} />
          </Label>
          <IconInput icon={<Global size={16} color="currentColor" />}>
            <Controller
              control={control}
              name="languages"
              render={({ field }) => (
                <Input
                  id="p-languages"
                  placeholder={t("tours.packages.form.languagesPlaceholder")}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </IconInput>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Story
// ─────────────────────────────────────────────────────────────────────────────

function Step3Story({ control, errors, watch }: StepProps) {
  const { t } = useTranslation();
  const coverPreview = watch?.("coverImageUrl") ?? "";

  return (
    <SectionCard>
      <div className="mb-5 flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Camera size={18} color="currentColor" variant="Bold" />
        </div>
        <div>
          <p className="text-muted text-[10px] font-semibold uppercase tracking-widest">03</p>
          <h2 className="text-foreground text-sm font-semibold">
            {t("tours.packages.form.sections.story.title")}
          </h2>
          <p className="text-muted mt-0.5 text-xs leading-relaxed">
            {t("tours.packages.form.sections.story.description")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Cover image URL + live preview */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="p-cover">
            {t("tours.packages.form.coverImageUrl")}
            <OptionalTag label={t("common.optional")} />
          </Label>
          <IconInput icon={<Link21 size={16} color="currentColor" />}>
            <Controller
              control={control}
              name="coverImageUrl"
              render={({ field }) => (
                <Input
                  id="p-cover"
                  placeholder="https://images.unsplash.com/..."
                  aria-invalid={Boolean(errors.coverImageUrl)}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </IconInput>
          <FieldError message={errors.coverImageUrl?.message} />
          {coverPreview ? (
            <div className="border-border mt-2 overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreview}
                alt=""
                aria-hidden="true"
                className="aspect-video w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = ""; }}
              />
            </div>
          ) : null}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="p-description">
            {t("tours.packages.form.description")}
            <OptionalTag label={t("common.optional")} />
          </Label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextArea
                id="p-description"
                placeholder={t("tours.packages.form.descriptionPlaceholder")}
                rows={4}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>

        {/* Highlights */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="p-highlights">
            {t("tours.packages.form.highlights")}
            <OptionalTag label={t("common.optional")} />
          </Label>
          <p className="text-muted -mt-0.5 text-xs">{t("tours.packages.form.highlightsHint")}</p>
          <Controller
            control={control}
            name="highlights"
            render={({ field }) => (
              <TextArea
                id="p-highlights"
                placeholder={t("tours.packages.form.highlightsPlaceholder")}
                rows={3}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>

        {/* Included / Excluded */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="p-included" className="flex items-center gap-1.5">
              <TickCircle size={14} color="currentColor" variant="Bold" className="text-emerald-600" />
              {t("tours.packages.form.included")}
            </Label>
            <p className="text-muted -mt-0.5 text-xs">{t("tours.packages.form.listHint")}</p>
            <div className="border-l-2 border-emerald-500/40 pl-3">
              <Controller
                control={control}
                name="included"
                render={({ field }) => (
                  <TextArea
                    id="p-included"
                    placeholder={t("tours.packages.form.includedPlaceholder")}
                    rows={4}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="p-excluded" className="flex items-center gap-1.5">
              <CloseCircle size={14} color="currentColor" variant="Bold" className="text-red-500" />
              {t("tours.packages.form.excluded")}
            </Label>
            <p className="text-muted -mt-0.5 text-xs">{t("tours.packages.form.listHint")}</p>
            <div className="border-l-2 border-red-400/40 pl-3">
              <Controller
                control={control}
                name="excluded"
                render={({ field }) => (
                  <TextArea
                    id="p-excluded"
                    placeholder={t("tours.packages.form.excludedPlaceholder")}
                    rows={4}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Review
// ─────────────────────────────────────────────────────────────────────────────

function Step4Review({ values, isEdit }: { values: NewPackageFormValues; isEdit: boolean }) {
  const { t } = useTranslation();

  const highlights = (values.highlights ?? "").split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  const included   = (values.included ?? "").split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  const excluded   = (values.excluded ?? "").split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  const hasStory   = Boolean(values.description || highlights.length || included.length || excluded.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Eye size={18} color="currentColor" variant="Bold" />
        </div>
        <div>
          <p className="text-muted text-[10px] font-semibold uppercase tracking-widest">04</p>
          <h2 className="text-foreground text-sm font-semibold">
            {t(isEdit ? "tours.packages.form.editReviewTitle" : "tours.packages.form.reviewTitle")}
          </h2>
          <p className="text-muted mt-0.5 text-xs">
            {t(isEdit ? "tours.packages.form.editReviewDesc" : "tours.packages.form.reviewDesc")}
          </p>
        </div>
      </div>

      {/* Cover image preview */}
      {values.coverImageUrl && (
        <div className="border-border overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={values.coverImageUrl}
            alt=""
            aria-hidden="true"
            className="aspect-video w-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* Identity card */}
      <div className="bg-surface border-border shadow-primary rounded-2xl border p-5">
        <p className="text-muted mb-3 text-[10px] font-semibold uppercase tracking-widest">
          {t("tours.packages.form.sections.identity.title")}
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-foreground text-base font-bold leading-snug">{values.title || "—"}</p>
          {values.tagline && (
            <p className="text-muted text-sm">{values.tagline}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            {values.province && (
              <span className="bg-primary/8 text-primary flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                <Location size={11} color="currentColor" />
                {t(`destinations.provinces.${values.province}`)}
              </span>
            )}
            {values.travelType && (
              <span className="bg-primary/8 text-primary rounded-full px-2.5 py-1 text-xs font-semibold">
                {t(`destinations.travelTypes.${values.travelType}`)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Logistics card */}
      <div className="bg-surface border-border shadow-primary rounded-2xl border p-5">
        <p className="text-muted mb-3 text-[10px] font-semibold uppercase tracking-widest">
          {t("tours.packages.form.sections.logistics.title")}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted flex items-center gap-1 text-xs">
              <Clock size={11} color="currentColor" />
              {t("tours.packages.form.days")}
            </span>
            <span className="text-foreground text-sm font-semibold">
              {String(values.days ?? 1)} {Number(values.days) === 1 ? t("tours.packages.form.dayUnit") : t("tours.packages.form.daysUnit")}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted flex items-center gap-1 text-xs">
              <DollarCircle size={11} color="currentColor" />
              {t("tours.packages.form.price")}
            </span>
            <span className="text-foreground text-sm font-semibold">
              ${String(values.priceFrom ?? 0)} {values.currency || "USD"}
            </span>
          </div>
          {values.groupSizeMax ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-muted flex items-center gap-1 text-xs">
                <People size={11} color="currentColor" />
                {t("tours.packages.form.groupSizeMax")}
              </span>
              <span className="text-foreground text-sm font-semibold">
                {String(values.groupSizeMax)} {t("tours.packages.form.peopleUnit")}
              </span>
            </div>
          ) : null}
          <div className="flex flex-col gap-0.5">
            <span className="text-muted text-xs">{t("tours.packages.form.cancellationPolicy")}</span>
            <span className={`text-sm font-semibold ${values.cancellationPolicy === "free" ? "text-emerald-600" : "text-danger"}`}>
              {values.cancellationPolicy === "free"
                ? t("tours.packages.form.cancellationFree")
                : t("tours.packages.form.cancellationNonRefundable")
              }
            </span>
          </div>
        </div>
        {values.languages && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
            <Global size={12} color="currentColor" className="text-muted shrink-0" />
            <span className="text-muted text-xs">{values.languages}</span>
          </div>
        )}
      </div>

      {/* Story card (only if something was entered) */}
      {hasStory && (
        <div className="bg-surface border-border shadow-primary rounded-2xl border p-5">
          <p className="text-muted mb-3 text-[10px] font-semibold uppercase tracking-widest">
            {t("tours.packages.form.sections.story.title")}
          </p>
          <div className="flex flex-col gap-3">
            {values.description && (
              <p className="text-muted text-sm leading-relaxed line-clamp-3">{values.description}</p>
            )}
            {highlights.length > 0 && (
              <div>
                <p className="text-foreground mb-1 text-xs font-semibold">{t("tours.packages.form.highlights")}</p>
                <ul className="flex flex-col gap-0.5">
                  {highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="text-muted flex items-start gap-1.5 text-xs">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                      {h}
                    </li>
                  ))}
                  {highlights.length > 3 && (
                    <li className="text-muted text-xs">+{highlights.length - 3} more…</li>
                  )}
                </ul>
              </div>
            )}
            <div className="flex gap-4">
              {included.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <TickCircle size={12} color="currentColor" variant="Bold" />
                  {included.length} included
                </div>
              )}
              {excluded.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                  <CloseCircle size={12} color="currentColor" variant="Bold" />
                  {excluded.length} excluded
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Readiness notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <InfoCircle size={16} color="currentColor" className="text-primary mt-0.5 shrink-0" />
        <p className="text-primary text-xs font-medium leading-relaxed">
          {t("tours.packages.form.draftNotice")}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  destinations: DestinationResponse[];
  agencyName: string;
  presetDestination?: DestinationResponse;
  /** When set the form operates in edit mode: pre-fills values and PUTs on submit. */
  packageId?: string;
  initialValues?: Partial<NewPackageFormValues>;
  onCreated: (pkg: TourPackageResponse) => void;
  onCancel: () => void;
};

const DRAFT_KEY = "pkg-form-draft";

export function PackageForm({ presetDestination, packageId, initialValues, onCreated, onCancel }: Props) {
  const { t } = useTranslation();
  const isEdit = Boolean(packageId);

  // Scope draft key per package so create-drafts and edit-drafts don't collide.
  const DRAFT_STORAGE_KEY = packageId ? `pkg-form-draft-${packageId}` : DRAFT_KEY;

  const draft = useRef(
    (() => {
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem(DRAFT_STORAGE_KEY) : null;
        if (!raw) return null;
        return JSON.parse(raw) as { values: Partial<NewPackageFormValues>; step: StepId };
      } catch {
        return null;
      }
    })(),
  );

  const [step, setStep]       = useState<StepId>(draft.current?.step ?? 1);
  const [stepDir, setStepDir] = useState(1);

  const baseDefaults: NewPackageFormValues = {
    title: "",
    tagline: "",
    province: (presetDestination?.province as NewPackageFormValues["province"]) ?? "SIEM_REAP",
    travelType: (presetDestination?.travelType as NewPackageFormValues["travelType"]) ?? "CULTURAL",
    days: 1,
    priceFrom: presetDestination?.priceFrom ?? 0,
    currency: presetDestination?.currency ?? "USD",
    groupSizeMax: "",
    cancellationPolicy: "free",
    languages: "",
    description: "",
    coverImageUrl: presetDestination?.coverImageUrl ?? "",
    highlights: "",
    included: "",
    excluded: "",
  };

  // Priority: localStorage draft > server-side initialValues (edit) > base defaults (create)
  const resolvedDefaults: NewPackageFormValues = {
    ...baseDefaults,
    ...(initialValues ?? {}),
    ...(draft.current?.values ?? {}),
  };

  const form = useForm<NewPackageFormValues, unknown, NewPackageInput>({
    resolver: zodResolver(NewPackageSchema),
    defaultValues: resolvedDefaults,
  });

  const { control, handleSubmit, trigger, watch, getValues, formState: { errors, isSubmitting } } = form;

  // Persist form values + current step to localStorage on every change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const { unsubscribe } = watch((values) => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ values, step }));
      } catch { /* quota exceeded — ignore */ }
    });
    return unsubscribe;
  // DRAFT_STORAGE_KEY is stable for the component's lifetime
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, step]);

  // Persist step changes (watch only fires on value changes, not step changes)
  useEffect(() => {
    try {
      const rawExisting = typeof window !== "undefined" ? localStorage.getItem(DRAFT_STORAGE_KEY) : null;
      const existing = rawExisting ? (JSON.parse(rawExisting) as { values: Partial<NewPackageFormValues> }) : null;
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ values: existing?.values ?? getValues(), step }));
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, getValues]);

  const clearScopedDraft = () => {
    try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch { /* ignore */ }
  };

  async function goTo(n: StepId) {
    if (n > step) {
      const valid = await trigger(STEP_FIELDS[step]);
      if (!valid) return;
    }
    setStepDir(n > step ? 1 : -1);
    setStep(n);
  }

  const buildBody = (values: NewPackageInput) => ({
    title: values.title,
    tagline: values.tagline || undefined,
    description: values.description || undefined,
    province: values.province as Province | undefined,
    travelType: values.travelType as TravelType | undefined,
    price: values.priceFrom,
    currency: values.currency,
    durationDays: values.days,
    coverImageUrl: values.coverImageUrl || undefined,
    groupSizeMax: values.groupSizeMax ? Number(values.groupSizeMax) : undefined,
    languages: values.languages || undefined,
    cancellationPolicy: values.cancellationPolicy,
    highlights: values.highlights || undefined,
    included: values.included || undefined,
    excluded: values.excluded || undefined,
  });

  const onSubmit = async (values: NewPackageInput) => {
    const pkg =
      isEdit && packageId
        ? await updatePackageAction(packageId, buildBody(values))
        : await createPackageAction(buildBody(values));
    clearScopedDraft();
    onCreated(pkg);
  };

  const isLastStep = step === 4;

  return (
    <Form
      className="mx-auto flex w-full max-w-2xl flex-col gap-0"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* ── Step indicator ── */}
      <StepIndicator step={step} />

      {/* ── Animated step content ── */}
      <div className="overflow-hidden pb-28">
        <AnimatePresence mode="wait" custom={stepDir}>
          <motion.div
            key={step}
            custom={stepDir}
            variants={SLIDE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {step === 1 && <Step1Identity control={control} errors={errors} />}
            {step === 2 && <Step2Logistics control={control} errors={errors} watch={watch} />}
            {step === 3 && <Step3Story control={control} errors={errors} watch={watch} />}
            {step === 4 && <Step4Review values={getValues()} isEdit={isEdit} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Sticky navigation footer ── */}
      <div className="bg-surface border-border shadow-primary fixed bottom-0 left-0 right-0 border-t px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          {/* Back / step counter */}
          <div className="flex items-center gap-3">
            {step > 1 ? (
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                onPress={() => goTo((step - 1) as StepId)}
                isDisabled={isSubmitting}
              >
                <ArrowLeft2 size={15} color="currentColor" />
                {t("common.back")}
              </Button>
            ) : (
              <Button type="button" variant="tertiary" size="sm" onPress={() => { clearScopedDraft(); onCancel(); }}>
                {t("common.cancel")}
              </Button>
            )}
            <span className="text-muted hidden text-xs sm:block">
              {t("tours.packages.form.stepCounter", { current: step, total: 4 })}
            </span>
          </div>

          {/* Forward / submit */}
          {!isLastStep ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onPress={() => goTo((step + 1) as StepId)}
              isDisabled={isSubmitting}
              className="flex items-center gap-1.5"
            >
              {t("tours.packages.form.continue")}
              <ArrowRight2 size={15} color="currentColor" />
            </Button>
          ) : (
            <Button type="submit" variant="primary" isPending={isSubmitting}>
              {t(isEdit ? "tours.packages.form.update" : "tours.packages.form.submit")}
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}
