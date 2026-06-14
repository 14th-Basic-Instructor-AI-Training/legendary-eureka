"use client";

import { useTranslation } from "react-i18next";
import { Star1, Calendar } from "iconsax-reactjs";
import { JalatCard } from "@/ui";
import { formatPrice, formatRating } from "@/lib/format";
import type { FeaturedTour } from "@/features/destinations/schema";

/**
 * Ice-Matcha styled tour teaser (Trending Tours row). Maps a {@link FeaturedTour}
 * onto the shared {@link JalatCard}: price floats top-right; the footer shows the
 * title + agency/duration/rating and an "Explore" action.
 */
export function TrendingTourCard({ tour }: { tour: FeaturedTour }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <JalatCard
      href={`/tours/${tour.slug}`}
      imageAspect="aspect-[16/10]"
      image={{ src: tour.image, alt: tour.title }}
      badge={
        <span className="bg-background/90 text-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
          {formatPrice(tour.priceFrom, tour.currency, lng)}
        </span>
      }
      title={tour.title}
      meta={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>{t("landing.tours.by", { agency: tour.agencyName })}</span>
          <span className="inline-flex items-center gap-0.5">
            <Calendar size={13} color="currentColor" variant="Bold" />
            {t("landing.tours.days", { count: tour.days })}
          </span>
          <span className="text-warning inline-flex items-center gap-0.5">
            <Star1 size={13} color="currentColor" variant="Bold" />
            {formatRating(tour.rating, lng)}
          </span>
        </span>
      }
      action={`${t("landing.card.explore")} →`}
    />
  );
}
