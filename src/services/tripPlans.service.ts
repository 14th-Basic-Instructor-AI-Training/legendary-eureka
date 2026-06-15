import { apiFetch } from "@/lib/api/client";
import type { PagedData, PageParams } from "@/lib/api/client";
import type {
  AddTripPlanItemRequest,
  CreateTripPlanRequest,
  TripPlanItemResponse,
  TripPlanResponse,
  UpdateTripPlanRequest,
} from "@/lib/api/tripPlans";

export function getMyTripPlans(params?: PageParams): Promise<PagedData<TripPlanResponse>> {
  return apiFetch("/trip-plans", { params });
}

export function getTripPlan(id: string): Promise<TripPlanResponse> {
  return apiFetch(`/trip-plans/${id}`);
}

export function createTripPlan(body: CreateTripPlanRequest): Promise<TripPlanResponse> {
  return apiFetch("/trip-plans", { method: "POST", body });
}

export function updateTripPlan(
  id: string,
  body: UpdateTripPlanRequest,
): Promise<TripPlanResponse> {
  return apiFetch(`/trip-plans/${id}`, { method: "PUT", body });
}

export function addTripPlanItem(
  id: string,
  body: AddTripPlanItemRequest,
): Promise<TripPlanItemResponse> {
  return apiFetch(`/trip-plans/${id}/items`, { method: "POST", body });
}

export function getPublicTripPlans(params?: PageParams): Promise<PagedData<TripPlanResponse>> {
  return apiFetch("/trip-plans/public", { auth: false, params });
}
