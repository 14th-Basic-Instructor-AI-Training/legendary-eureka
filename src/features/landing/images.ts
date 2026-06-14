/**
 * Curated travel imagery for the landing marketing sections (Unsplash CDN).
 * Kept in one place so the photographic look can be tuned without touching
 * component markup. The destinations grid pulls its own images from the
 * `destinations` fixtures (the real data backbone); these are the photos that
 * back the static marketing bands (hero, promo banner, CTA strip, etc.).
 */

/** Build a sized, auto-formatted Unsplash URL from a photo id. */
export const unsplash = (id: string, w = 1200, h = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const LANDING_IMAGES = {
  /** Hero — airplane climbing into a blue sky. */
  hero: unsplash("1531642765602-5cae8bbbf285", 1920, 1280),
  /** Small floating "popular now" thumbnail on the hero. */
  heroThumb: unsplash("1505228395891-9a51e7e86bf6", 240, 240),
  /** Circular city image inside the "Book a ticket" journey card. */
  journeyTicket: unsplash("1485871981521-5b1fd3805eee", 400, 400),
  /** Promo banner — aerial turquoise coastline. */
  unleash: unsplash("1544551763-46a013bb70d5", 1200, 900),
  /** Dual CTA strip — beach + tropical island. */
  ctaBeach: unsplash("1493558103817-58b2924bce98", 400, 400),
  ctaIsland: unsplash("1559128010-7c1ad6e1b6a5", 400, 400),
} as const;

/** Avatar placeholders for the testimonials band. */
export const avatar = (n: number) => `https://i.pravatar.cc/120?img=${n}`;
