import { z } from "zod";
import { ProvinceSchema, TravelTypeSchema } from "@/features/destinations/schema";

/**
 * Tours feature — the destination → package → approval flow.
 *
 * Two origins for a destination drive the two flows:
 *  - `admin`  : an Admin-created destination an agency can pick (Flow 1).
 *  - `agency` : an agency's own destination (Flow 2).
 *
 * A tour package always references one destination and carries an approval
 * status (`draft → pending → approved | rejected`). Zod is the single source of
 * truth — fixtures parse through these schemas and the forms reuse them.
 */

export const DestinationOriginSchema = z.enum(["admin", "agency"]);
export type DestinationOrigin = z.infer<typeof DestinationOriginSchema>;

export const TourDestinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  province: ProvinceSchema,
  travelType: TravelTypeSchema,
  summary: z.string(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  /** Who created it — distinguishes Flow 1 (admin) from Flow 2 (agency). */
  origin: DestinationOriginSchema,
  ownerName: z.string(),
});
export type TourDestination = z.infer<typeof TourDestinationSchema>;

/** Create-destination form shape. `priceFrom` coerces from the number input. */
export const NewDestinationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  province: ProvinceSchema,
  travelType: TravelTypeSchema,
  summary: z.string().min(1, "Description is required"),
  priceFrom: z.coerce.number().min(0, "Enter a price"),
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
