import { z } from "zod";
import { RoleSchema } from "@/features/auth/schema";
import {
  DestinationCategorySchema,
  ProvinceSchema,
  TravelTypeSchema,
} from "@/features/destinations/schema";

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
  /** Why the applicant wants to become an agency — shown in the review card. */
  description: z.string().optional(),
});
export type AgencyRequest = z.infer<typeof AgencyRequestSchema>;

export const ReportStatusSchema = z.enum(["open", "resolved", "dismissed"]);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export const ReportSeveritySchema = z.enum(["low", "medium", "high"]);
export type ReportSeverity = z.infer<typeof ReportSeveritySchema>;

export const ReportSchema = z.object({
  id: z.string(),
  targetAgency: z.string(),
  reporterName: z.string(),
  reason: z.string(),
  submittedAtLabel: z.string(),
  status: ReportStatusSchema,
  severity: ReportSeveritySchema.default("medium"),
  adminNote: z.string().optional(),
});
export type Report = z.infer<typeof ReportSchema>;

/** A platform activity as the admin sees it (across all agencies). */
export const ActivityStatusSchema = z.enum(["draft", "published"]);
export type ActivityStatus = z.infer<typeof ActivityStatusSchema>;

export const PlatformActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  agencyName: z.string(),
  category: DestinationCategorySchema,
  status: ActivityStatusSchema,
  rating: z.number().min(0).max(5),
  // Destination detail fields (align with the API body). Optional so legacy
  // fixtures created before these existed still parse.
  description: z.string().optional(),
  province: ProvinceSchema.optional(),
  travelType: TravelTypeSchema.optional(),
  coverImageUrl: z.string().url().optional(),
  priceFrom: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
export type PlatformActivity = z.infer<typeof PlatformActivitySchema>;

/**
 * The content-moderation form. Mirrors the API destination body (see
 * `DestinationDraftSchema`) plus the two admin-list concerns (`category` and
 * publish `status`). Used for both "Create destination" and editing an existing
 * activity. Kept plain (no coercion/defaults) so the form's input and output
 * types match — number fields are converted in the field's `onChange`.
 */
export const ActivityDraftSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  province: ProvinceSchema,
  travelType: TravelTypeSchema,
  category: DestinationCategorySchema,
  status: ActivityStatusSchema,
  coverImageUrl: z.string().url(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().min(1).max(8),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type ActivityDraft = z.infer<typeof ActivityDraftSchema>;

/** A partial set of editable activity fields the store can merge onto a record. */
export const ActivityPatchSchema = PlatformActivitySchema.omit({
  id: true,
  agencyName: true,
  rating: true,
}).partial();
export type ActivityPatch = z.infer<typeof ActivityPatchSchema>;

/**
 * Map a form draft onto stored activity fields — the API's `name` is the list's
 * `title`; everything else passes through. Returns all fields defined (the draft
 * is complete), so it doubles as the create payload.
 */
export function draftToActivityFields(draft: ActivityDraft) {
  const { name, ...rest } = draft;
  return { title: name, ...rest };
}

/** Moderation state of a user account. */
export const UserStatusSchema = z.enum(["active", "suspended", "banned"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

/** A user summary row for the users panel. */
export const UserSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  status: UserStatusSchema,
  joinedAtLabel: z.string(),
});
export type UserSummary = z.infer<typeof UserSummarySchema>;

/* ------------------------------------------------------------------ *
 * Admin analytics dashboard (read-only overview shown above the tabs).
 * Shapes are mock-only today; the `data.ts` getter is the swap seam.
 * ------------------------------------------------------------------ */

/** Which KPI a card represents — drives its i18n label. */
export const KpiKeySchema = z.enum(["pendingRequests", "openReports", "activities", "users"]);
export type KpiKey = z.infer<typeof KpiKeySchema>;

/** What the delta is compared against — drives the localized comparison copy. */
export const KpiComparisonSchema = z.enum(["vsYesterday", "vsLastWeek", "vsPrior30d"]);

/** A single KPI tile: a value plus a signed delta and whether that delta is good. */
export const KpiMetricSchema = z.object({
  key: KpiKeySchema,
  value: z.number(),
  deltaPct: z.number(),
  deltaDir: z.enum(["up", "down"]),
  /** Whether the direction is a positive signal (greener) — context-dependent. */
  deltaGood: z.boolean(),
  comparison: KpiComparisonSchema,
});
export type KpiMetric = z.infer<typeof KpiMetricSchema>;

/** One point on a single-series trend (area / line). */
export const TrendPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});
export type TrendPoint = z.infer<typeof TrendPointSchema>;

/** A slice of the category donut. `colorVar` is a globals.css custom property. */
export const DistributionSliceSchema = z.object({
  key: DestinationCategorySchema,
  value: z.number(),
  colorVar: z.string(),
});
export type DistributionSlice = z.infer<typeof DistributionSliceSchema>;

/** One day in the approvals bar chart (approved vs rejected agency requests). */
export const ApprovalBarSchema = z.object({
  label: z.string(),
  approved: z.number(),
  rejected: z.number(),
});
export type ApprovalBar = z.infer<typeof ApprovalBarSchema>;

/** A row in the "recent agency requests" table. */
export const RecentRequestRowSchema = z.object({
  id: z.string(),
  agencyName: z.string(),
  applicantName: z.string(),
  country: z.string(),
  submittedAtLabel: z.string(),
  status: AgencyRequestStatusSchema,
});
export type RecentRequestRow = z.infer<typeof RecentRequestRowSchema>;

/** An entry in the moderation activity feed. `subject` interpolates into the localized message. */
export const ActivityFeedItemSchema = z.object({
  id: z.string(),
  kind: z.enum(["agencyApproved", "reportResolved", "activityEdited", "userJoined"]),
  subject: z.string(),
  timeLabel: z.string(),
});
export type ActivityFeedItem = z.infer<typeof ActivityFeedItemSchema>;

/** The whole admin dashboard payload returned by `getAdminDashboard()`. */
export const AdminDashboardSchema = z.object({
  kpis: z.array(KpiMetricSchema),
  volume: z.array(TrendPointSchema),
  distribution: z.array(DistributionSliceSchema),
  approvals: z.array(ApprovalBarSchema),
  newUsers: z.array(TrendPointSchema),
  recentRequests: z.array(RecentRequestRowSchema),
  feed: z.array(ActivityFeedItemSchema),
});
export type AdminDashboard = z.infer<typeof AdminDashboardSchema>;

/* ------------------------------------------------------------------ *
 * Agency edit requests (agencies request changes to published activities).
 * ------------------------------------------------------------------ */

export const EditRequestStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type EditRequestStatus = z.infer<typeof EditRequestStatusSchema>;

export const EditRequestSchema = z.object({
  id: z.string(),
  activityTitle: z.string(),
  agencyName: z.string(),
  /** What the field currently says (shown alongside requestedChanges). */
  currentValue: z.string().optional(),
  requestedChanges: z.string(),
  submittedAtLabel: z.string(),
  status: EditRequestStatusSchema,
});
export type EditRequest = z.infer<typeof EditRequestSchema>;

/* ------------------------------------------------------------------ *
 * Admin packages view — all tour packages across agencies.
 * ------------------------------------------------------------------ */

export const AdminPackageStatusSchema = z.enum(["draft", "published", "archived"]);
export type AdminPackageStatus = z.infer<typeof AdminPackageStatusSchema>;

export const AdminPackageSchema = z.object({
  id: z.string(),
  title: z.string(),
  agencyName: z.string(),
  days: z.number().int().positive(),
  priceFrom: z.number().nonnegative(),
  currency: z.string().default("USD"),
  status: AdminPackageStatusSchema,
  activityCount: z.number().int().nonnegative(),
  bookingsCount: z.number().int().nonnegative(),
});
export type AdminPackage = z.infer<typeof AdminPackageSchema>;

/* ------------------------------------------------------------------ *
 * Admin bookings monitoring — all bookings platform-wide (read-only).
 * ------------------------------------------------------------------ */

export const AdminBookingStatusSchema = z.enum(["pending", "approved", "rejected", "completed"]);
export type AdminBookingStatus = z.infer<typeof AdminBookingStatusSchema>;

export const AdminBookingSchema = z.object({
  id: z.string(),
  travelerName: z.string(),
  agencyName: z.string(),
  packageTitle: z.string(),
  datesLabel: z.string(),
  guests: z.number().int().positive(),
  total: z.number().nonnegative(),
  currency: z.string().default("USD"),
  status: AdminBookingStatusSchema,
  requestedAtLabel: z.string(),
});
export type AdminBooking = z.infer<typeof AdminBookingSchema>;

/* ------------------------------------------------------------------ *
 * System settings — platform-wide config that only admins can change.
 * ------------------------------------------------------------------ */

export const SystemSettingsSchema = z.object({
  commissionRate: z.number().min(0).max(100),
  maxPackageDays: z.number().int().positive(),
  minActivityPriceUsd: z.number().nonnegative(),
  /** Platform feature flags — toggled live by admin. */
  registrationOpen: z.boolean().default(true),
  bookingEnabled: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
});
export type SystemSettings = z.infer<typeof SystemSettingsSchema>;

export const SystemSettingsFormSchema = z.object({
  commissionRate: z.coerce.number().min(0, "Must be ≥ 0").max(100, "Must be ≤ 100"),
  maxPackageDays: z.coerce.number().int().min(1, "Must be at least 1 day"),
  minActivityPriceUsd: z.coerce.number().min(0, "Must be ≥ 0"),
  registrationOpen: z.boolean(),
  bookingEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
});
export type SystemSettingsFormValues = z.input<typeof SystemSettingsFormSchema>;

/** Quick pending-count summary — used by the Requests page header. */
export const AdminStatsSchema = z.object({
  pendingAgencyRequests: z.number(),
  pendingEditRequests: z.number(),
  openReports: z.number(),
});
export type AdminStats = z.infer<typeof AdminStatsSchema>;
