"use client";

import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { TravelerProfileProvider } from "../context";
import type {
  ActivityItem,
  BookingHistory,
  Bookmark,
  MyReview,
  TravelerProfile,
  TripPlan,
} from "../schema";

export interface TravelerProfileScreenProps {
  profile: TravelerProfile;
  phone: string;
  bookings: BookingHistory[];
  bookmarks: Bookmark[];
  tripPlans: TripPlan[];
  reviews: MyReview[];
  activity: ActivityItem[];
}

/**
 * Top-level Traveler Profile screen. Server-fetched data is passed in and
 * shared with tab panels via context.
 */
export function TravelerProfileScreen({
  profile,
  phone,
  bookings,
  bookmarks,
  tripPlans,
  reviews,
  activity,
}: TravelerProfileScreenProps) {
  return (
    <TravelerProfileProvider
      value={{ profile, phone, bookings, bookmarks, tripPlans, reviews, activity }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <ProfileHeader />
        <ProfileTabs />
      </div>
    </TravelerProfileProvider>
  );
}
