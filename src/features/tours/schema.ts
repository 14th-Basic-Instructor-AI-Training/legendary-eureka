import { z } from "zod";
import {
  TravelTypeSchema,
  ProvinceSchema,
  AgencyProfileSchema,
} from "@/features/destinations/schema";

/**
 * Tours — the full tour-package detail backbone behind `/[locale]/tours/[id]`.
 * Zod is the source of truth; fixtures parse through these schemas so mock data
 * can't drift, and the same shapes back the eventual booking API. Reuses the
 * destinations `TravelType` / `Province` / `AgencyProfile` primitives.
 */

/** Cancellation policy shown as a badge in the quick-info bar. */
export const CancellationPolicySchema = z.enum(["free", "nonRefundable"]);
export type CancellationPolicy = z.infer<typeof CancellationPolicySchema>;

/** Live availability for the booking card badge. */
export const AvailabilitySchema = z.enum(["available", "limited", "full"]);
export type Availability = z.infer<typeof AvailabilitySchema>;

/** One stop within a travel-plan day. */
export const TourStopSchema = z.object({
  order: z.number().int().positive(),
  name: z.string(),
  durationLabel: z.string(),
  image: z.string().url().optional(),
  notes: z.string().optional(),
});
export type TourStop = z.infer<typeof TourStopSchema>;

/** One day of the itinerary timeline. */
export const TourDaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string(),
  stops: z.array(TourStopSchema),
});
export type TourDay = z.infer<typeof TourDaySchema>;

/** The agency that runs a tour — the Discover teaser plus contact/bio detail. */
export const TourAgencySchema = AgencyProfileSchema.extend({
  bio: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
});
export type TourAgency = z.infer<typeof TourAgencySchema>;

/** A traveler review attached to a tour (up to three photos). */
export const TourReviewSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().url(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  /** ISO-8601 date string. */
  createdAt: z.string(),
  photos: z.array(z.string().url()).max(3).default([]),
  /** Whether the reviewer completed a booking — drives the verified marker. */
  bookingCompleted: z.boolean().default(true),
});
export type TourReview = z.infer<typeof TourReviewSchema>;

export const TourDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  tagline: z.string(),
  description: z.string(),
  heroImage: z.string().url(),
  gallery: z.array(z.string().url()).min(1),
  travelType: TravelTypeSchema,
  province: ProvinceSchema,
  // Quick-info facts
  durationDays: z.number().int().positive(),
  groupSizeMax: z.number().int().positive(),
  languages: z.array(z.string()).min(1),
  cancellationPolicy: CancellationPolicySchema,
  // Rating
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  // Overview content
  highlights: z.array(z.string()).default([]),
  included: z.array(z.string()).default([]),
  excluded: z.array(z.string()).default([]),
  // Pricing
  unitPrice: z.number().nonnegative(),
  currency: z.string().default("USD"),
  platformFee: z.number().nonnegative(),
  availability: AvailabilitySchema,
  // Relations
  agency: TourAgencySchema,
  travelPlan: z.array(TourDaySchema),
  reviews: z.array(TourReviewSchema).default([]),
});
export type TourDetail = z.infer<typeof TourDetailSchema>;

/** Booking form draft (HeroUI DatePicker + traveler steppers), validated with Zod. */
export const BookingDraftSchema = z.object({
  /** ISO `YYYY-MM-DD`. */
  date: z.string().min(1),
  adults: z.number().int().min(1),
  children: z.number().int().min(0),
});
export type BookingDraft = z.infer<typeof BookingDraftSchema>;

/** Write-a-review form draft. */
export const ReviewDraftSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10),
});
export type ReviewDraft = z.infer<typeof ReviewDraftSchema>;

/** Counts of reviews per star (5 → 1), derived in the data layer. */
export type RatingBreakdown = Record<1 | 2 | 3 | 4 | 5, number>;

/** Review sort options for the Reviews tab. */
export type ReviewSort = "recent" | "highest" | "lowest";
