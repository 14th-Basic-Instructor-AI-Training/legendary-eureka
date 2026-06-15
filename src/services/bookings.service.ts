import { apiFetch } from "@/lib/api/client";
import type { PagedData, PageParams } from "@/lib/api/client";
import type {
  AdminTripParams,
  TripDecisionRequest,
  TripRequest,
  TripResponse,
} from "@/lib/api/bookings";
import type { MonthlyBookingResponse } from "@/lib/api/profile";

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

export function getAllTrips(params?: AdminTripParams): Promise<PagedData<TripResponse>> {
  return apiFetch("/admin/trips", { params });
}

export function getAdminMonthlyBookings(months = 12): Promise<MonthlyBookingResponse[]> {
  return apiFetch("/admin/trips/stats", { params: { months } });
}
