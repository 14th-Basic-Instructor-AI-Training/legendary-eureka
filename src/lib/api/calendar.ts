import type { TripStatus } from "./bookings";

export type { TripStatus };

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
  /** Personal calendar (sub-group) this event belongs to; null = default group. */
  calendarId?: string | null;
  createdAt: string;
}

export interface PersonalEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  /** Assign the event to a personal calendar; omit/null for the default group. */
  calendarId?: string | null;
}

export interface PersonalCalendarResponse {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface PersonalCalendarRequest {
  name: string;
  color?: string;
}
