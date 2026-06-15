import type { PageParams } from "./client";

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

export interface MyTripReviewResponse {
  id: string;
  tripId: string;
  reviewerId: string;
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
