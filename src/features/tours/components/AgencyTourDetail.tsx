"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Location,
  Calendar as CalendarIcon,
  Profile2User,
  Money,
  Global,
  ShieldTick,
  Clock,
  TickCircle,
  CloseCircle,
  Star1,
  Messages2,
  Routing,
  Layer,
  ExportSquare,
  Trash,
} from "iconsax-reactjs";
import { sileo } from "sileo";
import { Button, StatusChip } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { formatPrice, formatDate } from "@/lib/format";
import { useLocalizedRouter } from "@/lib/locale";
import type {
  TourApprovalStatus,
  TourPackageResponse,
  TourPackageStatus,
} from "@/lib/api/packages";
import {
  submitPackageAction,
  archivePackageAction,
  deletePackageAction,
} from "@/actions/tours";

type Props = {
  package: TourPackageResponse;
};

/** Split a "one per line" / comma-separated authoring string into trimmed items. */
function toItems(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** The pill the package status should reflect: publication state, or approval state while still a draft. */
function chipStatus(p: TourPackageResponse): string {
  if (p.status === "PUBLISHED") return "published";
  if (p.status === "ARCHIVED") return "archived";
  const approval = p.approvalStatus?.toUpperCase() as TourApprovalStatus | undefined;
  if (approval === "PENDING") return "pending";
  if (approval === "REJECTED") return "rejected";
  if (approval === "APPROVED") return "approved";
  return "draft";
}

/** A single labelled fact tile in the "Key details" grid. */
function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border bg-bg-ghostwhite/40 flex items-start gap-3 rounded-xl border p-3">
      <span className="bg-primary/10 text-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-muted text-[10px] font-medium tracking-wide uppercase">{label}</p>
        <p className="text-text-primary mt-0.5 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

/** A list of items rendered with a leading tick / cross marker. */
function MarkerList({
  items,
  variant,
}: {
  items: string[];
  variant: "include" | "exclude";
}) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="text-muted flex items-start gap-2 text-sm">
          {variant === "include" ? (
            <TickCircle
              size={18}
              color="currentColor"
              variant="Bold"
              className="mt-0.5 shrink-0 text-emerald-600"
            />
          ) : (
            <CloseCircle
              size={18}
              color="currentColor"
              variant="Bold"
              className="mt-0.5 shrink-0 text-red-500"
            />
          )}
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Card shell matching the agency/admin surface (surface bg, shadow, rounded-2xl). */
function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border-border shadow-primary rounded-2xl border p-5">
      {title ? (
        <h2 className="text-text-primary mb-4 text-base font-semibold tracking-tight">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

/**
 * Agency-side detail view of one tour package — lists every field the agency
 * authored (identity, logistics, story, itinerary) plus lifecycle state and
 * actions. Lives inside the agency AppShell; reuses the lifecycle server actions
 * from the packages list.
 */
export function AgencyTourDetail({ package: p }: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useLocalizedRouter();
  const [pending, setPending] = useState(false);
  const [pkg, setPkg] = useState(p);

  const highlights = toItems(pkg.highlights);
  const included = toItems(pkg.included);
  const excluded = toItems(pkg.excluded);
  const languages = toItems(pkg.languages);
  const activityTypes = toItems(pkg.activityTypes);
  const agenda = [...(pkg.agenda ?? [])].sort((a, b) => a.dayNumber - b.dayNumber);
  const approval = pkg.approvalStatus?.toUpperCase() as TourApprovalStatus | undefined;
  const isDraft = pkg.status === "DRAFT";
  const dash = "—";

  const handleSubmit = async () => {
    setPending(true);
    try {
      const res = await submitPackageAction(pkg.id);
      if (res.ok) {
        setPkg((prev) => ({ ...prev, approvalStatus: "PENDING" }));
        sileo.success({
          title: t("tours.packages.toast.submitted"),
          description: t("tours.packages.toast.submittedDesc"),
        });
      } else {
        sileo.error({
          title: t("tours.packages.toast.submitError"),
          description: t("tours.packages.toast.submitErrorDesc"),
        });
      }
    } finally {
      setPending(false);
    }
  };

  const handleArchive = async () => {
    setPending(true);
    try {
      await archivePackageAction(pkg.id);
      setPkg((prev) => ({ ...prev, status: "ARCHIVED" as TourPackageStatus }));
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    setPending(true);
    try {
      await deletePackageAction(pkg.id);
      router.push("/agency/tours");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <LocaleLink
        href="/agency/tours"
        className="text-muted hover:text-foreground inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={18} color="currentColor" />
        {t("tours.packages.detail.back")}
      </LocaleLink>

      {/* Hero */}
      <div className="bg-surface border-border shadow-primary overflow-hidden rounded-2xl border">
        <div className="bg-bg-ghostwhite relative aspect-[21/9] w-full">
          {pkg.coverImageUrl || pkg.image ? (
            <Image
              src={pkg.coverImageUrl || pkg.image}
              alt={pkg.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1100px"
              priority
            />
          ) : (
            <div className="text-muted flex h-full w-full items-center justify-center">
              <Layer size={40} color="currentColor" variant="Bulk" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusChip status={chipStatus(pkg)} />
                {pkg.familyFriendly ? (
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {t("tours.packages.detail.familyFriendly")}
                  </span>
                ) : null}
              </div>
              <h1 className="truncate text-2xl font-bold tracking-tight text-white drop-shadow">
                {pkg.title}
              </h1>
              {pkg.tagline ? (
                <p className="mt-1 truncate text-sm text-white/85">{pkg.tagline}</p>
              ) : null}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => router.push(`/tours/${pkg.slug ?? pkg.id}`)}
            >
              <ExportSquare size={16} color="currentColor" />
              {t("tours.packages.detail.viewPublic")}
            </Button>
          </div>
        </div>
      </div>

      {/* Rejection banner */}
      {approval === "REJECTED" && pkg.rejectionReason ? (
        <div className="border-danger/30 bg-danger/10 flex items-start gap-2 rounded-xl border px-4 py-3">
          <CloseCircle
            size={18}
            color="currentColor"
            variant="Bold"
            className="text-danger mt-0.5 shrink-0"
          />
          <p className="text-danger text-sm font-medium">
            {t("tours.packages.rejectedReason", { reason: pkg.rejectionReason })}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — authored content */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Key details */}
          <Section title={t("tours.packages.detail.facts.title")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Fact
                icon={<Location size={18} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.facts.province")}
                value={t(`destinations.provinces.${pkg.province}`)}
              />
              <Fact
                icon={<Layer size={18} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.facts.travelType")}
                value={t(`destinations.travelTypes.${pkg.travelType}`)}
              />
              <Fact
                icon={<CalendarIcon size={18} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.facts.duration")}
                value={t("tours.packages.days", {
                  count: pkg.durationDays || pkg.days || 1,
                })}
              />
              <Fact
                icon={<Money size={18} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.facts.price")}
                value={formatPrice(pkg.priceFrom ?? pkg.price, pkg.currency, lng)}
              />
              <Fact
                icon={<Profile2User size={18} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.facts.groupSize")}
                value={
                  pkg.groupSizeMax
                    ? t("tours.packages.detail.facts.groupSizeValue", {
                        count: pkg.groupSizeMax,
                      })
                    : dash
                }
              />
              <Fact
                icon={<Global size={18} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.facts.languages")}
                value={languages.length ? languages.join(", ") : dash}
              />
              {pkg.durationCategory ? (
                <Fact
                  icon={<Clock size={18} color="currentColor" variant="Bold" />}
                  label={t("tours.packages.detail.facts.durationCategory")}
                  value={t(
                    `tours.packages.detail.durationCategories.${pkg.durationCategory}`,
                  )}
                />
              ) : null}
              <Fact
                icon={<ShieldTick size={18} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.facts.cancellation")}
                value={pkg.cancellationPolicy || dash}
              />
            </div>

            {activityTypes.length ? (
              <div className="mt-4">
                <p className="text-muted text-[10px] font-medium tracking-wide uppercase">
                  {t("tours.packages.detail.facts.activityTypes")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activityTypes.map((a) => (
                    <span
                      key={a}
                      className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </Section>

          {/* Description */}
          {pkg.description ? (
            <Section title={t("tours.detail.overview.about")}>
              <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                {pkg.description}
              </p>
            </Section>
          ) : null}

          {/* Highlights */}
          {highlights.length ? (
            <Section title={t("tours.detail.overview.highlights")}>
              <ul className="grid gap-2 sm:grid-cols-2">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="text-foreground flex items-start gap-2 text-sm"
                  >
                    <TickCircle
                      size={18}
                      color="currentColor"
                      variant="Bold"
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {/* Included / excluded */}
          {included.length || excluded.length ? (
            <Section>
              <div className="grid gap-6 sm:grid-cols-2">
                {included.length ? (
                  <div>
                    <h3 className="text-text-primary text-base font-semibold">
                      {t("tours.detail.overview.included")}
                    </h3>
                    <MarkerList items={included} variant="include" />
                  </div>
                ) : null}
                {excluded.length ? (
                  <div>
                    <h3 className="text-text-primary text-base font-semibold">
                      {t("tours.detail.overview.excluded")}
                    </h3>
                    <MarkerList items={excluded} variant="exclude" />
                  </div>
                ) : null}
              </div>
            </Section>
          ) : null}

          {/* Itinerary */}
          {agenda.length ? (
            <Section title={t("tours.detail.travelPlan.title")}>
              <ol className="flex flex-col gap-4">
                {agenda.map((day) => (
                  <li key={day.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="bg-primary/10 text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        {day.dayNumber}
                      </span>
                      <span className="bg-border mt-1 w-px flex-1" />
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className="text-primary text-[10px] font-medium tracking-wide uppercase">
                        {t("tours.detail.travelPlan.day", { day: day.dayNumber })}
                      </p>
                      <p className="text-text-primary text-sm font-semibold">{day.title}</p>
                      {day.description ? (
                        <p className="text-muted mt-1 text-sm leading-relaxed">
                          {day.description}
                        </p>
                      ) : null}
                      {day.activities?.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {day.activities.map((a) => (
                            <span
                              key={a}
                              className="bg-bg-ghostwhite text-text-secondary rounded-full px-2.5 py-0.5 text-xs"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}
        </div>

        {/* Right column — lifecycle, stats, timeline */}
        <aside className="flex flex-col gap-6">
          {/* Actions */}
          <Section title={t("tours.packages.detail.actions.title")}>
            <div className="flex flex-col gap-2">
              {pkg.status === "PUBLISHED" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  isPending={pending}
                  onPress={handleArchive}
                >
                  {t("tours.packages.archive")}
                </Button>
              ) : isDraft && approval === "PENDING" ? (
                <div className="bg-warning/10 border-warning/30 flex items-center gap-2 rounded-xl border px-4 py-2.5">
                  <span className="text-warning text-sm font-medium">
                    {t("tours.packages.awaiting")}
                  </span>
                </div>
              ) : isDraft ? (
                <Button
                  variant="primary"
                  size="sm"
                  isPending={pending}
                  onPress={handleSubmit}
                >
                  {t(
                    approval === "REJECTED"
                      ? "tours.packages.resubmit"
                      : "tours.packages.requestApproval",
                  )}
                </Button>
              ) : null}
              <Button
                variant="tertiary"
                size="sm"
                className="text-danger justify-start"
                isPending={pending}
                onPress={handleDelete}
              >
                <Trash size={15} color="currentColor" />
                {t("common.delete")}
              </Button>
            </div>
          </Section>

          {/* Stats */}
          <Section title={t("tours.packages.detail.stats.title")}>
            <dl className="grid grid-cols-2 gap-3">
              <Stat
                icon={<Star1 size={16} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.stats.rating")}
                value={pkg.rating ? pkg.rating.toFixed(1) : dash}
              />
              <Stat
                icon={<Messages2 size={16} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.stats.reviews")}
                value={String(pkg.reviewCount ?? 0)}
              />
              <Stat
                icon={<Routing size={16} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.stats.bookings")}
                value={String(pkg.bookingsCount ?? 0)}
              />
              <Stat
                icon={<Layer size={16} color="currentColor" variant="Bold" />}
                label={t("tours.packages.detail.stats.activities")}
                value={String(pkg.activityCount ?? agenda.length)}
              />
            </dl>
          </Section>

          {/* Timeline */}
          <Section title={t("tours.packages.detail.timeline.title")}>
            <dl className="flex flex-col gap-3 text-sm">
              <TimelineRow
                label={t("tours.packages.detail.timeline.created")}
                value={pkg.createdAt ? formatDate(pkg.createdAt, lng) : dash}
              />
              <TimelineRow
                label={t("tours.packages.detail.timeline.updated")}
                value={pkg.updatedAt ? formatDate(pkg.updatedAt, lng) : dash}
              />
              {pkg.submittedAt ? (
                <TimelineRow
                  label={t("tours.packages.detail.timeline.submitted")}
                  value={formatDate(pkg.submittedAt, lng)}
                />
              ) : null}
              {pkg.reviewedAt ? (
                <TimelineRow
                  label={t("tours.packages.detail.timeline.reviewed")}
                  value={formatDate(pkg.reviewedAt, lng)}
                />
              ) : null}
            </dl>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border bg-bg-ghostwhite/40 rounded-xl border p-3">
      <div className="text-muted flex items-center gap-1.5">
        {icon}
        <dt className="text-[10px] font-medium tracking-wide uppercase">{label}</dt>
      </div>
      <dd className="text-text-primary mt-1 text-lg font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-text-primary font-medium tabular-nums">{value}</dd>
    </div>
  );
}
