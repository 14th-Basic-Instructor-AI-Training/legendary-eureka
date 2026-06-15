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
  kpis: Record<string, unknown>[];
  volume: Record<string, unknown>[];
  distribution: Record<string, unknown>[];
  approvals: Record<string, unknown>[];
  newUsers: Record<string, unknown>[];
  recentRequests: Record<string, unknown>[];
  feed: Record<string, unknown>[];
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
