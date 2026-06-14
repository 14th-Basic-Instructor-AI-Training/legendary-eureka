"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1, Location, Sun1, Routing2 } from "iconsax-reactjs";
import { Card, Chip } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExploreDestination, ExploreView } from "../../schema";
import { ACTIVITY_ICON } from "./activityIcons";
import { BookmarkButton } from "./BookmarkButton";

const IMAGE_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

/** Region tag + best-season + activity icons, shared by both layouts. */
function ActivityIcons({ destination }: { destination: ExploreDestination }) {
  return (
    <span className="flex items-center gap-1.5">
      {destination.topActivities.map((activity) => {
        const Icon = ACTIVITY_ICON[activity];
        return (
          <span
            key={activity}
            title={activity}
            className="bg-surface text-primary flex h-7 w-7 items-center justify-center rounded-full"
          >
            <Icon size={15} color="currentColor" variant="Bold" />
          </span>
        );
      })}
    </span>
  );
}

export function ExploreDestinationCard({
  destination,
  view,
  onRequireAuth,
}: {
  destination: ExploreDestination;
  view: ExploreView;
  onRequireAuth: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const href = `/destinations/${destination.slug}`;

  const regionTag = (
    <Chip color="accent" variant="soft" size="sm">
      <Chip.Label>{destination.region}</Chip.Label>
    </Chip>
  );

  const season = (
    <span className="text-muted inline-flex items-center gap-1 text-xs">
      <Sun1 size={14} color="currentColor" variant="Bold" className="text-warning" />
      {t(`explore.seasons.${destination.bestSeason}`)}
    </span>
  );

  const rating = (
    <span className="text-warning inline-flex items-center gap-0.5 text-sm font-medium">
      <Star1 size={14} color="currentColor" variant="Bold" />
      {formatRating(destination.rating, lng)}
    </span>
  );

  const tours = (
    <span className="text-muted inline-flex items-center gap-1 text-xs">
      <Routing2 size={14} color="currentColor" variant="Bold" className="text-primary" />
      {t("explore.card.toursAvailable", { count: destination.tourCount })}
    </span>
  );

  const exploreCta = (
    <LocaleLink
      href={href}
      className="text-primary text-sm font-medium underline decoration-1 underline-offset-4 hover:no-underline"
    >
      {t("explore.card.explore")} →
    </LocaleLink>
  );

  if (view === "list") {
    return (
      <Card className="bg-background shadow-primary group flex flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-72">
          <Image
            src={destination.heroImage}
            alt={destination.name}
            fill
            sizes="(max-width: 640px) 100vw, 18rem"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">{regionTag}</div>
          <BookmarkButton id={destination.id} onRequireAuth={onRequireAuth} className="absolute right-3 top-3" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-foreground leading-tight font-semibold tracking-tight">
                {destination.name}
              </h3>
              <span className="text-muted mt-0.5 flex items-center gap-1 text-sm">
                <Location size={14} color="currentColor" variant="Bold" className="text-primary" />
                {destination.city}, {destination.country}
              </span>
            </div>
            {rating}
          </div>
          <p className="text-muted line-clamp-2 text-sm leading-relaxed">
            {destination.shortDescription}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <ActivityIcons destination={destination} />
              {season}
            </div>
            <div className="flex items-center gap-3">
              {tours}
              {exploreCta}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-background shadow-primary group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={destination.heroImage}
          alt={destination.name}
          fill
          sizes={IMAGE_SIZES}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">{regionTag}</div>
        <BookmarkButton id={destination.id} onRequireAuth={onRequireAuth} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground min-w-0 leading-tight font-semibold tracking-tight">
            {destination.name}
          </h3>
          {rating}
        </div>
        <span className="text-muted flex items-center gap-1 text-sm">
          <Location size={14} color="currentColor" variant="Bold" className="text-primary" />
          {destination.city}, {destination.country}
        </span>
        <div className="flex items-center justify-between gap-2 pt-1">
          <ActivityIcons destination={destination} />
          {season}
        </div>
        <div
          className={cn(
            "border-border mt-auto flex items-center justify-between gap-2 border-t pt-3",
          )}
        >
          {tours}
          {exploreCta}
        </div>
      </div>
    </Card>
  );
}
