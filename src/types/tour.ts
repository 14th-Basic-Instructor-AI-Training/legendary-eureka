import type { ApiResponse, ApiListResponse, ApiPageResponse } from "./response";

/**
 * Tour package — raw API DTO (the `tour` feature on the backend). A package is
 * owned by an agency and carries a day-by-day agenda referencing content items.
 */
export interface TourAgendaItemDto {
  day: number;
  order: number;
  /** ref → Destination | Activity | Restaurant | Accommodation slug. */
  refSlug: string;
  refType: "DESTINATION" | "ACTIVITY" | "RESTAURANT" | "ACCOMMODATION";
  note?: string;
}

export interface TourPackageDto {
  id: string;
  slug: string;
  title: string;
  agencyId: string;
  agencyName: string;
  image: string;
  days: number;
  priceFrom: number;
  currency: string;
  rating: number;
  reviewCount: number;
  destinationSlugs: string[];
  agenda: TourAgendaItemDto[];
}

export type TourResponse = ApiResponse<TourPackageDto>;
export type TourListResponse = ApiListResponse<TourPackageDto>;
export type TourPageResponse = ApiPageResponse<TourPackageDto>;

/** Unwrapped domain type (the landing/discover teaser shape). */
export type { FeaturedTour } from "@/features/destinations/schema";
