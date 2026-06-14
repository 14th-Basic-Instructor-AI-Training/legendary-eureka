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

/** Cambodian province a destination sits in — matches the API enum (UPPER_SNAKE). */
export const ProvinceSchema = z.enum([
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
]);
export type Province = z.infer<typeof ProvinceSchema>;

/** Style of trip a destination suits — matches the API enum (UPPER_SNAKE). */
export const TravelTypeSchema = z.enum([
  "ADVENTURE",
  "CULTURAL",
  "NATURE",
  "BEACH",
  "HISTORICAL",
  "RELAXATION",
  "WILDLIFE",
]);
export type TravelType = z.infer<typeof TravelTypeSchema>;

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

export const DestinationSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  city: z.string(),
  category: DestinationCategorySchema,
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
  image: z.string().url(),
  days: z.number().int().positive(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  destinationSlugs: z.array(z.string()).default([]),
});
export type FeaturedTour = z.infer<typeof FeaturedTourSchema>;
