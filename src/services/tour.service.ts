import { apiFetch } from "@/lib/api/client";
import { IMAGE_PLACEHOLDER } from "@/lib/placeholder";
import { TourPackagePageSchema, type TourPackageResponse } from "@/types/tour";
import type { Result } from "@/features/destinations/data";
import type { FeaturedTour, TravelType } from "@/features/destinations/schema";

/**
 * Tour package API access for the landing page (trending + recommended rows). Validates
 * the backend response with Zod, then maps the wire DTO to the `FeaturedTour` domain type
 * the tour cards consume.
 */

const TRAVEL_TYPES: readonly TravelType[] = [
  "ADVENTURE", "CULTURAL", "RELAXATION", "FOOD", "NATURE", "HISTORICAL", "BEACH",
];

function toTravelType(value: string | null | undefined): TravelType {
  return value && (TRAVEL_TYPES as readonly string[]).includes(value)
    ? (value as TravelType)
    : "CULTURAL";
}

export function mapFeaturedTour(t: TourPackageResponse): FeaturedTour {
  return {
    id: t.id,
    slug: t.slug ?? t.id,
    title: t.title,
    agencyName: t.agencyName ?? "",
    travelType: toTravelType(t.travelType),
    image: t.coverImageUrl || t.image || IMAGE_PLACEHOLDER,
    days: t.durationDays ?? t.days ?? 1,
    priceFrom: t.price ?? t.priceFrom ?? 0,
    currency: t.currency ?? "USD",
    rating: t.rating,
    reviewCount: t.reviewCount,
    destinationSlugs: [],
  };
}

/** GET /tours?filter=trending — trending tour packages (newest published). */
export async function fetchTrendingTours(size = 6): Promise<Result<FeaturedTour[]>> {
  try {
    const data = await apiFetch<unknown>("/tours", {
      auth: false,
      params: { filter: "trending", page: 0, size },
    });
    const page = TourPackagePageSchema.parse(data);
    return { ok: true, data: page.content.map(mapFeaturedTour) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

/** GET /tours/recommended?userId= — highest-rated tours, optionally personalized by user. */
export async function fetchRecommendedTours(
  userId?: string,
  size = 6,
): Promise<Result<FeaturedTour[]>> {
  try {
    const data = await apiFetch<unknown>("/tours/recommended", {
      auth: false,
      params: { userId, page: 0, size },
    });
    const page = TourPackagePageSchema.parse(data);
    return { ok: true, data: page.content.map(mapFeaturedTour) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}
