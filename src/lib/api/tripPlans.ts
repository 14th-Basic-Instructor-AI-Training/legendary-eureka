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
