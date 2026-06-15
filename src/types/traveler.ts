import type { ApiResponse, ApiRole } from "./response";

/**
 * User + traveler profile — raw API DTOs (the `auth` + `profile` features on the
 * backend). The frontend session uses the lowercase `Role`; `UserDto.role` is the
 * wire `ApiRole` (map via `ROLE_FROM_API`).
 */
export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: ApiRole;
}

export interface TravelerProfileDto {
  id: string;
  name: string;
  avatar: string;
  /** ISO-8601. */
  joinedAt: string;
  reviewCount: number;
  tripPlanCount: number;
  bookmarkCount: number;
}

export type UserResponse = ApiResponse<UserDto>;
export type TravelerResponse = ApiResponse<TravelerProfileDto>;

/** Unwrapped domain type (defined inline until a `traveler`/`profile` feature is built). */
export interface TravelerProfile {
  id: string;
  name: string;
  avatar: string;
  joinedAt: string;
  reviewCount: number;
  tripPlanCount: number;
  bookmarkCount: number;
}
