import { apiFetch } from "@/lib/api/client";
import type { PagedData, PageParams } from "@/lib/api/client";
import type {
  CreateDestinationRequest,
  DestinationResponse,
} from "@/lib/api/destinations";

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

export function getPendingDestinations(params?: PageParams): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/destinations/pending", { params });
}

/** Admin approval queue: agency-submitted destinations of all statuses (pending/approved/rejected). */
export function getDestinationApprovals(params?: PageParams): Promise<PagedData<DestinationResponse>> {
  return apiFetch("/destinations/approvals", { params });
}

export function approveDestination(id: string): Promise<DestinationResponse> {
  return apiFetch(`/destinations/${id}/approve`, { method: "PUT" });
}

export function rejectDestination(id: string): Promise<DestinationResponse> {
  return apiFetch(`/destinations/${id}/reject`, { method: "PUT" });
}
