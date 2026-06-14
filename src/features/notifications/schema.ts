import { z } from "zod";

/**
 * Notifications — Zod is the source of truth for the traveler inbox. Each
 * notification carries the category that drives the filter tabs and a
 * locale-relative `targetHref` the card navigates to on open. Mirrors the eventual
 * Knock payload shape so the data seam swaps cleanly.
 */

/** What happened — drives the card icon + color. */
export const NotificationTypeSchema = z.enum([
  "booking-approved",
  "booking-rejected",
  "reminder",
  "comment",
  "reply",
  "report-update",
  "system",
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

/** Stored category — the filter tabs map 1:1 onto these (plus "all"). */
export const NotificationCategorySchema = z.enum([
  "bookings",
  "tripPlans",
  "comments",
  "reports",
  "system",
]);
export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;

/** Filter selection in the UI — every category plus the "all" pseudo-filter. */
export const NotificationFilterSchema = z.enum([
  "all",
  ...NotificationCategorySchema.options,
]);
export type NotificationFilter = z.infer<typeof NotificationFilterSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  category: NotificationCategorySchema,
  title: z.string(),
  body: z.string(),
  /** ISO-8601. */
  createdAt: z.string(),
  read: z.boolean().default(false),
  /** Locale-relative path the card opens (e.g. `/traveler/bookings/bk-1`). */
  targetHref: z.string(),
});
export type Notification = z.infer<typeof NotificationSchema>;
