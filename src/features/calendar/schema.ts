import { z } from "zod";

/**
 * Calendar feature — normalized event model. Zod is the source of truth; the
 * per-role `data.ts` getters parse real API records (or fixtures) into this
 * single shape so the `@/ui` Calendar wrapper never needs to know whether an
 * entry came from a booking, trip plan, or a personal note.
 *
 * `group` / `groupLabel` / `groupColor` power the multi-group view:
 *  - Traveler: "bookings" group + "personal" group
 *  - Agency/Admin: one group per tour package + "personal" group
 */

export const CalendarEventTypeSchema = z.enum(["booking", "tripPlan", "availability", "personal"]);
export type CalendarEventType = z.infer<typeof CalendarEventTypeSchema>;

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
  /** DayFlow calendarId — drives which colour group the event appears in. */
  group: z.string().optional(),
  /** Human-readable label for the legend (falls back to t(`calendar.types.${type}`)). */
  groupLabel: z.string().optional(),
  /** CSS colour for this group (overrides TYPE_COLOR). */
  groupColor: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  start: z.string(),
  end: z.string(),
  allDay: z.boolean().default(true),
  status: CalendarEventStatusSchema.optional(),
  /** True for user-created personal events (enables delete action in the UI). */
  isPersonal: z.boolean().default(false).optional(),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

/** Form schema for the Add/Edit personal event modal. */
export const PersonalEventFormSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(1000).optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    // Keep allDay as plain boolean (no .default) — defaultValues in useForm supplies the initial value.
    allDay: z.boolean(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });
export type PersonalEventFormValues = z.infer<typeof PersonalEventFormSchema>;
