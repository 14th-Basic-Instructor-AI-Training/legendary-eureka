import { apiFetch } from "@/lib/api/client";
import type { PagedData, PageParams } from "@/lib/api/client";
import type {
  ActivityListParams,
  ActivityRequest,
  ActivityResponse,
  RestaurantRequest,
  RestaurantResponse,
  AccommodationRequest,
  AccommodationResponse,
} from "@/lib/api/activities";
import type { DestinationResponse, CreateDestinationRequest } from "@/lib/api/destinations";

// ── Destinations ──────────────────────────────────────────────────────────────

export function getDestinations(params?: PageParams): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/destinations", { auth: false, params });
}

export function getDestination(id: string): Promise<DestinationResponse> {
  return apiFetch(`/destinations/${id}`, { auth: false });
}

export function getDestinationBySlug(slug: string): Promise<DestinationResponse> {
  return apiFetch(`/destinations/by-slug/${slug}`, { auth: false });
}

export function getMyDestinations(params?: PageParams): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/destinations/mine", { params });
}

export function createDestination(body: CreateDestinationRequest): Promise<DestinationResponse> {
  return apiFetch("/destinations", { method: "POST", body });
}

export function updateDestination(
  id: string,
  body: CreateDestinationRequest,
): Promise<DestinationResponse> {
  return apiFetch(`/destinations/${id}`, { method: "PUT", body });
}

export function deleteDestination(id: string): Promise<void> {
  return apiFetch(`/destinations/${id}`, { method: "DELETE" });
}

// ── Activities ────────────────────────────────────────────────────────────────

export function getActivitiesByDestination(
  destinationId: string,
  params?: ActivityListParams,
): Promise<PagedData<ActivityResponse>> {
  return apiFetch(`/destinations/${destinationId}/activities`, { auth: false, params });
}

export function getActivity(id: string): Promise<ActivityResponse> {
  return apiFetch(`/activities/${id}`, { auth: false });
}

export function createActivity(
  destinationId: string,
  body: ActivityRequest,
): Promise<ActivityResponse> {
  return apiFetch(`/destinations/${destinationId}/activities`, { method: "POST", body });
}

export function updateActivity(id: string, body: ActivityRequest): Promise<ActivityResponse> {
  return apiFetch(`/activities/${id}`, { method: "PUT", body });
}

export function deleteActivity(id: string): Promise<void> {
  return apiFetch(`/activities/${id}`, { method: "DELETE" });
}

// ── Restaurants ───────────────────────────────────────────────────────────────

export function getRestaurants(params?: PageParams): Promise<PagedData<RestaurantResponse>> {
  return apiFetch("/restaurants", { auth: false, params });
}

export function getRestaurant(id: string): Promise<RestaurantResponse> {
  return apiFetch(`/restaurants/${id}`, { auth: false });
}

export function getRestaurantsByDestination(
  destinationId: string,
  params?: PageParams,
): Promise<PagedData<RestaurantResponse>> {
  return apiFetch(`/destinations/${destinationId}/restaurants`, { auth: false, params });
}

export function getMyRestaurants(params?: PageParams): Promise<PagedData<RestaurantResponse>> {
  return apiFetch("/restaurants/mine", { params });
}

export function createRestaurant(
  destinationId: string,
  body: RestaurantRequest,
): Promise<RestaurantResponse> {
  return apiFetch(`/destinations/${destinationId}/restaurants`, { method: "POST", body });
}

export function updateRestaurant(id: string, body: RestaurantRequest): Promise<RestaurantResponse> {
  return apiFetch(`/restaurants/${id}`, { method: "PUT", body });
}

export function deleteRestaurant(id: string): Promise<void> {
  return apiFetch(`/restaurants/${id}`, { method: "DELETE" });
}

// ── Accommodations ────────────────────────────────────────────────────────────

export function getAccommodations(params?: PageParams): Promise<PagedData<AccommodationResponse>> {
  return apiFetch("/accommodations", { auth: false, params });
}

export function getAccommodation(id: string): Promise<AccommodationResponse> {
  return apiFetch(`/accommodations/${id}`, { auth: false });
}

export function getAccommodationsByDestination(
  destinationId: string,
  params?: PageParams,
): Promise<PagedData<AccommodationResponse>> {
  return apiFetch(`/destinations/${destinationId}/accommodations`, { auth: false, params });
}

export function getMyAccommodations(
  params?: PageParams,
): Promise<PagedData<AccommodationResponse>> {
  return apiFetch("/accommodations/mine", { params });
}

export function getMyActivities(params?: PageParams): Promise<PagedData<ActivityResponse>> {
  return apiFetch("/activities/mine", { params });
}

export function createAccommodation(
  destinationId: string,
  body: AccommodationRequest,
): Promise<AccommodationResponse> {
  return apiFetch(`/destinations/${destinationId}/accommodations`, { method: "POST", body });
}

export function updateAccommodation(
  id: string,
  body: AccommodationRequest,
): Promise<AccommodationResponse> {
  return apiFetch(`/accommodations/${id}`, { method: "PUT", body });
}

export function deleteAccommodation(id: string): Promise<void> {
  return apiFetch(`/accommodations/${id}`, { method: "DELETE" });
}
