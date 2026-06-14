"use client";

import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button, Card, StatusChip } from "@/ui";
import { formatDate, formatPrice } from "@/lib/format";
import type { TourDetail } from "@/features/tours/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  );
}

/** Step 3 — booking request submitted; show the reference + next actions. */
export function ConfirmationStep({
  tour,
  date,
  travelers,
  total,
  reference,
  onViewStatus,
  onExplore,
}: {
  tour: TourDetail;
  date: string;
  travelers: number;
  total: number;
  reference: string;
  onViewStatus: () => void;
  onExplore: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <span className="bg-success/15 mb-5 flex h-24 w-24 items-center justify-center rounded-full">
        <span className="bg-success flex h-16 w-16 items-center justify-center rounded-full">
          <TickCircle size={36} color="#ffffff" variant="Bold" />
        </span>
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">
        {t("booking.confirmation.title")}
      </h1>
      <p className="text-muted mt-2 text-sm leading-relaxed">
        {t("booking.confirmation.subtitle", { agency: tour.agency.name })}
      </p>

      <Card className="bg-background border-border mt-6 w-full overflow-hidden rounded-2xl border text-left shadow-sm">
        <div className="bg-agency-navy flex items-center justify-between gap-3 px-5 py-4 text-white">
          <div>
            <p className="text-xs opacity-70">
              {t("booking.confirmation.reference")}
            </p>
            <p className="text-xl font-extrabold tracking-wider">{reference}</p>
          </div>
          <StatusChip status="pending" />
        </div>
        <div className="flex flex-col gap-3 p-5">
          <Row label={t("booking.confirmation.tour")} value={tour.title} />
          <Row
            label={t("booking.review.date")}
            value={
              date ? formatDate(date, lng) : t("booking.review.dateFlexible")
            }
          />
          <Row
            label={t("booking.review.travelers")}
            value={t("booking.review.adultsCount", { count: travelers })}
          />
          <Row
            label={t("booking.confirmation.agencyContact")}
            value={`${tour.agency.name} · ${tour.agency.contactPhone}`}
          />
          <div className="border-border flex justify-between border-t pt-3">
            <span className="font-semibold">{t("booking.summary.total")}</span>
            <span className="text-lg font-extrabold">
              {formatPrice(total, tour.currency, lng)}
            </span>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="lg" onPress={onViewStatus}>
          {t("booking.confirmation.viewStatus")}
        </Button>
        <Button variant="secondary" size="lg" onPress={onExplore}>
          {t("booking.confirmation.exploreMore")}
        </Button>
      </div>
    </div>
  );
}
