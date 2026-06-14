import type { CSSProperties } from "react";

/**
 * Concave (inverted) bottom corners — the "Ice Matcha" card signature.
 *
 * `corner-inverter.douiri.org` is a CSS *generator*, not an npm package, so there
 * is nothing to install. We bake its responsive **CSS `mask`** export (radial
 * gradients, which grow/shrink with the element) into this helper.
 *
 * Each gradient carves a circular bite out of one bottom corner: the arc curves
 * INTO the image, producing the inward (concave) corner. The two half-width tiles
 * tile side-by-side and `mask` defaults to *add* (union), so the visible area is
 * the whole image minus the two corner disks.
 *
 * Pure CSS → SSR-safe; no `"use client"` needed for the masking itself. Note that
 * CSS `border`/`outline` do not follow a masked contour — the card is intentionally
 * shadow-only, so that limitation does not apply here.
 */

/** Default concave corner radius in px (tune to taste / match the design). */
export const CONCAVE_RADIUS = 28;

/**
 * Inline style that masks an element's two bottom corners into concave curves.
 * Apply to the image *wrapper* (with `overflow-hidden`); keep any floating badge
 * as a sibling outside this element so the mask never clips it.
 */
export function concaveMaskStyle(radius: number = CONCAVE_RADIUS): CSSProperties {
  const r = `${radius}px`;
  const mask =
    `radial-gradient(circle ${r} at 0% 100%, transparent 98%, #000 100%) 0 0 / 50% 100% no-repeat,` +
    `radial-gradient(circle ${r} at 100% 100%, transparent 98%, #000 100%) 100% 0 / 50% 100% no-repeat`;

  // Both the standard and -webkit- shorthands for the widest browser coverage.
  return { WebkitMask: mask, mask } as CSSProperties;
}
