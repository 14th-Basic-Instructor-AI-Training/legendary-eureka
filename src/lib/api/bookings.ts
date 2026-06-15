import { apiFetch, type PagedData, type PageParams } from "./client";
import type { MonthlyBookingResponse } from "./profile";

// ── Enums ─────────────────────────────────────────────────────────────────────

export type TripStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

// ── Response types ────────────────────────────────────────────────────────────

export interface TripResponse {
  id: string;
  // traveler identity (enriched by the backend — all fields available)
  travelerId: string;
  travelerName: string;
  travelerDisplayName: string;
  travelerInitials: string;
  travelerEmail: string;
  travelerPhone: string;
  // package info
  tourPackageId: string;
  tourPackageTitle: string;
  packageTitle: string;
  // agency
  agencyId: string;
  // booking details
  status: TripStatus;
  numberOfPeople: number;
  guests: number;
  /** ISO date string (YYYY-MM-DD) */
  requestedDate: string;
  datesLabel: string;
  total: number;
  currency: string;
  paymentStatus: string;
  // notes
  note: string;
  specialRequests: string;
  agencyNote: string;
  // meta
  requestedAtLabel: string;
  createdAt: string;
  updatedAt: string;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface TripRequest {
  tourPackageId: string;
  numberOfPeople: number;
  /** ISO date string (YYYY-MM-DD) — must be today or in the future */
  requestedDate: string;
  note?: string;
}

/** Optional note sent when an agency approves, rejects, or completes a trip. */
export interface TripDecisionRequest {
  note?: string;
}

// ── Traveler: own bookings ────────────────────────────────────────────────────

export function bookTrip(body: TripRequest): Promise<TripResponse> {
  return apiFetch("/trips", { method: "POST", body });
}

export function getMyTrips(params?: PageParams): Promise<PagedData<TripResponse>> {
  return apiFetch("/trips/mine", { params });
}

export function getTrip(id: string): Promise<TripResponse> {
  return apiFetch(`/trips/${id}`);
}

export function cancelTrip(id: string): Promise<TripResponse> {
  return apiFetch(`/trips/${id}/cancel`, { method: "PUT" });
}

// ── Agency: incoming bookings ─────────────────────────────────────────────────

export function getIncomingTrips(params?: PageParams): Promise<PagedData<TripResponse>> {
  return apiFetch("/trips/incoming", { params });
}

export function approveTrip(id: string, body?: TripDecisionRequest): Promise<TripResponse> {
  return apiFetch(`/trips/${id}/approve`, { method: "PUT", body });
}

export function rejectTrip(id: string, body?: TripDecisionRequest): Promise<TripResponse> {
  return apiFetch(`/trips/${id}/reject`, { method: "PUT", body });
}

export function completeTrip(id: string, body?: TripDecisionRequest): Promise<TripResponse> {
  return apiFetch(`/trips/${id}/complete`, { method: "PUT", body });
}

// ── Admin: all platform bookings ──────────────────────────────────────────────

export interface AdminTripParams extends PageParams {
  status?: TripStatus;
}

/** Every trip on the platform (ADMIN only), optionally filtered by status. */
export function getAllTrips(params?: AdminTripParams): Promise<PagedData<TripResponse>> {
  return apiFetch("/admin/trips", { params });
}

/** Platform-wide monthly booking counts for the trend chart (ADMIN only). */
export function getAdminMonthlyBookings(months = 12): Promise<MonthlyBookingResponse[]> {
  return apiFetch("/admin/trips/stats", { params: { months } });
}
