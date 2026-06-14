import { apiFetch, type PagedData, type PageParams } from "./client";

// ── Types ────────────────────────────────────────────────────────────────────

export type TripStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface TripResponse {
  id: string;
  tourPackageId: string;
  tourPackageTitle: string;
  travelerId: string;
  agencyId: string;
  status: TripStatus;
  numberOfPeople: number;
  /** ISO date string (YYYY-MM-DD) */
  requestedDate: string;
  note: string;
  agencyNote: string;
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

export interface TripDecisionRequest {
  agencyNote?: string;
}

// ── Traveler: own bookings ────────────────────────────────────────────────────

export function bookTrip(body: TripRequest): Promise<TripResponse> {
  return apiFetch("/trips", { method: "POST", body });
}

export function getMyTrips(params?: PageParams): Promise<PagedData<TripResponse>> {
  return apiFetch("/trips/mine", { params });
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

// ── Shared ────────────────────────────────────────────────────────────────────

export function getTrip(id: string): Promise<TripResponse> {
  return apiFetch(`/trips/${id}`);
}
