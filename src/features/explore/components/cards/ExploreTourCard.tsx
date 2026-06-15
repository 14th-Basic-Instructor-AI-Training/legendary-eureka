"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1, Clock } from "iconsax-reactjs";
import { Card, Chip } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { formatNumber, formatPrice, formatRating } from "@/lib/format";
import type { ExploreTour, ExploreView } from "../../schema";
import { BookmarkButton } from "./BookmarkButton";

const IMAGE_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

export function ExploreTourCard({
  tour,
  view,
  onRequireAuth,
}: {
  tour: ExploreTour;
  view: ExploreView;
  onRequireAuth: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const href = `/tours/${tour.slug}`;

  const destinationBadge = (
    <Chip color="accent" variant="soft" size="sm">
      <Chip.Label>{tour.destinationName}</Chip.Label>
    </Chip>
  );

  const agency = (
    <span className="text-muted flex min-w-0 items-center gap-1.5 text-sm">
      <Image
        src={tour.agencyAvatar}
        alt={tour.agencyName}
        width={20}
        height={20}
        className="h-5 w-5 shrink-0 rounded-full object-cover"
      />
      <span className="truncate">{tour.agencyName}</span>
    </span>
  );

  const duration = (
    <span className="text-muted inline-flex items-center gap-1 text-xs">
      <Clock size={14} color="currentColor" variant="Bold" className="text-primary" />
      {tour.durationLabel}
    </span>
  );

  const rating = (
    <span className="text-warning inline-flex items-center gap-0.5 text-sm font-medium">
      <Star1 size={14} color="currentColor" variant="Bold" />
      {formatRating(tour.rating, lng)}
      <span className="text-muted ml-0.5 font-normal">
        ({formatNumber(tour.reviewCount, lng)})
      </span>
    </span>
  );

  const price = (
    <span className="text-foreground text-sm">
      <span className="text-base font-semibold">
        {formatPrice(tour.priceFrom, tour.currency, lng)}
      </span>{" "}
      <span className="text-muted text-xs">{t("explore.card.perPerson")}</span>
    </span>
  );

  const title = (
    <LocaleLink href={href} className="hover:text-primary transition-colors">
      <h3 className="text-foreground leading-tight font-semibold tracking-tight">
        {tour.title}
      </h3>
    </LocaleLink>
  );

  if (view === "list") {
    return (
      <Card className="bg-background shadow-primary group flex flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-[4/3] sm:w-72">
          <Image
            src={tour.image}
            alt={tour.title}
            fill
            sizes="(max-width: 640px) 100vw, 18rem"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">{destinationBadge}</div>
          <BookmarkButton id={tour.id} onRequireAuth={onRequireAuth} className="absolute right-3 top-3" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-3">
            {title}
            {rating}
          </div>
          {agency}
          <p className="text-muted line-clamp-2 text-sm leading-relaxed">
            {tour.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
            {duration}
            {price}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-background shadow-primary group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          sizes={IMAGE_SIZES}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">{destinationBadge}</div>
        <BookmarkButton id={tour.id} onRequireAuth={onRequireAuth} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {title}
        {agency}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {duration}
          {rating}
        </div>
        <div className="border-border mt-auto flex items-center justify-between gap-2 border-t pt-3">
          {price}
          <LocaleLink
            href={href}
            className="text-primary text-sm font-medium underline decoration-1 underline-offset-4 hover:no-underline"
          >
            {t("explore.card.explore")} →
          </LocaleLink>
        </div>
      </div>
    </Card>
  );
}
