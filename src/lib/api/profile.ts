import { apiFetch } from "./client";

// ── Types ────────────────────────────────────────────────────────────────────

export type AgencyStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AgencyProfileResponse {
  id: string;
  userId: string;
  agencyName: string;
  bio: string;
  avatarUrl: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  status: AgencyStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TravelerProfileResponse {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface UpdateAgencyProfileRequest {
  agencyName?: string;
  bio?: string;
  avatarUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
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
