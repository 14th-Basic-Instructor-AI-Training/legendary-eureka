import { z } from "zod";
import { pagedSchema } from "./paged";

/**
 * Tour package — backend wire DTO (`feature/tour` `TourPackageResponse`). Source of truth
 * for response validation in `services/tour.service.ts` (trending + recommended rows).
 * Carries both `price`/`priceFrom` and `durationDays`/`days` aliases as the API emits them.
 */
export const TourAgendaItemResponseSchema = z.object({
  id: z.string(),
  dayNumber: z.number().int().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  activities: z.array(z.string()).default([]),
});

export const TourPackageResponseSchema = z.object({
  id: z.string(),
  slug: z.string().nullish(),
  ownerId: z.string().nullish(),
  agencyId: z.string().nullish(),
  agencyName: z.string().nullish(),
  title: z.string(),
  description: z.string().nullish(),
  province: z.string().nullish(),
  travelType: z.string().nullish(),
  price: z.number().nullish(),
  priceFrom: z.number().nullish(),
  currency: z.string().nullish(),
  durationDays: z.number().int().nullish(),
  days: z.number().int().nullish(),
  coverImageUrl: z.string().nullish(),
  image: z.string().nullish(),
  status: z.string().nullish(),
  agenda: z.array(TourAgendaItemResponseSchema).default([]),
  activityCount: z.number().int().default(0),
  bookingsCount: z.number().int().default(0),
  rating: z.number().default(0),
  reviewCount: z.number().int().default(0),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});

export type TourPackageResponse = z.infer<typeof TourPackageResponseSchema>;

export const TourPackagePageSchema = pagedSchema(TourPackageResponseSchema);
export type TourPackagePage = z.infer<typeof TourPackagePageSchema>;
