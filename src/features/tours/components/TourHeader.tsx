"use client";

import { useTranslation } from "react-i18next";
import { Star1, Location } from "iconsax-reactjs";
import { Avatar } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { formatRating } from "@/lib/format";
import type { TourDetail } from "../types";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Tour title, tagline, rating link, agency link, and province tag. */
export function TourHeader({
  tour,
  onReviewsClick,
}: {
  tour: TourDetail;
  onReviewsClick: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
        {tour.title}
      </h1>
      <p className="text-muted text-base">{tour.tagline}</p>

      <div className="text-muted flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <button
          type="button"
          onClick={onReviewsClick}
          className="text-foreground flex items-center gap-1.5 font-medium hover:underline"
        >
          <Star1 size={16} color="currentColor" variant="Bold" className="text-warning" />
          {formatRating(tour.rating, lng)}
          <span className="text-muted font-normal">
            · {t("destinations.card.reviews", { count: tour.reviewCount })}
          </span>
        </button>

        <LocaleLink
          href={`/agencies/${tour.agency.id}`}
          className="hover:text-foreground flex items-center gap-2 transition-colors"
        >
          <Avatar size="sm">
            <Avatar.Image src={tour.agency.logo} alt={tour.agency.name} />
            <Avatar.Fallback>{initialsOf(tour.agency.name)}</Avatar.Fallback>
          </Avatar>
          <span className="font-medium">{tour.agency.name}</span>
        </LocaleLink>

        <span className="flex items-center gap-1.5">
          <Location size={16} color="currentColor" variant="Bold" className="text-primary" />
          {tour.province}
        </span>
      </div>
    </header>
  );
}
