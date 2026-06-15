import type { ApiResponse, ApiListResponse, ApiPageResponse } from "./response";
import type { AgencyStatus } from "./enums";

/**
 * Tour agency public profile — raw API DTO (the `profile` feature on the
 * backend). 1:1 with a `TOUR_AGENCY` user.
 */
export interface AgencyProfileDto {
  id: string;
  slug: string;
  name: string;
  logo: string;
  province: string;
  status: AgencyStatus;
  rating: number;
  reviewCount: number;
  tourCount: number;
  contactEmail?: string;
  contactPhone?: string;
  lat?: number;
  lng?: number;
}

export type AgencyResponse = ApiResponse<AgencyProfileDto>;
export type AgencyListResponse = ApiListResponse<AgencyProfileDto>;
export type AgencyPageResponse = ApiPageResponse<AgencyProfileDto>;

/** Unwrapped domain type (Zod source of truth). */
export type { AgencyProfile } from "@/features/destinations/schema";
