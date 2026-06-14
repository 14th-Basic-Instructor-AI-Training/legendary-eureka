import { Star1 } from "iconsax-reactjs";
import { formatNumber, formatRating } from "@/lib/format";

/**
 * Compact rating pill used in the rounded top-right corner of the "topRight"
 * {@link JalatCard} shape (Trending Tours, Popular Destinations, Recommended).
 * Shows a star + the rating value + the total number of ratings, e.g. `★ 4.9 (12,840)`.
 * All numbers are locale-aware (Khmer/Korean numerals) via {@link formatRating} /
 * {@link formatNumber}.
 */
export function RatingBadge({
  rating,
  reviewCount,
  lng,
}: {
  rating: number;
  reviewCount: number;
  lng: string;
}) {
  return (
    <span className="bg-background/95 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
      <Star1 size={13} color="currentColor" variant="Bold" className="text-warning" />
      <span className="text-foreground">{formatRating(rating, lng)}</span>
      <span className="text-muted font-normal">({formatNumber(reviewCount, lng)})</span>
    </span>
  );
}
