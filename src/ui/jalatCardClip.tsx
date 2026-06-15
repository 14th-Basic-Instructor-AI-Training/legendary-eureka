import type { CSSProperties } from "react";

/**
 * Notched-corner silhouette for the rating-led landing cards (`JalatCard`
 * `shape="topRight"`). Replaces the old single-rounded-corner look with an SVG
 * `clip-path` that rounds all four corners and steps a tab notch into the top
 * edge — the cut-out makes room for the floating rating/price badge.
 *
 * The path is authored in `objectBoundingBox` units (0–1) so one definition
 * scales to any card size. It must be referenced by `url(#…)`, which requires
 * the matching `<clipPath>` to exist in the document — render {@link
 * JalatCardClipDefs} once at the app root.
 *
 * NOTE: `clip-path` also clips `box-shadow`, so a clipped card cannot use the
 * `shadow-primary` utility. Put {@link jalatCardClipShadowStyle} on a parent
 * wrapper instead — `filter: drop-shadow` follows the clipped contour.
 */
export const JALAT_CARD_CLIP_ID = "jalat-card-clip";

/** Top-tab notch + all-corners-rounded path, in `objectBoundingBox` units. */
const CLIP_PATH_D =
  "M0.1,0H0.5A0.1,0.1,0,0,1,0.6,0.1V0.1A0.1,0.1,0,0,0,0.7,0.2H0.9A0.1,0.1,0,0,1,1,0.3V0.9A0.1,0.1,0,0,1,0.9,1H0.1A0.1,0.1,0,0,1,0,0.9V0.1A0.1,0.1,0,0,1,0.1,0Z";

/**
 * Hidden SVG holding the shared `<clipPath>`. Render once near the app root so
 * every `JalatCard` can reference `url(#jalat-card-clip)`.
 */
export function JalatCardClipDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={0}
      height={0}
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        <clipPath id={JALAT_CARD_CLIP_ID} clipPathUnits="objectBoundingBox">
          <path d={CLIP_PATH_D} />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Apply to the element whose silhouette should be the notched card shape. */
export const jalatCardClipStyle: CSSProperties = {
  clipPath: `url(#${JALAT_CARD_CLIP_ID})`,
  WebkitClipPath: `url(#${JALAT_CARD_CLIP_ID})`,
};

/**
 * Drop-shadow that follows the clipped contour — the `clip-path` equivalent of
 * the `shadow-primary` utility (`--shadow-primary: 0 0 10px rgba(0,0,0,.07)`).
 * Apply to a wrapper *around* the clipped card, not the card itself.
 */
export const jalatCardClipShadowStyle: CSSProperties = {
  filter: "drop-shadow(0 0 10px rgba(0,0,0,0.07))",
};
