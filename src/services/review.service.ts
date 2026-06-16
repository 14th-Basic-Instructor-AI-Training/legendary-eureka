import { apiFetch } from "@/lib/api/client";
import {
  RecentReviewPageSchema,
  type LandingReview,
  type RecentReviewResponse,
} from "@/types/review";
import type { Result } from "@/features/destinations/data";

/**
 * Recent-reviews API access for the landing page testimonials. Validates the backend
 * response with Zod, then maps the wire DTO to the `LandingReview` view model, filling a
 * deterministic avatar when the reviewer has none.
 */

function avatarFor(review: RecentReviewResponse): string {
  if (review.reviewerAvatarUrl) return review.reviewerAvatarUrl;
  const seed = encodeURIComponent(review.reviewerName ?? review.id);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
}

export function mapReview(r: RecentReviewResponse): LandingReview {
  return {
    id: r.id,
    authorName: r.reviewerName ?? "Traveler",
    authorAvatar: avatarFor(r),
    rating: r.rating,
    comment: r.comment ?? "",
    createdAt: r.createdAt,
  };
}

/** GET /reviews/recent?sort=asc — recent reviews for the landing testimonials strip. */
export async function fetchRecentReviews(
  sort: "asc" | "desc" = "asc",
  size = 3,
): Promise<Result<LandingReview[]>> {
  try {
    const data = await apiFetch<unknown>("/reviews/recent", {
      auth: false,
      params: { sort, page: 0, size },
    });
    const page = RecentReviewPageSchema.parse(data);
    return { ok: true, data: page.content.map(mapReview) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}
