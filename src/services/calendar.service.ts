import { clientApiFetch } from "@/lib/api/client";
import type {
  CalendarTripEntry,
  PersonalEventRequest,
  PersonalEventResponse,
} from "@/lib/api/calendar";

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
