import { apiFetch } from "@/lib/api/client";
import type { PagedData } from "@/lib/api/client";
import type { DestinationResponse } from "@/lib/api/activities";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { SearchParams } from "@/lib/api/search";

export function searchDestinations(
  params?: SearchParams,
): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/search", { auth: false, params });
}

export function searchTours(params?: SearchParams): Promise<PagedData<TourPackageResponse>> {
  return apiFetch("/search/tours", { auth: false, params });
}
