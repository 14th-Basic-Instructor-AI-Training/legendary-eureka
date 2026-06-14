import { z } from "zod";
import {
  TravelTypeSchema,
  ProvinceSchema,
  AgencyProfileSchema,
} from "@/features/destinations/schema";

/**
 * Tours feature — two cooperating surfaces share this folder:
 *
 *  1. The public tour **detail / booking** backbone behind `/[locale]/tours/[id]`
 *     (`TourDetail`, reviews, booking draft). Reuses the destinations
 *     `TravelType` / `Province` / `AgencyProfile` primitives.
 *  2. The agency **destination → package → approval** flow (`TourDestination`,
 *     `TourPackage`): an admin- or agency-created destination an agency turns into
 *     a package that moves `draft → pending → approved | rejected`.
 *
 * Zod is the source of truth for both — fixtures parse through these schemas so
 * mock data can't drift, and the forms reuse the same shapes.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Public tour detail / booking
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// 2. Agency destination → package → approval flow
// ─────────────────────────────────────────────────────────────────────────────

export const DestinationOriginSchema = z.enum(["admin", "agency"]);
export type DestinationOrigin = z.infer<typeof DestinationOriginSchema>;

export const TourDestinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  province: ProvinceSchema,
  travelType: TravelTypeSchema,
  coverImageUrl: z.string().url(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  /** Who created it — distinguishes Flow 1 (admin) from Flow 2 (agency). */
  origin: DestinationOriginSchema,
  ownerName: z.string(),
});
export type TourDestination = z.infer<typeof TourDestinationSchema>;

/**
 * Create-destination form shape — mirrors the backend POST body 1:1 so the same
 * schema validates the form today and the request later. Number fields coerce so
 * they bind to native `<input type="number">` string values.
 */
export const NewDestinationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  province: ProvinceSchema,
  travelType: TravelTypeSchema,
  coverImageUrl: z.string().url("Enter a valid image URL"),
  priceFrom: z.coerce.number().min(0, "Enter a price"),
  currency: z.string().min(1, "Currency is required").max(8).default("USD"),
  latitude: z.coerce.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  longitude: z.coerce.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
});
export type NewDestinationInput = z.output<typeof NewDestinationSchema>;
export type NewDestinationFormValues = z.input<typeof NewDestinationSchema>;

/** Approval lifecycle for a tour package. Labels come from the `status.*` keys. */
export const PackageApprovalStatusSchema = z.enum([
  "draft",
  "pending",
  "approved",
  "rejected",
]);
export type PackageApprovalStatus = z.infer<typeof PackageApprovalStatusSchema>;

export const TourPackageSchema = z.object({
  id: z.string(),
  title: z.string(),
  destinationId: z.string(),
  destinationName: z.string(),
  agencyName: z.string(),
  days: z.number().int().positive(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  status: PackageApprovalStatusSchema,
  /** Set when the agency requests approval (status → pending). */
  submittedAtLabel: z.string().optional(),
});
export type TourPackage = z.infer<typeof TourPackageSchema>;

/** Create-package form shape. A package must reference a destination. */
export const NewPackageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  destinationId: z.string().min(1, "Select a destination"),
  days: z.coerce.number().int().min(1, "At least 1 day"),
  priceFrom: z.coerce.number().min(0, "Enter a price"),
});
export type NewPackageInput = z.output<typeof NewPackageSchema>;
export type NewPackageFormValues = z.input<typeof NewPackageSchema>;
