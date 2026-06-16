import type { PageParams } from "./client";
import type { AgencyProfileResponse, AgencyStatus } from "./profile";
import type { AdminTripParams } from "./bookings";
import type { TourPackageResponse } from "./packages";
import type { DestinationResponse } from "./destinations";

// ── Status types ──────────────────────────────────────────────────────────────

export type AdminAgencyStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AdminUserStatus = "active" | "suspended" | "banned";
export type AdminUserRole = "traveler" | "agency";
export type EditRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";
export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH";

// ── Response types ────────────────────────────────────────────────────────────

export interface AdminDashboardResponse {
  kpis: AdminKpiMetric[];
  volume: AdminTrendPoint[];
  distribution: AdminDistributionSlice[];
  approvals: AdminApprovalPoint[];
  newUsers: AdminTrendPoint[];
  recentRequests: AdminAgencyRequestSummary[];
  feed: AdminPlatformActivity[];
}

export interface UserSummaryResponse {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole | "admin";
  status: AdminUserStatus;
  joinedAtLabel: string;
  createdAt: string;
}

export interface EditRequestResponse {
  id: string;
  targetType: string;
  targetId: string;
  message: string;
  status: EditRequestStatus;
  adminNote: string | null;
  agencyId: string;
  agencyName: string;
  createdAt: string;
}

export interface ReportResponse {
  id: string;
  targetType: string;
  targetId: string;
  targetLabel: string | null;
  reason: string;
  severity: ReportSeverity;
  description: string | null;
  status: ReportStatus;
  adminNote: string | null;
  reporterId: string;
  reporterName: string;
  reporterRole: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface SystemSettingsResponse {
  commissionRate: number;
  registrationOpen: boolean;
  bookingEnabled: boolean;
  maintenanceMode: boolean;
  destinationCreationEnabled: boolean;
  tourCreationEnabled: boolean;
  reportingEnabled: boolean;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface AdminAgencyUpdateRequest {
  status: AdminAgencyStatus;
  adminNote?: string;
}

export interface AdminEditRequestDecision {
  adminNote?: string;
}

export interface AdminReportDecision {
  status: ReportStatus;
  adminNote?: string;
}

export interface UpdateSystemSettingsRequest {
  commissionRate?: number;
  registrationOpen?: boolean;
  bookingEnabled?: boolean;
  maintenanceMode?: boolean;
  destinationCreationEnabled?: boolean;
  tourCreationEnabled?: boolean;
  reportingEnabled?: boolean;
}

// ── List params ───────────────────────────────────────────────────────────────

export interface AdminUserParams extends PageParams {
  role?: AdminUserRole | "admin";
  status?: AdminUserStatus;
  search?: string;
}

export interface AdminAgencyParams extends PageParams {
  status?: AdminAgencyStatus;
}

export interface AdminEditRequestParams extends PageParams {
  status?: EditRequestStatus;
}

export interface AdminReportParams extends PageParams {
  status?: ReportStatus;
  severity?: ReportSeverity;
}

// ── Re-exports ────────────────────────────────────────────────────────────────

export type { DestinationResponse };
export type { AdminTripParams };
export type { TourPackageResponse };
export type { AgencyStatus };
export type { AgencyProfileResponse };

// ── Dashboard analytics display types ─────────────────────────────────────────

/** A KPI tile. `key` is one of the backend metric ids (see KPI_META in StatCard). */
export interface AdminKpiMetric {
  key: string;
  value: number;
  deltaPct: number;
  /** "up" | "down" | "neutral". */
  deltaDir: string;
  deltaGood: boolean;
  /** Free-text caption from the backend (mapped to i18n in the UI). */
  comparison: string;
}

/** One point on a trend chart. */
export interface AdminTrendPoint {
  label: string;
  bookings?: number | null;
  packages?: number | null;
  count?: number | null;
}

/** A donut slice. `fill` is a ready-to-use CSS color (hex). */
export interface AdminDistributionSlice {
  name: string;
  value: number;
  fill: string;
}

/** One bar group — approved vs rejected agency requests in a period. */
export interface AdminApprovalPoint {
  label: string;
  approved: number;
  rejected: number;
}

/** A row in the "recent agency requests" table. */
export interface AdminAgencyRequestSummary {
  id: string;
  agencyName: string;
  applicantEmail: string | null;
  logoUrl: string | null;
  adminNote: string | null;
  /** Backend enum name: "PENDING" | "APPROVED" | "REJECTED". */
  status: string;
  /** ISO-8601 timestamp. */
  createdAt: string;
}

/** A moderation-feed entry. `label`/`detail` are backend-formed display strings. */
export interface AdminPlatformActivity {
  /** "booking" | "approval" | "registration". */
  type: string;
  label: string;
  detail: string;
  /** ISO-8601 timestamp. */
  occurredAt: string;
}

// ── Agency onboarding requests / activity edit requests ───────────────────────

/** A become-an-agency request / agency profile awaiting moderation. */
export interface AdminAgencyProfile {
  id: string;
  userId: string;
  agencyName: string;
  /** The applicant's account email (the person who registered as an agency). */
  email: string;
  description: string | null;
  logoUrl: string | null;
  status: AgencyStatus;
  adminNote: string | null;
  /** ISO-8601 timestamp. */
  createdAt: string;
}

/** What the agency wants edited. */
export type EditRequestTargetType = "DESTINATION" | "ACTIVITY";

export interface AdminEditRequest {
  id: string;
  requesterId: string;
  targetType: EditRequestTargetType;
  targetId: string;
  message: string;
  status: EditRequestStatus;
  adminNote: string | null;
  /** ISO-8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}
