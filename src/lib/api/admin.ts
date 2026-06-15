import { apiFetch, type PagedData, type PageParams } from "./client";
import type { AgencyProfileResponse } from "./profile";
import type { TripResponse } from "./bookings";
import type { TourPackageResponse } from "./packages";
import type { DestinationResponse } from "./activities";

// ── Status types ──────────────────────────────────────────────────────────────

export type AdminAgencyStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AdminUserStatus = "active" | "suspended" | "banned";
export type AdminUserRole = "traveler" | "agency";
export type EditRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

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
  reason: string;
  description: string | null;
  status: ReportStatus;
  adminNote: string | null;
  reporterId: string;
  reporterName: string;
  createdAt: string;
}

export interface SystemSettingsResponse {
  commissionRate: number;
  maxPackageDays: number;
  minActivityPriceUsd: number;
  registrationOpen: boolean;
  bookingEnabled: boolean;
  maintenanceMode: boolean;
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
  maxPackageDays?: number;
  minActivityPriceUsd?: number;
  registrationOpen?: boolean;
  bookingEnabled?: boolean;
  maintenanceMode?: boolean;
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

export interface AdminTripParams extends PageParams {
  status?: string;
}

export interface AdminEditRequestParams extends PageParams {
  status?: EditRequestStatus;
}

export interface AdminReportParams extends PageParams {
  status?: ReportStatus;
}

// ── Admin dashboard ───────────────────────────────────────────────────────────

export function getAdminDashboard(): Promise<AdminDashboardResponse> {
  return apiFetch("/admin/dashboard");
}

// ── Agency management ─────────────────────────────────────────────────────────

export function getAdminAgencies(
  params?: AdminAgencyParams,
): Promise<PagedData<AgencyProfileResponse>> {
  return apiFetch("/admin/agencies", { params });
}

export function updateAdminAgency(
  id: string,
  body: AdminAgencyUpdateRequest,
): Promise<AgencyProfileResponse> {
  return apiFetch(`/admin/agencies/${id}`, { method: "PUT", body });
}

// ── Edit requests ─────────────────────────────────────────────────────────────

export function getAdminEditRequests(
  params?: AdminEditRequestParams,
): Promise<PagedData<EditRequestResponse>> {
  return apiFetch("/admin/edit-requests", { params });
}

export function approveEditRequest(
  id: string,
  body?: AdminEditRequestDecision,
): Promise<EditRequestResponse> {
  return apiFetch(`/admin/edit-requests/${id}/approve`, { method: "PUT", body });
}

export function rejectEditRequest(
  id: string,
  body?: AdminEditRequestDecision,
): Promise<EditRequestResponse> {
  return apiFetch(`/admin/edit-requests/${id}/reject`, { method: "PUT", body });
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function getAdminReports(
  params?: AdminReportParams,
): Promise<PagedData<ReportResponse>> {
  return apiFetch("/admin/reports", { params });
}

export function resolveAdminReport(
  id: string,
  body: AdminReportDecision,
): Promise<ReportResponse> {
  return apiFetch(`/admin/reports/${id}/resolve`, { method: "PUT", body });
}

// ── User management ───────────────────────────────────────────────────────────

export function getAdminUsers(
  params?: AdminUserParams,
): Promise<PagedData<UserSummaryResponse>> {
  return apiFetch("/admin/users", { params });
}

export function suspendUser(id: string): Promise<UserSummaryResponse> {
  return apiFetch(`/admin/users/${id}/suspend`, { method: "PUT" });
}

export function banUser(id: string): Promise<UserSummaryResponse> {
  return apiFetch(`/admin/users/${id}/ban`, { method: "PUT" });
}

export function reactivateUser(id: string): Promise<UserSummaryResponse> {
  return apiFetch(`/admin/users/${id}/reactivate`, { method: "PUT" });
}

export function changeUserRole(
  id: string,
  role: AdminUserRole,
): Promise<UserSummaryResponse> {
  return apiFetch(`/admin/users/${id}/role`, { method: "PUT", body: { role } });
}

// ── System settings ───────────────────────────────────────────────────────────

export function getSystemSettings(): Promise<SystemSettingsResponse> {
  return apiFetch("/admin/settings");
}

export function updateSystemSettings(
  body: UpdateSystemSettingsRequest,
): Promise<SystemSettingsResponse> {
  return apiFetch("/admin/settings", { method: "PUT", body });
}

// ── Trips (admin read) ────────────────────────────────────────────────────────

export function getAdminTrips(
  params?: AdminTripParams,
): Promise<PagedData<TripResponse>> {
  return apiFetch("/trips", { params });
}

// ── Destinations (admin) — delegates to existing activities module ────────────
export type { DestinationResponse };
export function getAdminDestinations(
  params?: PageParams,
): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/destinations", { params });
}

// ── Tours (admin) — delegates to existing packages module ─────────────────────
export type { TourPackageResponse };
export function getAdminTours(
  params?: PageParams,
): Promise<PagedData<TourPackageResponse>> {
  return apiFetch("/tours", { params });
}

// ── Dashboard analytics display types ─────────────────────────────────────────
// Consumed by the `/admin` overview chart cards (Recharts). The dashboard data
// getter (`features/admin/data.ts`) reads `AdminDashboardResponse`'s generic
// arrays and casts each into these typed shapes for the cards.

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

// ── Agency onboarding requests / activity edit requests (display types) ───────
// Used by the admin requests queues + the React Flow lifecycle panel.

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
