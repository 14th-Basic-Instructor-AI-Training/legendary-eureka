"use server";

import { fetchTopRatedAgencies } from "@/services/agency.service";
import type { Result } from "@/features/destinations/data";
import type { AgencyProfile } from "@/features/destinations/schema";

/** Server action: top-rated agencies for the landing page (GET /agencies?filter=top_rated). */
export async function getTopRatedAgencies(size = 4): Promise<Result<AgencyProfile[]>> {
  return fetchTopRatedAgencies(size);
}
