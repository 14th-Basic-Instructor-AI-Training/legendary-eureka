import { describe, expect, it } from "vitest";
import {
  matchesDestination,
  matchesTour,
  sortDestinations,
  sortTours,
} from "./data";
import { EXPLORE_DESTINATIONS, EXPLORE_TOURS } from "./fixtures";
import {
  EMPTY_DESTINATION_FILTER,
  EMPTY_TOUR_FILTER,
  type DestinationFilter,
  type TourFilter,
} from "./schema";

const destFilter = (patch: Partial<DestinationFilter>): DestinationFilter => ({
  ...EMPTY_DESTINATION_FILTER,
  ...patch,
});
const tourFilter = (patch: Partial<TourFilter>): TourFilter => ({
  ...EMPTY_TOUR_FILTER,
  ...patch,
});

describe("matchesDestination", () => {
  const all = EXPLORE_DESTINATIONS;

  it("empty filter matches everything", () => {
    expect(all.every((d) => matchesDestination(d, EMPTY_DESTINATION_FILTER))).toBe(true);
  });

  it("region multi-select is OR within the facet", () => {
    const out = all.filter((d) =>
      matchesDestination(d, destFilter({ regions: ["Southeast Asia"] })),
    );
    expect(out.length).toBe(all.length); // Cambodia seed is all SE Asia
    expect(all.filter((d) => matchesDestination(d, destFilter({ regions: ["Europe"] })))).toHaveLength(0);
  });

  it("region types filter to the chosen type", () => {
    const beaches = all.filter((d) => matchesDestination(d, destFilter({ regionTypes: ["Beach"] })));
    expect(beaches.length).toBeGreaterThan(0);
    expect(beaches.every((d) => d.regionType === "Beach")).toBe(true);
  });

  it("activity focus matches when any focus overlaps", () => {
    const out = all.filter((d) => matchesDestination(d, destFilter({ activityFocus: ["History"] })));
    expect(out.every((d) => d.activityFocus.includes("History"))).toBe(true);
  });

  it("family-friendly only constrains when true", () => {
    const out = all.filter((d) => matchesDestination(d, destFilter({ familyFriendly: true })));
    expect(out.every((d) => d.familyFriendly)).toBe(true);
  });
});

describe("matchesTour", () => {
  const all = EXPLORE_TOURS;

  it("empty filter matches everything", () => {
    expect(all.every((t) => matchesTour(t, EMPTY_TOUR_FILTER))).toBe(true);
  });

  it("price range excludes tours outside the band", () => {
    const cheap = all.filter((t) => matchesTour(t, tourFilter({ priceMin: 0, priceMax: 100 })));
    expect(cheap.every((t) => t.priceFrom <= 100)).toBe(true);
    expect(cheap.length).toBeGreaterThan(0);
  });

  it("duration checkbox group filters by bucket", () => {
    const halfDay = all.filter((t) => matchesTour(t, tourFilter({ durations: ["half-day"] })));
    expect(halfDay.every((t) => t.durationCategory === "half-day")).toBe(true);
    expect(halfDay.length).toBeGreaterThan(0);
  });

  it("minimum rating is a threshold", () => {
    const top = all.filter((t) => matchesTour(t, tourFilter({ minRating: 4.8 })));
    expect(top.every((t) => t.rating >= 4.8)).toBe(true);
  });

  it("language multi-select matches any listed language", () => {
    const korean = all.filter((t) => matchesTour(t, tourFilter({ languages: ["Korean"] })));
    expect(korean.every((t) => t.languages.includes("Korean"))).toBe(true);
    expect(korean.length).toBeGreaterThan(0);
  });

  it("activity type matches when any type overlaps", () => {
    const water = all.filter((t) => matchesTour(t, tourFilter({ activityTypes: ["Water Sports"] })));
    expect(water.every((t) => t.activityTypes.includes("Water Sports"))).toBe(true);
    expect(water.length).toBeGreaterThan(0);
  });

  it("date range requires availability overlap", () => {
    const out = all.filter((t) =>
      matchesTour(t, tourFilter({ dateFrom: "2027-01-01", dateTo: "2027-03-01" })),
    );
    expect(out.every((t) => t.availableTo >= "2027-01-01" && t.availableFrom <= "2027-03-01")).toBe(true);
  });
});

describe("sorting", () => {
  it("sortTours priceAsc is non-decreasing", () => {
    const sorted = sortTours(EXPLORE_TOURS, "priceAsc");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].priceFrom).toBeGreaterThanOrEqual(sorted[i - 1].priceFrom);
    }
  });

  it("sortTours ratingDesc is non-increasing", () => {
    const sorted = sortTours(EXPLORE_TOURS, "ratingDesc");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].rating).toBeLessThanOrEqual(sorted[i - 1].rating);
    }
  });

  it("sortTours newest orders by createdAt descending", () => {
    const sorted = sortTours(EXPLORE_TOURS, "newest");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].createdAt <= sorted[i - 1].createdAt).toBe(true);
    }
  });

  it("sortDestinations priceAsc is non-decreasing", () => {
    const sorted = sortDestinations(EXPLORE_DESTINATIONS, "priceAsc");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].priceFrom).toBeGreaterThanOrEqual(sorted[i - 1].priceFrom);
    }
  });

  it("does not mutate the input array", () => {
    const before = EXPLORE_TOURS.map((t) => t.id);
    sortTours(EXPLORE_TOURS, "priceAsc");
    expect(EXPLORE_TOURS.map((t) => t.id)).toEqual(before);
  });
});
