"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Location, Star1, Calendar, Box1, Trash } from "iconsax-reactjs";
import { Button, Chip, StatusChip, useConfirm } from "@/ui";
import { CardImage } from "@/ui/CardImage";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocalizedRouter } from "@/lib/locale";
import { formatPrice, formatRating, formatDate } from "@/lib/format";
import { sendRealtime, TOURS_CHANGED } from "@/lib/realtime";
import {
  archivePackageAction,
  deletePackageAction,
  publishPackageAction,
} from "@/actions/tours";
import type { TourPackageResponse } from "@/lib/api/packages";

/** UPPER_SNAKE enum → "Title Case" (province / travel-type labels). */
function prettyEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** One label/value row inside the Details card. */
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-muted text-sm">{label}</span>
      <span className="text-text-primary text-sm font-medium">{value}</span>
    </div>
  );
}

/**
 * Admin tour-package detail view. Rendered inside the admin shell by
 * `/[locale]/admin/content/packages/[id]`. Read-only overview with the
 * day-by-day agenda — publish / archive / delete stay on the content list.
 * Data is fetched server-side and passed in.
 */
export function PackageDetail({ pkg }: { pkg: TourPackageResponse }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useRouter();
  const localizedRouter = useLocalizedRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  const status = pkg.status.toLowerCase();
  const isPublished = status === "published";

  /** Run a publish/archive mutation, emit the realtime frame, then refresh. */
  const runAction = async (action: (id: string) => Promise<{ ok: boolean }>) => {
    setBusy(true);
    const res = await action(pkg.id);
    setBusy(false);
    if (res?.ok) sendRealtime({ event: TOURS_CHANGED, data: { id: pkg.id } });
    router.refresh();
  };

  const handleArchive = async () => {
    const ok = await confirm({
      title: t("admin.packages.archiveConfirm.title"),
      description: t("admin.packages.archiveConfirm.description"),
      intent: "warning",
      confirmLabel: t("admin.packages.actions.archive"),
    });
    if (ok) runAction(archivePackageAction);
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: t("admin.packages.deleteConfirm.title"),
      description: t("admin.packages.deleteConfirm.description"),
      intent: "danger",
      confirmLabel: t("admin.packages.actions.confirmDelete"),
    });
    if (!ok) return;
    setBusy(true);
    const res = await deletePackageAction(pkg.id);
    if (res?.ok) {
      sendRealtime({ event: TOURS_CHANGED, data: { id: pkg.id } });
      localizedRouter.push("/admin/content?tab=packages");
    } else {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <LocaleLink
          href="/admin/content?tab=packages"
          className="text-muted hover:text-foreground flex w-fit items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft size={16} color="currentColor" />
          {t("admin.packageDetail.back")}
        </LocaleLink>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-primary text-2xl font-bold tracking-tight">{pkg.title}</h1>
              <StatusChip status={status} />
            </div>
            <p className="text-muted mt-1 text-sm">
              {t("admin.packages.by", { agency: pkg.agencyName })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              isPending={busy}
              onPress={() =>
                isPublished ? handleArchive() : runAction(publishPackageAction)
              }
            >
              {isPublished
                ? t("admin.packages.actions.archive")
                : t("admin.packages.actions.publish")}
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              className="text-danger"
              isPending={busy}
              onPress={handleDelete}
            >
              <Trash size={16} color="currentColor" />
              {t("admin.packages.actions.delete")}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column — cover + description + agenda */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface shadow-primary relative aspect-[16/9] overflow-hidden rounded-2xl">
            <CardImage
              src={pkg.coverImageUrl || pkg.image}
              alt={pkg.title}
              sizes="(max-width: 1024px) 100vw, 768px"
            />
          </div>

          <section className="bg-surface shadow-primary flex flex-col gap-2 rounded-2xl p-5">
            <h3 className="text-primary font-semibold tracking-tight">
              {t("admin.packageDetail.description")}
            </h3>
            <p className="text-foreground text-sm leading-relaxed">
              {pkg.description || t("admin.packageDetail.noDescription")}
            </p>
          </section>

          <section className="bg-surface shadow-primary flex flex-col gap-4 rounded-2xl p-5">
            <h3 className="text-primary font-semibold tracking-tight">
              {t("admin.packageDetail.agenda")}
            </h3>
            {pkg.agenda.length === 0 ? (
              <p className="text-muted text-sm">{t("admin.packageDetail.noAgenda")}</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {pkg.agenda
                  .slice()
                  .sort((a, b) => a.dayNumber - b.dayNumber)
                  .map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <span className="bg-primary/10 text-primary inline-flex h-7 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-semibold">
                        {t("admin.packageDetail.day", { day: item.dayNumber })}
                      </span>
                      <div className="min-w-0">
                        <p className="text-text-primary text-sm font-semibold">{item.title}</p>
                        {item.description ? (
                          <p className="text-muted mt-0.5 text-sm">{item.description}</p>
                        ) : null}
                        {item.activities.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.activities.map((a, i) => (
                              <Chip key={`${a}-${i}`} color="default" variant="soft" size="sm">
                                {a}
                              </Chip>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
              </ol>
            )}
          </section>
        </div>

        {/* Side column — details */}
        <aside className="flex flex-col gap-6">
          <section className="bg-surface shadow-primary flex flex-col rounded-2xl p-5">
            <h3 className="text-primary mb-1 font-semibold tracking-tight">
              {t("admin.packageDetail.details")}
            </h3>
            <div className="divide-border divide-y">
              <DetailRow
                label={t("admin.packageDetail.price")}
                value={formatPrice(pkg.price, pkg.currency, lng)}
              />
              <DetailRow
                label={t("admin.packageDetail.duration")}
                value={t("admin.packages.days", { count: pkg.durationDays })}
              />
              <DetailRow
                label={t("admin.packageDetail.agenda")}
                value={t("admin.packages.activities", { count: pkg.agenda.length })}
              />
              <DetailRow
                label={t("admin.packageDetail.province")}
                value={prettyEnum(pkg.province)}
              />
              <DetailRow
                label={t("admin.packageDetail.travelType")}
                value={prettyEnum(pkg.travelType)}
              />
              <DetailRow
                label={t("admin.packageDetail.rating")}
                value={
                  <span className="flex items-center gap-1">
                    <Star1 size={14} color="currentColor" variant="Bold" className="text-warning" />
                    {formatRating(pkg.rating, lng)}
                    <span className="text-muted">
                      ({t("admin.packageDetail.reviews", { count: pkg.reviewCount })})
                    </span>
                  </span>
                }
              />
              <DetailRow
                label={t("admin.packageDetail.created")}
                value={
                  <span className="flex items-center gap-1">
                    <Calendar size={14} color="currentColor" className="text-muted" />
                    {formatDate(pkg.createdAt, lng)}
                  </span>
                }
              />
            </div>
          </section>

          <section className="bg-surface shadow-primary flex items-center gap-3 rounded-2xl p-5">
            <span className="bg-purple-500/10 text-purple-600 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Box1 size={18} color="currentColor" variant="Bold" />
            </span>
            <div className="min-w-0">
              <p className="text-text-primary truncate text-sm font-semibold">{pkg.agencyName}</p>
              <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                <Location size={12} color="currentColor" />
                {prettyEnum(pkg.province)}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
