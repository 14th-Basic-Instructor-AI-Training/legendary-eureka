"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1, Location } from "iconsax-reactjs";
import { Card, Chip } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { formatPrice, formatRating } from "@/lib/format";
import type { Destination } from "../schema";

/** A single destination / experience / stay tile used across the landing grids.
 * The whole tile is a link to the destination detail page. */
export function DestinationCard({ destination }: { destination: Destination }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <LocaleLink
      href={`/destinations/${destination.slug}`}
      aria-label={destination.name}
      className="focus-visible:ring-primary block rounded-3xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
    <Card className="group bg-background border-border hover:shadow-primary overflow-hidden rounded-3xl border p-2 shadow-sm transition-shadow">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <Image
          src={destination.heroImage}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Chip color="default" variant="soft" size="sm">
            {t(`destinations.categories.${destination.category}`)}
          </Chip>
        </div>
        <span className="bg-primary absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
          <Star1 size={13} color="currentColor" variant="Bold" />
          {formatRating(destination.rating, lng)}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 p-3 pt-3.5">
        <h3 className="leading-tight font-semibold tracking-tight">{destination.name}</h3>

        <p className="text-muted flex items-center gap-1 text-sm">
          <Location size={15} color="currentColor" variant="Bold" className="text-primary" />
          {destination.city}, {destination.country}
        </p>

        <div className="text-muted mt-1 flex items-center justify-between text-xs">
          <span>{t("destinations.card.reviews", { count: destination.reviewCount })}</span>
          <span className="text-foreground text-sm font-semibold">
            {destination.priceFrom === 0
              ? t("common.free")
              : `${t("destinations.card.from")} ${formatPrice(destination.priceFrom, destination.currency, lng)}`}
          </span>
        </div>
      </div>
    </Card>
    </LocaleLink>
  );
}
