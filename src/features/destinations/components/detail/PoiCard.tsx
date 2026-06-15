"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1 } from "iconsax-reactjs";
import { Card, Chip } from "@/ui";
import { formatRating } from "@/lib/format";
import type { PointOfInterest } from "../../schema";

/** A nearby point-of-interest tile (Things-to-do / Eat / Stay grids). */
export function PoiCard({ poi }: { poi: PointOfInterest }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <Card className="bg-background shadow-primary group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={poi.image}
          alt={poi.name}
          fill
          sizes="(max-width: 768px) 100vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Chip color="accent" variant="soft" size="sm">
            <Chip.Label>{t(`destinations.detail.poiCategory.${poi.category}`)}</Chip.Label>
          </Chip>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h4 className="text-foreground leading-tight font-semibold tracking-tight">{poi.name}</h4>
        <p className="text-muted text-sm">
          {poi.area}
          {poi.durationLabel ? ` · ${poi.durationLabel}` : ""}
          {poi.priceLevel ? ` · ${poi.priceLevel}` : ""}
        </p>
        {poi.rating !== undefined ? (
          <span className="text-warning mt-1 inline-flex items-center gap-1 text-sm font-medium">
            <Star1 size={14} color="currentColor" variant="Bold" />
            {formatRating(poi.rating, lng)}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
