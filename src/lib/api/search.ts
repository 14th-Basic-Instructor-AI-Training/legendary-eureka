import { apiFetch, type PagedData, type PageParams, type Province, type TravelType } from "./client";
import type { DestinationResponse } from "./activities";
import type { TourPackageResponse } from "./packages";

export interface SearchParams extends PageParams {
  province?: Province;
  travelType?: TravelType;
  query?: string;
}

export function searchDestinations(
  params?: SearchParams,
): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/search", { auth: false, params });
}

export function searchTours(
  params?: SearchParams,
): Promise<PagedData<TourPackageResponse>> {
  return apiFetch("/search/tours", { auth: false, params });
}
