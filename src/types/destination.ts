import { z } from "zod";
import { pagedSchema } from "./paged";

/**
 * Destination — backend wire DTO (`feature/content` `DestinationResponse`). Zod is the
 * source of truth for response validation in `services/destination.service.ts`. Nullable
 * text fields mirror the Java record, whose fields are always present but may be null.
 */
export const DestinationResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  shortDescription: z.string().nullish(),
  province: z.string().nullish(),
  city: z.string().nullish(),
  country: z.string().nullish(),
  travelType: z.string().nullish(),
  category: z.string().nullish(),
  coverImageUrl: z.string().nullish(),
  heroImage: z.string().nullish(),
  priceFrom: z.number().nullish(),
  currency: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  rating: z.number().default(0),
  reviewCount: z.number().int().default(0),
  ownerId: z.string().nullish(),
  createdAt: z.string().nullish(),
  photos: z.array(z.string()).default([]),
});

export type DestinationResponse = z.infer<typeof DestinationResponseSchema>;

export const DestinationPageSchema = pagedSchema(DestinationResponseSchema);
export type DestinationPage = z.infer<typeof DestinationPageSchema>;
