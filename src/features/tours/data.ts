import { publicApiFetch, type PagedData } from "@/lib/api/client";
import type { TourPackageResponse, TourAgendaItemResponse } from "@/lib/api/packages";
import type { AgencyProfileResponse } from "@/lib/api/profile";
import type { ReviewResponse } from "@/lib/api/reviews";
import type { FeaturedTour, TravelType } from "@/features/destinations/schema";
import type {
  TourDetail,
  TourReview,
  RatingBreakdown,
  TourAgency,
  TourDestination,
  TourPackage,
  TourDay,
} from "./schema";

/**
 * The ONE data seam for tours. Components import from here, never fixtures —
 * swapping for route handlers / server actions later is a one-file change.
 *
 * It backs both surfaces of the feature:
 *  - the public tour detail / booking page (read-only getters returning typed
 *    `Result`s; similar/other-tour rows return the destinations `FeaturedTour`
 *    teaser shape so the existing TourCard is reused), and
 *  - the agency destination → package → approval flow, whose mutable store seeds
 *    from the `initialX()` helpers below (never from `fixtures.ts` directly).
 *
 * All getters use `publicApiFetch` (browser-safe, no auth token) so this module
 * works from both Server Components and client components (e.g. booking/data.ts).
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

/** The agency name used for the demo session's own content. */
export const DEMO_AGENCY_NAME = "";

// ── Travel-type guard ────────────────────────────────────────────────────────

const VALID_TRAVEL_TYPES: string[] = [
  "ADVENTURE",
  "CULTURAL",
  "RELAXATION",
  "FOOD",
  "NATURE",
  "HISTORICAL",
  "BEACH",
];

/**
 * Coerce any backend TravelType (10 values) down to the 7 the feature schema
 * accepts. Unknown values fall back to "CULTURAL".
 */
function toFeatureTravelType(v: string): TravelType {
  return VALID_TRAVEL_TYPES.includes(v) ? (v as TravelType) : "CULTURAL";
}

// ── Mapping helpers ──────────────────────────────────────────────────────────

function mapAgendaToTourDay(a: TourAgendaItemResponse): TourDay {
  return {
    day: a.dayNumber,
    title: a.title || `Day ${a.dayNumber}`,
    stops: (a.activities ?? []).map((act, i) => ({
      order: i + 1,
      name: act,
      durationLabel: "1 hr",
    })),
  };
}

function mapToTourReview(r: ReviewResponse): TourReview {
  return {
    id: r.id,
    authorName: r.travelerName || "Traveler",
    authorAvatar:
      r.travelerAvatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        r.travelerName || r.id,
      )}`,
    rating: r.rating,
    comment: r.comment || "",
    createdAt: r.createdAt,
    photos: (r.photos || []).slice(0, 3),
    bookingCompleted: true,
  };
}

function mapToTourAgency(a: AgencyProfileResponse): TourAgency {
  return {
    id: a.id,
    slug: a.id,
    name: a.agencyName || "",
    owner: a.agencyName || "",
    logo:
      a.avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        a.agencyName || a.id,
      )}`,
    province: a.address || "Cambodia",
    status: a.status,
    rating: a.averageRating ?? 0,
    reviewCount: a.reviewCount ?? 0,
    tourCount: 0,
    tags: [],
    about: a.bio || undefined,
    languages: [],
    bio: a.bio || "",
    contactEmail: a.contactEmail || "",
    contactPhone: a.contactPhone || "",
  };
}

function mapToTourDetail(
  t: TourPackageResponse,
  agency: TourAgency,
  reviews: TourReview[],
): TourDetail {
  const coverUrl = t.coverImageUrl || t.image || "https://placehold.co/800x500";
  return {
    id: t.id,
    slug: t.slug ?? t.id,
    title: t.title,
    tagline: t.description?.slice(0, 80) || t.title,
    description: t.description || "",
    heroImage: coverUrl,
    gallery: [coverUrl],
    travelType: toFeatureTravelType(t.travelType),
    province: t.province,
    durationDays: t.durationDays,
    groupSizeMax: 20,
    languages: ["English"],
    cancellationPolicy: "free",
    rating: t.rating ?? 0,
    reviewCount: t.reviewCount ?? 0,
    highlights: [],
    included: [],
    excluded: [],
    unitPrice: t.price ?? t.priceFrom ?? 0,
    currency: t.currency || "USD",
    platformFee: 0,
    availability: "available",
    agency,
    travelPlan: (t.agenda || []).map(mapAgendaToTourDay),
    reviews,
  };
}

/** Project a `TourPackageResponse` to the teaser shape `TourCard` renders. */
function mapToTeaser(t: TourPackageResponse): FeaturedTour {
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
  };
}

// ── Public tour detail / booking ─────────────────────────────────────────────

/** Load one tour by id OR slug, along with its agency profile and reviews. */
export async function getTourById(id: string): Promise<Result<TourDetail>> {
  try {
    const [tour, reviewPage] = await Promise.all([
      publicApiFetch<TourPackageResponse>(`/tours/${id}`),
      publicApiFetch<PagedData<ReviewResponse>>("/reviews", {
        params: { targetType: "TOUR", targetId: id, size: 20 },
      }),
    ]);

    const agencyId = tour.agencyId ?? tour.ownerId;
    let agency: TourAgency;
    try {
      const agencyData = await publicApiFetch<AgencyProfileResponse>(
        `/agencies/${agencyId}`,
      );
      agency = mapToTourAgency(agencyData);
    } catch {
      // Agency endpoint unavailable — build a minimal fallback so the page
      // still renders rather than returning an error.
      agency = {
        id: agencyId,
        slug: agencyId,
        name: tour.agencyName || "",
        owner: tour.agencyName || "",
        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          tour.agencyName || agencyId,
        )}`,
        province: "Cambodia",
        status: "APPROVED",
        rating: 0,
        reviewCount: 0,
        tourCount: 0,
        tags: [],
        languages: [],
        bio: "",
        contactEmail: "",
        contactPhone: "",
      };
    }

    const reviews = reviewPage.content.map(mapToTourReview);
    return { ok: true, data: mapToTourDetail(tour, agency, reviews) };
  } catch {
    return { ok: false, error: "not_found" };
  }
}

/** Load one agency by id. */
export async function getAgencyById(
  agencyId: string,
): Promise<Result<TourAgency>> {
  try {
    const a = await publicApiFetch<AgencyProfileResponse>(
      `/agencies/${agencyId}`,
    );
    return { ok: true, data: mapToTourAgency(a) };
  } catch {
    return { ok: false, error: "not_found" };
  }
}

/** Tours in the same province (excluding itself) — used in the "Similar tours" row. */
export async function getSimilarTours(
  tour: TourDetail,
): Promise<Result<FeaturedTour[]>> {
  try {
    const page = await publicApiFetch<PagedData<TourPackageResponse>>("/tours", {
      params: { province: tour.province, size: 6 },
    });
    const data = page.content
      .filter((t) => t.id !== tour.id)
      .map(mapToTeaser);
    return { ok: true, data };
  } catch {
    // Non-fatal — render with empty list rather than an error state.
    return { ok: true, data: [] };
  }
}

/** Other tours run by the same agency (excluding the one being viewed). */
export async function getAgencyTours(
  agencyId: string,
  excludeId: string,
): Promise<Result<FeaturedTour[]>> {
  try {
    const page = await publicApiFetch<PagedData<TourPackageResponse>>("/tours", {
      params: { agencyId, size: 6 },
    });
    const data = page.content
      .filter((t) => t.id !== excludeId)
      .map(mapToTeaser);
    return { ok: true, data };
  } catch {
    return { ok: true, data: [] };
  }
}

/**
 * Per-star review counts (5 → 1) for the Reviews-tab bar chart. The API returns
 * only an aggregate `reviewCount`, so synthesize a distribution that sums to that
 * total and skews toward the overall rating.
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

// ── Agency destination → package → approval flow ─────────────────────────────

/** Returns an empty list — destinations are loaded from the API by the store. */
export function initialDestinations(): TourDestination[] {
  return [];
}

/** Returns an empty list — packages are loaded from the API by the store. */
export function initialPackages(): TourPackage[] {
  return [];
}
