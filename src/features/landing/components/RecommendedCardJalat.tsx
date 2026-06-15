"use client";

import { useTranslation } from "react-i18next";
import { Location } from "iconsax-reactjs";
import { JalatCard, PriceTag, RatingInline } from "@/ui";
import { formatPrice } from "@/lib/format";
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
      shape="topRight"
      image={{ src: destination.heroImage, alt: destination.name }}
      priceTag={
        destination.priceFrom > 0 ? (
          <PriceTag
            label={t("destinations.card.from")}
            price={formatPrice(destination.priceFrom, destination.currency, lng)}
          />
        ) : undefined
      }
      title={destination.name}
      meta={
        <span className="flex items-center gap-1">
          <Location size={15} color="currentColor" variant="Bold" className="text-primary" />
          {destination.city}, {destination.country}
        </span>
      }
      footerRating={
        <RatingInline
          rating={destination.rating}
          reviewCount={destination.reviewCount}
          lng={lng}
        />
      }
      action={`${t("landing.card.explore")} →`}
    />
  );
}
