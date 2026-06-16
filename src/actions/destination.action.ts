"use server";

import { fetchPopularDestinations } from "@/services/destination.service";
import type { Result } from "@/features/destinations/data";
import type { Destination } from "@/features/destinations/schema";

/** Server action: popular destinations for the landing page (GET /destinations?filter=popular). */
export async function getPopularDestinations(size = 6): Promise<Result<Destination[]>> {
  return fetchPopularDestinations(size);
}
