import type { ApiResponse, ApiListResponse, ApiPageResponse } from "./response";
import type { Visibility } from "./enums";

/**
 * Trip plan — raw API DTO (the `engagement/tripplan` feature on the backend). A
 * traveler-authored itinerary (destinations + things-to-do + where-to-eat) that
 * is public (shareable) or private. No frontend feature folder yet, so the
 * domain type is inline.
 */
export interface TripPlanItemDto {
  day: number;
  order: number;
  refSlug: string;
  refType: "DESTINATION" | "ACTIVITY" | "RESTAURANT" | "ACCOMMODATION";
  note?: string;
}

export interface TripPlanDto {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  visibility: Visibility;
  coverImage?: string;
  items: TripPlanItemDto[];
  /** ISO-8601. */
  createdAt: string;
}

export type TripPlanResponse = ApiResponse<TripPlanDto>;
export type TripPlanListResponse = ApiListResponse<TripPlanDto>;
export type TripPlanPageResponse = ApiPageResponse<TripPlanDto>;

/** Unwrapped domain type (defined inline until a `tripPlan` feature is built). */
export interface TripPlan {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  visibility: Visibility;
  coverImage?: string;
  items: TripPlanItemDto[];
  createdAt: string;
}
