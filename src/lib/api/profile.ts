// ── Enums ─────────────────────────────────────────────────────────────────────

export type AgencyStatus = "PENDING" | "APPROVED" | "REJECTED";

// ── Response types ────────────────────────────────────────────────────────────

export interface AgencyProfileResponse {
  id: string;
  slug: string;
  agencyName: string;
  /** Long-form description (maps to Java field `bio`). */
  bio: string;
  avatarUrl: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  /** Backend Province enum name (e.g. "SIEM_REAP") or null when unset. */
  province: string | null;
  /** Map pin — BigDecimal on the wire (null when unset); lat/lng are 0 when unset. */
  latitude: number | null;
  longitude: number | null;
  lat: number;
  lng: number;
  /** Comma-separated languages (e.g. "English,Khmer"). */
  languages: string | null;
  responseTimeHours: number | null;
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
  province?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  languages?: string;
  responseTimeHours?: number;
}

export interface UpdateTravelerProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
}
