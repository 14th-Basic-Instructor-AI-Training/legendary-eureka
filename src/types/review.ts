import { z } from "zod";
import { pagedSchema } from "./paged";

/**
 * Recent review — backend wire DTO (`feature/review` `RecentReviewResponse`), the enriched
 * global feed behind `GET /reviews/recent`. Source of truth for `services/review.service.ts`.
 */
export const RecentReviewResponseSchema = z.object({
  id: z.string(),
  reviewerId: z.string().nullish(),
  reviewerName: z.string().nullish(),
  reviewerAvatarUrl: z.string().nullish(),
  rating: z.number().int(),
  comment: z.string().nullish(),
  targetType: z.string().nullish(),
  targetId: z.string().nullish(),
  createdAt: z.string(),
});

export type RecentReviewResponse = z.infer<typeof RecentReviewResponseSchema>;

export const RecentReviewPageSchema = pagedSchema(RecentReviewResponseSchema);
export type RecentReviewPage = z.infer<typeof RecentReviewPageSchema>;

/** UI view model for a landing-page testimonial card (mapped from {@link RecentReviewResponse}). */
export type LandingReview = {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
};
