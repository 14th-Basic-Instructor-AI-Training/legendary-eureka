import { publicApiFetch, type PagedData } from "@/lib/api/client";
import type { DestinationResponse } from "@/lib/api/destinations";
import type { TourPackageResponse } from "@/lib/api/packages";
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
 * `fixtures.ts` directly — swapping between mock and real API is a one-file change.
 * Getters call the Spring Boot backend at NEXT_PUBLIC_API_BASE_URL, map API
 * response shapes to the feature's Zod-derived types, then apply client-side
 * predicate filtering for the rich filter fields the API doesn't support.
 *
 * Server actions vs route handler: these are browser-safe `publicApiFetch` calls
 * (GET, no auth token). Mutations (bookings, etc.) use server actions elsewhere.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

// ── Mapping helpers ───────────────────────────────────────────────────────────

import type { TravelType } from "@/features/destinations/schema";

/**
 * The backend TravelType enum has 10 values; the feature schema accepts only 7.
 * Map the two extras (WILDLIFE, SPIRITUAL, URBAN) to the closest supported value.
 */
function toFeatureTravelType(v: string): TravelType {
  const valid: TravelType[] = [
    "ADVENTURE",
    "CULTURAL",
    "RELAXATION",
    "FOOD",
    "NATURE",
    "HISTORICAL",
    "BEACH",
  ];
  return valid.includes(v as TravelType) ? (v as TravelType) : "CULTURAL";
}

function travelTypeToRegionType(tt: string): RegionType {
  if (tt === "BEACH") return "Beach";
  if (tt === "NATURE" || tt === "WILDLIFE") return "Jungle";
  if (tt === "CULTURAL" || tt === "HISTORICAL" || tt === "SPIRITUAL") return "Cultural";
  if (tt === "URBAN") return "City";
  return "Mountain";
}

function travelTypeToActivityFocus(tt: string): ActivityFocus[] {
  const map: Record<string, ActivityFocus[]> = {
    ADVENTURE: ["Adventure"],
    CULTURAL: ["History"],
    HISTORICAL: ["History"],
    SPIRITUAL: ["History"],
    NATURE: ["Nature"],
    WILDLIFE: ["Nature"],
    BEACH: ["Nature", "Wellness"],
    FOOD: ["Food"],
    RELAXATION: ["Wellness"],
    URBAN: ["History"],
  };
  return map[tt] ?? ["History"];
}

function travelTypeToTourActivity(tt: string): TourActivityType[] {
  const map: Record<string, TourActivityType[]> = {
    ADVENTURE: ["Adventure"],
    CULTURAL: ["Cultural"],
    HISTORICAL: ["Cultural"],
    SPIRITUAL: ["Cultural"],
    NATURE: ["Nature"],
    WILDLIFE: ["Nature"],
    BEACH: ["Water Sports"],
    FOOD: ["Food & Drink"],
    RELAXATION: ["Wellness"],
    URBAN: ["Cultural"],
  };
  return map[tt] ?? ["Cultural"];
}

function daysToDuration(days: number): TourDuration {
  if (days < 1) return "half-day";
  if (days === 1) return "full-day";
  if (days <= 3) return "2-3 days";
  if (days <= 7) return "4-7 days";
  return "7+ days";
}

function mapToExploreDestination(d: DestinationResponse): ExploreDestination {
  const tt = d.travelType ?? "CULTURAL";
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    country: d.country || "Cambodia",
    city: d.city || d.province?.replace(/_/g, " ") || "",
    province: d.province,
    category: "destination" as const,
    travelType: toFeatureTravelType(tt),
    shortDescription: d.shortDescription || d.description?.slice(0, 140) || "",
    heroImage: d.heroImage || d.coverImageUrl || "https://placehold.co/800x500",
    rating: d.rating ?? 0,
    reviewCount: d.reviewCount ?? 0,
    priceFrom: d.priceFrom ?? 0,
    currency: d.currency || "USD",
    tags: d.tags || [],
    featured: d.featured ?? false,
    trending: d.trending ?? false,
    lat: d.lat || d.latitude || 0,
    lng: d.lng || d.longitude || 0,
    gallery: d.photos || [],
    pois: [],
    continent: "Asia",
    region: "Southeast Asia",
    regionType: travelTypeToRegionType(tt),
    bestSeason: "Dry Season",
    activityFocus: travelTypeToActivityFocus(tt),
    topActivities: travelTypeToActivityFocus(tt).slice(0, 3),
    tourCount: 0,
    familyFriendly: false,
  };
}

function mapToExploreTour(t: TourPackageResponse): ExploreTour {
  return {
    id: t.id,
    slug: t.slug ?? t.id,
    title: t.title,
    agencyName: t.agencyName || "",
    travelType: toFeatureTravelType(t.travelType),
    image: t.coverImageUrl || t.image || "https://placehold.co/800x500",
    days: t.durationDays,
    priceFrom: t.price ?? t.priceFrom ?? 0,
    currency: t.currency || "USD",
    rating: t.rating ?? 0,
    reviewCount: t.reviewCount ?? 0,
    destinationSlugs: [],
    province: t.province,
    description: t.description || "",
    destinationName: t.title,
    agencyAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.agencyName || t.id)}`,
    agencySlug: t.agencyId,
    durationLabel: `${t.durationDays} day${t.durationDays !== 1 ? "s" : ""}`,
    durationCategory: daysToDuration(t.durationDays),
    activityTypes: travelTypeToTourActivity(t.travelType),
    languages: ["English"],
    familyFriendly: false,
    availableFrom: "2025-01-01",
    availableTo: "2026-12-31",
    createdAt: t.createdAt,
  };
}

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
  try {
    const params: Record<string, string | number> = { size: 50 };
    if (filter.province) params.province = filter.province;
    if (filter.query.trim()) params.query = filter.query.trim();
    const paged = await publicApiFetch<PagedData<DestinationResponse>>("/search", { params });
    const mapped = (paged.content ?? []).map(mapToExploreDestination);
    const filtered = mapped.filter((d) => matchesDestination(d, filter));
    return { ok: true, data: sortDestinations(filtered, sort) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getExploreTours(
  filter: TourFilter,
  sort: ExploreSort = "recommended",
): Promise<Result<ExploreTour[]>> {
  try {
    const params: Record<string, string | number> = { size: 50 };
    if (filter.province) params.province = filter.province;
    if (filter.query.trim()) params.query = filter.query.trim();
    const paged = await publicApiFetch<PagedData<TourPackageResponse>>("/search/tours", { params });
    const mapped = (paged.content ?? []).map(mapToExploreTour);
    const filtered = mapped.filter((t) => matchesTour(t, filter));
    return { ok: true, data: sortTours(filtered, sort) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

/**
 * Tours in a given province — powers the "Tours in {destination}" grid on the
 * destination detail page. `ExploreTour` extends the `FeaturedTour` teaser shape,
 * so the results render directly with the shared `TrendingTourCard`.
 */
export async function getToursByProvince(
  province: string,
  sort: ExploreSort = "recommended",
): Promise<Result<ExploreTour[]>> {
  try {
    const paged = await publicApiFetch<PagedData<TourPackageResponse>>("/tours", {
      params: { province, size: 30 },
    });
    const mapped = (paged.content ?? []).map(mapToExploreTour);
    return { ok: true, data: sortTours(mapped, sort) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
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
  try {
    const paged = await publicApiFetch<PagedData<TourPackageResponse>>("/tours", {
      params: { agencyId: agencySlug, size: 30 },
    });
    const mapped = (paged.content ?? []).map(mapToExploreTour);
    return { ok: true, data: sortTours(mapped, sort) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

// ── Filter-option sources (hardcoded — API doesn't expose these taxonomies) ───

export const REGION_OPTIONS = ["Southeast Asia"] as const satisfies readonly Region[];
export const SEASON_OPTIONS = ["Dry Season", "Year-round"] as const satisfies readonly Season[];
export const REGION_TYPE_OPTIONS = [
  "Beach",
  "City",
  "Cultural",
  "Jungle",
  "Mountain",
] as const satisfies readonly RegionType[];
export const ACTIVITY_FOCUS_OPTIONS = [
  "Adventure",
  "Food",
  "History",
  "Nature",
  "Wellness",
] as const satisfies readonly ActivityFocus[];
export const DESTINATION_PROVINCE_OPTIONS = [
  "PHNOM_PENH",
  "SIEM_REAP",
  "BATTAMBANG",
  "KAMPOT",
  "KEP",
  "PREAH_SIHANOUK",
  "MONDULKIRI",
  "RATANAKIRI",
] as const;
export const TOUR_ACTIVITY_OPTIONS = [
  "Adventure",
  "Cultural",
  "Food & Drink",
  "Nature",
  "Wellness",
  "Family",
  "Water Sports",
] as const satisfies readonly TourActivityType[];
export const DURATION_OPTIONS = [
  "half-day",
  "full-day",
  "2-3 days",
  "4-7 days",
  "7+ days",
] as const satisfies readonly TourDuration[];
export const LANGUAGE_OPTIONS = ["English", "Khmer", "Korean"] as const;
export const TOUR_PROVINCE_OPTIONS = [
  "PHNOM_PENH",
  "SIEM_REAP",
  "BATTAMBANG",
  "KAMPOT",
  "KEP",
  "PREAH_SIHANOUK",
  "MONDULKIRI",
  "RATANAKIRI",
] as const;
