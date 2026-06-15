import { DESTINATIONS, FEATURED_TOURS, AGENCIES, REVIEWS } from "./fixtures";
import { EXPLORE_DESTINATIONS } from "@/features/explore/fixtures";
import type {
  AgencyProfile,
  Destination,
  DestinationCategory,
  DiscoverFilter,
  FeaturedTour,
  Review,
  TravelType,
} from "./schema";

/**
 * The ONE data seam for destinations. Components import from here, never from
 * fixtures directly — swapping these for route handlers / server actions later
 * is a one-file change. Functions return typed results (never throw strings).
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

/** Simulate network latency so loading states are exercised in the static phase. */
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getFeaturedDestinations(): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS.filter((d) => d.featured) };
}

export async function getTrendingDestinations(): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS.filter((d) => d.trending) };
}

export async function getDestinationsByCategory(
  category: DestinationCategory,
): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS.filter((d) => d.category === category) };
}

export async function getAllDestinations(): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS };
}

/** Convenience zero-arg getter for the landing "Things to do" row. */
export async function getThingsToDo(): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS.filter((d) => d.category === "thingToDo") };
}

/**
 * One destination by slug for the detail page. Resolves from a UNIFIED pool —
 * the landing "best places" catalog (`DESTINATIONS`) first, then the richer
 * Cambodia Explore catalog (`EXPLORE_DESTINATIONS`, which extends `Destination`).
 * This lets detail links from BOTH the landing cards (`angkor-wat`) and the
 * Explore cards (`siem-reap`, `kampot`, …) resolve to the same screen.
 */
export async function getDestinationBySlug(
  slug: string,
): Promise<Result<Destination>> {
  await delay();
  const match =
    DESTINATIONS.find((d) => d.slug === slug) ??
    EXPLORE_DESTINATIONS.find((d) => d.slug === slug);
  return match ? { ok: true, data: match } : { ok: false, error: "not_found" };
}

/** Traveler reviews targeting one destination/tour slug (newest first). */
export async function getDestinationReviews(
  slug: string,
): Promise<Result<Review[]>> {
  await delay();
  const data = REVIEWS.filter((r) => r.targetSlug === slug).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return { ok: true, data };
}

export async function getFeaturedTours(): Promise<Result<FeaturedTour[]>> {
  await delay();
  return { ok: true, data: FEATURED_TOURS };
}

/** All travel types, in display order — populates the Discover travel-type filter. */
export const TRAVEL_TYPES: readonly TravelType[] = [
  "ADVENTURE",
  "CULTURAL",
  "RELAXATION",
  "FOOD",
  "NATURE",
];

/** Distinct provinces present in the catalog — populates the Discover province filter. */
export const PROVINCES: readonly string[] = Array.from(
  new Set(DESTINATIONS.map((d) => d.province)),
).sort((a, b) => a.localeCompare(b));

/** Pure filter predicate, shared by the data getter and tests. */
export function matchesFilter(d: Destination, filter: DiscoverFilter): boolean {
  if (filter.category && d.category !== filter.category) return false;
  if (filter.province && d.province !== filter.province) return false;
  if (filter.travelType && d.travelType !== filter.travelType) return false;
  const q = filter.query.trim().toLowerCase();
  if (q) {
    const haystack =
      `${d.name} ${d.city} ${d.country} ${d.province} ${d.shortDescription} ${d.tags.join(" ")}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

/**
 * Discover-page search. Filters the catalog by query + province + travel type +
 * category (mirrors the backend `/search`). Returns a typed result like every
 * other getter so the loading/empty/error states are exercised.
 */
export async function searchDestinations(
  filter: DiscoverFilter,
): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS.filter((d) => matchesFilter(d, filter)) };
}

/** One agency by slug — powers the `/agencies/[slug]` profile page. */
export async function getAgencyBySlug(
  slug: string,
): Promise<Result<AgencyProfile>> {
  await delay();
  const match = AGENCIES.find((a) => a.slug === slug);
  return match ? { ok: true, data: match } : { ok: false, error: "not_found" };
}

/** Top tour agencies for the Discover "Top agencies" strip (approved, best rated first). */
export async function getTopAgencies(): Promise<Result<AgencyProfile[]>> {
  await delay();
  const data = AGENCIES.filter((a) => a.status === "APPROVED").sort(
    (a, b) => b.rating - a.rating,
  );
  return { ok: true, data };
}

/** Recent traveler reviews for the Discover "Recent reviews" section (newest first). */
export async function getRecentReviews(): Promise<Result<Review[]>> {
  await delay();
  const data = [...REVIEWS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { ok: true, data };
}
