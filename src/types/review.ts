import type { ApiResponse, ApiListResponse, ApiPageResponse } from "./response";
import type { TravelType } from "./enums";

/**
 * Trip review — raw API DTO (the `review` feature on the backend). A traveler
 * rates and comments on an activity/service after a completed trip; ratings feed
 * the "most rated" newsfeed and agency profiles.
 */
export interface TripReviewDto {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  /** Slug of the destination/activity/tour this review targets. */
  targetSlug: string;
  travelType?: TravelType;
  /** ISO-8601. */
  createdAt: string;
}

export type ReviewResponse = ApiResponse<TripReviewDto>;
export type ReviewListResponse = ApiListResponse<TripReviewDto>;
export type ReviewPageResponse = ApiPageResponse<TripReviewDto>;

/** Unwrapped domain type (Zod source of truth). */
export type { Review } from "@/features/destinations/schema";
