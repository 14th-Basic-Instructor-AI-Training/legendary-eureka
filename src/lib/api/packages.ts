import type { Province, TravelType } from "./client";

// ── Enums ─────────────────────────────────────────────────────────────────────

export type TourPackageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/** Approval lifecycle, independent of publication status. Null = never submitted. */
export type TourApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

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
  tagline?: string;
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
  groupSizeMax?: number;
  languages?: string;
  cancellationPolicy?: string;
  highlights?: string;
  included?: string;
  excluded?: string;
  status: TourPackageStatus;
  agenda: TourAgendaItemResponse[];
  activityCount?: number;
  bookingsCount?: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  // Approval workflow (null when never submitted for review)
  approvalStatus?: TourApprovalStatus | null;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface TourPackageRequest {
  title: string;
  tagline?: string;
  description?: string;
  province?: Province;
  travelType?: TravelType;
  price?: number;
  currency?: string;
  durationDays: number;
  coverImageUrl?: string;
  groupSizeMax?: number;
  languages?: string;
  cancellationPolicy?: string;
  highlights?: string;
  included?: string;
  excluded?: string;
}

export interface TourAgendaItemRequest {
  dayNumber: number;
  title?: string;
  description?: string;
  activities?: string[];
}
