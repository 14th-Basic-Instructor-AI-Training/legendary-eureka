import { describe, expect, it } from "vitest";
import {
  eventsGetterFor,
  getAdminEvents,
  getAgencyEvents,
  getTravelerEvents,
} from "./data";
import { CalendarEventSchema } from "./schema";

describe("calendar data getters", () => {
  it("traveler events are valid and scoped to booking + trip plans", async () => {
    const res = await getTravelerEvents();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.length).toBeGreaterThan(0);
    for (const e of res.data) expect(CalendarEventSchema.parse(e)).toBeTruthy();
    const types = new Set(res.data.map((e) => e.type));
    expect([...types].sort()).toEqual(["booking", "tripPlan"]);
  });

  it("agency events expose booking + availability windows", async () => {
    const res = await getAgencyEvents();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const types = new Set(res.data.map((e) => e.type));
    expect(types.has("availability")).toBe(true);
    expect(types.has("booking")).toBe(true);
  });

  it("admin events are all bookings", async () => {
    const res = await getAdminEvents();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.every((e) => e.type === "booking")).toBe(true);
  });

  it("eventsGetterFor maps each role to its getter", () => {
    expect(eventsGetterFor("traveler")).toBe(getTravelerEvents);
    expect(eventsGetterFor("agency")).toBe(getAgencyEvents);
    expect(eventsGetterFor("admin")).toBe(getAdminEvents);
  });
});
