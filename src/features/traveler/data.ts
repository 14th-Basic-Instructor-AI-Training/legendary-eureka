import {
  ACTIVITY_FEED,
  BOOKINGS,
  BOOKMARKS,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PRIVACY,
  MY_REVIEWS,
  TRAVELER_PROFILE,
  TRIP_PLANS,
} from "./fixtures";
import type {
  ActivityItem,
  BookingHistory,
  Bookmark,
  MyReview,
  NotificationPrefs,
  PrivacySettings,
  TravelerProfile,
  TripPlan,
} from "./schema";

/**
 * The ONE data seam for the traveler profile. Read-only getters return typed
 * results (loading/empty/error are exercised in the static phase); mutable,
 * transition-bearing state (profile, bookings, reviews, prefs) is seeded into
 * the Zustand store via the `initialX()` helpers below.
 *
 * Bookmarks are exposed as per-kind zero-arg getters so each Bookmarks sub-tab
 * can pass a stable (module-level) fetcher to `useResource`.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDestinationBookmarks(): Promise<Result<Bookmark[]>> {
  await delay();
  return { ok: true, data: BOOKMARKS.filter((b) => b.kind === "destination") };
}

export async function getTourBookmarks(): Promise<Result<Bookmark[]>> {
  await delay();
  return { ok: true, data: BOOKMARKS.filter((b) => b.kind === "tour") };
}

export async function getTripPlanBookmarks(): Promise<Result<Bookmark[]>> {
  await delay();
  return { ok: true, data: BOOKMARKS.filter((b) => b.kind === "tripPlan") };
}

export async function getTripPlans(): Promise<Result<TripPlan[]>> {
  await delay();
  return { ok: true, data: TRIP_PLANS };
}

export async function getRecentActivity(): Promise<Result<ActivityItem[]>> {
  await delay();
  const data = [...ACTIVITY_FEED]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);
  return { ok: true, data };
}

/* ----------------------------- Store seeders ------------------------------ */

export function initialProfile(): TravelerProfile {
  return TRAVELER_PROFILE;
}

export function initialBookings(): BookingHistory[] {
  return BOOKINGS;
}

export function initialReviews(): MyReview[] {
  return MY_REVIEWS;
}

export function initialNotificationPrefs(): NotificationPrefs {
  return DEFAULT_NOTIFICATION_PREFS;
}

export function initialPrivacy(): PrivacySettings {
  return DEFAULT_PRIVACY;
}
