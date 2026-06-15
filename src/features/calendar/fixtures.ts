import type { CalendarEvent } from "./schema";

/**
 * Mock calendar events, scoped per role. Dates cluster around mid-2026 so the
 * default month view lands on populated weeks. These live behind `data.ts`
 * getters — components never import this file directly (see feature-structure).
 *
 * When the backend lands, the getters swap these for an aggregation of the live
 * booking / trip-plan / availability records; the `CalendarEvent` shape stays.
 */

/** Traveler: their own booked trips + authored trip plans. */
export const TRAVELER_EVENTS: CalendarEvent[] = [
  {
    id: "tev-1",
    type: "booking",
    title: "Angkor Sunrise Tour",
    subtitle: "Siem Reap Explorers",
    start: "2026-06-20",
    end: "2026-06-22",
    allDay: true,
    status: "approved",
  },
  {
    id: "tev-2",
    type: "booking",
    title: "Koh Rong Island Getaway",
    subtitle: "Island Hopper Co.",
    start: "2026-06-28",
    end: "2026-06-30",
    allDay: true,
    status: "pending",
  },
  {
    id: "tev-3",
    type: "tripPlan",
    title: "Temples & Sunsets",
    subtitle: "Siem Reap",
    start: "2026-06-18",
    end: "2026-06-23",
    allDay: true,
  },
  {
    id: "tev-4",
    type: "tripPlan",
    title: "Phnom Penh Food Crawl",
    subtitle: "Phnom Penh",
    start: "2026-06-10",
    end: "2026-06-12",
    allDay: true,
  },
];

/** Agency: incoming booking requests/confirmed tours + open availability windows. */
export const AGENCY_EVENTS: CalendarEvent[] = [
  {
    id: "aev-1",
    type: "booking",
    title: "Family of 4 · Angkor Discovery",
    subtitle: "Sophea Chan",
    start: "2026-06-19",
    end: "2026-06-21",
    allDay: true,
    status: "pending",
  },
  {
    id: "aev-2",
    type: "booking",
    title: "Mekong Sunset Cruise",
    subtitle: "Daniel Park · 2 guests",
    start: "2026-06-24",
    end: "2026-06-26",
    allDay: true,
    status: "approved",
  },
  {
    id: "aev-3",
    type: "availability",
    title: "Angkor Discovery — open for booking",
    start: "2026-06-01",
    end: "2026-06-30",
    allDay: true,
  },
  {
    id: "aev-4",
    type: "availability",
    title: "Tonlé Sap Eco Tour — open for booking",
    start: "2026-06-15",
    end: "2026-07-15",
    allDay: true,
  },
];

/** Admin: every booking across the platform (read-only oversight). */
export const ADMIN_EVENTS: CalendarEvent[] = [
  {
    id: "dev-1",
    type: "booking",
    title: "Angkor Sunrise · Siem Reap Explorers",
    subtitle: "Sophea Chan",
    start: "2026-06-20",
    end: "2026-06-22",
    allDay: true,
    status: "approved",
  },
  {
    id: "dev-2",
    type: "booking",
    title: "Koh Rong Getaway · Island Hopper Co.",
    subtitle: "Maly Sok",
    start: "2026-06-28",
    end: "2026-06-30",
    allDay: true,
    status: "pending",
  },
  {
    id: "dev-3",
    type: "booking",
    title: "Mekong Cruise · River Journeys",
    subtitle: "Daniel Park",
    start: "2026-06-05",
    end: "2026-06-07",
    allDay: true,
    status: "completed",
  },
  {
    id: "dev-4",
    type: "booking",
    title: "Bokor Highlands · Kampot Trails",
    subtitle: "Nara Tep",
    start: "2026-06-12",
    end: "2026-06-14",
    allDay: true,
    status: "cancelled",
  },
];
