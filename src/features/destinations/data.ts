import { publicApiFetch, type PagedData } from "@/lib/api/client";
import type { DestinationResponse } from "@/lib/api/activities";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { AgencyProfileResponse } from "@/lib/api/profile";
import type { ReviewResponse } from "@/lib/api/reviews";
import type {
  AgencyProfile,
  Destination,
  DestinationCategory,
  DiscoverFilter,
  FeaturedTour,
  Review,
  TravelType,
} from "./schema";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

// ── Constants ────────────────────────────────────────────────────────────────

export const TRAVEL_TYPES: readonly TravelType[] = [
  "ADVENTURE",
  "CULTURAL",
  "RELAXATION",
  "FOOD",
  "NATURE",
];

export const PROVINCES: readonly string[] = [
  "PHNOM_PENH",
  "SIEM_REAP",
  "BATTAMBANG",
  "KAMPOT",
  "KEP",
  "PREAH_SIHANOUK",
  "MONDULKIRI",
  "RATANAKIRI",
];

// ── Type helpers ─────────────────────────────────────────────────────────────

const FEATURE_TRAVEL_TYPES: readonly TravelType[] = [
  "ADVENTURE", "CULTURAL", "RELAXATION", "FOOD",
  "NATURE", "HISTORICAL", "BEACH",
];

function toFeatureTravelType(v: string): TravelType {
  return (FEATURE_TRAVEL_TYPES as string[]).includes(v)
    ? (v as TravelType)
    : "CULTURAL";
}

function categoryFromString(cat: string): DestinationCategory {
  if (cat === "food") return "food";
  if (cat === "stay" || cat === "accommodation") return "stay";
  if (cat === "thingToDo" || cat === "activity") return "thingToDo";
  return "destination";
}

// ── Type mappers ─────────────────────────────────────────────────────────────

function mapDestination(d: DestinationResponse): Destination {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    country: d.country || "Cambodia",
    city: d.city || d.province?.replace(/_/g, " ") || "",
    province: d.province,
    category: categoryFromString(d.category),
    travelType: toFeatureTravelType(d.travelType),
    shortDescription: d.shortDescription || d.description?.slice(0, 140) || "",
    heroImage: d.heroImage || d.coverImageUrl || "",
    rating: d.rating ?? 0,
    reviewCount: d.reviewCount ?? 0,
    priceFrom: d.priceFrom ?? 0,
    currency: d.currency || "USD",
    tags: d.tags || [],
    featured: d.featured ?? false,
    trending: d.trending ?? false,
    lat: d.lat || d.latitude || 0,
    lng: d.lng || d.longitude || 0,
    about: d.description,
    gallery: d.photos || [],
    pois: [],
  };
}

function mapFeaturedTour(t: TourPackageResponse): FeaturedTour {
  return {
    id: t.id,
    slug: t.id,
    title: t.title,
    agencyName: t.agencyName || "",
    travelType: toFeatureTravelType(t.travelType),
    image: t.coverImageUrl || "",
    days: t.durationDays,
    priceFrom: t.price ?? t.priceFrom ?? 0,
    currency: t.currency || "USD",
    rating: t.rating ?? 0,
    reviewCount: t.reviewCount ?? 0,
    destinationSlugs: [],
  };
}

function mapAgencyProfile(a: AgencyProfileResponse): AgencyProfile {
  return {
    id: a.id,
    slug: a.id,
    name: a.agencyName || "",
    owner: a.agencyName || "",
    logo: a.avatarUrl || "",
    province: a.address || "",
    status: a.status,
    rating: a.averageRating ?? 0,
    reviewCount: a.reviewCount ?? 0,
    tourCount: 0,
    tags: [],
    languages: [],
    about: a.bio,
  };
}

function mapReview(r: ReviewResponse): Review {
  return {
    id: r.id,
    authorName: r.travelerName || "Traveler",
    authorAvatar:
      r.travelerAvatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.travelerName || r.id)}`,
    rating: r.rating,
    comment: r.comment || "",
    targetSlug: r.targetId,
    createdAt: r.createdAt,
    photoCount: r.photos?.length ?? 0,
  };
}

// ── Public getters (called via useResource from client components) ─────────────

export async function getFeaturedDestinations(): Promise<Result<Destination[]>> {
  try {
    const page = await publicApiFetch<PagedData<DestinationResponse>>("/feed/featured", {
      params: { size: 12 },
    });
    return { ok: true, data: page.content.map(mapDestination) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getTrendingDestinations(): Promise<Result<Destination[]>> {
  try {
    const page = await publicApiFetch<PagedData<DestinationResponse>>("/feed/trending", {
      params: { size: 12 },
    });
    return { ok: true, data: page.content.map(mapDestination) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getAllDestinations(): Promise<Result<Destination[]>> {
  try {
    const page = await publicApiFetch<PagedData<DestinationResponse>>("/destinations", {
      params: { size: 50 },
    });
    return { ok: true, data: page.content.map(mapDestination) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getDestinationsByCategory(
  category: DestinationCategory,
): Promise<Result<Destination[]>> {
  try {
    const all = await getAllDestinations();
    if (!all.ok) return all;
    return { ok: true, data: all.data.filter((d) => d.category === category) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getThingsToDo(): Promise<Result<Destination[]>> {
  return getDestinationsByCategory("thingToDo");
}

export async function getDestinationBySlug(slug: string): Promise<Result<Destination>> {
  try {
    const d = await publicApiFetch<DestinationResponse>(`/destinations/by-slug/${slug}`);
    return { ok: true, data: mapDestination(d) };
  } catch {
    return { ok: false, error: "not_found" };
  }
}

export async function getDestinationReviews(slug: string): Promise<Result<Review[]>> {
  try {
    const dest = await publicApiFetch<DestinationResponse>(`/destinations/by-slug/${slug}`);
    const page = await publicApiFetch<PagedData<ReviewResponse>>("/reviews", {
      params: { targetType: "DESTINATION", targetId: dest.id, size: 20 },
    });
    return { ok: true, data: page.content.map(mapReview) };
  } catch {
    return { ok: true, data: [] };
  }
}

export async function getFeaturedTours(): Promise<Result<FeaturedTour[]>> {
  try {
    const page = await publicApiFetch<PagedData<TourPackageResponse>>("/feed/tours", {
      params: { size: 8 },
    });
    return { ok: true, data: page.content.map(mapFeaturedTour) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getAgencyBySlug(slug: string): Promise<Result<AgencyProfile>> {
  try {
    const a = await publicApiFetch<AgencyProfileResponse>(`/agencies/${slug}`);
    return { ok: true, data: mapAgencyProfile(a) };
  } catch {
    return { ok: false, error: "not_found" };
  }
}

export async function getTopAgencies(): Promise<Result<AgencyProfile[]>> {
  try {
    const page = await publicApiFetch<PagedData<AgencyProfileResponse>>("/agencies", {
      params: { size: 6 },
    });
    const approved = page.content
      .filter((a) => a.status === "APPROVED")
      .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
    return { ok: true, data: approved.map(mapAgencyProfile) };
  } catch {
    return { ok: true, data: [] };
  }
}

export async function getRecentReviews(): Promise<Result<Review[]>> {
  try {
    const page = await publicApiFetch<PagedData<ReviewResponse>>("/reviews", {
      params: { size: 6 },
    });
    return {
      ok: true,
      data: [...page.content]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(mapReview),
    };
  } catch {
    return { ok: true, data: [] };
  }
}

export async function searchDestinations(filter: DiscoverFilter): Promise<Result<Destination[]>> {
  try {
    const params: Record<string, string | number | boolean | undefined> = { size: 50 };
    if (filter.province) params.province = filter.province;
    if (filter.travelType) params.travelType = filter.travelType;
    if (filter.query?.trim()) params.query = filter.query.trim();
    const page = await publicApiFetch<PagedData<DestinationResponse>>("/search", { params });
    let results = page.content.map(mapDestination);
    if (filter.category) results = results.filter((d) => d.category === filter.category);
    return { ok: true, data: results };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

/** Pure filter predicate — kept for backward compat with tests. */
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
