"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Location, Star1, Calendar, Edit2, Trash } from "iconsax-reactjs";
import { Button, Chip, useConfirm } from "@/ui";
import { CardImage } from "@/ui/CardImage";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocalizedRouter } from "@/lib/locale";
import { formatPrice, formatRating, formatDate } from "@/lib/format";
import { sendRealtime, DESTINATIONS_CHANGED } from "@/lib/realtime";
import { deleteDestinationAction } from "@/actions/tours";
import { DestinationForm } from "@/features/tours/components/DestinationForm";
import type { DestinationResponse } from "@/lib/api/destinations";

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
 * Admin destination detail view. Rendered inside the admin shell by
 * `/[locale]/admin/content/destinations/[id]`. Read-only overview — create /
 * edit / delete stay on the content list. Data is fetched server-side and
 * passed in.
 */
export function DestinationDetail({ destination: d }: { destination: DestinationResponse }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useRouter();
  const localizedRouter = useLocalizedRouter();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(false);

  const handleDelete = () =>
    confirm({
      title: t("tours.admin.destinations.deleteConfirm.title"),
      description: t("tours.admin.destinations.deleteConfirm.description", { name: d.name }),
      intent: "danger",
      confirmLabel: t("common.delete"),
      onConfirm: async () => {
        await deleteDestinationAction(d.id);
        sendRealtime({ event: DESTINATIONS_CHANGED, data: { id: d.id } });
        localizedRouter.push("/admin/content?tab=destinations");
      },
    });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <LocaleLink
          href="/admin/content?tab=destinations"
          className="text-muted hover:text-foreground flex w-fit items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft size={16} color="currentColor" />
          {t("admin.destinationDetail.back")}
        </LocaleLink>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-primary text-2xl font-bold tracking-tight">{d.name}</h1>
              {d.featured ? (
                <Chip color="accent" variant="soft" size="sm">
                  {t("admin.destinationDetail.featured")}
                </Chip>
              ) : null}
              {d.trending ? (
                <Chip color="warning" variant="soft" size="sm">
                  {t("admin.destinationDetail.trending")}
                </Chip>
              ) : null}
            </div>
            <p className="text-muted mt-1 flex items-center gap-1 text-sm">
              <Location size={14} color="currentColor" />
              {prettyEnum(d.province)} · {prettyEnum(d.travelType)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" size="sm" onPress={() => setEditing(true)}>
              <Edit2 size={16} color="currentColor" />
              {t("common.edit")}
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              className="text-danger"
              onPress={handleDelete}
            >
              <Trash size={16} color="currentColor" />
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </header>

      <DestinationForm
        isOpen={editing}
        destination={d}
        onClose={() => setEditing(false)}
        onSaved={() => {
          sendRealtime({ event: DESTINATIONS_CHANGED, data: { id: d.id } });
          setEditing(false);
          router.refresh();
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column — cover + description + photos */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface shadow-primary relative aspect-[16/9] overflow-hidden rounded-2xl">
            <CardImage
              src={d.coverImageUrl || d.heroImage}
              alt={d.name}
              sizes="(max-width: 1024px) 100vw, 768px"
            />
          </div>

          <section className="bg-surface shadow-primary flex flex-col gap-2 rounded-2xl p-5">
            <h3 className="text-primary font-semibold tracking-tight">
              {t("admin.destinationDetail.description")}
            </h3>
            <p className="text-foreground text-sm leading-relaxed">
              {d.description || d.shortDescription || t("admin.destinationDetail.noDescription")}
            </p>
          </section>

          {d.photos.length > 0 ? (
            <section className="bg-surface shadow-primary flex flex-col gap-3 rounded-2xl p-5">
              <h3 className="text-primary font-semibold tracking-tight">
                {t("admin.destinationDetail.photos")}
              </h3>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                {d.photos.map((photo, i) => (
                  <li
                    key={`${photo}-${i}`}
                    className="relative aspect-square overflow-hidden rounded-xl"
                  >
                    <CardImage src={photo} alt={`${d.name} ${i + 1}`} sizes="160px" />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Side column — details */}
        <aside className="flex flex-col gap-6">
          <section className="bg-surface shadow-primary flex flex-col rounded-2xl p-5">
            <h3 className="text-primary mb-1 font-semibold tracking-tight">
              {t("admin.destinationDetail.details")}
            </h3>
            <div className="divide-border divide-y">
              <DetailRow
                label={t("admin.destinationDetail.priceFrom")}
                value={formatPrice(d.priceFrom, d.currency, lng)}
              />
              <DetailRow
                label={t("admin.destinationDetail.rating")}
                value={
                  <span className="flex items-center gap-1">
                    <Star1 size={14} color="currentColor" variant="Bold" className="text-warning" />
                    {formatRating(d.rating, lng)}
                    <span className="text-muted">
                      ({t("admin.destinationDetail.reviews", { count: d.reviewCount })})
                    </span>
                  </span>
                }
              />
              <DetailRow
                label={t("admin.destinationDetail.category")}
                value={prettyEnum(d.category)}
              />
              <DetailRow label={t("admin.destinationDetail.city")} value={d.city} />
              <DetailRow label={t("admin.destinationDetail.country")} value={d.country} />
              <DetailRow
                label={t("admin.destinationDetail.coordinates")}
                value={`${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}`}
              />
              <DetailRow
                label={t("admin.destinationDetail.created")}
                value={
                  <span className="flex items-center gap-1">
                    <Calendar size={14} color="currentColor" className="text-muted" />
                    {formatDate(d.createdAt, lng)}
                  </span>
                }
              />
            </div>
          </section>

          {d.tags.length > 0 ? (
            <section className="bg-surface shadow-primary flex flex-col gap-3 rounded-2xl p-5">
              <h3 className="text-primary font-semibold tracking-tight">
                {t("admin.destinationDetail.tags")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {d.tags.map((tag) => (
                  <Chip key={tag} color="default" variant="soft" size="sm">
                    {tag}
                  </Chip>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
