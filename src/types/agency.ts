import { z } from "zod";
import { pagedSchema } from "./paged";

/**
 * Tour agency public profile — backend wire DTO (`feature/profile` `AgencyProfileResponse`).
 * Source of truth for response validation in `services/agency.service.ts` (top-rated row).
 */
export const AgencyProfileResponseSchema = z.object({
  id: z.string(),
  slug: z.string().nullish(),
  agencyName: z.string().nullish(),
  bio: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  contactEmail: z.string().nullish(),
  contactPhone: z.string().nullish(),
  website: z.string().nullish(),
  address: z.string().nullish(),
  status: z.string(),
  rejectionReason: z.string().nullish(),
  averageRating: z.number().default(0),
  reviewCount: z.number().int().default(0),
  ratingsBreakdown: z.record(z.string(), z.number()).nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});

export type AgencyProfileResponse = z.infer<typeof AgencyProfileResponseSchema>;

export const AgencyProfilePageSchema = pagedSchema(AgencyProfileResponseSchema);
export type AgencyProfilePage = z.infer<typeof AgencyProfilePageSchema>;
