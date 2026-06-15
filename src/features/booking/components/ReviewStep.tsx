"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Calendar, Location, ShieldTick } from "iconsax-reactjs";
import { Button, Card, Chip, NumberStepper } from "@/ui";
import { formatDate } from "@/lib/format";
import type { TourDetail } from "@/features/tours/types";
import type { Pricing } from "../schema";
import { PriceSummary } from "./PriceSummary";

function SummaryCell({
  Icon,
  label,
  value,
}: {
  Icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon
        size={20}
        color="currentColor"
        variant="Bold"
        className="text-primary-lightskyblue shrink-0"
      />
      <div className="min-w-0">
        <p className="text-muted text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <p className="text-foreground truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

/** Step 1 — review the tour, dates, traveler count, and cancellation policy. */
export function ReviewStep({
  tour,
  date,
  travelers,
  onTravelersChange,
  pricing,
  onNext,
}: {
  tour: TourDetail;
  date: string;
  travelers: number;
  onTravelersChange: (n: number) => void;
  pricing: Pricing;
  onNext: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const dateLabel = date
    ? formatDate(date, lng)
    : t("booking.review.dateFlexible");

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {t("booking.review.title")}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {t("booking.review.subtitle")}
          </p>
        </div>

        {/* Tour summary */}
        <Card className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm">
          <div className="flex gap-4 p-4">
            <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={tour.heroImage}
                alt={tour.title}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap gap-2">
                <Chip color="success" variant="soft" size="sm">
                  {t("booking.review.verified")}
                </Chip>
                <Chip color="default" variant="soft" size="sm">
                  {t("booking.review.days", { count: tour.durationDays })}
                </Chip>
              </div>
              <h3 className="text-foreground leading-tight font-semibold">
                {tour.title}
              </h3>
              <p className="text-muted flex items-center gap-1.5 text-sm">
                <ShieldTick
                  size={15}
                  color="currentColor"
                  variant="Bold"
                  className="text-primary-lightskyblue"
                />
                {tour.agency.name}
              </p>
            </div>
          </div>
          <div className="border-border grid grid-cols-1 border-t sm:grid-cols-2 sm:divide-x">
            <SummaryCell
              Icon={Calendar}
              label={t("booking.review.date")}
              value={dateLabel}
            />
            <SummaryCell
              Icon={Location}
              label={t("booking.review.meetingPoint")}
              value={t("booking.review.meetingPointValue", {
                province: tour.province,
              })}
            />
          </div>
        </Card>

        {/* Travelers */}
        <Card className="bg-background border-border rounded-2xl border p-5 shadow-sm">
          <h3 className="mb-4 font-semibold tracking-tight">
            {t("booking.review.travelers")}
          </h3>
          <NumberStepper
            label={t("booking.review.adults")}
            description={t("booking.review.adultsHint")}
            value={travelers}
            onChange={onTravelersChange}
            min={1}
            max={tour.groupSizeMax}
          />
        </Card>

        {/* Free cancellation */}
        <div className="bg-success/8 border-success/20 flex gap-3 rounded-2xl border p-4">
          <ShieldTick
            size={20}
            color="currentColor"
            variant="Bold"
            className="text-success shrink-0"
          />
          <div>
            <p className="text-success text-sm font-semibold">
              {t("booking.review.freeCancellation")}
            </p>
            <p className="text-muted mt-0.5 text-sm">
              {t("booking.review.freeCancellationHint")}
            </p>
          </div>
        </div>
      </div>

      <PriceSummary
        pricing={pricing}
        unitPrice={tour.unitPrice}
        travelers={travelers}
        currency={tour.currency}
        cta={
          <Button variant="primary" size="lg" fullWidth onPress={onNext}>
            {t("booking.review.continue")}
          </Button>
        }
      />
    </div>
  );
}
