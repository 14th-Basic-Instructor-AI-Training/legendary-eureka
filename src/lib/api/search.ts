import type { PageParams, Province, TravelType } from "./client";

export interface SearchParams extends PageParams {
  province?: Province;
  travelType?: TravelType;
  query?: string;
}
