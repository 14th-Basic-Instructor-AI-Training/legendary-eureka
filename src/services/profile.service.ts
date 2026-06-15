import { apiFetch } from "@/lib/api/client";
import type { PagedData, PageParams } from "@/lib/api/client";
import type {
  AgencyProfileResponse,
  AgencyReviewResponse,
  AgencyStatsResponse,
  BookingStatusSummaryResponse,
  MonthlyBookingResponse,
  TravelerProfileResponse,
  UpdateAgencyProfileRequest,
  UpdateTravelerProfileRequest,
} from "@/lib/api/profile";

// ── Agency profile ────────────────────────────────────────────────────────────

export function getAgencyProfile(id: string): Promise<AgencyProfileResponse> {
  return apiFetch(`/agencies/${id}`, { auth: false });
}

export function getMyAgencyProfile(): Promise<AgencyProfileResponse> {
  return apiFetch("/agencies/me");
}

export function updateMyAgencyProfile(
  body: UpdateAgencyProfileRequest,
): Promise<AgencyProfileResponse> {
  return apiFetch("/agencies/me", { method: "PUT", body });
}

export function getMyAgencyStats(): Promise<AgencyStatsResponse> {
  return apiFetch("/agencies/me/stats");
}

export function getMonthlyBookings(months = 6): Promise<MonthlyBookingResponse[]> {
  return apiFetch("/agencies/me/stats/monthly-bookings", { params: { months } });
}

export function getBookingStatusSummary(): Promise<BookingStatusSummaryResponse> {
  return apiFetch("/agencies/me/stats/booking-status-summary");
}

export function getMyAgencyReviews(
  params?: PageParams,
): Promise<PagedData<AgencyReviewResponse>> {
  return apiFetch("/agencies/me/reviews", { params });
}

// ── Traveler profile ──────────────────────────────────────────────────────────

export function getTravelerProfile(id: string): Promise<TravelerProfileResponse> {
  return apiFetch(`/travelers/${id}`, { auth: false });
}

export function getMyTravelerProfile(): Promise<TravelerProfileResponse> {
  return apiFetch("/travelers/me");
}

export function updateMyTravelerProfile(
  body: UpdateTravelerProfileRequest,
): Promise<TravelerProfileResponse> {
  return apiFetch("/travelers/me", { method: "PUT", body });
}
