"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1 } from "iconsax-reactjs";
import { Card, Chip } from "@/ui";
import { formatDate, formatRating } from "@/lib/format";
import type { Review } from "../schema";

/** A traveler review card for the Discover "Recent reviews" section. */
export function ReviewCard({
  review,
  placeName,
}: {
  review: Review;
  placeName?: string;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <Card className="bg-background border-border flex h-full flex-col gap-3 rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <Image
            src={review.authorAvatar}
            alt={review.authorName}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight">{review.authorName}</p>
          <p className="text-muted text-xs">{formatDate(review.createdAt, lng)}</p>
        </div>
        <span className="text-warning ml-auto flex items-center gap-1 text-sm font-medium">
          <Star1 size={14} color="currentColor" variant="Bold" />
          {formatRating(review.rating, lng)}
        </span>
      </div>

      <p className="text-foreground/90 text-sm leading-relaxed">“{review.comment}”</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        {placeName ? (
          <span className="text-muted text-xs">
            {t("discover.review.for", { place: placeName })}
          </span>
        ) : null}
        {review.travelType ? (
          <Chip color="accent" variant="soft" size="sm">
            {t(`discover.travelTypes.${review.travelType.toLowerCase()}`)}
          </Chip>
        ) : null}
      </div>
    </Card>
  );
}
