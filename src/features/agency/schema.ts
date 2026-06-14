import { z } from "zod";
import { DestinationCategorySchema } from "@/features/destinations/schema";

/**
 * Agency workspace data shapes. Activities reuse the shared destination category
 * vocabulary. Statuses are modelled as enums so the (mock) state transitions —
 * booking approve/reject — are explicit and testable.
 */

export const ActivityStatusSchema = z.enum(["draft", "published"]);
export type ActivityStatus = z.infer<typeof ActivityStatusSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  category: DestinationCategorySchema,
  location: z.string(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  status: ActivityStatusSchema,
  rating: z.number().min(0).max(5),
});
export type Activity = z.infer<typeof ActivitySchema>;

/** Create-activity form shape. `priceFrom` is coerced from the text input. */
export const NewActivitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: DestinationCategorySchema,
  location: z.string().min(1, "Location is required"),
  priceFrom: z.coerce.number().min(0, "Enter a price"),
});
/** Validated output (priceFrom is a number) — what the store consumes. */
export type NewActivityInput = z.output<typeof NewActivitySchema>;
/** Raw form values (priceFrom still un-coerced) — what React Hook Form holds. */
export type NewActivityFormValues = z.input<typeof NewActivitySchema>;

export const PackageStatusSchema = z.enum(["draft", "published"]);
export type PackageStatus = z.infer<typeof PackageStatusSchema>;

export const PackageSchema = z.object({
  id: z.string(),
  title: z.string(),
  days: z.number().int().positive(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  status: PackageStatusSchema,
  activityCount: z.number().int().nonnegative(),
  bookingsCount: z.number().int().nonnegative(),
});
export type Package = z.infer<typeof PackageSchema>;

/** Booking lifecycle status (agency side). */
export const BookingStatusSchema = z.enum(["pending", "approved", "rejected", "completed"]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingRequestSchema = z.object({
  id: z.string(),
  travelerName: z.string(),
  packageTitle: z.string(),
  datesLabel: z.string(),
  guests: z.number().int().positive(),
  total: z.number().nonnegative(),
  currency: z.string().default("USD"),
  status: BookingStatusSchema,
  requestedAtLabel: z.string(),
});
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
