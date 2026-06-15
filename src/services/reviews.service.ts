import { apiFetch } from "@/lib/api/client";
import type { PagedData, PageParams } from "@/lib/api/client";
import type {
  CreateReviewRequest,
  MyTripReviewResponse,
  RatingSummaryResponse,
  ReviewListParams,
  ReviewResponse,
  ReviewTargetType,
} from "@/lib/api/reviews";

export function getReviews(params?: ReviewListParams): Promise<PagedData<ReviewResponse>> {
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

export function getMyReviews(params?: PageParams): Promise<PagedData<MyTripReviewResponse>> {
  return apiFetch("/reviews/mine", { params });
}
