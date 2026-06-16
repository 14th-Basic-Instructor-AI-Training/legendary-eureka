import { z } from "zod";

/**
 * Trip inspiration theme — backend wire DTO (`feature/discovery` `TripInspirationResponse`),
 * behind `GET /trip-inspirations`. Source of truth for `services/trip-inspiration.service.ts`.
 * `activityFocus` maps to the Explore page's Activity Focus filter.
 */
export const TripInspirationResponseSchema = z.object({
  id: z.string(),
  themeKey: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  activityFocus: z.string(),
  sortOrder: z.number().int().default(0),
});

export type TripInspirationResponse = z.infer<typeof TripInspirationResponseSchema>;
