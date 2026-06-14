import { TOURS } from "./fixtures";
import type { FeaturedTour } from "@/features/destinations/schema";
import type { TourDetail, TourReview, RatingBreakdown } from "./schema";

/**
 * The ONE data seam for tours. Components import from here, never fixtures —
 * swapping for route handlers / server actions later is a one-file change.
 * Returns typed results (never throws). Similar/other-tour rows return the
 * destinations `FeaturedTour` teaser shape so the existing TourCard is reused.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/** Project a full tour into the teaser shape the TourCard renders. */
function toTeaser(tour: TourDetail): FeaturedTour {
  return {
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    agencyName: tour.agency.name,
    travelType: tour.travelType,
    image: tour.heroImage,
    days: tour.durationDays,
    priceFrom: tour.unitPrice,
    currency: tour.currency,
    rating: tour.rating,
    reviewCount: tour.reviewCount,
    destinationSlugs: [],
  };
}

/** Load one tour by id OR slug (the route segment carries either). */
export async function getTourById(id: string): Promise<Result<TourDetail>> {
  await delay();
  const match = TOURS.find((tour) => tour.id === id || tour.slug === id);
  return match ? { ok: true, data: match } : { ok: false, error: "not_found" };
}

/** Tours similar to this one — same province OR travel type, excluding itself. */
export async function getSimilarTours(tour: TourDetail): Promise<Result<FeaturedTour[]>> {
  await delay();
  const data = TOURS.filter(
    (t) => t.id !== tour.id && (t.province === tour.province || t.travelType === tour.travelType),
  ).map(toTeaser);
  return { ok: true, data };
}

/** Other tours run by the same agency (excluding the one being viewed). */
export async function getAgencyTours(
  agencyId: string,
  excludeId: string,
): Promise<Result<FeaturedTour[]>> {
  await delay();
  const data = TOURS.filter((t) => t.agency.id === agencyId && t.id !== excludeId).map(toTeaser);
  return { ok: true, data };
}

/**
 * Per-star review counts (5 → 1) for the Reviews-tab bar chart. The mock catalog
 * carries only a few sample reviews but a realistic `reviewCount`, so synthesize a
 * distribution that sums to `reviewCount` and skews toward the overall rating.
 */
export function getRatingBreakdown(tour: TourDetail): RatingBreakdown {
  const total = tour.reviewCount;
  // Weights skew higher as the average rating rises (clamped 3.5–5).
  const r = Math.min(5, Math.max(3.5, tour.rating));
  const top = (r - 3.5) / 1.5; // 0..1
  const weights: Record<5 | 4 | 3 | 2 | 1, number> = {
    5: 0.45 + 0.4 * top,
    4: 0.3 - 0.12 * top,
    3: 0.14 - 0.12 * top,
    2: 0.07 - 0.08 * top,
    1: 0.04 - 0.08 * top,
  };
  const order: Array<5 | 4 | 3 | 2 | 1> = [4, 3, 2, 1];
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as RatingBreakdown;
  let assigned = 0;
  for (const star of order) {
    const n = Math.max(0, Math.round(total * weights[star]));
    breakdown[star] = n;
    assigned += n;
  }
  breakdown[5] = Math.max(0, total - assigned); // remainder lands on 5 stars
  return breakdown;
}

/** Seed reviews for the store from a loaded tour (never read fixtures in components). */
export function initialReviews(tour: TourDetail): TourReview[] {
  return tour.reviews;
}
