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
