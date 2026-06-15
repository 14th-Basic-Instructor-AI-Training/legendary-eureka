import type { TripResponse } from "@/lib/api/bookings";
import type { BookmarkResponse } from "@/lib/api/bookmarks";
import type { TravelerProfileResponse } from "@/lib/api/profile";
import type { MyTripReviewResponse } from "@/lib/api/reviews";
import type { TripPlanResponse } from "@/lib/api/tripPlans";
import type {
  ActivityItem,
  BadgeLevel,
  BookingHistory,
  BookingStatus,
  Bookmark,
  MyReview,
  TravelerProfile,
  TripPlan,
} from "./schema";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop";
const DEFAULT_AVATAR =
  "https://api.dicebear.com/7.x/initials/svg?seed=Traveler";
const TOUR_PLACEHOLDER =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop";

function badgeFromTrips(completed: number): BadgeLevel {
  if (completed >= 10) return "pioneer";
  if (completed >= 5) return "globetrotter";
  if (completed >= 2) return "adventurer";
  return "explorer";
}

function tripStatusToBooking(status: TripResponse["status"]): BookingStatus {
  return status.toLowerCase() as BookingStatus;
}

export function apiProfileToTravelerProfile(
  api: TravelerProfileResponse,
  stats: {
    tripsCompleted: number;
    reviewsWritten: number;
    bookmarksSaved: number;
  },
): TravelerProfile {
  const tripsCompleted = stats.tripsCompleted;
  return {
    id: api.id,
    name: api.displayName || "Traveler",
    avatar: api.avatarUrl || DEFAULT_AVATAR,
    coverImage: DEFAULT_COVER,
    bio: api.bio ?? "",
    badgeLevel: badgeFromTrips(tripsCompleted),
    joinedAt: api.createdAt,
    stats: {
      countriesVisited: Math.min(Math.max(tripsCompleted, 1), 6),
      tripsCompleted,
      reviewsWritten: stats.reviewsWritten,
      bookmarksSaved: stats.bookmarksSaved,
    },
  };
}

export function tripToBookingHistory(trip: TripResponse): BookingHistory {
  const title = trip.tourPackageTitle || trip.packageTitle || "Tour";
  return {
    id: trip.id,
    tour: {
      slug: trip.tourPackageId,
      name: title,
      thumbnail: TOUR_PLACEHOLDER,
    },
    agencyName: trip.agencyName ?? "",
    startDate: trip.requestedDate,
    travelers: trip.numberOfPeople ?? trip.guests ?? 1,
    total: Number(trip.total ?? 0),
    currency: trip.currency ?? "USD",
    status: tripStatusToBooking(trip.status),
    hasReview: trip.status === "COMPLETED",
    refundStatus: trip.status === "CANCELLED" ? "pending" : undefined,
  };
}

export function apiBookmarkToBookmark(b: BookmarkResponse): Bookmark {
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
      category: "destination",
      travelType: "CULTURAL",
      shortDescription: "",
      heroImage: b.destinationImage || TOUR_PLACEHOLDER,
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

export function apiTripPlanToTripPlan(t: TripPlanResponse): TripPlan {
  return {
    id: t.id,
    title: t.title,
    destination: t.description?.slice(0, 60) || t.title,
    visibility: t.visibility,
    coverImage: TOUR_PLACEHOLDER,
    itemCount: t.items?.length ?? 0,
    dateRange: {
      start: t.createdAt.slice(0, 10),
      end: (t.updatedAt ?? t.createdAt).slice(0, 10),
    },
    createdAt: t.createdAt,
  };
}

export function apiReviewToMyReview(
  api: MyTripReviewResponse,
  profile: { name: string; avatar: string },
): MyReview {
  const created = new Date(api.createdAt);
  const editableUntil = new Date(created);
  editableUntil.setDate(editableUntil.getDate() + 7);

  return {
    id: api.id,
    authorName: profile.name,
    authorAvatar: profile.avatar,
    rating: api.rating,
    comment: api.comment ?? "",
    targetSlug: api.targetId,
    createdAt: api.createdAt,
    photoCount: 0,
    targetName: api.targetName,
    editableUntil: editableUntil.toISOString(),
  };
}

/** Derive a lightweight activity feed from profile data (no dedicated endpoint). */
export function buildRecentActivity(
  bookings: BookingHistory[],
  reviews: MyReview[],
  bookmarks: Bookmark[],
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const b of bookings.filter((x) => x.status === "completed")) {
    items.push({
      id: `trip-${b.id}`,
      kind: "completedTrip",
      subject: b.tour.name,
      at: b.startDate,
    });
  }
  for (const r of reviews) {
    items.push({
      id: `review-${r.id}`,
      kind: "review",
      subject: r.targetName,
      at: r.createdAt,
    });
  }
  for (const bm of bookmarks) {
    items.push({
      id: `bookmark-${bm.id}`,
      kind: "bookmark",
      subject: bm.kind === "destination" ? bm.item.name : bm.item.title,
      at: bm.savedAt,
    });
  }

  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);
}

export function personalInfoToUpdateBody(input: {
  name: string;
  phone?: string;
  bio: string;
  avatar?: string;
}) {
  return {
    displayName: input.name.trim() || undefined,
    bio: input.bio,
    phone: input.phone?.trim() || undefined,
    avatarUrl: input.avatar?.trim() || undefined,
  };
}
