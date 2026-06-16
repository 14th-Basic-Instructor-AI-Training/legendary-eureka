import { apiFetch } from "@/lib/api/client";
import type { PagedData, PageParams } from "@/lib/api/client";
import type {
  TourAgendaItemRequest,
  TourPackageRequest,
  TourPackageResponse,
} from "@/lib/api/packages";

// ── Tour packages ─────────────────────────────────────────────────────────────

export function getPackages(params?: PageParams): Promise<PagedData<TourPackageResponse>> {
  return apiFetch("/tours", { auth: false, params });
}

export function getPackage(id: string): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${id}`, { auth: false });
}

export function getMyPackages(params?: PageParams): Promise<PagedData<TourPackageResponse>> {
  return apiFetch("/tours/mine", { params });
}

export function getArchivedPackages(
  params?: PageParams,
): Promise<PagedData<TourPackageResponse>> {
  return apiFetch("/tours/archived", { params });
}

export function createPackage(body: TourPackageRequest): Promise<TourPackageResponse> {
  return apiFetch("/tours", { method: "POST", body });
}

export function updatePackage(id: string, body: TourPackageRequest): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${id}`, { method: "PUT", body });
}

export function publishPackage(id: string): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${id}/publish`, { method: "PUT" });
}

export function archivePackage(id: string): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${id}/archive`, { method: "PUT" });
}

export function deletePackage(id: string): Promise<void> {
  return apiFetch(`/tours/${id}`, { method: "DELETE" });
}

// ── Package approval workflow ───────────────────────────────────────────────

/** Admin queue: packages submitted for approval (all submitted when no status param). */
export function getApprovalPackages(
  params?: PageParams,
): Promise<PagedData<TourPackageResponse>> {
  return apiFetch("/tours/approvals", { params });
}

/** Agency/owner: submit a draft package for admin approval. */
export function submitPackage(id: string): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${id}/submit`, { method: "POST" });
}

/** Admin: approve a pending package (also publishes it). */
export function approvePackage(id: string): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${id}/approve`, { method: "PUT" });
}

/** Admin: reject a pending package with an optional reason. */
export function rejectPackage(id: string, reason?: string): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${id}/reject`, { method: "PUT", body: { reason } });
}

// ── Tour agenda items ─────────────────────────────────────────────────────────

export function addAgendaItem(
  tourId: string,
  body: TourAgendaItemRequest,
): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${tourId}/agenda`, { method: "POST", body });
}

export function updateAgendaItem(
  tourId: string,
  itemId: string,
  body: TourAgendaItemRequest,
): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${tourId}/agenda/${itemId}`, { method: "PUT", body });
}

export function removeAgendaItem(tourId: string, itemId: string): Promise<TourPackageResponse> {
  return apiFetch(`/tours/${tourId}/agenda/${itemId}`, { method: "DELETE" });
}
