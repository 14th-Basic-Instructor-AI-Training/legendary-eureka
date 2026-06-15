// ── Enums ─────────────────────────────────────────────────────────────────────

export type AgencyStatus = "PENDING" | "APPROVED" | "REJECTED";

// ── Response types ────────────────────────────────────────────────────────────

export interface AgencyProfileResponse {
  id: string;
  agencyName: string;
  /** Long-form description (maps to Java field `bio`). */
  bio: string;
  avatarUrl: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  status: AgencyStatus;
  rejectionReason: string | null;
  averageRating: number;
  reviewCount: number;
  ratingsBreakdown: Record<string, number> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyStatsResponse {
  totalPackages: number;
  activePackages: number;
  pendingBookings: number;
  totalActivities: number;
  categoryCount: number;
  averageRating: number;
  reviewCount: number;
}

/** One bar in the monthly booking trend chart. */
export interface MonthlyBookingResponse {
  month: string;
  bookings: number;
}

/** Counts per status for the donut chart. */
export interface BookingStatusSummaryResponse {
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  cancelled: number;
}

export interface AgencyReviewResponse {
  id: string;
  travelerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface TravelerProfileResponse {
  id: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  phone?: string | null;
  createdAt: string;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface UpdateAgencyProfileRequest {
  agencyName?: string;
  bio?: string;
  avatarUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
}

export interface UpdateTravelerProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
}
