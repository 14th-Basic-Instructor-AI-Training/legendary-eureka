import { EXPLORE_DESTINATIONS, EXPLORE_TOURS } from "./fixtures";
import type {
  DestinationFilter,
  ExploreDestination,
  ExploreSort,
  ExploreTour,
  Region,
  RegionType,
  Season,
  ActivityFocus,
  TourActivityType,
  TourDuration,
  TourFilter,
} from "./schema";

/**
 * The ONE data seam for the Explore page. Components read from here, never from
 * `fixtures.ts` directly — swapping these for route handlers / server actions
 * later is a one-file change. Getters return typed results and `await delay()`
 * so the loading / error / empty states are exercised in the static phase.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Pure filter predicates (shared with tests) ────────────────────────────────

/** True when the destination passes the filter. Arrays are OR-within, AND-across. */
export function matchesDestination(
  d: ExploreDestination,
  f: DestinationFilter,
): boolean {
  if (f.regions.length && !f.regions.includes(d.region)) return false;
  if (f.province && d.province !== f.province) return false;
  if (f.seasons.length && !f.seasons.includes(d.bestSeason)) return false;
  if (f.regionTypes.length && !f.regionTypes.includes(d.regionType)) return false;
  if (f.activityFocus.length && !f.activityFocus.some((a) => d.activityFocus.includes(a)))
    return false;
  if (f.familyFriendly && !d.familyFriendly) return false;
  const q = f.query.trim().toLowerCase();
  if (q) {
    const haystack =
      `${d.name} ${d.city} ${d.country} ${d.province} ${d.region} ${d.shortDescription} ${d.tags.join(" ")}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

/** True when the tour passes the filter. */
export function matchesTour(t: ExploreTour, f: TourFilter): boolean {
  if (f.province && t.province !== f.province) return false;
  if (f.activityTypes.length && !f.activityTypes.some((a) => t.activityTypes.includes(a)))
    return false;
  if (t.priceFrom < f.priceMin || t.priceFrom > f.priceMax) return false;
  if (f.durations.length && !f.durations.includes(t.durationCategory)) return false;
  if (f.minRating !== undefined && t.rating < f.minRating) return false;
  if (f.languages.length && !f.languages.some((l) => t.languages.includes(l))) return false;
  if (f.familyFriendly && !t.familyFriendly) return false;
  // Date range: the requested window must overlap the tour's availability window.
  if (f.dateFrom && t.availableTo < f.dateFrom) return false;
  if (f.dateTo && t.availableFrom > f.dateTo) return false;
  const q = f.query.trim().toLowerCase();
  if (q) {
    const haystack =
      `${t.title} ${t.destinationName} ${t.province} ${t.agencyName} ${t.description}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

// ── Sorting ───────────────────────────────────────────────────────────────────

/** "Recommended" weight — featured + trending float to the top, then by rating. */
function recommendedScore(d: { featured: boolean; trending: boolean; rating: number }) {
  return (d.featured ? 2 : 0) + (d.trending ? 1 : 0) + d.rating / 10;
}

export function sortDestinations(
  rows: ExploreDestination[],
  sort: ExploreSort,
): ExploreDestination[] {
  const copy = [...rows];
  switch (sort) {
    case "priceAsc":
      return copy.sort((a, b) => a.priceFrom - b.priceFrom);
    case "ratingDesc":
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "newest":
      // Destinations have no createdAt; trending-first is the closest proxy.
      return copy.sort((a, b) => Number(b.trending) - Number(a.trending) || b.rating - a.rating);
    case "recommended":
    default:
      return copy.sort((a, b) => recommendedScore(b) - recommendedScore(a));
  }
}

export function sortTours(rows: ExploreTour[], sort: ExploreSort): ExploreTour[] {
  const copy = [...rows];
  switch (sort) {
    case "priceAsc":
      return copy.sort((a, b) => a.priceFrom - b.priceFrom);
    case "ratingDesc":
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "recommended":
    default:
      return copy.sort((a, b) => b.rating * Math.log10(b.reviewCount + 10) - a.rating * Math.log10(a.reviewCount + 10));
  }
}

// ── Getters ───────────────────────────────────────────────────────────────────

export async function getExploreDestinations(
  filter: DestinationFilter,
  sort: ExploreSort = "recommended",
): Promise<Result<ExploreDestination[]>> {
  await delay();
  const data = sortDestinations(
    EXPLORE_DESTINATIONS.filter((d) => matchesDestination(d, filter)),
    sort,
  );
  return { ok: true, data };
}

export async function getExploreTours(
  filter: TourFilter,
  sort: ExploreSort = "recommended",
): Promise<Result<ExploreTour[]>> {
  await delay();
  const data = sortTours(
    EXPLORE_TOURS.filter((t) => matchesTour(t, filter)),
    sort,
  );
  return { ok: true, data };
}

/**
 * Tours owned by one agency (by slug) — powers the "Tours Offered" grid on the
 * agency profile page. An empty array is a valid success (agency has no published
 * tours) so the screen renders its empty state rather than an error.
 */
export async function getToursByAgency(
  agencySlug: string,
  sort: ExploreSort = "recommended",
): Promise<Result<ExploreTour[]>> {
  await delay();
  const data = sortTours(
    EXPLORE_TOURS.filter((t) => t.agencySlug === agencySlug),
    sort,
  );
  return { ok: true, data };
}

// ── Filter-option sources (derived from fixtures so no filter is ever dead) ────

const uniqueSorted = <T>(values: T[]): T[] =>
  Array.from(new Set(values)).sort((a, b) => String(a).localeCompare(String(b)));

export const REGION_OPTIONS: readonly Region[] = uniqueSorted(
  EXPLORE_DESTINATIONS.map((d) => d.region),
);
export const SEASON_OPTIONS: readonly Season[] = uniqueSorted(
  EXPLORE_DESTINATIONS.map((d) => d.bestSeason),
);
export const REGION_TYPE_OPTIONS: readonly RegionType[] = uniqueSorted(
  EXPLORE_DESTINATIONS.map((d) => d.regionType),
);
export const ACTIVITY_FOCUS_OPTIONS: readonly ActivityFocus[] = uniqueSorted(
  EXPLORE_DESTINATIONS.flatMap((d) => d.activityFocus),
);
export const DESTINATION_PROVINCE_OPTIONS: readonly string[] = uniqueSorted(
  EXPLORE_DESTINATIONS.map((d) => d.province),
);

export const TOUR_ACTIVITY_OPTIONS: readonly TourActivityType[] = uniqueSorted(
  EXPLORE_TOURS.flatMap((t) => t.activityTypes),
);
export const DURATION_OPTIONS: readonly TourDuration[] = [
  "half-day",
  "full-day",
  "2-3 days",
  "4-7 days",
  "7+ days",
];
export const LANGUAGE_OPTIONS: readonly string[] = uniqueSorted(
  EXPLORE_TOURS.flatMap((t) => t.languages),
);
export const TOUR_PROVINCE_OPTIONS: readonly string[] = uniqueSorted(
  EXPLORE_TOURS.map((t) => t.province),
);
