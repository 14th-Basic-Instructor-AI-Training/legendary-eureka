import { clientApiFetch } from "./client";

// ── Types ──────────────────────────────────────────────────────────────────────

export type TripStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";

export interface CalendarTripEntry {
  id: string;
  tourPackageId: string;
  tourPackageTitle: string;
  /** Agency display name — present in traveler's view */
  agencyName?: string;
  /** Traveler display name — present in agency/admin view */
  travelerName?: string;
  status: TripStatus;
  requestedDate: string; // ISO YYYY-MM-DD
  durationDays: number | null;
}

export interface PersonalEventResponse {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;
  allDay: boolean;
  createdAt: string;
}

export interface PersonalEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
}

// ── Traveler ───────────────────────────────────────────────────────────────────

export function getCalendarMyTrips(): Promise<CalendarTripEntry[]> {
  return clientApiFetch("/calendar/my-trips");
}

// ── Agency / Admin ─────────────────────────────────────────────────────────────

export function getCalendarAgencyBookings(): Promise<CalendarTripEntry[]> {
  return clientApiFetch("/calendar/agency-bookings");
}

// ── Personal events (all roles) ────────────────────────────────────────────────

export function getPersonalEvents(): Promise<PersonalEventResponse[]> {
  return clientApiFetch("/calendar/personal-events");
}

export function createPersonalEvent(body: PersonalEventRequest): Promise<PersonalEventResponse> {
  return clientApiFetch("/calendar/personal-events", { method: "POST", body });
}

export function updatePersonalEvent(
  id: string,
  body: PersonalEventRequest,
): Promise<PersonalEventResponse> {
  return clientApiFetch(`/calendar/personal-events/${id}`, { method: "PUT", body });
}

export function deletePersonalEvent(id: string): Promise<void> {
  return clientApiFetch(`/calendar/personal-events/${id}`, { method: "DELETE" });
}
