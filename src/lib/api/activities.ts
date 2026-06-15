import { apiFetch, type PagedData, type PageParams, type Province, type TravelType } from "./client";

// ── Enums ─────────────────────────────────────────────────────────────────────

export type ActivityType = "ACTIVITY" | "RESTAURANT" | "ACCOMMODATION";

export type AccommodationType =
  | "HOTEL"
  | "GUESTHOUSE"
  | "RESORT"
  | "HOSTEL"
  | "VILLA"
  | "APARTMENT";

// ── Response types ────────────────────────────────────────────────────────────

export interface ActivityResponse {
  id: string;
  destinationId: string;
  type: ActivityType;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  ownerId: string;
  createdAt: string;
}

export interface RestaurantResponse {
  id: string;
  destinationId: string;
  ownerId: string;
  name: string;
  description: string;
  cuisineType: string;
  priceRange: string;
  imageUrl: string;
  address: string;
  phone: string;
  currency: string;
  createdAt: string;
}

export interface AccommodationResponse {
  id: string;
  destinationId: string;
  ownerId: string;
  name: string;
  description: string;
  accommodationType: AccommodationType;
  pricePerNight: number;
  imageUrl: string;
  address: string;
  phone: string;
  currency: string;
  starRating: number;
  createdAt: string;
}

export interface DestinationResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  province: Province;
  city: string;
  country: string;
  travelType: TravelType;
  category: string;
  coverImageUrl: string;
  heroImage: string;
  priceFrom: number;
  currency: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  featured: boolean;
  trending: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
  ownerId: string;
  createdAt: string;
  photos: string[];
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface ActivityRequest {
  type: ActivityType;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
}

export interface RestaurantRequest {
  name: string;
  description?: string;
  cuisineType?: string;
  priceRange?: string;
  imageUrl?: string;
  address?: string;
  phone?: string;
  currency: string;
}

export interface AccommodationRequest {
  name: string;
  description?: string;
  accommodationType?: AccommodationType;
  pricePerNight: number;
  imageUrl?: string;
  address?: string;
  phone?: string;
  currency: string;
  starRating?: number;
}

export interface DestinationRequest {
  name: string;
  description?: string;
  shortDescription?: string;
  province: Province;
  travelType: TravelType;
  coverImageUrl?: string;
  priceFrom?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  trending?: boolean;
  tags?: string[];
  photos?: string[];
}

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

export function createDestination(body: DestinationRequest): Promise<DestinationResponse> {
  return apiFetch("/destinations", { method: "POST", body });
}

export function updateDestination(
  id: string,
  body: DestinationRequest,
): Promise<DestinationResponse> {
  return apiFetch(`/destinations/${id}`, { method: "PUT", body });
}

export function deleteDestination(id: string): Promise<void> {
  return apiFetch(`/destinations/${id}`, { method: "DELETE" });
}

// ── Activities ────────────────────────────────────────────────────────────────

export interface ActivityListParams extends PageParams {
  type?: ActivityType;
}

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
