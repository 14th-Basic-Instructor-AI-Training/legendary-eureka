import { clientApiFetch, type PagedData } from "@/lib/api/client";
import type { BookmarkResponse } from "@/lib/api/bookmarks";
import type { TripPlanResponse } from "@/lib/api/tripPlans";
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

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

// ── Type mappers ──────────────────────────────────────────────────────────────

function mapBookmark(b: BookmarkResponse): Bookmark {
  return {
    id: b.id,
    kind: "destination",
    savedAt: b.createdAt,
    item: {
      id: b.destinationId,
      slug: b.destinationSlug,
      name: b.destinationName,
      country: "Cambodia",
      city: "",
      province: "",
      category: "destination" as const,
      travelType: "CULTURAL" as const,
      shortDescription: "",
      heroImage: b.destinationImage || "https://placehold.co/800x500",
      rating: 0,
      reviewCount: 0,
      priceFrom: 0,
      currency: "USD",
      tags: [],
      featured: false,
      trending: false,
      lat: 0,
      lng: 0,
      gallery: [],
      pois: [],
    },
  };
}

function mapTripPlan(t: TripPlanResponse): TripPlan {
  return {
    id: t.id,
    title: t.title,
    destination: t.description?.slice(0, 60) || t.title,
    visibility: t.visibility,
    coverImage: "https://placehold.co/800x500",
    itemCount: t.items?.length ?? 0,
    dateRange: {
      start: t.createdAt.slice(0, 10),
      end: t.updatedAt?.slice(0, 10) || t.createdAt.slice(0, 10),
    },
    createdAt: t.createdAt,
  };
}

// ── Getters (called via useResource from client components) ───────────────────

export async function getDestinationBookmarks(): Promise<Result<Bookmark[]>> {
  try {
    const page = await clientApiFetch<PagedData<BookmarkResponse>>("/bookmarks", {
      params: { size: 50 },
    });
    return { ok: true, data: page.content.map(mapBookmark) };
  } catch {
    return { ok: true, data: [] };
  }
}

export async function getTourBookmarks(): Promise<Result<Bookmark[]>> {
  // Tour bookmarks are not yet tracked by the backend
  return { ok: true, data: [] };
}

export async function getTripPlanBookmarks(): Promise<Result<Bookmark[]>> {
  // Trip-plan bookmarks are not yet tracked by the backend
  return { ok: true, data: [] };
}

export async function getTripPlans(): Promise<Result<TripPlan[]>> {
  try {
    const page = await clientApiFetch<PagedData<TripPlanResponse>>("/trip-plans", {
      params: { size: 50 },
    });
    return { ok: true, data: page.content.map(mapTripPlan) };
  } catch {
    return { ok: true, data: [] };
  }
}

export async function getRecentActivity(): Promise<Result<ActivityItem[]>> {
  // No dedicated activity-feed endpoint — return empty; the UI handles the empty state
  return { ok: true, data: [] };
}

// ── Store seeders (synchronous — return empty defaults; stores load real data async) ──

export function initialProfile(): TravelerProfile {
  return {
    id: "",
    name: "",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Traveler",
    coverImage: "https://placehold.co/1200x400",
    bio: "",
    badgeLevel: "explorer",
    joinedAt: new Date().toISOString(),
    stats: {
      countriesVisited: 0,
      tripsCompleted: 0,
      reviewsWritten: 0,
      bookmarksSaved: 0,
    },
  };
}

export function initialBookings(): BookingHistory[] {
  return [];
}

export function initialReviews(): MyReview[] {
  return [];
}

export function initialNotificationPrefs(): NotificationPrefs {
  return {
    bookingUpdates: true,
    tripReminders: true,
    reviewReplies: true,
    promotions: false,
    productNews: false,
  };
}

export function initialPrivacy(): PrivacySettings {
  return { defaultVisibility: "PRIVATE" };
}
