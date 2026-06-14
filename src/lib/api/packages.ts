import { apiFetch, type PagedData, type PageParams, type Province, type TravelType } from "./client";

// ── Types ────────────────────────────────────────────────────────────────────

export type TourPackageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface TourAgendaItem {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: string[];
}

export interface TourPackageResponse {
  id: string;
  title: string;
  description: string;
  province: Province;
  travelType: TravelType;
  price: number;
  currency: string;
  durationDays: number;
  coverImageUrl: string;
  status: TourPackageStatus;
  agencyId: string;
  agenda: TourAgendaItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface TourPackageRequest {
  title: string;
  description: string;
  province: Province;
  travelType: TravelType;
  price: number;
  currency: string;
  durationDays: number;
  coverImageUrl: string;
}

export interface TourAgendaItemRequest {
  dayNumber: number;
  title: string;
  description: string;
  activities: string[];
}

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
