"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Star1, Location, Sms, Call, Flag } from "iconsax-reactjs";
import { Avatar, Button, Card } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useResource } from "@/lib/useResource";
import { useLocalizedRouter } from "@/lib/locale";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatRating } from "@/lib/format";
import { TourCard } from "@/features/destinations/components/TourCard";
import { getAgencyTours } from "../data";
import type { TourDetail } from "../types";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Other tours by this agency — horizontal scroll, reusing the TourCard. */
function OtherTours({
  agencyId,
  excludeId,
}: {
  agencyId: string;
  excludeId: string;
}) {
  const { t } = useTranslation();
  const fetcher = useCallback(
    () => getAgencyTours(agencyId, excludeId),
    [agencyId, excludeId],
  );
  const { status, data } = useResource(fetcher);

  if (status !== "success" || !data || data.length === 0) return null;

  return (
    <section>
      <h3 className="text-foreground text-base font-semibold">
        {t("tours.detail.agency.otherTours")}
      </h3>
      <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
        {data.map((tour) => (
          <LocaleLink
            key={tour.id}
            href={`/tours/${tour.slug}`}
            className="w-64 shrink-0"
          >
            <TourCard tour={tour} />
          </LocaleLink>
        ))}
      </div>
    </section>
  );
}

/** Agency tab: profile card, contact, full-profile link, and other tours. */
export function AgencyTab({ tour }: { tour: TourDetail }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useLocalizedRouter();
  const { role } = useSession();
  const { agency } = tour;
  const canReport = can(role, "reportAgency");

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-border flex flex-col gap-5 rounded-3xl border p-6">
        <div className="flex items-start gap-4">
          <Avatar size="lg">
            <Avatar.Image src={agency.logo} alt={agency.name} />
            <Avatar.Fallback>{initialsOf(agency.name)}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              {agency.name}
            </h2>
            <div className="text-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <Location
                  size={15}
                  color="currentColor"
                  variant="Bold"
                  className="text-primary"
                />
                {agency.province}
              </span>
              <span className="flex items-center gap-1.5">
                <Star1
                  size={15}
                  color="currentColor"
                  variant="Bold"
                  className="text-warning"
                />
                {formatRating(agency.rating, lng)}
                <span className="text-muted">
                  ·{" "}
                  {t("destinations.card.reviews", {
                    count: agency.reviewCount,
                  })}
                </span>
              </span>
              <span>
                {t("tours.detail.agency.tours", { count: agency.tourCount })}
              </span>
            </div>
          </div>
        </div>

        <p className="text-muted text-sm leading-relaxed">{agency.bio}</p>

        <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
          <p className="text-foreground font-medium">
            {t("tours.detail.agency.contact")}
          </p>
          <a
            href={`mailto:${agency.contactEmail}`}
            className="text-muted hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <Sms size={15} color="currentColor" variant="Bold" />
            {agency.contactEmail}
          </a>
          <a
            href={`tel:${agency.contactPhone}`}
            className="text-muted hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <Call size={15} color="currentColor" variant="Bold" />
            {agency.contactPhone}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onPress={() => router.push(`/agencies/${agency.id}`)}
          >
            {t("tours.detail.agency.viewProfile")}
          </Button>
          {canReport ? (
            <button
              type="button"
              onClick={() => router.push(`/traveler/report/${agency.id}`)}
              className="text-muted hover:text-danger inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <Flag size={14} color="currentColor" variant="Bold" />
              {t("tours.detail.agency.report")}
            </button>
          ) : null}
        </div>
      </Card>

      <OtherTours agencyId={agency.id} excludeId={tour.id} />
    </div>
  );
}
