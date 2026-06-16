"use server";

import { fetchRecommendedTours, fetchTrendingTours } from "@/services/tour.service";
import type { Result } from "@/features/destinations/data";
import type { FeaturedTour } from "@/features/destinations/schema";

/** Server action: trending tours for the landing page (GET /tours?filter=trending). */
export async function getTrendingTours(size = 6): Promise<Result<FeaturedTour[]>> {
  return fetchTrendingTours(size);
}

/** Server action: recommended tours for the signed-in traveler (GET /tours/recommended). */
export async function getRecommendedTours(
  userId?: string,
  size = 6,
): Promise<Result<FeaturedTour[]>> {
  return fetchRecommendedTours(userId, size);
}
