import type { Result } from "@/features/destinations/data";
import type { Actor } from "@/lib/permissions";
import type { Role } from "@/features/auth/schema";

/**
 * API boundary types — the contract the Spring Boot backend speaks on the wire.
 *
 * The frontend is static-UI-first: today `data.ts` getters return the local
 * `Result<T>` over mock fixtures. These envelope/DTO types describe the *real*
 * payloads so that swapping a getter from a fixture to `fetch()` is a one-seam
 * change — the getter unwraps `ApiResponse<T>` into the same `Result<T>` the UI
 * already consumes. Mirrors the backend `shared/common/ApiResponse`.
 */

/** Standard backend envelope: `{ status, message, data, timestamp }`. */
export interface ApiResponse<T> {
  /** HTTP-style status code returned in the body (e.g. 200, 201, 404). */
  status: number;
  message: string;
  data: T;
  /** ISO-8601 server timestamp. */
  timestamp: string;
}

/** Spring Data `Page<T>` payload, used by paginated list endpoints. */
export interface ApiPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Convenience aliases for the two common envelope shapes. */
export type ApiListResponse<T> = ApiResponse<T[]>;
export type ApiPageResponse<T> = ApiResponse<ApiPage<T>>;

/**
 * Backend role enum (wire format). The frontend keeps lowercase `Role`/`Actor`
 * (see `lib/permissions.ts`) for session + permission checks; these maps bridge
 * the two so neither side has to rename.
 */
export type ApiRole = "ADMIN" | "TOUR_AGENCY" | "TRAVELER" | "GUEST";

/** Wire role → the actor used by `can()` / session. `GUEST` is the unauthenticated actor. */
export const ROLE_FROM_API: Record<ApiRole, Actor> = {
  ADMIN: "admin",
  TOUR_AGENCY: "agency",
  TRAVELER: "traveler",
  GUEST: "guest",
};

/** Frontend `Role` → wire role. (Guest has no stored role, so it is not in this map.) */
export const ROLE_TO_API: Record<Role, ApiRole> = {
  admin: "ADMIN",
  agency: "TOUR_AGENCY",
  traveler: "TRAVELER",
};

export function apiRoleToActor(role: ApiRole): Actor {
  return ROLE_FROM_API[role];
}

/**
 * Bridge a backend envelope into the local `Result<T>` the data layer speaks.
 * `null` (e.g. a thrown/aborted fetch the caller already caught) becomes a
 * `load_failed` result so callers never have to special-case it.
 */
export function unwrap<T>(res: ApiResponse<T> | null): Result<T> {
  if (!res) return { ok: false, error: "load_failed" };
  return { ok: true, data: res.data };
}
