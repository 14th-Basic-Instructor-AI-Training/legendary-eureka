"use server";

import { fetchRecentReviews } from "@/services/review.service";
import type { Result } from "@/features/destinations/data";
import type { LandingReview } from "@/types/review";

/** Server action: recent reviews for the landing testimonials (GET /reviews/recent?sort=asc). */
export async function getRecentReviews(
  sort: "asc" | "desc" = "asc",
  size = 3,
): Promise<Result<LandingReview[]>> {
  return fetchRecentReviews(sort, size);
}
