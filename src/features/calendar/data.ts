import type { Role } from "@/features/auth/schema";
import {
  getCalendarMyTrips,
  getCalendarAgencyBookings,
  getPersonalEvents,
  type CalendarTripEntry,
  type PersonalEventResponse,
  type TripStatus as ApiTripStatus,
} from "@/lib/api/calendar";
import { CalendarEventSchema, type CalendarEvent, type CalendarEventStatus } from "./schema";

/**
 * Calendar data seam. Getters aggregate trip bookings from the backend with
 * personal events into a unified `CalendarEvent[]` that the UI renders.
 * Swapping fixtures for live data is this one file's job.
 */

export type Result<T> = { ok: true; data: T } | { ok: false; error: "load_failed" };

// ── Colour palette for per-package agency groups ──────────────────────────────

const PACKAGE_COLORS = [
  "#2F6FED",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
  "#EF4444",
];

const PERSONAL_COLOR = "#10B981";

// ── Status mapping ─────────────────────────────────────────────────────────────

function mapStatus(s: ApiTripStatus): CalendarEventStatus {
  return s.toLowerCase() as CalendarEventStatus;
}

// ── End-date helper ────────────────────────────────────────────────────────────

function computeEndDate(startDate: string, durationDays: number | null): string {
  if (!startDate) return startDate;
  if (!durationDays || durationDays <= 1) return startDate;
  const d = new Date(startDate + "T00:00:00");
  d.setDate(d.getDate() + durationDays - 1);
  return d.toISOString().slice(0, 10);
}

// ── Personal event mapper (shared by all roles) ────────────────────────────────

function mapPersonalEvents(events: PersonalEventResponse[]): CalendarEvent[] {
  return events.map((e) => ({
    id: e.id,
    type: "personal" as const,
    group: "personal",
    groupColor: PERSONAL_COLOR,
    title: e.title,
    subtitle: e.description,
    start: e.startDate,
    end: e.endDate,
    allDay: e.allDay,
    isPersonal: true,
  }));
}

// ── Parse guard ────────────────────────────────────────────────────────────────

function parseResult(raw: CalendarEvent[]): Result<CalendarEvent[]> {
  const parsed = CalendarEventSchema.array().safeParse(raw);
  return parsed.success ? { ok: true, data: parsed.data } : { ok: false, error: "load_failed" };
}

// ── Role getters ───────────────────────────────────────────────────────────────

export async function getTravelerEvents(): Promise<Result<CalendarEvent[]>> {
  try {
    const [trips, personalEvents] = await Promise.all([
      getCalendarMyTrips().catch(() => [] as CalendarTripEntry[]),
      getPersonalEvents().catch(() => [] as PersonalEventResponse[]),
    ]);

    const bookingEvents: CalendarEvent[] = trips.map((t) => ({
      id: t.id,
      type: "booking" as const,
      group: "bookings",
      groupColor: "#2F6FED",
      title: t.tourPackageTitle,
      subtitle: t.agencyName,
      start: t.requestedDate,
      end: computeEndDate(t.requestedDate, t.durationDays),
      allDay: true,
      status: mapStatus(t.status),
      isPersonal: false,
    }));

    return parseResult([...bookingEvents, ...mapPersonalEvents(personalEvents)]);
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getAgencyEvents(): Promise<Result<CalendarEvent[]>> {
  try {
    const [trips, personalEvents] = await Promise.all([
      getCalendarAgencyBookings().catch(() => [] as CalendarTripEntry[]),
      getPersonalEvents().catch(() => [] as PersonalEventResponse[]),
    ]);

    // Assign a stable color per tour package, in first-seen order.
    const packageColorMap = new Map<string, string>();
    trips.forEach((t) => {
      if (!packageColorMap.has(t.tourPackageId)) {
        packageColorMap.set(
          t.tourPackageId,
          PACKAGE_COLORS[packageColorMap.size % PACKAGE_COLORS.length] ?? PACKAGE_COLORS[0],
        );
      }
    });

    const bookingEvents: CalendarEvent[] = trips.map((t) => ({
      id: t.id,
      type: "booking" as const,
      group: t.tourPackageId,
      groupLabel: t.tourPackageTitle,
      groupColor: packageColorMap.get(t.tourPackageId),
      title: t.travelerName ?? "Traveler",
      subtitle: t.tourPackageTitle,
      start: t.requestedDate,
      end: computeEndDate(t.requestedDate, t.durationDays),
      allDay: true,
      status: mapStatus(t.status),
      isPersonal: false,
    }));

    return parseResult([...bookingEvents, ...mapPersonalEvents(personalEvents)]);
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getAdminEvents(): Promise<Result<CalendarEvent[]>> {
  // Admin uses the same agency-bookings endpoint (returns all platform trips).
  return getAgencyEvents();
}

export function eventsGetterFor(role: Role): () => Promise<Result<CalendarEvent[]>> {
  switch (role) {
    case "agency":
      return getAgencyEvents;
    case "admin":
      return getAdminEvents;
    case "traveler":
    default:
      return getTravelerEvents;
  }
}
