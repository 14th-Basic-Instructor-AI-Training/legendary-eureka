import type { Role } from "@/features/auth/schema";
import {
  getCalendarMyTrips,
  getCalendarAgencyBookings,
  getPersonalEvents,
  getPersonalCalendars,
} from "@/services/calendar.service";
import type {
  PersonalCalendarResponse,
  PersonalEventResponse,
  TripStatus as ApiTripStatus,
} from "@/lib/api/calendar";
import { CalendarEventSchema, type CalendarEvent, type CalendarEventStatus } from "./schema";

/**
 * Calendar data seam. Getters aggregate trip bookings from the backend with
 * personal events into a unified `CalendarEvent[]`, plus the user's personal
 * calendars (sub-groups under "Personal Events"). The UI renders the bundle.
 * Swapping fixtures for live data is this one file's job.
 */

export type Result<T> = { ok: true; data: T } | { ok: false; error: "load_failed" };

/** A user-defined personal calendar (sub-group under "Personal Events"). */
export interface PersonalCalendarItem {
  id: string;
  name: string;
  color: string;
}

/** Everything the calendar screen needs in one load. */
export interface CalendarBundle {
  events: CalendarEvent[];
  calendars: PersonalCalendarItem[];
}

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
    // Belongs to its assigned personal calendar, or the default "personal" group.
    group: e.calendarId ?? "personal",
    groupColor: PERSONAL_COLOR,
    title: e.title,
    // API sends `null` for an empty description; the schema's optional string
    // rejects null, so coerce to undefined or the whole event gets dropped.
    subtitle: e.description ?? undefined,
    start: e.startDate,
    end: e.endDate,
    // Personal events are date-only ranges → always render as all-day so they
    // appear as bars in month view (timed events only show in day/week view).
    allDay: true,
    isPersonal: true,
  }));
}

// ── Fetch guard ──────────────────────────────────────────────────────────────
// Resolve a list endpoint to an array no matter what: a rejected promise (API
// down / 401) or a null `data` envelope both degrade to `[]` instead of throwing.

async function safeList<T>(p: Promise<T[]>): Promise<T[]> {
  try {
    const v = await p;
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// ── Parse guard ────────────────────────────────────────────────────────────────
// Parse per-record so one malformed booking (e.g. a null requestedDate) is
// dropped rather than failing the whole calendar.

function parseEvents(raw: CalendarEvent[]): CalendarEvent[] {
  const valid: CalendarEvent[] = [];
  for (const item of raw) {
    const parsed = CalendarEventSchema.safeParse(item);
    if (parsed.success) {
      valid.push(parsed.data);
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("[calendar] skipped invalid event", parsed.error.issues, item);
    }
  }
  return valid;
}

// ── Personal calendar mapper (shared by all roles) ─────────────────────────────

function mapPersonalCalendars(raw: PersonalCalendarResponse[]): PersonalCalendarItem[] {
  return raw.map((c) => ({ id: c.id, name: c.name, color: c.color }));
}

// ── Role getters ───────────────────────────────────────────────────────────────

export async function getTravelerEvents(): Promise<Result<CalendarBundle>> {
  try {
    const [trips, personalEvents, personalCalendars] = await Promise.all([
      safeList(getCalendarMyTrips()),
      safeList(getPersonalEvents()),
      safeList(getPersonalCalendars()),
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

    return {
      ok: true,
      data: {
        events: parseEvents([...bookingEvents, ...mapPersonalEvents(personalEvents)]),
        calendars: mapPersonalCalendars(personalCalendars),
      },
    };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getAgencyEvents(): Promise<Result<CalendarBundle>> {
  try {
    const [trips, personalEvents, personalCalendars] = await Promise.all([
      safeList(getCalendarAgencyBookings()),
      safeList(getPersonalEvents()),
      safeList(getPersonalCalendars()),
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

    return {
      ok: true,
      data: {
        events: parseEvents([...bookingEvents, ...mapPersonalEvents(personalEvents)]),
        calendars: mapPersonalCalendars(personalCalendars),
      },
    };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getAdminEvents(): Promise<Result<CalendarBundle>> {
  // Admin uses the same agency-bookings endpoint (returns all platform trips).
  return getAgencyEvents();
}

export function eventsGetterFor(role: Role): () => Promise<Result<CalendarBundle>> {
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
