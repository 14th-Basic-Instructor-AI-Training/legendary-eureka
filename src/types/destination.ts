import type { ApiResponse, ApiListResponse, ApiPageResponse } from "./response";
import type { ContentCategory, TravelType } from "./enums";

/**
 * Destination — raw API DTO (the `content/destination` feature on the backend).
 * Domain type (`Destination`) is the Zod-validated shape used across the UI and
 * is re-exported here so the entity's raw + domain types live in one file.
 */
export interface DestinationDto {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  province: string;
  category: ContentCategory;
  travelType: TravelType;
  shortDescription: string;
  heroImage: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: string;
  durationLabel?: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  lat: number;
  lng: number;
}

export type DestinationResponse = ApiResponse<DestinationDto>;
export type DestinationListResponse = ApiListResponse<DestinationDto>;
export type DestinationPageResponse = ApiPageResponse<DestinationDto>;

/** Unwrapped domain type (Zod source of truth). */
export type { Destination, DestinationCategory } from "@/features/destinations/schema";
