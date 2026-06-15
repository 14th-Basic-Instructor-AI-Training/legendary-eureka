import { apiFetch, type PagedData, type PageParams } from "./client";

/**
 * Admin platform dashboard — the analytics overview shown on `/admin`.
 * Types mirror the backend `AdminDashboardResponse` (and its nested records)
 * 1:1; see `feature/admin/dto/*` in destination-api. Endpoint:
 *   GET /api/v1/admin/dashboard  (ROLE_ADMIN, bearer auth)
 */

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

/** One point on a trend chart. The backend reuses this record for several charts;
 *  only the relevant numeric field is populated (the UI reads `count` first). */
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

export interface AdminDashboardResponse {
  kpis: AdminKpiMetric[];
  volume: AdminTrendPoint[];
  distribution: AdminDistributionSlice[];
  approvals: AdminApprovalPoint[];
  newUsers: AdminTrendPoint[];
  recentRequests: AdminAgencyRequestSummary[];
  feed: AdminPlatformActivity[];
}

export function getAdminDashboard(): Promise<AdminDashboardResponse> {
  return apiFetch("/admin/dashboard");
}

// ── Agency onboarding requests ────────────────────────────────────────────────
// Backend: GET /admin/agencies, PUT /admin/agencies/{id} (ROLE_ADMIN).
// Mirrors `feature/admin/dto/AgencyProfileResponse` + `AgencyStatusUpdateRequest`.

/** Backend enum name. */
export type AgencyStatus = "PENDING" | "APPROVED" | "REJECTED";

/** A become-an-agency request / agency profile awaiting moderation. */
export interface AdminAgencyProfile {
  id: string;
  userId: string;
  agencyName: string;
  description: string | null;
  logoUrl: string | null;
  status: AgencyStatus;
  adminNote: string | null;
  /** ISO-8601 timestamp. */
  createdAt: string;
}

export interface AgencyStatusUpdateRequest {
  status: AgencyStatus;
  adminNote?: string;
}

export function getAdminAgencies(
  params?: PageParams & { status?: AgencyStatus },
): Promise<PagedData<AdminAgencyProfile>> {
  return apiFetch("/admin/agencies", { params });
}

export function updateAgencyStatus(
  id: string,
  body: AgencyStatusUpdateRequest,
): Promise<AdminAgencyProfile> {
  return apiFetch(`/admin/agencies/${id}`, { method: "PUT", body });
}

// ── Activity edit requests ────────────────────────────────────────────────────
// Backend: GET /admin/edit-requests, PUT /admin/edit-requests/{id}/{approve|reject}.
// Mirrors `feature/content/editrequest/dto/EditRequestResponse`.

/** Backend enum name. */
export type EditRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
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

export function getAdminEditRequests(
  params?: PageParams & { status?: EditRequestStatus },
): Promise<PagedData<AdminEditRequest>> {
  return apiFetch("/admin/edit-requests", { params });
}

export function approveAdminEditRequest(id: string): Promise<AdminEditRequest> {
  return apiFetch(`/admin/edit-requests/${id}/approve`, { method: "PUT" });
}

export function rejectAdminEditRequest(id: string): Promise<AdminEditRequest> {
  return apiFetch(`/admin/edit-requests/${id}/reject`, { method: "PUT" });
}
