import { DESTINATIONS, FEATURED_TOURS } from "@/features/destinations/fixtures";
import {
  ActivityItemSchema,
  BookingHistorySchema,
  BookmarkSchema,
  MyReviewSchema,
  TravelerProfileSchema,
  TripPlanSchema,
  type ActivityItem,
  type BookingHistory,
  type Bookmark,
  type MyReview,
  type NotificationPrefs,
  type PrivacySettings,
  type TravelerProfile,
  type TripPlan,
} from "./schema";

/**
 * Mock data for the Traveler Profile. Everything parses through the feature
 * schemas so fixtures can't drift; swapping these for API calls is a one-file
 * change in `data.ts`. Dates are fixed ISO strings (no runtime `Date.now()`).
 */

const img = (seed: string, w = 1200, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const TRAVELER_PROFILE: TravelerProfile = TravelerProfileSchema.parse({
  id: "u-traveler-1",
  name: "Dara Sok",
  avatar: "https://i.pravatar.cc/240?img=12",
  coverImage: img("jalat-cover", 1600, 500),
  bio: "Weekend wanderer chasing temples, street food, and island sunsets across Southeast Asia.",
  badgeLevel: "adventurer",
  joinedAt: "2024-09-01T00:00:00.000Z",
  stats: {
    countriesVisited: 7,
    tripsCompleted: 12,
    reviewsWritten: 9,
    bookmarksSaved: 18,
  },
});

export const TRIP_PLANS: TripPlan[] = [
  {
    id: "tp-1",
    title: "Temples & Sunsets in Siem Reap",
    destination: "Siem Reap, Cambodia",
    visibility: "PUBLIC",
    coverImage: img("plan-siemreap"),
    itemCount: 8,
    dateRange: { start: "2026-07-18", end: "2026-07-23" },
    createdAt: "2026-05-30T10:00:00.000Z",
  },
  {
    id: "tp-2",
    title: "Jeju Island Road Trip",
    destination: "Jeju, South Korea",
    visibility: "PRIVATE",
    coverImage: img("plan-jeju"),
    itemCount: 5,
    dateRange: { start: "2026-09-02", end: "2026-09-06" },
    createdAt: "2026-06-02T08:30:00.000Z",
  },
  {
    id: "tp-3",
    title: "Phnom Penh Food Crawl",
    destination: "Phnom Penh, Cambodia",
    visibility: "PUBLIC",
    coverImage: img("plan-pp-food"),
    itemCount: 6,
    dateRange: { start: "2026-08-10", end: "2026-08-12" },
    createdAt: "2026-06-08T14:00:00.000Z",
  },
].map((p) => TripPlanSchema.parse(p));

export const BOOKMARKS: Bookmark[] = [
  ...DESTINATIONS.slice(0, 4).map((d, i) => ({
    id: `bm-d-${i + 1}`,
    kind: "destination" as const,
    savedAt: `2026-06-0${i + 1}T09:00:00.000Z`,
    item: d,
  })),
  ...FEATURED_TOURS.slice(0, 3).map((tr, i) => ({
    id: `bm-t-${i + 1}`,
    kind: "tour" as const,
    savedAt: `2026-05-2${i + 1}T09:00:00.000Z`,
    item: tr,
  })),
  ...TRIP_PLANS.slice(0, 2).map((tp, i) => ({
    id: `bm-p-${i + 1}`,
    kind: "tripPlan" as const,
    savedAt: `2026-06-1${i}T09:00:00.000Z`,
    item: tp,
  })),
].map((b) => BookmarkSchema.parse(b));

export const BOOKINGS: BookingHistory[] = [
  {
    id: "bk-1",
    tour: {
      slug: "angkor-sunrise-3d",
      name: "Angkor Sunrise: 3-Day Explorer",
      thumbnail: img("booking-angkor", 480, 360),
    },
    agencyName: "Angkor Trails",
    startDate: "2026-07-20",
    travelers: 2,
    total: 540,
    currency: "USD",
    status: "approved",
    hasReview: false,
  },
  {
    id: "bk-2",
    tour: {
      slug: "jeju-island-escape",
      name: "Jeju Island Escape",
      thumbnail: img("booking-jeju", 480, 360),
    },
    agencyName: "Hallasan Tours",
    startDate: "2026-08-05",
    travelers: 1,
    total: 720,
    currency: "USD",
    status: "pending",
    hasReview: false,
  },
  {
    id: "bk-3",
    tour: {
      slug: "khmer-cooking-day",
      name: "Khmer Cooking Day Class",
      thumbnail: img("booking-cooking", 480, 360),
    },
    agencyName: "Tonle Flavors",
    startDate: "2026-03-10",
    travelers: 2,
    total: 90,
    currency: "USD",
    status: "completed",
    hasReview: true,
  },
  {
    id: "bk-4",
    tour: {
      slug: "tonle-sap-floating",
      name: "Tonle Sap Floating Villages",
      thumbnail: img("booking-tonle", 480, 360),
    },
    agencyName: "Angkor Trails",
    startDate: "2026-02-01",
    travelers: 3,
    total: 165,
    currency: "USD",
    status: "completed",
    hasReview: false,
  },
  {
    id: "bk-5",
    tour: {
      slug: "kampot-pepper-tour",
      name: "Kampot Pepper Plantation Tour",
      thumbnail: img("booking-kampot", 480, 360),
    },
    agencyName: "Riverside Trips",
    startDate: "2026-04-15",
    travelers: 2,
    total: 110,
    currency: "USD",
    status: "cancelled",
    hasReview: false,
    refundStatus: "refunded",
  },
  {
    id: "bk-6",
    tour: {
      slug: "seoul-old-town-walk",
      name: "Seoul Old Town Heritage Walk",
      thumbnail: img("booking-seoul", 480, 360),
    },
    agencyName: "Hanok Walks",
    startDate: "2026-05-09",
    travelers: 1,
    total: 60,
    currency: "USD",
    status: "rejected",
    hasReview: false,
  },
].map((b) => BookingHistorySchema.parse(b));

export const MY_REVIEWS: MyReview[] = [
  {
    id: "rv-1",
    authorName: "Dara Sok",
    authorAvatar: "https://i.pravatar.cc/240?img=12",
    rating: 5,
    comment:
      "Our guide made the Khmer cooking class unforgettable — fresh market tour then a feast we cooked ourselves.",
    targetSlug: "khmer-cooking-day",
    targetName: "Khmer Cooking Day Class",
    travelType: "FOOD",
    createdAt: "2026-06-12T16:00:00.000Z",
    editableUntil: "2026-06-19T16:00:00.000Z",
  },
  {
    id: "rv-2",
    authorName: "Dara Sok",
    authorAvatar: "https://i.pravatar.cc/240?img=12",
    rating: 4,
    comment:
      "Beautiful floating villages and a calm sunset cruise. The boat was a little crowded but worth it.",
    targetSlug: "tonle-sap-floating",
    targetName: "Tonle Sap Floating Villages",
    travelType: "NATURE",
    createdAt: "2026-05-01T11:00:00.000Z",
    editableUntil: "2026-05-08T11:00:00.000Z",
  },
].map((r) => MyReviewSchema.parse(r));

export const ACTIVITY_FEED: ActivityItem[] = [
  { id: "af-1", kind: "review", subject: "Khmer Cooking Day Class", at: "2026-06-12T16:00:00.000Z" },
  { id: "af-2", kind: "bookmark", subject: "Angkor Wat", at: "2026-06-06T09:00:00.000Z" },
  { id: "af-3", kind: "bookmark", subject: "Jeju Island", at: "2026-06-04T09:00:00.000Z" },
  { id: "af-4", kind: "completedTrip", subject: "Khmer Cooking Day Class", at: "2026-03-12T18:00:00.000Z" },
  { id: "af-5", kind: "completedTrip", subject: "Tonle Sap Floating Villages", at: "2026-02-03T18:00:00.000Z" },
].map((a) => ActivityItemSchema.parse(a));

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  bookingUpdates: true,
  tripReminders: true,
  reviewReplies: true,
  promotions: false,
  productNews: false,
};

export const DEFAULT_PRIVACY: PrivacySettings = {
  defaultVisibility: "PUBLIC",
};
