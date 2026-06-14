"use client";

import { useTranslation } from "react-i18next";
import { Star1, Location } from "iconsax-reactjs";
import { JalatCard } from "@/ui";
import { formatPrice, formatRating } from "@/lib/format";
import type { Destination } from "@/features/destinations/schema";

/**
 * Ice-Matcha styled tile for the signed-in "Recommended for you" row. Recommended
 * items are destinations, so this mirrors {@link PopularDestinationCard} but leads
 * with the rating badge (the "why you'll like it" signal) and tucks price + location
 * into the footer meta.
 */
export function RecommendedCardJalat({ destination }: { destination: Destination }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <JalatCard
      href={`/destinations/${destination.slug}`}
      image={{ src: destination.heroImage, alt: destination.name }}
      badge={
        <span className="bg-background/90 text-warning inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
          <Star1 size={13} color="currentColor" variant="Bold" />
          {formatRating(destination.rating, lng)}
        </span>
      }
      title={destination.name}
      meta={
        <span className="flex items-center gap-1">
          <Location size={15} color="currentColor" variant="Bold" className="text-primary" />
          {destination.city}, {destination.country}
          {destination.priceFrom > 0 ? (
            <span className="text-foreground ml-2 font-medium">
              {formatPrice(destination.priceFrom, destination.currency, lng)}
            </span>
          ) : null}
        </span>
      }
      action={`${t("landing.card.explore")} →`}
    />
  );
}
