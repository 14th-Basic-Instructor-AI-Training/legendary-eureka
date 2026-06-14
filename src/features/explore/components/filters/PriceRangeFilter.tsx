"use client";

import { useTranslation } from "react-i18next";
import { RangeSlider } from "@/ui";
import { formatPrice } from "@/lib/format";
import { PRICE_MAX, PRICE_MIN } from "../../schema";

/**
 * Dual-handle price filter ($0–$2,000+). Drag updates the labels live; the
 * committed value patches the store (which triggers a refetch).
 */
export function PriceRangeFilter({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  const label = (value: number) =>
    value >= PRICE_MAX
      ? `${formatPrice(PRICE_MAX, "USD", lng)}+`
      : formatPrice(value, "USD", lng);

  return (
    <div className="flex flex-col gap-2">
      <RangeSlider
        value={[min, max]}
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={50}
        onValueChange={([lo, hi]) => onChange(lo, hi)}
        aria-label={t("explore.filters.price")}
      />
      <div className="text-muted flex items-center justify-between text-xs">
        <span>{label(min)}</span>
        <span>{label(max)}</span>
      </div>
    </div>
  );
}
