import type { PageParams, Province, TravelType } from "./client";

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

// ── List params ───────────────────────────────────────────────────────────────

export interface ActivityListParams extends PageParams {
  type?: ActivityType;
}
