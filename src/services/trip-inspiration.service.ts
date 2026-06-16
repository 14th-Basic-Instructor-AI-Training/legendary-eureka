import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  TripInspirationResponseSchema,
  type TripInspirationResponse,
} from "@/types/trip-inspiration";
import type { Result } from "@/features/destinations/data";

/**
 * Trip-inspiration API access for the landing page. Validates the backend response with
 * Zod and returns the themes ordered by the backend's `sortOrder`. This endpoint returns a
 * plain list (not paginated).
 */

const TripInspirationListSchema = z.array(TripInspirationResponseSchema);

/** GET /trip-inspirations — editorial themes for the landing inspiration band. */
export async function fetchTripInspirations(): Promise<Result<TripInspirationResponse[]>> {
  try {
    const data = await apiFetch<unknown>("/trip-inspirations", { auth: false });
    const items = TripInspirationListSchema.parse(data);
    return { ok: true, data: items };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}
