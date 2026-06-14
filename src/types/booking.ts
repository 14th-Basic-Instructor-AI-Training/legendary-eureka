import type { ApiResponse, ApiListResponse, ApiPageResponse } from "./response";
import type { TripStatus } from "./enums";

/**
 * Trip / booking — raw API DTO (the `booking` feature on the backend). A
 * traveler books a tour package; the agency approves/confirms; on completion the
 * traveler can review each activity. No `booking` feature folder exists on the
 * frontend yet, so the domain type is defined inline here until it lands.
 */
export interface TripDto {
  id: string;
  tourId: string;
  tourSlug: string;
  travelerId: string;
  status: TripStatus;
  travelers: number;
  startDate?: string;
  createdAt: string;
}

export type BookingResponse = ApiResponse<TripDto>;
export type BookingListResponse = ApiListResponse<TripDto>;
export type BookingPageResponse = ApiPageResponse<TripDto>;

/** Unwrapped domain type (defined inline until a `booking` feature is built). */
export interface Trip {
  id: string;
  tourId: string;
  tourSlug: string;
  travelerId: string;
  status: TripStatus;
  travelers: number;
  startDate?: string;
  createdAt: string;
}
