"use client";

import { useTranslation } from "react-i18next";
import { Star1, Location } from "iconsax-reactjs";
import { JalatCard } from "@/ui";
import { formatPrice, formatRating } from "@/lib/format";
import type { Destination } from "../schema";

/**
 * Ice-Matcha styled destination tile (Popular Destinations row). Maps a
 * {@link Destination} onto the shared {@link JalatCard}: price floats top-right,
 * the footer shows the name + location/rating and an "Explore" action.
 */
export function PopularDestinationCard({ destination }: { destination: Destination }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <JalatCard
      href={`/destinations/${destination.slug}`}
      image={{ src: destination.heroImage, alt: destination.name }}
      badge={
        <span className="bg-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
          {destination.priceFrom === 0
            ? t("common.free")
            : formatPrice(destination.priceFrom, destination.currency, lng)}
        </span>
      }
      title={destination.name}
      meta={
        <span className="flex items-center gap-1">
          <Location size={15} color="currentColor" variant="Bold" className="text-primary" />
          {destination.city}, {destination.country}
          <span className="text-warning ml-2 inline-flex items-center gap-0.5">
            <Star1 size={13} color="currentColor" variant="Bold" />
            {formatRating(destination.rating, lng)}
          </span>
        </span>
      }
      action={`${t("landing.card.explore")} →`}
    />
  );
}
