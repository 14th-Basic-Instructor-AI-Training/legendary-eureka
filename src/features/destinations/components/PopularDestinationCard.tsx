"use client";

import { useTranslation } from "react-i18next";
import { Location } from "iconsax-reactjs";
import { JalatCard, RatingBadge } from "@/ui";
import { formatPrice } from "@/lib/format";
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
      shape="topRight"
      image={{ src: destination.heroImage, alt: destination.name }}
      badge={
        <RatingBadge
          rating={destination.rating}
          reviewCount={destination.reviewCount}
          lng={lng}
        />
      }
      title={destination.name}
      meta={
        <span className="flex items-center gap-1">
          <Location size={15} color="currentColor" variant="Bold" className="text-primary" />
          {destination.city}, {destination.country}
          <span className="text-foreground ml-2 font-medium">
            {destination.priceFrom === 0
              ? t("common.free")
              : formatPrice(destination.priceFrom, destination.currency, lng)}
          </span>
        </span>
      }
      action={`${t("landing.card.explore")} →`}
    />
  );
}
