/**
 * Domain enums mirrored from the backend `docs/domain-model.md`. These are the
 * wire string-literal unions used by the DTOs in this folder. The feature Zod
 * schemas (e.g. `features/destinations/schema.ts`) define matching `z.enum`s for
 * runtime validation of mock data — keep the two in sync.
 */

export type AgencyStatus = "PENDING" | "APPROVED" | "REJECTED";

export type TripStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type TravelType =
  | "ADVENTURE"
  | "CULTURAL"
  | "RELAXATION"
  | "FOOD"
  | "NATURE";

export type Visibility = "PUBLIC" | "PRIVATE";

/** Content kind a destination/activity post represents. */
export type ContentCategory = "DESTINATION" | "THING_TO_DO" | "FOOD" | "STAY";
