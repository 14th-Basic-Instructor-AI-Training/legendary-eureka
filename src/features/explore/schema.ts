import { z } from "zod";
import {
  DestinationSchema,
  FeaturedTourSchema,
  ProvinceSchema,
} from "@/features/destinations/schema";

/**
 * Explore page — a richer discovery surface than the Discover index. Two tabs
 * (Destinations / Tours) each with their own card shape + sidebar filters. Zod is
 * the source of truth; fixtures parse through these schemas so mock data can't drift.
 *
 * The taxonomy is typed **global-ready** (continent / region / season span a
 * worldwide catalog) while the fixtures are seeded with Cambodia data today —
 * the schema is ready for a wider catalog without a migration.
 */

// ── Global-ready taxonomy (Cambodia sits under Asia / "Southeast Asia") ───────
export const ContinentSchema = z.enum(["Asia", "Europe", "Africa", "Americas", "Oceania"]);
export type Continent = z.infer<typeof ContinentSchema>;

export const RegionSchema = z.enum([
  "Southeast Asia",
  "East Asia",
  "South Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Oceania",
]);
export type Region = z.infer<typeof RegionSchema>;

export const SeasonSchema = z.enum([
  "Dry Season",
  "Wet Season",
  "Summer",
  "Winter",
  "Year-round",
]);
export type Season = z.infer<typeof SeasonSchema>;

export const RegionTypeSchema = z.enum([
  "Beach",
  "Mountain",
  "City",
  "Jungle",
  "Cultural",
  "Island",
]);
export type RegionType = z.infer<typeof RegionTypeSchema>;

/** Destination-tab "Activity Focus" taxonomy (distinct from the tour activity set). */
export const ActivityFocusSchema = z.enum([
  "Adventure",
  "Wellness",
  "Food",
  "History",
  "Nature",
]);
export type ActivityFocus = z.infer<typeof ActivityFocusSchema>;

/** Tour-tab activity taxonomy — broader, booking-oriented (spec'd separately). */
export const TourActivityTypeSchema = z.enum([
  "Adventure",
  "Cultural",
  "Food & Drink",
  "Nature",
  "Wellness",
  "Family",
  "Water Sports",
]);
export type TourActivityType = z.infer<typeof TourActivityTypeSchema>;

/** Tour duration buckets — the sidebar checkbox group. */
export const TourDurationSchema = z.enum([
  "half-day",
  "full-day",
  "2-3 days",
  "4-7 days",
  "7+ days",
]);
export type TourDuration = z.infer<typeof TourDurationSchema>;

// ── Explore Destination card (extends the shared Destination backbone) ────────
export const ExploreDestinationSchema = DestinationSchema.extend({
  continent: ContinentSchema,
  region: RegionSchema,
  regionType: RegionTypeSchema,
  bestSeason: SeasonSchema,
  /** Powers the sidebar "Activity Focus" filter. */
  activityFocus: z.array(ActivityFocusSchema).default([]),
  /** The (up to) 3 activity icons shown on the card. */
  topActivities: z.array(ActivityFocusSchema).max(3).default([]),
  /** "X tours available" on the card. */
  tourCount: z.number().int().nonnegative(),
  familyFriendly: z.boolean().default(false),
});
export type ExploreDestination = z.infer<typeof ExploreDestinationSchema>;

// ── Explore Tour card (extends the FeaturedTour teaser) ───────────────────────
export const ExploreTourSchema = FeaturedTourSchema.extend({
  /** 2-line excerpt shown in list view. */
  description: z.string(),
  /** Destination badge on the card. */
  destinationName: z.string(),
  province: ProvinceSchema,
  agencyAvatar: z.string().url(),
  /** Slug of the owning AgencyProfile — links tours to the agency profile page. */
  agencySlug: z.string().optional(),
  /** Display label, e.g. "3 days". */
  durationLabel: z.string(),
  durationCategory: TourDurationSchema,
  activityTypes: z.array(TourActivityTypeSchema).default([]),
  languages: z.array(z.string()).default([]),
  familyFriendly: z.boolean().default(false),
  /** ISO `YYYY-MM-DD` — start of the tour's available window (date-range filter). */
  availableFrom: z.string(),
  /** ISO `YYYY-MM-DD` — end of the available window. */
  availableTo: z.string(),
  /** ISO date — powers the "Newest" sort. */
  createdAt: z.string(),
});
export type ExploreTour = z.infer<typeof ExploreTourSchema>;

// ── Shared view state ─────────────────────────────────────────────────────────
export const ExploreTabSchema = z.enum(["destinations", "tours"]);
export type ExploreTab = z.infer<typeof ExploreTabSchema>;

export const ExploreViewSchema = z.enum(["grid", "list"]);
export type ExploreView = z.infer<typeof ExploreViewSchema>;

export const ExploreSortSchema = z.enum(["recommended", "priceAsc", "ratingDesc", "newest"]);
export type ExploreSort = z.infer<typeof ExploreSortSchema>;

// ── Per-tab filter shapes (empty arrays / undefined = "show everything") ──────
export const DestinationFilterSchema = z.object({
  query: z.string().default(""),
  regions: z.array(RegionSchema).default([]),
  province: ProvinceSchema.optional(),
  seasons: z.array(SeasonSchema).default([]),
  regionTypes: z.array(RegionTypeSchema).default([]),
  activityFocus: z.array(ActivityFocusSchema).default([]),
  familyFriendly: z.boolean().default(false),
});
export type DestinationFilter = z.infer<typeof DestinationFilterSchema>;

/** Price-slider bounds — "$0–$2,000+". */
export const PRICE_MIN = 0;
export const PRICE_MAX = 2000;

export const TourFilterSchema = z.object({
  query: z.string().default(""),
  /** Searchable Province / Destination dropdown. */
  province: ProvinceSchema.optional(),
  activityTypes: z.array(TourActivityTypeSchema).default([]),
  /** ISO `YYYY-MM-DD`. */
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  priceMin: z.number().nonnegative().default(PRICE_MIN),
  priceMax: z.number().nonnegative().default(PRICE_MAX),
  durations: z.array(TourDurationSchema).default([]),
  minRating: z.number().min(1).max(5).optional(),
  languages: z.array(z.string()).default([]),
  familyFriendly: z.boolean().default(false),
});
export type TourFilter = z.infer<typeof TourFilterSchema>;

/** Default (empty) filters — used to seed the store and the "Clear all" reset. */
export const EMPTY_DESTINATION_FILTER: DestinationFilter =
  DestinationFilterSchema.parse({});
export const EMPTY_TOUR_FILTER: TourFilter = TourFilterSchema.parse({});
