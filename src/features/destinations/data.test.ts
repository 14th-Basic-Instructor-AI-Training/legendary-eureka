import { describe, expect, it } from "vitest";
import {
  matchesFilter,
  searchDestinations,
  getTopAgencies,
  getRecentReviews,
  PROVINCES,
  TRAVEL_TYPES,
} from "./data";
import { DESTINATIONS } from "./fixtures";
import type { DiscoverFilter } from "./schema";

const base: DiscoverFilter = { query: "" };

describe("matchesFilter", () => {
  it("an empty filter matches every destination", () => {
    expect(DESTINATIONS.every((d) => matchesFilter(d, base))).toBe(true);
  });

  it("filters by category", () => {
    const f: DiscoverFilter = { ...base, category: "food" };
    const result = DESTINATIONS.filter((d) => matchesFilter(d, f));
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((d) => d.category === "food")).toBe(true);
  });

  it("filters by province", () => {
    const f: DiscoverFilter = { ...base, province: "Siem Reap" };
    const result = DESTINATIONS.filter((d) => matchesFilter(d, f));
    expect(result.every((d) => d.province === "Siem Reap")).toBe(true);
  });

  it("filters by travel type", () => {
    const f: DiscoverFilter = { ...base, travelType: "NATURE" };
    const result = DESTINATIONS.filter((d) => matchesFilter(d, f));
    expect(result.every((d) => d.travelType === "NATURE")).toBe(true);
  });

  it("matches a case-insensitive free-text query across name/city/tags", () => {
    const f: DiscoverFilter = { ...base, query: "angkor" };
    const result = DESTINATIONS.filter((d) => matchesFilter(d, f));
    expect(result.some((d) => d.slug === "angkor-wat")).toBe(true);
  });

  it("combines filters (AND semantics)", () => {
    const f: DiscoverFilter = { ...base, province: "Seoul", category: "food" };
    const result = DESTINATIONS.filter((d) => matchesFilter(d, f));
    expect(result.every((d) => d.province === "Seoul" && d.category === "food")).toBe(true);
  });
});

describe("data getters", () => {
  it("searchDestinations returns a successful result narrowed by the filter", async () => {
    const res = await searchDestinations({ ...base, category: "stay" });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data.every((d) => d.category === "stay")).toBe(true);
    }
  });

  it("getTopAgencies returns only approved agencies, best rated first", async () => {
    const res = await getTopAgencies();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.every((a) => a.status === "APPROVED")).toBe(true);
      const ratings = res.data.map((a) => a.rating);
      expect([...ratings].sort((x, y) => y - x)).toEqual(ratings);
    }
  });

  it("getRecentReviews returns reviews newest first", async () => {
    const res = await getRecentReviews();
    expect(res.ok).toBe(true);
    if (res.ok) {
      const dates = res.data.map((r) => r.createdAt);
      expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
    }
  });

  it("derives non-empty province + travel-type filter options", () => {
    expect(PROVINCES.length).toBeGreaterThan(0);
    expect(TRAVEL_TYPES.length).toBe(5);
  });
});
