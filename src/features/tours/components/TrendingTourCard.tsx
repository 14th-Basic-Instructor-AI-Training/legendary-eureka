"use client";

import { useTranslation } from "react-i18next";
import { Calendar } from "iconsax-reactjs";
import { JalatCard, PriceTag, RatingInline } from "@/ui";
import { formatPrice } from "@/lib/format";
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
      shape="topRight"
      imageAspect="aspect-[16/10]"
      image={{ src: tour.image, alt: tour.title }}
      priceTag={
        <PriceTag
          label={t("landing.tours.from")}
          price={formatPrice(tour.priceFrom, tour.currency, lng)}
        />
      }
      title={tour.title}
      meta={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>{t("landing.tours.by", { agency: tour.agencyName })}</span>
          <span className="inline-flex items-center gap-0.5">
            <Calendar size={13} color="currentColor" variant="Bold" />
            {t("landing.tours.days", { count: tour.days })}
          </span>
        </span>
      }
      footerRating={
        <RatingInline rating={tour.rating} reviewCount={tour.reviewCount} lng={lng} />
      }
      action={`${t("landing.card.explore")} →`}
    />
  );
}
