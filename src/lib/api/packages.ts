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
