import { apiFetch } from "@/lib/api/client";
import type { PagedData, PageParams } from "@/lib/api/client";
import type {
  AdminAgencyParams,
  AdminAgencyProfile,
  AdminAgencyUpdateRequest,
  AdminEditRequestDecision,
  AdminEditRequestParams,
  AdminReportDecision,
  AdminReportParams,
  AdminUserParams,
  EditRequestResponse,
  ReportResponse,
  SystemSettingsResponse,
  UpdateSystemSettingsRequest,
  UserSummaryResponse,
  AdminDashboardResponse,
} from "@/lib/api/admin";
import type { AgencyProfileResponse } from "@/lib/api/profile";
import type { TripResponse, AdminTripParams } from "@/lib/api/bookings";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { DestinationResponse } from "@/lib/api/destinations";

// ── Admin dashboard ───────────────────────────────────────────────────────────

export function getAdminDashboard(): Promise<AdminDashboardResponse> {
  return apiFetch("/admin/dashboard");
}

// ── Agency management ─────────────────────────────────────────────────────────

export function getAdminAgencies(
  params?: AdminAgencyParams,
): Promise<PagedData<AdminAgencyProfile>> {
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
  role: "traveler" | "agency",
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

export function getAdminTrips(params?: AdminTripParams): Promise<PagedData<TripResponse>> {
  return apiFetch("/trips", { params });
}

// ── Destinations (admin) ──────────────────────────────────────────────────────

export function getAdminDestinations(
  params?: PageParams,
): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/destinations", { params });
}

// ── Tours (admin) ─────────────────────────────────────────────────────────────

export function getAdminTours(params?: PageParams): Promise<PagedData<TourPackageResponse>> {
  return apiFetch("/tours", { params });
}
