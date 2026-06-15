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
  createdAt: string;
}

export interface PersonalEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
}
