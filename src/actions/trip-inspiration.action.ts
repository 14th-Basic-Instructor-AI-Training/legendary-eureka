"use server";

import { fetchTripInspirations } from "@/services/trip-inspiration.service";
import type { Result } from "@/features/destinations/data";
import type { TripInspirationResponse } from "@/types/trip-inspiration";

/** Server action: trip-inspiration themes for the landing page (GET /trip-inspirations). */
export async function getTripInspirations(): Promise<Result<TripInspirationResponse[]>> {
  return fetchTripInspirations();
}
