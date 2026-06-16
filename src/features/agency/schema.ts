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
  description: z.string().optional(),
  locked: z.boolean().optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;

/** Create-activity form shape. `priceFrom` is coerced from the text input. */
export const NewActivitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: DestinationCategorySchema,
  location: z.string().min(1, "Location is required"),
  priceFrom: z.coerce.number().min(0, "Enter a price"),
  description: z.string().optional(),
});
/** Validated output (priceFrom is a number) — what the store consumes. */
export type NewActivityInput = z.output<typeof NewActivitySchema>;
/** Raw form values (priceFrom still un-coerced) — what React Hook Form holds. */
export type NewActivityFormValues = z.input<typeof NewActivitySchema>;

export const PackageStatusSchema = z.enum(["draft", "published", "archived"]);
export type PackageStatus = z.infer<typeof PackageStatusSchema>;

export const ItineraryDaySchema = z.object({
  day: z.number().int().positive(),
  notes: z.string().optional(),
  activityIds: z.array(z.string()),
});
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;

export const PackageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  maxGroupSize: z.number().int().positive().optional(),
  days: z.number().int().positive(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  status: PackageStatusSchema,
  activityCount: z.number().int().nonnegative(),
  bookingsCount: z.number().int().nonnegative(),
  itinerary: z.array(ItineraryDaySchema).optional(),
});
export type Package = z.infer<typeof PackageSchema>;

/** Booking lifecycle status (agency side). */
export const BookingStatusSchema = z.enum(["pending", "approved", "rejected", "completed", "cancelled"]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const PaymentStatusSchema = z.enum(["paid", "unpaid", "partial"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const BookingRequestSchema = z.object({
  id: z.string(),
  travelerName: z.string(),
  travelerInitials: z.string().optional(),
  travelerEmail: z.string().optional(),
  travelerPhone: z.string().optional(),
  packageTitle: z.string(),
  datesLabel: z.string(),
  guests: z.number().int().positive(),
  total: z.number().nonnegative(),
  currency: z.string().default("USD"),
  status: BookingStatusSchema,
  paymentStatus: PaymentStatusSchema.optional(),
  requestedAtLabel: z.string(),
  specialRequests: z.string().optional(),
});
export type BookingRequest = z.infer<typeof BookingRequestSchema>;

export const AgencyReviewSchema = z.object({
  id: z.string(),
  travelerName: z.string(),
  rating: z.number().min(0).max(5),
  comment: z.string(),
});
export type AgencyReview = z.infer<typeof AgencyReviewSchema>;

export const AgencyDashboardStatsSchema = z.object({
  totalPackages: z.number().int().nonnegative(),
  activePackages: z.number().int().nonnegative(),
  pendingBookings: z.number().int().nonnegative(),
  totalActivities: z.number().int().nonnegative(),
  categoryCount: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
});
export type AgencyDashboardStats = z.infer<typeof AgencyDashboardStatsSchema>;

export const RatingsBreakdownSchema = z.object({
  five: z.number().int().nonnegative(),
  four: z.number().int().nonnegative(),
  three: z.number().int().nonnegative(),
  two: z.number().int().nonnegative(),
  one: z.number().int().nonnegative(),
});
export type RatingsBreakdown = z.infer<typeof RatingsBreakdownSchema>;

export const AgencyProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  email: z.string(),
  phone: z.string().optional(),
  website: z.string().optional(),
  province: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  /** Map pin for the per-place LocationMap (undefined until the agency drops one). */
  lat: z.number().optional(),
  lng: z.number().optional(),
  isVerified: z.boolean(),
  averageRating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  ratingsBreakdown: RatingsBreakdownSchema,
});
export type AgencyProfile = z.infer<typeof AgencyProfileSchema>;

export const ProfileReviewSchema = z.object({
  id: z.string(),
  travelerName: z.string(),
  travelerInitials: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  date: z.string(),
  packageName: z.string(),
});
export type ProfileReview = z.infer<typeof ProfileReviewSchema>;
