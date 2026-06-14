"use client";

import { Star1 } from "iconsax-reactjs";
import { useTranslation } from "react-i18next";
import { formatRating } from "@/lib/format";

/**
 * Flat, footer-friendly rating line — `★ 4.9 · 12,840 reviews`. Unlike the
 * floating {@link RatingBadge} pill (which sits over the image), this renders
 * inline on the card surface, so the landing cards can show "total ratings"
 * content in the footer while the price takes the top-right notch.
 *
 * The review count is hidden when zero (just `★ 4.9`). Numbers are locale-aware
 * (Khmer/Korean numerals) via {@link formatRating} and the `reviews` plural key.
 */
export function RatingInline({
  rating,
  reviewCount,
  lng,
}: {
  rating: number;
  reviewCount: number;
  lng: string;
}) {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Star1 size={14} color="currentColor" variant="Bold" className="text-warning" />
      <span className="text-foreground font-medium">{formatRating(rating, lng)}</span>
      {reviewCount > 0 ? (
        <>
          <span className="text-muted">·</span>
          <span className="text-muted">
            {t("destinations.card.reviews", { count: reviewCount })}
          </span>
        </>
      ) : null}
    </span>
  );
}
