import { apiFetch, type PagedData, type PageParams } from "./client";
import type { DestinationResponse } from "./activities";
import type { TourPackageResponse } from "./packages";

export function getFeaturedFeed(
  params?: PageParams,
): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/feed/featured", { auth: false, params });
}

export function getTrendingFeed(
  params?: PageParams,
): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/feed/trending", { auth: false, params });
}

export function getToursFeed(
  params?: PageParams,
): Promise<PagedData<TourPackageResponse>> {
  return apiFetch("/feed/tours", { auth: false, params });
}
