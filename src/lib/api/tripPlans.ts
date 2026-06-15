import { apiFetch, type PagedData, type PageParams } from "./client";

export type TripPlanVisibility = "PRIVATE" | "PUBLIC";
export type TripPlanRefType = "DESTINATION" | "ACTIVITY" | "RESTAURANT" | "ACCOMMODATION";

export interface TripPlanItemResponse {
  id: string;
  tripPlanId: string;
  dayNumber: number;
  sortOrder: number;
  refType: TripPlanRefType;
  refId: string;
  note: string | null;
}

export interface TripPlanResponse {
  id: string;
  travelerId: string;
  title: string;
  description: string | null;
  visibility: TripPlanVisibility;
  items: TripPlanItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripPlanRequest {
  title: string;
  description?: string;
  visibility: TripPlanVisibility;
}

export interface UpdateTripPlanRequest {
  title?: string;
  description?: string;
  visibility?: TripPlanVisibility;
}

export interface AddTripPlanItemRequest {
  dayNumber: number;
  sortOrder: number;
  refType: TripPlanRefType;
  refId: string;
  note?: string;
}

export function getMyTripPlans(
  params?: PageParams,
): Promise<PagedData<TripPlanResponse>> {
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

export function getPublicTripPlans(
  params?: PageParams,
): Promise<PagedData<TripPlanResponse>> {
  return apiFetch("/trip-plans/public", { auth: false, params });
}
