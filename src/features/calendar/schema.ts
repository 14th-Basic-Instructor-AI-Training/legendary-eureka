import { z } from "zod";

/**
 * Calendar feature — normalized event model. Zod is the source of truth; the
 * per-role `data.ts` getters parse mock/real records into this one shape so the
 * `@/ui` Calendar wrapper never needs to know about bookings vs trip plans.
 *
 * Every dated domain record (a booking, a trip plan, an availability window)
 * collapses into a `CalendarEvent`. The `type` drives colour/legend grouping;
 * `status` is the (optional) lifecycle pill carried through for the detail view.
 */

/**
 * What a calendar entry represents. v1 covers the three strongest fits:
 * - `booking`      — a confirmed/requested trip (traveler) or request (agency/admin)
 * - `tripPlan`     — a traveler-authored itinerary date range
 * - `availability` — an agency tour's open-for-booking window
 */
export const CalendarEventTypeSchema = z.enum([
  "booking",
  "tripPlan",
  "availability",
]);
export type CalendarEventType = z.infer<typeof CalendarEventTypeSchema>;

/** Booking lifecycle, mirrored from the booking features (feeds `status.*` i18n). */
export const CalendarEventStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "completed",
  "cancelled",
]);
export type CalendarEventStatus = z.infer<typeof CalendarEventStatusSchema>;

export const CalendarEventSchema = z.object({
  id: z.string(),
  type: CalendarEventTypeSchema,
  title: z.string(),
  /** Secondary line (agency/traveler name, place) shown in the detail panel. */
  subtitle: z.string().optional(),
  /** ISO `YYYY-MM-DD` — inclusive start of the (all-day) range. */
  start: z.string(),
  /** ISO `YYYY-MM-DD` — inclusive end. Equal to `start` for single-day events. */
  end: z.string(),
  /** All entries are all-day ranges in v1 (no intra-day scheduling yet). */
  allDay: z.boolean().default(true),
  status: CalendarEventStatusSchema.optional(),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
