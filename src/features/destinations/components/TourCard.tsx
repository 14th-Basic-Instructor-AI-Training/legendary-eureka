"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1, Calendar } from "iconsax-reactjs";
import { Card } from "@/ui";
import { formatPrice, formatRating } from "@/lib/format";
import type { FeaturedTour } from "../schema";

/** A tour-package teaser card for the landing "Featured tours" row. */
export function TourCard({ tour }: { tour: FeaturedTour }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <Card className="group bg-surface border-border flex h-full flex-col overflow-hidden rounded-2xl border p-0 shadow-primary">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="bg-background/90 text-foreground absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur">
          <Calendar size={13} color="currentColor" variant="Bold" />
          {t("landing.tours.days", { count: tour.days })}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="leading-tight font-semibold tracking-tight">{tour.title}</h3>
        <p className="text-muted text-xs">{t("landing.tours.by", { agency: tour.agencyName })}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-warning flex items-center gap-0.5 text-sm font-medium">
            <Star1 size={14} color="currentColor" variant="Bold" />
            {formatRating(tour.rating, lng)}
          </span>
          <span className="text-sm">
            <span className="text-muted">{t("landing.tours.from")} </span>
            <span className="text-foreground font-semibold">
              {formatPrice(tour.priceFrom, tour.currency, lng)}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}
