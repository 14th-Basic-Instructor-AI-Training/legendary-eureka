import type { ReactNode } from "react";
import Image from "next/image";
import { Card } from "./Card";
import { cn } from "@/lib/utils";
import { LocaleLink } from "@/components/LocaleLink";
import { concaveMaskStyle } from "./concaveCorners";
import { jalatCardClipStyle, jalatCardClipShadowStyle } from "./jalatCardClip";

/**
 * JalatCard — the shared "Ice Matcha" card primitive used across Popular
 * Destinations, Trending Tours, Trip Plans, and Recommended rows.
 *
 * Shape: white surface, rounded, shadow-only (no border). A top image whose two
 * bottom corners curve inward (concave — see {@link concaveMaskStyle}). A badge
 * floats top-right OVER the image. A clean footer carries the title (left) and an
 * underlined action such as "Explore →" (right), with an optional meta line.
 *
 * Hook-free and slot-based, so it composes in both server and client trees. The
 * data-mapping (i18n, price/rating formatting) lives in the per-feature wrappers.
 */
export type JalatCardProps = {
  /** Top image. */
  image: { src: string; alt: string };
  /** Primary label (left of the footer). */
  title: ReactNode;
  /** Underlined call-to-action (right of the footer), e.g. "Explore →". */
  action?: ReactNode;
  /** Floats top-right over the image (price, privacy, rating…). Not masked. */
  badge?: ReactNode;
  /** Optional secondary line under the title (location, agency, dates…). */
  meta?: ReactNode;
  /**
   * Corner geometry. `"concave"` (default) is the "Ice Matcha" look: rounded top,
   * inward-curving bottom corners. `"topRight"` applies the notched silhouette
   * (all corners rounded + a tab notch stepped into the top edge that cradles the
   * floating badge) — used by the rating-led landing cards.
   */
  shape?: "concave" | "topRight";
  /** When set, the whole card is a locale-aware link to this path. */
  href?: string;
  /** Image aspect ratio utility (default `aspect-[4/3]`). */
  imageAspect?: string;
  /** Concave corner radius in px (defaults to the helper's `CONCAVE_RADIUS`). */
  cornerRadius?: number;
  /** Responsive `sizes` for next/image. */
  imageSizes?: string;
  className?: string;
};

const DEFAULT_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

export function JalatCard({
  image,
  title,
  action,
  badge,
  meta,
  shape = "concave",
  href,
  imageAspect = "aspect-[4/3]",
  cornerRadius,
  imageSizes = DEFAULT_SIZES,
  className,
}: JalatCardProps) {
  const isTopRight = shape === "topRight";

  const card = (
    <Card
      className={cn(
        "group bg-background flex h-full flex-col gap-0 overflow-hidden border-0 p-0 transition-shadow",
        // The notched shape is drawn with `clip-path`, which also clips box-shadow —
        // its shadow lives on the wrapper below. The concave shape stays shadow-only.
        isTopRight ? "rounded-none" : "rounded-2xl shadow-primary hover:shadow-md",
        className,
      )}
      style={isTopRight ? jalatCardClipStyle : undefined}
    >
      {/* Media region — the image and the (un-masked) floating badge are siblings. */}
      <div className="relative">
        <div
          className={cn(
            "relative w-full overflow-hidden",
            // topRight's corners come from the card-level clip-path, so the image is square.
            isTopRight ? "rounded-none" : "rounded-t-2xl",
            imageAspect,
          )}
          style={isTopRight ? undefined : concaveMaskStyle(cornerRadius)}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={imageSizes}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {badge ? (
          <div className="absolute right-3 top-3 z-10">{badge}</div>
        ) : null}
      </div>

      {/* Footer — title left, underlined action right, optional meta under the title. */}
      <div className="flex flex-1 items-start justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <h3 className="text-foreground leading-tight font-medium tracking-tight">{title}</h3>
          {meta ? <div className="text-muted mt-1 text-sm">{meta}</div> : null}
        </div>
        {action ? (
          <span className="text-primary shrink-0 text-sm font-medium underline decoration-1 underline-offset-4 group-hover:no-underline">
            {action}
          </span>
        ) : null}
      </div>
    </Card>
  );

  // The notched card is clipped, so its shadow rides on a wrapper (drop-shadow
  // follows the clipped contour where box-shadow can't).
  const framedCard = isTopRight ? (
    <div className="h-full" style={jalatCardClipShadowStyle}>
      {card}
    </div>
  ) : (
    card
  );

  if (!href) return framedCard;

  return (
    <LocaleLink
      href={href}
      aria-label={typeof title === "string" ? title : undefined}
      className={cn(
        "focus-visible:ring-primary block h-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        isTopRight ? "rounded-xl" : "rounded-2xl",
      )}
    >
      {framedCard}
    </LocaleLink>
  );
}
