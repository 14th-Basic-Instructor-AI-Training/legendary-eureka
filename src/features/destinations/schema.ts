import { z } from "zod";

/**
 * Destinations — the shared "best places to travel" backbone consumed by the
 * landing page and (later) traveler search/browse. Zod is the source of truth;
 * fixtures parse through these schemas so mock data can't drift.
 */

export const DestinationCategorySchema = z.enum([
  "destination", // places / sights
  "thingToDo", // experiences / activities
  "food", // restaurants / local food
  "stay", // accommodation
]);
export type DestinationCategory = z.infer<typeof DestinationCategorySchema>;

/**
 * Travel type — the backend `TravelType` enum (uppercase wire values). Drives the
 * Discover page's travel-type filter (mirrors backend `/search`). Keep in sync
 * with `@/types/enums` `TravelType` and the backend `TravelType.java` enum.
 */
export const TravelTypeSchema = z.enum([
  "ADVENTURE",
  "CULTURAL",
  "RELAXATION",
  "FOOD",
  "NATURE",
  "HISTORICAL",
  "BEACH",
]);
export type TravelType = z.infer<typeof TravelTypeSchema>;

/**
 * Province — the searchable region a destination sits in. Kept a free string
 * (the catalog spans Cambodia + neighbours, e.g. Jeju/Seoul/Kyoto/Bali), with
 * filter options derived from the data. `CAMBODIA_PROVINCES` is the canonical
 * "Discover Cambodia" reference list used by the create/edit destination forms.
 */
export const ProvinceSchema = z.string().min(1);
export type Province = z.infer<typeof ProvinceSchema>;

export const CAMBODIA_PROVINCES = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Kampot",
  "Kep",
  "Preah Sihanouk",
  "Koh Kong",
  "Mondulkiri",
  "Ratanakiri",
  "Kandal",
] as const;

/**
 * UPPER_SNAKE province codes for the create/edit destination forms — these match
 * the backend enum and the `destinations.provinces.*` i18n keys, so the forms can
 * localize each option. `ProvinceSchema` itself stays a free string (the catalog
 * also holds international destinations), so this is just the Cambodia pick-list.
 */
export const CAMBODIA_PROVINCE_CODES = [
  "PHNOM_PENH",
  "SIEM_REAP",
  "BATTAMBANG",
  "PREAH_SIHANOUK",
  "KAMPOT",
  "KEP",
  "KOH_KONG",
  "MONDULKIRI",
  "RATANAKIRI",
  "KRATIE",
] as const;

/** Agency approval status — the backend `AgencyStatus` enum. */
export const AgencyStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type AgencyStatus = z.infer<typeof AgencyStatusSchema>;

/**
 * The create/edit payload for a destination — mirrors the backend POST body
 * 1:1 so this same schema validates the form today and the request later
 * (Zod is the single source of truth). Number fields coerce so they bind to
 * native `<input type="number">` string values.
 */
export const DestinationDraftSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  province: ProvinceSchema,
  travelType: TravelTypeSchema,
  coverImageUrl: z.string().url(),
  priceFrom: z.coerce.number().nonnegative(),
  currency: z.string().min(1).max(8).default("USD"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});
export type DestinationDraft = z.infer<typeof DestinationDraftSchema>;

/**
 * A nearby point of interest shown in the destination detail page's
 * Things-to-do / Where-to-eat / Where-to-stay grids (grouped by `category`).
 */
export const PointOfInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["sight", "activity", "food", "stay"]),
  /** Sub-label, e.g. "Angkor Park" or "Old Market". */
  area: z.string(),
  rating: z.number().min(0).max(5).optional(),
  priceLevel: z.enum(["$", "$$", "$$$"]).optional(),
  /** "2 hr", "Half day", "Stay"… */
  durationLabel: z.string().optional(),
  image: z.string().url(),
});
export type PointOfInterest = z.infer<typeof PointOfInterestSchema>;
export type PoiCategory = PointOfInterest["category"];

/** One bar of the TripAdvisor-style rating breakdown (5★…1★ with a fill %). */
export const RatingBucketSchema = z.object({
  stars: z.number().int().min(1).max(5),
  pct: z.number().int().min(0).max(100),
});
export type RatingBucket = z.infer<typeof RatingBucketSchema>;

export const DestinationSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  city: z.string(),
  province: ProvinceSchema,
  category: DestinationCategorySchema,
  travelType: TravelTypeSchema,
  shortDescription: z.string(),
  heroImage: z.string().url(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  durationLabel: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  /** Drives the MapLibre 3D map on the destination detail page. */
  lat: z.number(),
  lng: z.number(),
  // ── Detail-page fields (optional so the teaser cards/fixtures stay valid) ──
  /** Long "About this destination" copy (falls back to `shortDescription`). */
  about: z.string().optional(),
  /** Gallery photos for the About collage (falls back to `[heroImage]`). */
  gallery: z.array(z.string().url()).default([]),
  /** "Best time to visit", e.g. "Nov – Feb". */
  bestTime: z.string().optional(),
  /** Primary local language, e.g. "Khmer". */
  language: z.string().optional(),
  /** Nearby points of interest, grouped by category in the UI. */
  pois: z.array(PointOfInterestSchema).default([]),
  /** Pre-computed star distribution for the reviews summary. */
  ratingBreakdown: z.array(RatingBucketSchema).optional(),
});
export type Destination = z.infer<typeof DestinationSchema>;

/** A tour-package teaser shown in the landing "Featured tours" row. */
export const FeaturedTourSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  agencyName: z.string(),
  travelType: TravelTypeSchema,
  image: z.string().url(),
  days: z.number().int().positive(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  destinationSlugs: z.array(z.string()).default([]),
});
export type FeaturedTour = z.infer<typeof FeaturedTourSchema>;

/**
 * Discover-page filter state. All fields optional — an empty filter means "show
 * everything". Mirrors the backend `/search` query (province + travel type),
 * plus a free-text query and the content category tabs.
 */
export const DiscoverFilterSchema = z.object({
  query: z.string().default(""),
  province: ProvinceSchema.optional(),
  travelType: TravelTypeSchema.optional(),
  category: DestinationCategorySchema.optional(),
});
export type DiscoverFilter = z.infer<typeof DiscoverFilterSchema>;

/** A tour-agency teaser shown in the Discover "Top agencies" strip. */
export const AgencyProfileSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  /** Display name of the person who owns / runs the agency. */
  owner: z.string(),
  logo: z.string().url(),
  province: ProvinceSchema,
  status: AgencyStatusSchema.default("APPROVED"),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  tourCount: z.number().int().nonnegative(),
  /** "Tour about" themes shown as tags on the agency card. */
  tags: z.array(z.string()).default([]),
  // ── Profile-page fields (optional so the teaser card/fixtures stay valid) ──
  /** "About this agency" blurb shown on the detail page. */
  about: z.string().optional(),
  /** Years the agency has operated — the "Years Active" stat. */
  yearsActive: z.number().int().nonnegative().optional(),
  /** Completed bookings — the "Bookings Completed" stat. */
  bookingsCompleted: z.number().int().nonnegative().optional(),
  /** Languages the agency guides in — shown in the sidebar. */
  languages: z.array(z.string()).default([]),
  /** Typical response time in hours — sidebar contact fact. */
  responseTimeHours: z.number().int().positive().optional(),
  /** Year the agency joined the platform — sidebar "Member since". */
  memberSince: z.number().int().optional(),
  /** Map coordinates for the sidebar LocationMap (province centroid). */
  lat: z.number().optional(),
  lng: z.number().optional(),
});
export type AgencyProfile = z.infer<typeof AgencyProfileSchema>;

/** A traveler review shown in the Discover "Recent reviews" section. */
export const ReviewSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().url(),
  rating: z.number().min(0).max(5),
  comment: z.string(),
  /** Slug of the destination/tour this review targets. */
  targetSlug: z.string(),
  travelType: TravelTypeSchema.optional(),
  /** ISO-8601 date string. */
  createdAt: z.string(),
  /** Reviewer's home country — the TripAdvisor-style "country · date" row. */
  country: z.string().optional(),
  /** Number of photos attached to the review (rendered as thumbnails). */
  photoCount: z.number().int().nonnegative().default(0),
});
export type Review = z.infer<typeof ReviewSchema>;
