"use client";

import { useTranslation } from "react-i18next";
import { Star1 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * Clickable 1★–5★ minimum-rating filter. Clicking a star sets that threshold;
 * clicking the active threshold again clears it.
 */
export function RatingFilter({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = value !== undefined && star <= value;
          return (
            <button
              key={star}
              type="button"
              aria-label={t("explore.filters.ratingStars", { stars: star })}
              aria-pressed={active}
              onClick={() => onChange(value === star ? undefined : star)}
              className="p-0.5"
            >
              <Star1
                size={22}
                color="currentColor"
                variant={active ? "Bold" : "Linear"}
                className={cn(active ? "text-warning" : "text-border")}
              />
            </button>
          );
        })}
      </div>
      <span className="text-muted text-xs">
        {value === undefined
          ? t("explore.filters.ratingAny")
          : t("explore.filters.ratingAndUp", { rating: value })}
      </span>
    </div>
  );
}
