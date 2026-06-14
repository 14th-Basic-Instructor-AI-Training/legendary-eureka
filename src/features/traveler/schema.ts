import { z } from "zod";
import {
  DestinationSchema,
  FeaturedTourSchema,
  ReviewSchema,
} from "@/features/destinations/schema";

/**
 * Traveler profile — Zod is the source of truth (fixtures parse through these so
 * mock data can't drift). Shapes stay compatible with the wire DTOs in
 * `@/types/{traveler,booking,tripPlan}` which will swap in once the backend lands.
 */

/** Traveler progression badge — drives the header pill (`profile.badge.<level>`). */
export const BadgeLevelSchema = z.enum([
  "explorer",
  "adventurer",
  "globetrotter",
  "pioneer",
]);
export type BadgeLevel = z.infer<typeof BadgeLevelSchema>;

export const TravelerStatsSchema = z.object({
  countriesVisited: z.number().int().nonnegative(),
  tripsCompleted: z.number().int().nonnegative(),
  reviewsWritten: z.number().int().nonnegative(),
  bookmarksSaved: z.number().int().nonnegative(),
});
export type TravelerStats = z.infer<typeof TravelerStatsSchema>;

export const TravelerProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().url(),
  coverImage: z.string().url(),
  bio: z.string().default(""),
  badgeLevel: BadgeLevelSchema,
  /** ISO-8601. */
  joinedAt: z.string(),
  stats: TravelerStatsSchema,
});
export type TravelerProfile = z.infer<typeof TravelerProfileSchema>;

/** Default visibility for new trip plans — mirrors the backend `Visibility` enum. */
export const VisibilitySchema = z.enum(["PUBLIC", "PRIVATE"]);
export type Visibility = z.infer<typeof VisibilitySchema>;

/**
 * Trip plan — a traveler-authored itinerary. Carries the card-facing fields
 * (destination, date range, item count, privacy) on top of the wire shape.
 */
export const TripPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  destination: z.string(),
  visibility: VisibilitySchema,
  coverImage: z.string().url(),
  itemCount: z.number().int().nonnegative(),
  dateRange: z.object({ start: z.string(), end: z.string() }),
  /** ISO-8601. */
  createdAt: z.string(),
});
export type TripPlan = z.infer<typeof TripPlanSchema>;

/**
 * A saved item. Discriminated by `kind` so each Bookmarks sub-tab renders the
 * matching discovery card (DestinationCard / TourCard / PlanCard).
 */
export const BookmarkSchema = z.discriminatedUnion("kind", [
  z.object({
    id: z.string(),
    kind: z.literal("destination"),
    savedAt: z.string(),
    item: DestinationSchema,
  }),
  z.object({
    id: z.string(),
    kind: z.literal("tour"),
    savedAt: z.string(),
    item: FeaturedTourSchema,
  }),
  z.object({
    id: z.string(),
    kind: z.literal("tripPlan"),
    savedAt: z.string(),
    item: TripPlanSchema,
  }),
]);
export type Bookmark = z.infer<typeof BookmarkSchema>;
export type BookmarkKind = Bookmark["kind"];

/**
 * Booking lifecycle status (traveler side). Lowercase to feed the shared
 * `StatusChip` + `status.*` i18n keys; mirrors the wire `TripStatus`.
 */
export const BookingStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "completed",
  "cancelled",
]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

/** Refund progress for a cancelled booking. */
export const RefundStatusSchema = z.enum(["pending", "refunded", "denied"]);
export type RefundStatus = z.infer<typeof RefundStatusSchema>;

export const BookingHistorySchema = z.object({
  id: z.string(),
  tour: z.object({
    slug: z.string(),
    name: z.string(),
    thumbnail: z.string().url(),
  }),
  agencyName: z.string(),
  /** ISO-8601. */
  startDate: z.string(),
  travelers: z.number().int().positive(),
  total: z.number().nonnegative(),
  currency: z.string().default("USD"),
  status: BookingStatusSchema,
  /** True once the traveler has reviewed this completed trip. */
  hasReview: z.boolean().default(false),
  refundStatus: RefundStatusSchema.optional(),
});
export type BookingHistory = z.infer<typeof BookingHistorySchema>;

/** Which segment of the booking history is shown. */
export const BookingSegmentSchema = z.enum(["upcoming", "completed", "cancelled"]);
export type BookingSegment = z.infer<typeof BookingSegmentSchema>;

/**
 * A review the traveler has written. Extends the shared discovery `Review`
 * (so it drops straight into `ReviewCard`) with the target name + the edit
 * window deadline (7 days from submission, data-driven).
 */
export const MyReviewSchema = ReviewSchema.extend({
  targetName: z.string(),
  /** ISO-8601 — the review is editable while `now < editableUntil`. */
  editableUntil: z.string(),
});
export type MyReview = z.infer<typeof MyReviewSchema>;

/** A single entry in the Overview "recent activity" feed. */
export const ActivityKindSchema = z.enum(["bookmark", "review", "completedTrip"]);
export type ActivityKind = z.infer<typeof ActivityKindSchema>;

export const ActivityItemSchema = z.object({
  id: z.string(),
  kind: ActivityKindSchema,
  /** Human label of the thing acted on (place/tour/review target). */
  subject: z.string(),
  /** ISO-8601. */
  at: z.string(),
});
export type ActivityItem = z.infer<typeof ActivityItemSchema>;

/* --------------------------------- Forms ---------------------------------- */

/** Settings → personal info form. */
export const PersonalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{5,}$/, "Enter a valid phone number")
    .or(z.literal("")),
  bio: z.string().max(280, "Keep your bio under 280 characters"),
  avatar: z.string().url("Enter a valid image URL").or(z.literal("")),
});
export type PersonalInfoInput = z.output<typeof PersonalInfoSchema>;
export type PersonalInfoFormValues = z.input<typeof PersonalInfoSchema>;

/** Settings → change password form. */
export const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;

/** Settings → notification preferences (one toggle per event type). */
export const NotificationPrefsSchema = z.object({
  bookingUpdates: z.boolean(),
  tripReminders: z.boolean(),
  reviewReplies: z.boolean(),
  promotions: z.boolean(),
  productNews: z.boolean(),
});
export type NotificationPrefs = z.infer<typeof NotificationPrefsSchema>;
export type NotificationEvent = keyof NotificationPrefs;

/** Settings → privacy (default visibility for new trip plans). */
export const PrivacySettingsSchema = z.object({
  defaultVisibility: VisibilitySchema,
});
export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;
