import { apiFetch, type PagedData, type PageParams, type Province, type TravelType } from "./client";

// ── Response types ────────────────────────────────────────────────────────────

export interface DestinationResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  province: Province;
  city: string;
  country: string;
  travelType: TravelType;
  category: string;
  coverImageUrl: string;
  heroImage: string;
  priceFrom: number;
  currency: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  featured: boolean;
  trending: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
  ownerId: string;
  createdAt: string;
  photos: string[];
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface CreateDestinationRequest {
  name: string;
  description?: string;
  province?: Province;
  travelType?: TravelType;
  coverImageUrl?: string;
  priceFrom?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  trending?: boolean;
}

// ── Destination API ───────────────────────────────────────────────────────────

export function getDestinations(params?: PageParams): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/destinations", { auth: false, params });
}

export function getDestination(id: string): Promise<DestinationResponse> {
  return apiFetch(`/destinations/${id}`, { auth: false });
}

export function getMyDestinations(params?: PageParams): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/destinations/mine", { params });
}

export function createDestination(body: CreateDestinationRequest): Promise<DestinationResponse> {
  return apiFetch("/destinations", {
    method: "POST",
    body: { featured: false, trending: false, ...body },
  });
}

export function updateDestination(
  id: string,
  body: Partial<CreateDestinationRequest>,
): Promise<DestinationResponse> {
  return apiFetch(`/destinations/${id}`, { method: "PUT", body });
}

export function deleteDestination(id: string): Promise<void> {
  return apiFetch(`/destinations/${id}`, { method: "DELETE" });
}
