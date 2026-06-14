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
 * with `@/types/enums` `TravelType`.
 */
export const TravelTypeSchema = z.enum([
  "ADVENTURE",
  "CULTURAL",
  "RELAXATION",
  "FOOD",
  "NATURE",
]);
export type TravelType = z.infer<typeof TravelTypeSchema>;

/**
 * Province — the searchable region a destination sits in. Kept a free string
 * (the catalog spans Cambodia + neighbours), with filter options derived from the
 * data. `CAMBODIA_PROVINCES` is the canonical "Discover Cambodia" reference list.
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

/** Agency approval status — the backend `AgencyStatus` enum. */
export const AgencyStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type AgencyStatus = z.infer<typeof AgencyStatusSchema>;

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
  logo: z.string().url(),
  province: ProvinceSchema,
  status: AgencyStatusSchema.default("APPROVED"),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  tourCount: z.number().int().nonnegative(),
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
});
export type Review = z.infer<typeof ReviewSchema>;
