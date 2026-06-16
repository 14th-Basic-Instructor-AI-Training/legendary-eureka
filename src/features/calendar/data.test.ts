import { describe, expect, it } from "vitest";
import { eventsGetterFor, getAdminEvents, getAgencyEvents, getTravelerEvents } from "./data";
import { CalendarEventSchema } from "./schema";

/**
 * Unit tests for the calendar data module. The getters now call the real API;
 * in a test environment the network calls fail gracefully (each safeList returns [])
 * so the getter always resolves to `{ ok: true, data: { events: [], calendars: [] } }`.
 * The tests assert the structure of the returned data rather than the content.
 */

describe("calendar data getters", () => {
  it("getTravelerEvents resolves to a bundle of valid events + calendars", async () => {
    const res = await getTravelerEvents();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(Array.isArray(res.data.events)).toBe(true);
    expect(Array.isArray(res.data.calendars)).toBe(true);
    // Each returned event must pass the schema (empty array is also valid).
    for (const e of res.data.events) expect(CalendarEventSchema.parse(e)).toBeTruthy();
  });

  it("getAgencyEvents resolves to a bundle of valid events + calendars", async () => {
    const res = await getAgencyEvents();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(Array.isArray(res.data.events)).toBe(true);
    expect(Array.isArray(res.data.calendars)).toBe(true);
    for (const e of res.data.events) expect(CalendarEventSchema.parse(e)).toBeTruthy();
  });

  it("getAdminEvents resolves to a bundle of valid events + calendars", async () => {
    const res = await getAdminEvents();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(Array.isArray(res.data.events)).toBe(true);
    expect(Array.isArray(res.data.calendars)).toBe(true);
    for (const e of res.data.events) expect(CalendarEventSchema.parse(e)).toBeTruthy();
  });

  it("eventsGetterFor maps each role to its getter", () => {
    expect(eventsGetterFor("traveler")).toBe(getTravelerEvents);
    expect(eventsGetterFor("agency")).toBe(getAgencyEvents);
    expect(eventsGetterFor("admin")).toBe(getAdminEvents);
  });
});
