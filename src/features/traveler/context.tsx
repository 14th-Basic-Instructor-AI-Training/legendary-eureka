"use client";

import { createContext, useContext, type ReactNode } from "react";
import type {
  ActivityItem,
  BookingHistory,
  Bookmark,
  MyReview,
  TravelerProfile,
  TripPlan,
} from "./schema";

export interface TravelerProfileData {
  profile: TravelerProfile;
  phone: string;
  bookings: BookingHistory[];
  bookmarks: Bookmark[];
  tripPlans: TripPlan[];
  reviews: MyReview[];
  activity: ActivityItem[];
}

const TravelerProfileContext = createContext<TravelerProfileData | null>(null);

export function TravelerProfileProvider({
  value,
  children,
}: {
  value: TravelerProfileData;
  children: ReactNode;
}) {
  return (
    <TravelerProfileContext.Provider value={value}>
      {children}
    </TravelerProfileContext.Provider>
  );
}

export function useTravelerProfileData(): TravelerProfileData {
  const ctx = useContext(TravelerProfileContext);
  if (!ctx) {
    throw new Error("useTravelerProfileData must be used within TravelerProfileProvider");
  }
  return ctx;
}
