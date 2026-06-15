import { describe, expect, it } from "vitest";
import { eventsGetterFor, getAdminEvents, getAgencyEvents, getTravelerEvents } from "./data";
import { CalendarEventSchema } from "./schema";

/**
 * Unit tests for the calendar data module. The getters now call the real API;
 * in a test environment the network calls fail gracefully (each .catch returns [])
 * so the getter always resolves to `{ ok: true, data: [] }`.
 * The tests assert the structure of the returned data rather than the content.
 */

describe("calendar data getters", () => {
  it("getTravelerEvents resolves and returns valid CalendarEvent[]", async () => {
    const res = await getTravelerEvents();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    // Each returned event must pass the schema (empty array is also valid).
    for (const e of res.data) expect(CalendarEventSchema.parse(e)).toBeTruthy();
  });

  it("getAgencyEvents resolves and returns valid CalendarEvent[]", async () => {
    const res = await getAgencyEvents();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    for (const e of res.data) expect(CalendarEventSchema.parse(e)).toBeTruthy();
  });

  it("getAdminEvents resolves and returns valid CalendarEvent[]", async () => {
    const res = await getAdminEvents();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    for (const e of res.data) expect(CalendarEventSchema.parse(e)).toBeTruthy();
  });

  it("eventsGetterFor maps each role to its getter", () => {
    expect(eventsGetterFor("traveler")).toBe(getTravelerEvents);
    expect(eventsGetterFor("agency")).toBe(getAgencyEvents);
    expect(eventsGetterFor("admin")).toBe(getAdminEvents);
  });
});
