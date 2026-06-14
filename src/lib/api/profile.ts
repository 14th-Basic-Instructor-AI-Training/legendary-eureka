import { apiFetch, type PagedData, type PageParams } from "./client";

// ── Enums ─────────────────────────────────────────────────────────────────────

export type AgencyStatus = "PENDING" | "APPROVED" | "REJECTED";

// ── Response types ────────────────────────────────────────────────────────────

export interface AgencyProfileResponse {
  id: string;
  agencyName: string;
  phone: string;
  address: string;
  description: string;
  logoUrl: string;
  website: string;
  status: AgencyStatus;
  createdAt: string;
}

export interface AgencyStatsResponse {
  totalPackages: number;
  activePackages: number;
  pendingBookings: number;
  totalActivities: number;
  categoryCount: number;
  averageRating: number;
  reviewCount: number;
}

export interface AgencyReviewResponse {
  id: string;
  travelerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface TravelerProfileResponse {
  id: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface UpdateAgencyProfileRequest {
  agencyName?: string;
  phone?: string;
  address?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
}

export interface UpdateTravelerProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

// ── Agency profile ────────────────────────────────────────────────────────────

export function getAgencyProfile(id: string): Promise<AgencyProfileResponse> {
  return apiFetch(`/agencies/${id}`, { auth: false });
}

export function getMyAgencyProfile(): Promise<AgencyProfileResponse> {
  return apiFetch("/agencies/me");
}

export function updateMyAgencyProfile(
  body: UpdateAgencyProfileRequest,
): Promise<AgencyProfileResponse> {
  return apiFetch("/agencies/me", { method: "PUT", body });
}

export function getMyAgencyStats(): Promise<AgencyStatsResponse> {
  return apiFetch("/agencies/me/stats");
}

export function getMyAgencyReviews(
  params?: PageParams,
): Promise<PagedData<AgencyReviewResponse>> {
  return apiFetch("/agencies/me/reviews", { params });
}

// ── Traveler profile ──────────────────────────────────────────────────────────

export function getTravelerProfile(id: string): Promise<TravelerProfileResponse> {
  return apiFetch(`/travelers/${id}`, { auth: false });
}

export function getMyTravelerProfile(): Promise<TravelerProfileResponse> {
  return apiFetch("/travelers/me");
}

export function updateMyTravelerProfile(
  body: UpdateTravelerProfileRequest,
): Promise<TravelerProfileResponse> {
  return apiFetch("/travelers/me", { method: "PUT", body });
}
