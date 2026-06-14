import type { ReactNode } from "react";

/**
 * Frosted price pill that floats inside the top-right notch of the `topRight`
 * {@link JalatCard} shape. Mirrors {@link RatingBadge}'s look for consistency,
 * with a thin border added because the notch reveals the page background (not
 * the image), so the pill needs definition against light surfaces.
 *
 * Presentational only — the caller formats `price` (locale-aware) and passes an
 * optional `label` ("from"); omit the label for a bare value like "Free".
 */
export function PriceTag({ price, label }: { price: ReactNode; label?: ReactNode }) {
  return (
    <span className="bg-background/95 border-border/60 text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
      {label ? <span className="text-muted font-normal">{label}</span> : null}
      {price}
    </span>
  );
}
