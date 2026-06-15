import type { Role } from "@/features/auth/schema";
import { CalendarEventSchema, type CalendarEvent } from "./schema";
import { ADMIN_EVENTS, AGENCY_EVENTS, TRAVELER_EVENTS } from "./fixtures";

/**
 * Calendar data seam. Read-only getters return a tagged result the UI consumes
 * via `useResource`. Today they parse role-scoped fixtures through the schema
 * (so mock data can't drift); swapping in the real aggregation later is a
 * one-file change. The route already role-guards access (see `useRequireRole`),
 * so each getter simply returns the events relevant to that role.
 */

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "load_failed" };

/** Parse fixtures through the schema; a bad record fails the whole getter. */
function parseEvents(records: CalendarEvent[]): Result<CalendarEvent[]> {
  const parsed = CalendarEventSchema.array().safeParse(records);
  if (!parsed.success) return { ok: false, error: "load_failed" };
  return { ok: true, data: parsed.data };
}

export async function getTravelerEvents(): Promise<Result<CalendarEvent[]>> {
  return parseEvents(TRAVELER_EVENTS);
}

export async function getAgencyEvents(): Promise<Result<CalendarEvent[]>> {
  return parseEvents(AGENCY_EVENTS);
}

export async function getAdminEvents(): Promise<Result<CalendarEvent[]>> {
  return parseEvents(ADMIN_EVENTS);
}

/** Pick the getter for a role — used by the shared RoleCalendar screen. */
export function eventsGetterFor(
  role: Role,
): () => Promise<Result<CalendarEvent[]>> {
  switch (role) {
    case "agency":
      return getAgencyEvents;
    case "admin":
      return getAdminEvents;
    case "traveler":
    default:
      return getTravelerEvents;
  }
}
