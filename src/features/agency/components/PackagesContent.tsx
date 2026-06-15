"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Add,
  Edit2,
  Trash,
  CloseCircle,
  Clock,
  People,
  Map1,
  MoneyRecive,
  ArrowRight2,
  ArrowLeft2,
  TickCircle,
  Box,
  Archive,
  Unlock,
  DocumentUpload,
  ArrowDown2,
  ArrowUp2,
  Location,
} from "iconsax-reactjs";
import { Button, Input, TextArea, Select, ListBox, SearchField, Skeleton } from "@/ui";
import {
  getPackages,
  createPackageApi,
  updatePackageApi,
  deletePackageApi,
  publishPackageApi,
  archivePackageApi,
} from "@/features/agency/data";
import { uploadFileAction } from "@/actions/agencyProfile";
import { useSession } from "@/lib/auth";
import { useAgencyStore, type PackageInput } from "@/features/agency/store";
import type { Activity, ItineraryDay, Package } from "@/features/agency/schema";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROVINCE_OPTIONS = [
  { value: "Phnom Penh",     label: "Phnom Penh" },
  { value: "Siem Reap",      label: "Siem Reap" },
  { value: "Battambang",     label: "Battambang" },
  { value: "Kampot",         label: "Kampot" },
  { value: "Sihanoukville",  label: "Sihanoukville" },
  { value: "Preah Vihear",   label: "Preah Vihear" },
  { value: "Koh Kong",       label: "Koh Kong" },
  { value: "Kratie",         label: "Kratie" },
  { value: "Kampong Thom",   label: "Kampong Thom" },
  { value: "Kandal",         label: "Kandal" },
  { value: "Takeo",          label: "Takeo" },
  { value: "Kampong Cham",   label: "Kampong Cham" },
  { value: "Preah Sihanouk", label: "Preah Sihanouk" },
] as const;

const STATUS_CFG = {
  published: { label: "Published", bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  draft:     { label: "Draft",     bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
  archived:  { label: "Archived",  bg: "#F3F4F6", color: "#4B5563", dot: "#9CA3AF" },
} as const;

const TABS = [
  { id: "all",       labelKey: "agency.packages.tabAll" },
  { id: "published", labelKey: "agency.packages.tabPublished" },
  { id: "draft",     labelKey: "agency.packages.tabDraft" },
  { id: "archived",  labelKey: "agency.packages.tabArchived" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const STEPS = [
  { n: 1, labelKey: "agency.packages.step1" },
  { n: 2, labelKey: "agency.packages.step2" },
  { n: 3, labelKey: "agency.packages.step3" },
];

// Cover placeholder colours per package position
const COVER_COLORS = ["#185FA5", "#059669", "#7C3AED", "#B45309", "#0891B2"];

// ---------------------------------------------------------------------------
// Form schema (Step 1)
// ---------------------------------------------------------------------------

const BasicInfoSchema = z.object({
  title:        z.string().min(1, "Name is required"),
  description:  z.string().optional(),
  location:     z.string().min(1, "Province is required"),
  priceFrom:    z.number().min(0, "Enter a price"),
  maxGroupSize: z.number().int().positive().optional(),
  days:         z.number().int().min(1).max(30),
});
type BasicInfoValues = z.infer<typeof BasicInfoSchema>;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: keyof typeof STATUS_CFG }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function CoverPlaceholder({ colorIdx = 0, height = 120 }: { colorIdx?: number; height?: number }) {
  const bg = COVER_COLORS[colorIdx % COVER_COLORS.length];
  return (
    <div
      className="relative overflow-hidden w-full flex-shrink-0"
      style={{ height, background: bg }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 60%)" }}
      />
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => {
        const done    = step > s.n;
        const active  = step === s.n;
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold flex-shrink-0"
                style={{
                  background: done ? "#185FA5" : active ? "#185FA5" : "#F1F5F9",
                  color:      done || active ? "#FFFFFF" : "#9BA8B5",
                }}
              >
                {done ? <TickCircle size={16} color="#fff" variant="Bold" /> : s.n}
              </div>
              <span
                className="text-[10.5px] font-semibold whitespace-nowrap"
                style={{ color: active ? "#185FA5" : "#9BA8B5" }}
              >
                {t(s.labelKey)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 mx-2 h-px mb-4"
                style={{ background: step > s.n ? "#185FA5" : "#E1E6EC" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Basic Info form
// ---------------------------------------------------------------------------

function BasicInfoStep({
  defaultValues,
  onNext,
}: {
  defaultValues?: Partial<BasicInfoValues>;
  onNext: (data: BasicInfoValues) => void;
}) {
  const { t } = useTranslation();
  const { register, handleSubmit, control, formState: { errors } } = useForm<BasicInfoValues>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: { days: 3, ...defaultValues },
  });
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  async function handleCoverFile(file: File) {
    setCoverError(null);
    setCoverUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadFileAction(fd);
    setCoverUploading(false);
    if (result.ok) {
      setCoverPreview(result.url);
    } else {
      setCoverError(result.error);
    }
  }

  const labelCls = "block text-[12px] font-semibold text-agency-dark mb-1.5";

  return (
    <form id="pkgStep1" onSubmit={handleSubmit(onNext)} className="flex flex-col gap-4">
      {/* Package name */}
      <div>
        <label className={labelCls}>
          {t("agency.packages.fieldName")}<span className="text-red-500">*</span>
        </label>
        <Input
          {...register("title")}
          placeholder={t("agency.packages.fieldNamePlaceholder")}
          variant="secondary"
        />
        {errors.title && <p className="mt-1 text-[11px] text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>{t("agency.packages.fieldDescription")}</label>
        <TextArea
          {...register("description")}
          rows={3}
          placeholder={t("agency.packages.fieldDescriptionPlaceholder")}
          variant="secondary"
        />
      </div>

      {/* Cover upload */}
      <div>
        <label className={labelCls}>{t("agency.packages.fieldCover")}</label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleCoverFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={coverUploading}
          onClick={() => coverInputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-[10px] border-2 border-dashed border-agency-border bg-bg-ghostwhite px-4 py-5 transition-all hover:border-agency hover:bg-agency-light disabled:opacity-60"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="cover preview" className="h-24 w-full rounded-[6px] object-cover" />
          ) : (
            <>
              <DocumentUpload size={26} color={coverUploading ? "#185FA5" : "#9BA8B5"} />
              <div className="text-center">
                <p className="text-[13px] font-semibold text-agency-dark">
                  {coverUploading ? t("common.loading") : (
                    <>{t("agency.packages.dropCover")}{" "}<span className="text-agency">{t("agency.packages.browse")}</span></>
                  )}
                </p>
                <p className="mt-0.5 text-[11.5px] text-agency-muted">{t("agency.packages.coverHint")}</p>
              </div>
            </>
          )}
        </button>
        {coverError && <p className="mt-1 text-[11px] text-red-500">{coverError}</p>}
      </div>

      {/* Province + Price */}
      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <label className={labelCls}>
            {t("agency.packages.fieldProvince")}<span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <Select
                aria-label={t("agency.packages.fieldProvince")}
                selectedKey={field.value || null}
                onSelectionChange={(key) => field.onChange(String(key))}
              >
                <Select.Trigger className="w-full rounded-[10px] border border-agency-border bg-white py-1">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {PROVINCE_OPTIONS.map((p) => (
                      <ListBox.Item key={p.value} id={p.value} textValue={p.label}>
                        {p.label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}
          />
          {errors.location && <p className="mt-1 text-[11px] text-red-500">{errors.location.message}</p>}
        </div>
        <div>
          <label className={labelCls}>
            {t("agency.packages.fieldPrice")}<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[13px] font-semibold text-agency-muted">$</span>
            <Input
              {...register("priceFrom", { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="0"
              variant="secondary"
              className="pl-6"
            />
          </div>
          {errors.priceFrom && <p className="mt-1 text-[11px] text-red-500">{errors.priceFrom.message}</p>}
        </div>
      </div>

      {/* Group size + Days */}
      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <label className={labelCls}>{t("agency.packages.fieldGroupSize")}</label>
          <div className="relative">
            <People size={14} color="#9BA8B5" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <Input
              {...register("maxGroupSize", { valueAsNumber: true })}
              type="number"
              min="1"
              placeholder="12"
              variant="secondary"
              className="pl-8"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>
            {t("agency.packages.fieldDays")}<span className="text-red-500">*</span>
          </label>
          <Input
            {...register("days", { valueAsNumber: true })}
            type="number"
            min="1"
            max="30"
            placeholder="3"
            variant="secondary"
          />
          {errors.days && <p className="mt-1 text-[11px] text-red-500">{errors.days.message}</p>}
        </div>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Itinerary Builder
// ---------------------------------------------------------------------------

function ItineraryStep({
  days,
  itinerary,
  activities,
  onChange,
}: {
  days: number;
  itinerary: ItineraryDay[];
  activities: Activity[];
  onChange: (next: ItineraryDay[]) => void;
}) {
  const { t } = useTranslation();
  const [openDay, setOpenDay] = useState<number>(1);
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  function dayData(day: number): ItineraryDay {
    return itinerary.find((d) => d.day === day) ?? { day, notes: "", activityIds: [] };
  }

  function setDay(day: number, patch: Partial<ItineraryDay>) {
    const existing = dayData(day);
    const updated = { ...existing, ...patch };
    const rest = itinerary.filter((d) => d.day !== day);
    onChange([...rest, updated].sort((a, b) => a.day - b.day));
  }

  function addActivity(day: number, activityId: string) {
    const d = dayData(day);
    if (d.activityIds.includes(activityId)) return;
    setDay(day, { activityIds: [...d.activityIds, activityId] });
    setPickerDay(null);
    setPickerSearch("");
  }

  function removeActivity(day: number, activityId: string) {
    const d = dayData(day);
    setDay(day, { activityIds: d.activityIds.filter((id) => id !== activityId) });
  }

  const filteredActivities = activities.filter(
    (a) =>
      !pickerSearch ||
      a.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      a.location.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  const CATEGORY_LABELS: Record<string, string> = {
    destination: "Destination", thingToDo: "Things To Do", food: "Restaurant", stay: "Stay",
  };
  const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
    destination: { bg: "#EBF2FC", color: "#185FA5" },
    thingToDo:   { bg: "#FEF3C7", color: "#B45309" },
    food:        { bg: "#D1FAE5", color: "#065F46" },
    stay:        { bg: "#EDE9FE", color: "#5B21B6" },
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12.5px] text-agency-muted mb-2">
        {t("agency.packages.itineraryHint", { count: days })}
      </p>

      {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
        const d = dayData(day);
        const isOpen = openDay === day;
        const dayActivities = d.activityIds
          .map((id) => activities.find((a) => a.id === id))
          .filter(Boolean) as Activity[];

        return (
          <div
            key={day}
            className="overflow-hidden rounded-xl border border-agency-border"
          >
            {/* Accordion header */}
            <button
              type="button"
              onClick={() => setOpenDay(isOpen ? 0 : day)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-bg-ghostwhite"
              style={{ background: isOpen ? "#F7F9FB" : "#FFFFFF" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                  style={{ background: "#185FA5" }}
                >
                  {day}
                </div>
                <span className="text-[13px] font-bold text-agency-navy">
                  {t("agency.packages.day", { n: day })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {dayActivities.length > 0 && (
                  <span className="rounded-full bg-agency-light px-2 py-0.5 text-[10.5px] font-bold text-agency">
                    {t("agency.packages.activitiesCount", { count: dayActivities.length })}
                  </span>
                )}
                {isOpen ? <ArrowUp2 size={15} color="#9BA8B5" /> : <ArrowDown2 size={15} color="#9BA8B5" />}
              </div>
            </button>

            {/* Accordion body */}
            {isOpen && (
              <div className="border-t border-agency-border px-4 py-4 flex flex-col gap-3">
                {/* Activity list */}
                {dayActivities.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {dayActivities.map((a) => {
                      const catStyle = CATEGORY_COLORS[a.category] ?? { bg: "#F1F5F9", color: "#64748B" };
                      return (
                        <div
                          key={a.id}
                          className="flex items-center gap-2.5 rounded-lg border border-agency-border bg-white px-3 py-2"
                        >
                          <span className="flex-1 text-[12.5px] font-semibold text-agency-dark truncate">
                            {a.title}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap flex-shrink-0"
                            style={catStyle}
                          >
                            {CATEGORY_LABELS[a.category] ?? a.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeActivity(day, a.id)}
                            className="flex-shrink-0 rounded p-0.5 text-agency-muted transition-colors hover:text-red-500"
                          >
                            <CloseCircle size={14} color="currentColor" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[12px] text-agency-muted">
                    {t("agency.packages.noActivitiesDay")}
                  </p>
                )}

                {/* Add activity picker */}
                {pickerDay === day ? (
                  <div className="rounded-xl border border-agency-border bg-white shadow-sm">
                    <SearchField
                      autoFocus
                      value={pickerSearch}
                      onChange={setPickerSearch}
                      aria-label={t("agency.packages.searchActivities")}
                    >
                      <SearchField.Group className="border-b border-agency-border px-3 py-2">
                        <SearchField.SearchIcon />
                        <SearchField.Input
                          placeholder={t("agency.packages.searchActivities")}
                          className="text-[12.5px] text-agency-dark placeholder:text-agency-muted"
                        />
                        <SearchField.ClearButton />
                      </SearchField.Group>
                    </SearchField>
                    <div className="max-h-[180px] overflow-y-auto">
                      {filteredActivities.length === 0 ? (
                        <p className="px-3 py-3 text-[12px] text-agency-muted">{t("agency.packages.noMatchingActivities")}</p>
                      ) : (
                        filteredActivities.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => addActivity(day, a.id)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-bg-ghostwhite"
                          >
                            <span className="flex-1 text-[12.5px] font-semibold text-agency-dark truncate">{a.title}</span>
                            <span className="text-[11px] text-agency-muted truncate">{a.location}</span>
                          </button>
                        ))
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPickerDay(null); setPickerSearch(""); }}
                      className="w-full border-t border-agency-border py-2 text-[12px] text-agency-muted transition-colors hover:bg-bg-ghostwhite"
                    >
                      {t("agency.packages.cancelAdd")}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerDay(day)}
                    className="flex items-center gap-1.5 rounded-lg border border-dashed border-agency-border px-3 py-2 text-[12px] font-semibold text-agency transition-colors hover:border-agency hover:bg-agency-light"
                  >
                    <Add size={14} color="currentColor" variant="Bold" />
                    {t("agency.packages.addActivity")}
                  </button>
                )}

                {/* Day notes */}
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-agency-muted">
                    {t("agency.packages.dayNotes")}
                  </label>
                  <TextArea
                    rows={2}
                    value={d.notes ?? ""}
                    onChange={(e) => setDay(day, { notes: e.target.value })}
                    placeholder={t("agency.packages.dayNotesPlaceholder")}
                    variant="secondary"
                    className="w-full resize-y rounded-[9px] text-[12.5px] text-agency-dark outline-none transition-colors placeholder:text-agency-muted focus:border-agency"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Review & Publish
// ---------------------------------------------------------------------------

function ReviewStep({
  basicInfo,
  itinerary,
  activities,
}: {
  basicInfo: BasicInfoValues;
  itinerary: ItineraryDay[];
  activities: Activity[];
}) {
  const { t } = useTranslation();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
      {/* Left — summary */}
      <div className="flex flex-col gap-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-agency-navy">
          {t("agency.packages.reviewBasicInfo")}
        </p>

        <CoverPlaceholder height={100} colorIdx={0} />

        <div className="flex flex-col gap-2.5">
          <div>
            <p className="text-[11px] text-agency-muted mb-0.5">{t("agency.packages.fieldName")}</p>
            <p className="text-[13.5px] font-bold text-agency-navy">{basicInfo.title}</p>
          </div>
          {basicInfo.description && (
            <div>
              <p className="text-[11px] text-agency-muted mb-0.5">{t("agency.packages.fieldDescription")}</p>
              <p className="text-[12.5px] text-agency-dark leading-relaxed">{basicInfo.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[11px] text-agency-muted mb-0.5">{t("agency.packages.fieldProvince")}</p>
              <p className="text-[12.5px] font-semibold text-agency-dark">{basicInfo.location}</p>
            </div>
            <div>
              <p className="text-[11px] text-agency-muted mb-0.5">{t("agency.packages.fieldPrice")}</p>
              <p className="text-[12.5px] font-semibold text-agency-dark">${basicInfo.priceFrom}</p>
            </div>
            <div>
              <p className="text-[11px] text-agency-muted mb-0.5">{t("agency.packages.fieldGroupSize")}</p>
              <p className="text-[12.5px] font-semibold text-agency-dark">{basicInfo.maxGroupSize ?? "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-agency-muted mb-0.5">{t("agency.packages.fieldDays")}</p>
              <p className="text-[12.5px] font-semibold text-agency-dark">{basicInfo.days}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — itinerary summary */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-agency-navy">
          {t("agency.packages.reviewItinerary")}
        </p>
        {Array.from({ length: basicInfo.days }, (_, i) => i + 1).map((day) => {
          const d = itinerary.find((x) => x.day === day);
          const dayActivities = (d?.activityIds ?? [])
            .map((id) => activities.find((a) => a.id === id))
            .filter(Boolean) as Activity[];
          const isOpen = expandedDay === day;

          return (
            <div key={day} className="overflow-hidden rounded-xl border border-agency-border">
              <button
                type="button"
                onClick={() => setExpandedDay(isOpen ? null : day)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-bg-ghostwhite transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
                    style={{ background: "#185FA5" }}
                  >
                    {day}
                  </div>
                  <span className="text-[12.5px] font-semibold text-agency-navy">
                    {t("agency.packages.day", { n: day })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-agency-muted">
                    {t("agency.packages.activitiesCount", { count: dayActivities.length })}
                  </span>
                  {isOpen ? <ArrowUp2 size={13} color="#9BA8B5" /> : <ArrowDown2 size={13} color="#9BA8B5" />}
                </div>
              </button>
              {isOpen && dayActivities.length > 0 && (
                <ul className="border-t border-agency-border px-4 py-2.5 flex flex-col gap-1">
                  {dayActivities.map((a) => (
                    <li key={a.id} className="text-[12px] text-agency-dark flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-agency-muted flex-shrink-0" />
                      {a.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create / Edit modal
// ---------------------------------------------------------------------------

function PackageModal({
  pkg,
  activities,
  onClose,
  onSaveDraft,
  onPublish,
}: {
  pkg?: Package;
  activities: Activity[];
  onClose: () => void;
  onSaveDraft: (input: PackageInput) => Promise<void>;
  onPublish: (input: PackageInput) => Promise<void>;
}) {
  const { t } = useTranslation();
  const isEdit = !!pkg;
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfoValues | null>(
    pkg
      ? {
          title: pkg.title,
          description: pkg.description ?? "",
          location: pkg.location ?? "",
          priceFrom: pkg.priceFrom,
          maxGroupSize: pkg.maxGroupSize,
          days: pkg.days,
        }
      : null,
  );
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(
    pkg?.itinerary ??
      (pkg ? Array.from({ length: pkg.days }, (_, i) => ({ day: i + 1, notes: "", activityIds: [] })) : []),
  );

  function buildInput(info: BasicInfoValues): PackageInput {
    return {
      title: info.title,
      description: info.description,
      location: info.location,
      priceFrom: info.priceFrom,
      maxGroupSize: info.maxGroupSize,
      days: info.days,
      itinerary: itinerary.slice(0, info.days),
    };
  }

  function handleStep1Next(data: BasicInfoValues) {
    setBasicInfo(data);
    // Sync itinerary days count when days changes
    const newDays = data.days;
    setItinerary((prev) => {
      const updated: ItineraryDay[] = [];
      for (let i = 1; i <= newDays; i++) {
        updated.push(prev.find((d) => d.day === i) ?? { day: i, notes: "", activityIds: [] });
      }
      return updated;
    });
    setStep(2);
  }

  const title = isEdit ? t("agency.packages.modalEditTitle") : t("agency.packages.modalCreateTitle");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,35,58,0.48)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex w-full flex-col rounded-[20px] bg-white"
        style={{ maxWidth: 920, maxHeight: "90vh", boxShadow: "0 24px 64px rgba(13,35,58,0.22)" }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-agency-border px-6 py-5">
          <h2 className="text-[18px] font-extrabold tracking-tight text-agency-navy">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-agency-border bg-bg-ghostwhite text-agency-muted transition-colors hover:bg-gray-100"
          >
            <CloseCircle size={15} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <StepIndicator step={step} />

          {step === 1 && (
            <BasicInfoStep defaultValues={basicInfo ?? undefined} onNext={handleStep1Next} />
          )}
          {step === 2 && basicInfo && (
            <ItineraryStep
              days={basicInfo.days}
              itinerary={itinerary}
              activities={activities}
              onChange={setItinerary}
            />
          )}
          {step === 3 && basicInfo && (
            <ReviewStep basicInfo={basicInfo} itinerary={itinerary} activities={activities} />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 flex-col gap-2 border-t border-agency-border bg-bg-ghostwhite px-6 py-4">
          {saveError && (
            <p className="text-center text-[12px] font-semibold text-red-500">{saveError}</p>
          )}
          <div className="flex items-center justify-between">
            {/* Back */}
            <div>
              {step > 1 && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 rounded-full border border-agency-border px-5 py-2 text-[13px] font-semibold text-agency-dark transition-colors hover:bg-white disabled:opacity-50"
                >
                  <ArrowLeft2 size={14} color="currentColor" />
                  {t("agency.packages.back")}
                </button>
              )}
            </div>

            {/* Right actions */}
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="rounded-full border border-agency-border px-5 py-2 text-[13px] font-semibold text-agency-dark transition-colors hover:bg-white disabled:opacity-50"
              >
                {t("agency.packages.cancel")}
              </button>

              {step < 3 ? (
                <button
                  type={step === 1 ? "submit" : "button"}
                  form={step === 1 ? "pkgStep1" : undefined}
                  disabled={saving}
                  onClick={step === 2 ? () => setStep(3) : undefined}
                  className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#185FA5" }}
                >
                  {t("agency.packages.nextStep")}
                  <ArrowRight2 size={14} color="currentColor" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      if (!basicInfo) return;
                      setSaving(true);
                      setSaveError(null);
                      try { await onSaveDraft(buildInput(basicInfo)); }
                      finally { setSaving(false); }
                    }}
                    className="rounded-full border border-agency-border px-5 py-2 text-[13px] font-semibold text-agency-dark transition-colors hover:bg-white disabled:opacity-50"
                  >
                    {saving ? t("common.loading") : t("agency.packages.saveDraft")}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      if (!basicInfo) return;
                      setSaving(true);
                      setSaveError(null);
                      try { await onPublish(buildInput(basicInfo)); }
                      finally { setSaving(false); }
                    }}
                    className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "#185FA5" }}
                  >
                    <TickCircle size={14} color="currentColor" />
                    {saving ? t("common.loading") : t("agency.packages.publish")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Package Detail Modal (read-only)
// ---------------------------------------------------------------------------

function DetailModal({
  pkg,
  colorIdx,
  activities,
  onClose,
  onEdit,
  onPublish,
  onArchive,
}: {
  pkg: Package;
  colorIdx: number;
  activities: Activity[];
  onClose: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onArchive: () => void;
}) {
  const { t } = useTranslation();
  const [openDay, setOpenDay] = useState<number | null>(null);

  const CATEGORY_LABELS: Record<string, string> = {
    destination: "Destination", thingToDo: "Things To Do", food: "Restaurant", stay: "Stay",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,35,58,0.48)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex w-full flex-col rounded-[20px] bg-white"
        style={{ maxWidth: 780, maxHeight: "90vh", boxShadow: "0 24px 64px rgba(13,35,58,0.22)" }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-agency-border px-6 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-[18px] font-extrabold tracking-tight text-agency-navy truncate">{pkg.title}</h2>
            <StatusBadge status={pkg.status as keyof typeof STATUS_CFG} />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] border border-agency-border bg-bg-ghostwhite text-agency-muted transition-colors hover:bg-gray-100 ml-4"
          >
            <CloseCircle size={15} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <CoverPlaceholder colorIdx={colorIdx} height={140} />

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-[12.5px] text-agency-muted">
              <Clock size={14} color="currentColor" />
              <span>{t("agency.packages.days", { count: pkg.days })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12.5px] text-agency-muted">
              <MoneyRecive size={14} color="currentColor" />
              <span className="font-semibold text-agency-dark">${pkg.priceFrom}</span>
            </div>
            {pkg.maxGroupSize && (
              <div className="flex items-center gap-1.5 text-[12.5px] text-agency-muted">
                <People size={14} color="currentColor" />
                <span>{t("agency.packages.maxGroupSize", { n: pkg.maxGroupSize })}</span>
              </div>
            )}
            {pkg.location && (
              <div className="flex items-center gap-1.5 text-[12.5px] text-agency-muted">
                <Location size={14} color="currentColor" />
                <span>{pkg.location}</span>
              </div>
            )}
          </div>

          {pkg.description && (
            <p className="mt-3 text-[13px] leading-relaxed text-agency-dark">{pkg.description}</p>
          )}

          {/* Itinerary */}
          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-agency-navy">
                {t("agency.packages.itinerary")}
              </p>
              <div className="flex flex-col gap-2">
                {pkg.itinerary.map((d) => {
                  const dayActivities = d.activityIds
                    .map((id) => activities.find((a) => a.id === id))
                    .filter(Boolean) as Activity[];
                  const isOpen = openDay === d.day;

                  return (
                    <div key={d.day} className="overflow-hidden rounded-xl border border-agency-border">
                      <button
                        type="button"
                        onClick={() => setOpenDay(isOpen ? null : d.day)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-bg-ghostwhite transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
                            style={{ background: "#185FA5" }}
                          >
                            {d.day}
                          </div>
                          <span className="text-[12.5px] font-semibold text-agency-navy">
                            {t("agency.packages.day", { n: d.day })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-agency-muted">
                            {t("agency.packages.activitiesCount", { count: dayActivities.length })}
                          </span>
                          {isOpen ? <ArrowUp2 size={13} color="#9BA8B5" /> : <ArrowDown2 size={13} color="#9BA8B5" />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="border-t border-agency-border px-4 py-3">
                          {dayActivities.length > 0 ? (
                            <ul className="flex flex-col gap-1.5">
                              {dayActivities.map((a) => (
                                <li key={a.id} className="flex items-center gap-2.5 text-[12.5px] text-agency-dark">
                                  <span className="h-1 w-1 rounded-full bg-agency flex-shrink-0" />
                                  <span className="flex-1">{a.title}</span>
                                  <span className="text-[11px] text-agency-muted">
                                    {CATEGORY_LABELS[a.category] ?? a.category}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[12px] text-agency-muted">{t("agency.packages.noActivitiesDay")}</p>
                          )}
                          {d.notes && (
                            <p className="mt-2.5 rounded-lg bg-bg-ghostwhite px-3 py-2 text-[12px] italic text-agency-muted">
                              {d.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-end gap-2.5 border-t border-agency-border bg-bg-ghostwhite px-6 py-4">
          {pkg.status === "published" && (
            <button
              onClick={onArchive}
              className="flex items-center gap-1.5 rounded-full border border-agency-border px-5 py-2 text-[13px] font-semibold text-agency-dark transition-colors hover:bg-white"
            >
              <Archive size={14} color="currentColor" />
              {t("agency.packages.archive")}
            </button>
          )}
          {(pkg.status === "draft" || pkg.status === "archived") && (
            <button
              onClick={onPublish}
              className="flex items-center gap-1.5 rounded-full border border-green-500 px-5 py-2 text-[13px] font-semibold text-green-700 transition-colors hover:bg-green-50"
            >
              <Unlock size={14} color="currentColor" />
              {t("agency.packages.publish")}
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#185FA5" }}
          >
            <Edit2 size={14} color="currentColor" />
            {t("agency.packages.edit")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Package card
// ---------------------------------------------------------------------------

function PackageCard({
  pkg,
  colorIdx,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
}: {
  pkg: Package;
  colorIdx: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onArchive: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-agency-border bg-white transition-all hover:-translate-y-px hover:shadow-md"
    >
      <button type="button" onClick={onView} className="block">
        <CoverPlaceholder colorIdx={colorIdx} height={120} />
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name + badge */}
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={onView}
            className="flex-1 text-left text-[14px] font-bold leading-snug text-agency-navy hover:text-agency transition-colors"
          >
            {pkg.title}
          </button>
          <StatusBadge status={pkg.status as keyof typeof STATUS_CFG} />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
          <div className="flex items-center gap-1.5 text-[12px] text-agency-muted">
            <Clock size={13} color="currentColor" />
            <span>{t("agency.packages.days", { count: pkg.days })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-agency-muted">
            <MoneyRecive size={13} color="currentColor" />
            <span className="font-semibold text-agency-dark">${pkg.priceFrom}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-agency-muted">
            <Map1 size={13} color="currentColor" />
            <span>{t("agency.packages.activitiesCount", { count: pkg.activityCount })}</span>
          </div>
          {pkg.maxGroupSize && (
            <div className="flex items-center gap-1.5 text-[12px] text-agency-muted">
              <People size={13} color="currentColor" />
              <span>{t("agency.packages.maxGroupSize", { n: pkg.maxGroupSize })}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-1.5 border-t border-agency-border pt-3">
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1 rounded-[9px] border border-agency-border bg-bg-ghostwhite py-2 text-[11.5px] font-semibold text-agency-muted transition-all hover:border-agency hover:bg-agency-light hover:text-agency"
          >
            <Edit2 size={12} color="currentColor" />
            {t("agency.packages.edit")}
          </button>

          {pkg.status === "published" ? (
            <button
              onClick={onArchive}
              className="flex flex-1 items-center justify-center gap-1 rounded-[9px] border border-agency-border bg-bg-ghostwhite py-2 text-[11.5px] font-semibold text-agency-muted transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
            >
              <Archive size={12} color="currentColor" />
              {t("agency.packages.archive")}
            </button>
          ) : (
            <button
              onClick={onPublish}
              className="flex flex-1 items-center justify-center gap-1 rounded-[9px] border border-agency-border bg-bg-ghostwhite py-2 text-[11.5px] font-semibold text-agency-muted transition-all hover:border-green-400 hover:bg-green-50 hover:text-green-600"
            >
              <Unlock size={12} color="currentColor" />
              {t("agency.packages.publish")}
            </button>
          )}

          <button
            onClick={onDelete}
            className="flex flex-1 items-center justify-center gap-1 rounded-[9px] border border-agency-border bg-bg-ghostwhite py-2 text-[11.5px] font-semibold text-agency-muted transition-all hover:border-red-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash size={12} color="currentColor" />
            {t("agency.packages.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-[18px]"
        style={{ background: "#F1F5F9", color: "#C8D0DA" }}
      >
        <Box size={30} />
      </div>
      <p className="mb-1.5 text-[17px] font-bold text-agency-navy">{t("agency.packages.emptyTitle")}</p>
      <p className="mb-5 max-w-[280px] text-[13px] leading-relaxed text-agency-muted">
        {t("agency.packages.emptyDesc")}
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "#185FA5", boxShadow: "0 2px 8px rgba(24,95,165,0.28)" }}
      >
        <Add size={15} color="currentColor" variant="Bold" />
        {t("agency.packages.createFirst")}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete confirm modal
// ---------------------------------------------------------------------------

function DeleteModal({ pkg, onConfirm, onCancel }: { pkg: Package; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,35,58,0.48)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-[440px] rounded-[20px] bg-white p-6"
        style={{ boxShadow: "0 24px 64px rgba(13,35,58,0.22)" }}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#FEE2E2" }}>
          <Trash size={26} color="#EF4444" />
        </div>
        <h3 className="mb-2 text-center text-[18px] font-bold text-agency-navy">{t("agency.packages.deleteTitle")}</h3>
        <p className="mb-6 text-center text-[13px] text-agency-muted">
          {t("agency.packages.deleteConfirm", { name: pkg.title })}
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-agency-border py-2.5 text-[13px] font-semibold text-agency-dark transition-colors hover:bg-bg-ghostwhite"
          >
            {t("agency.packages.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#EF4444" }}
          >
            {t("agency.packages.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function PackagesContent() {
  const { t } = useTranslation();
  const { role } = useSession();

  const packages       = useAgencyStore((s) => s.packages);
  const activities     = useAgencyStore((s) => s.activities);
  const setPackages    = useAgencyStore((s) => s.setPackages);
  const deletePackage  = useAgencyStore((s) => s.deletePackage);
  const publishPackage = useAgencyStore((s) => s.publishPackage);
  const archivePackage = useAgencyStore((s) => s.archivePackage);

  const [activeTab, setActiveTab]   = useState<TabId>("all");
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState(false);

  useEffect(() => {
    getPackages().then((result) => {
      if (result.ok) setPackages(result.data);
      else setLoadError(true);
      setLoading(false);
    });
  }, [setPackages]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPkg, setEditPkg]       = useState<Package | null>(null);
  const [viewPkg, setViewPkg]       = useState<Package | null>(null);
  const [deletePkg, setDeletePkg]   = useState<Package | null>(null);

  const counts = useMemo(
    () => ({
      all:       packages.length,
      published: packages.filter((p) => p.status === "published").length,
      draft:     packages.filter((p) => p.status === "draft").length,
      archived:  packages.filter((p) => p.status === "archived").length,
    }),
    [packages],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return packages.filter((p) => {
      const matchTab = activeTab === "all" || p.status === activeTab;
      const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.location ?? "").toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [packages, activeTab, search]);

  async function handleSaveDraft(input: PackageInput): Promise<void> {
    if (editPkg) {
      const result = await updatePackageApi(editPkg.id, input);
      if (!result.ok) { return; }
      const list = await getPackages();
      if (list.ok) setPackages(list.data);
      setEditPkg(null);
    } else {
      const result = await createPackageApi(input);
      if (!result.ok) { return; }
      const list = await getPackages();
      if (list.ok) setPackages(list.data);
      setCreateOpen(false);
    }
  }

  async function handlePublishSave(input: PackageInput): Promise<void> {
    if (editPkg) {
      const updateResult = await updatePackageApi(editPkg.id, input);
      if (!updateResult.ok) { return; }
      await publishPackageApi(editPkg.id);
      const list = await getPackages();
      if (list.ok) setPackages(list.data);
      setEditPkg(null);
    } else {
      const createResult = await createPackageApi(input);
      if (!createResult.ok) { return; }
      await publishPackageApi(createResult.data.id);
      const list = await getPackages();
      if (list.ok) setPackages(list.data);
      setCreateOpen(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-agency-border bg-white px-7 py-6">
        <h1 className="text-[24px] font-extrabold tracking-tight leading-tight text-agency-navy">
          {t("agency.packages.pageTitle")}
        </h1>
        <p className="mt-1 text-[13px] text-agency-muted">{t("agency.packages.pageSubtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-agency-border px-7">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const count = counts[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 bg-transparent border-none px-3.5 py-3 text-[13px] transition-colors whitespace-nowrap"
                style={{
                  borderBottom: isActive ? "2px solid #185FA5" : "2px solid transparent",
                  marginBottom: -1,
                  color: isActive ? "#185FA5" : "#9BA8B5",
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {t(tab.labelKey)}
                <span
                  className="rounded-full px-1.5 py-px text-[10.5px] font-bold"
                  style={
                    isActive
                      ? { background: "#185FA5", color: "#FFFFFF" }
                      : { background: "#E1E6EC", color: "#9BA8B5" }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + create */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0 px-7 py-4">
        <SearchField
          value={search}
          onChange={setSearch}
          aria-label={t("agency.packages.search")}
          className="max-w-[340px] w-full"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={t("agency.packages.search")} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <Button
          onPress={() => setCreateOpen(true)}
          className="flex-shrink-0 rounded-full !bg-agency !text-white flex items-center gap-1.5"
        >
          <Add size={15} color="currentColor" variant="Bold" />
          {t("agency.packages.createNew")}
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 px-7 pb-12">
        {loading ? (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[260px] rounded-2xl" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="mb-1.5 text-[17px] font-bold text-agency-navy">{t("agency.packages.emptyTitle")}</p>
            <p className="mb-5 text-[13px] text-agency-muted">{t("common.loadError")}</p>
            <Button
              onPress={() => {
                setLoadError(false);
                setLoading(true);
                getPackages().then((result) => {
                  if (result.ok) setPackages(result.data);
                  else setLoadError(true);
                  setLoading(false);
                });
              }}
              className="rounded-full !bg-agency !text-white"
            >
              {t("common.retry")}
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {filtered.map((pkg, idx) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                colorIdx={idx}
                onView={() => setViewPkg(pkg)}
                onEdit={() => setEditPkg(pkg)}
                onDelete={() => setDeletePkg(pkg)}
                onPublish={async () => {
                  const result = await publishPackageApi(pkg.id);
                  if (result.ok) publishPackage(role, pkg.id);
                }}
                onArchive={async () => {
                  const result = await archivePackageApi(pkg.id);
                  if (result.ok) archivePackage(role, pkg.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {createOpen && (
        <PackageModal
          activities={activities}
          onClose={() => setCreateOpen(false)}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublishSave}
        />
      )}

      {/* Edit modal */}
      {editPkg && (
        <PackageModal
          key={editPkg.id}
          pkg={editPkg}
          activities={activities}
          onClose={() => setEditPkg(null)}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublishSave}
        />
      )}

      {/* Detail modal */}
      {viewPkg && (
        <DetailModal
          pkg={viewPkg}
          colorIdx={filtered.indexOf(viewPkg)}
          activities={activities}
          onClose={() => setViewPkg(null)}
          onEdit={() => { setEditPkg(viewPkg); setViewPkg(null); }}
          onPublish={async () => {
            const result = await publishPackageApi(viewPkg.id);
            if (result.ok) { publishPackage(role, viewPkg.id); setViewPkg(null); }
          }}
          onArchive={async () => {
            const result = await archivePackageApi(viewPkg.id);
            if (result.ok) { archivePackage(role, viewPkg.id); setViewPkg(null); }
          }}
        />
      )}

      {/* Delete confirm */}
      {deletePkg && (
        <DeleteModal
          pkg={deletePkg}
          onConfirm={async () => {
            const result = await deletePackageApi(deletePkg.id);
            if (result.ok) { deletePackage(role, deletePkg.id); setDeletePkg(null); }
          }}
          onCancel={() => setDeletePkg(null)}
        />
      )}
    </div>
  );
}
