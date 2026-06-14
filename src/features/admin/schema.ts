import { z } from "zod";
import { RoleSchema } from "@/features/auth/schema";
import { DestinationCategorySchema } from "@/features/destinations/schema";

/**
 * Admin control-panel data shapes. The two mutable queues — agency-onboarding
 * requests and traveler reports — model their lifecycle as explicit enums so the
 * (mock) admin actions are testable state transitions.
 */

export const AgencyRequestStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type AgencyRequestStatus = z.infer<typeof AgencyRequestStatusSchema>;

export const AgencyRequestSchema = z.object({
  id: z.string(),
  agencyName: z.string(),
  applicantName: z.string(),
  email: z.string().email(),
  country: z.string(),
  submittedAtLabel: z.string(),
  status: AgencyRequestStatusSchema,
});
export type AgencyRequest = z.infer<typeof AgencyRequestSchema>;

export const ReportStatusSchema = z.enum(["open", "resolved", "dismissed"]);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export const ReportSchema = z.object({
  id: z.string(),
  targetAgency: z.string(),
  reporterName: z.string(),
  reason: z.string(),
  submittedAtLabel: z.string(),
  status: ReportStatusSchema,
});
export type Report = z.infer<typeof ReportSchema>;

/** A platform activity as the admin sees it (across all agencies). */
export const PlatformActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  agencyName: z.string(),
  category: DestinationCategorySchema,
  status: z.enum(["draft", "published"]),
  rating: z.number().min(0).max(5),
});
export type PlatformActivity = z.infer<typeof PlatformActivitySchema>;

/** A user summary row for the users panel. */
export const UserSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  joinedAtLabel: z.string(),
});
export type UserSummary = z.infer<typeof UserSummarySchema>;
