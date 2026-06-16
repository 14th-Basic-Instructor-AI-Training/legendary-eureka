import { apiFetch } from "@/lib/api/client";
import { DestinationPageSchema, type DestinationResponse } from "@/types/destination";
import type { Result } from "@/features/destinations/data";
import type {
  Destination,
  DestinationCategory,
  TravelType,
} from "@/features/destinations/schema";

/**
 * Destination API access for the landing page. Fetches the backend response, validates
 * it with Zod (the contract guard), then maps the wire DTO to the `Destination` domain
 * type the cards consume. Returns a typed `Result` — never throws to the caller.
 */

const TRAVEL_TYPES: readonly TravelType[] = [
  "ADVENTURE", "CULTURAL", "RELAXATION", "FOOD", "NATURE", "HISTORICAL", "BEACH",
];

function toTravelType(value: string | null | undefined): TravelType {
  return value && (TRAVEL_TYPES as readonly string[]).includes(value)
    ? (value as TravelType)
    : "CULTURAL";
}

function toCategory(value: string | null | undefined): DestinationCategory {
  switch (value) {
    case "FOOD":
    case "food":
      return "food";
    case "STAY":
    case "stay":
    case "ACCOMMODATION":
      return "stay";
    case "THING_TO_DO":
    case "thingToDo":
    case "ACTIVITY":
      return "thingToDo";
    default:
      return "destination";
  }
}

export function mapDestination(d: DestinationResponse): Destination {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    country: d.country ?? "Cambodia",
    city: d.city ?? d.province?.replace(/_/g, " ") ?? "",
    province: d.province ?? "",
    category: toCategory(d.category),
    travelType: toTravelType(d.travelType),
    shortDescription: d.shortDescription ?? d.description?.slice(0, 140) ?? "",
    heroImage: d.heroImage ?? d.coverImageUrl ?? "",
    rating: d.rating,
    reviewCount: d.reviewCount,
    priceFrom: d.priceFrom ?? 0,
    currency: d.currency ?? "USD",
    tags: d.tags,
    featured: d.featured,
    trending: d.trending,
    lat: d.lat ?? d.latitude ?? 0,
    lng: d.lng ?? d.longitude ?? 0,
    about: d.description ?? undefined,
    gallery: d.photos,
    pois: [],
  };
}

/** GET /destinations?filter=popular — popular destinations for the landing page. */
export async function fetchPopularDestinations(size = 6): Promise<Result<Destination[]>> {
  try {
    const data = await apiFetch<unknown>("/destinations", {
      auth: false,
      params: { filter: "popular", page: 0, size },
    });
    const page = DestinationPageSchema.parse(data);
    return { ok: true, data: page.content.map(mapDestination) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}
