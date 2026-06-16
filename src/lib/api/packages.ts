import type { Province, TravelType } from "./client";

// ── Enums ─────────────────────────────────────────────────────────────────────

export type TourPackageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// ── Response types ────────────────────────────────────────────────────────────

export interface TourAgendaItemResponse {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: string[];
}

export interface TourPackageResponse {
  id: string;
  slug?: string;
  ownerId: string;
  agencyId?: string;
  agencyName: string;
  title: string;
  description: string;
  province: Province;
  travelType: TravelType;
  price: number;
  priceFrom?: number;
  currency: string;
  durationDays: number;
  days?: number;
  /** Explore facets — backend enum / free-text columns, may be null when unset. */
  durationCategory?:
    | "HALF_DAY"
    | "FULL_DAY"
    | "TWO_TO_THREE_DAYS"
    | "FOUR_TO_SEVEN_DAYS"
    | "SEVEN_PLUS_DAYS"
    | null;
  familyFriendly?: boolean;
  /** Comma-separated activity types (e.g. "Adventure,Cultural"). */
  activityTypes?: string | null;
  /** Comma-separated languages (e.g. "English,Khmer"). */
  languages?: string | null;
  coverImageUrl: string;
  image: string;
  status: TourPackageStatus;
  agenda: TourAgendaItemResponse[];
  activityCount?: number;
  bookingsCount?: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface TourPackageRequest {
  title: string;
  description?: string;
  province?: Province;
  travelType?: TravelType;
  price?: number;
  currency?: string;
  durationDays: number;
  coverImageUrl?: string;
}

export interface TourAgendaItemRequest {
  dayNumber: number;
  title?: string;
  description?: string;
  activities?: string[];
}
