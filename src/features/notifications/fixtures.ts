import { NotificationSchema, type Notification } from "./schema";

/**
 * Mock notifications for the traveler inbox. Parsed through the schema so they
 * can't drift; `targetHref`s point at real in-app routes and `createdAt`s are
 * fixed ISO strings (no runtime `Date.now()`). Title/body are content records
 * (like booking tour names) — the UI chrome around them is translated.
 */
export const NOTIFICATIONS: Notification[] = [
  {
    id: "nt-1",
    type: "booking-approved",
    category: "bookings",
    title: "Booking approved",
    body: "Angkor Trails approved your booking for Angkor Sunrise: 3-Day Explorer.",
    createdAt: "2026-06-14T07:30:00.000Z",
    read: false,
    targetHref: "/traveler/bookings/bk-1",
  },
  {
    id: "nt-2",
    type: "comment",
    category: "tripPlans",
    title: "New comment on your trip plan",
    body: "Sophie commented on “Temples & Sunsets in Siem Reap”: Adding Banteay Srei was a great call!",
    createdAt: "2026-06-14T04:10:00.000Z",
    read: false,
    targetHref: "/traveler/profile?tab=tripPlans",
  },
  {
    id: "nt-3",
    type: "reminder",
    category: "bookings",
    title: "Your tour is in 2 days",
    body: "Get ready — Angkor Sunrise: 3-Day Explorer departs Jul 20. Pickup at 4:45 AM.",
    createdAt: "2026-06-13T09:00:00.000Z",
    read: false,
    targetHref: "/traveler/bookings/bk-1",
  },
  {
    id: "nt-4",
    type: "reply",
    category: "comments",
    title: "Reply to your comment",
    body: "Hallasan Tours replied to your question about the Jeju Island Escape itinerary.",
    createdAt: "2026-06-12T15:20:00.000Z",
    read: true,
    targetHref: "/tours/jeju-island-escape",
  },
  {
    id: "nt-5",
    type: "booking-rejected",
    category: "bookings",
    title: "Booking could not be confirmed",
    body: "Hanok Walks is fully booked on May 9. Pick another date to rebook the Seoul Old Town Heritage Walk.",
    createdAt: "2026-06-11T11:45:00.000Z",
    read: true,
    targetHref: "/tours/seoul-old-town-walk",
  },
  {
    id: "nt-6",
    type: "report-update",
    category: "reports",
    title: "Update on your report",
    body: "Our trust & safety team has reviewed your report and taken action. Thanks for helping keep Jalat safe.",
    createdAt: "2026-06-09T08:00:00.000Z",
    read: true,
    targetHref: "/traveler/notifications",
  },
  {
    id: "nt-7",
    type: "system",
    category: "system",
    title: "Welcome to Jalat",
    body: "Your traveler account is verified. Start by bookmarking tours and building your first trip plan.",
    createdAt: "2026-06-07T10:00:00.000Z",
    read: true,
    targetHref: "/traveler/profile?tab=overview",
  },
].map((n) => NotificationSchema.parse(n));
