import { apiFetch, type PagedData, type PageParams } from "./client";

export type ReviewTargetType = "DESTINATION" | "TOUR" | "AGENCY";

export interface ReviewResponse {
  id: string;
  tripId: string;
  reviewerId: string;
  travelerName: string;
  travelerAvatar: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: string;
}

export interface RatingSummaryResponse {
  targetType: ReviewTargetType;
  targetId: string;
  averageRating: number;
  reviewCount: number;
}

export interface CreateReviewRequest {
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment?: string;
}

export interface ReviewListParams extends PageParams {
  targetType?: ReviewTargetType;
  targetId?: string;
}

export function getReviews(
  params?: ReviewListParams,
): Promise<PagedData<ReviewResponse>> {
  return apiFetch("/reviews", { auth: false, params });
}

export function getReviewSummary(
  targetType: ReviewTargetType,
  targetId: string,
): Promise<RatingSummaryResponse> {
  return apiFetch("/reviews/summary", {
    auth: false,
    params: { targetType, targetId },
  });
}

export function postTripReview(
  tripId: string,
  body: CreateReviewRequest,
): Promise<ReviewResponse> {
  return apiFetch(`/trips/${tripId}/reviews`, { method: "POST", body });
}
