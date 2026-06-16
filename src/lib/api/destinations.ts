import type { Province, TravelType } from "./client";

// ── Response types ────────────────────────────────────────────────────────────

export interface DestinationResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  province: Province;
  city: string;
  country: string;
  travelType: TravelType;
  category: string;
  coverImageUrl: string;
  heroImage: string;
  priceFrom: number;
  currency: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  featured: boolean;
  trending: boolean;
  /** Explore facets — backend enum names (e.g. "SOUTHEAST_ASIA") or null when unset. */
  region: string | null;
  regionType: string | null;
  bestSeason: string | null;
  /** Free-text, comma-separated activity focus (e.g. "Adventure,Nature"). */
  activityFocus: string | null;
  familyFriendly: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
  ownerId: string;
  createdAt: string;
  photos: string[];
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface CreateDestinationRequest {
  name: string;
  description?: string;
  shortDescription?: string;
  province?: Province;
  travelType?: TravelType;
  coverImageUrl?: string;
  priceFrom?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  trending?: boolean;
  tags?: string[];
  photos?: string[];
}
