import { describe, expect, it } from "vitest";
import { EXPLORE_DESTINATIONS, EXPLORE_TOURS } from "./fixtures";
import {
  ExploreDestinationSchema,
  ExploreTourSchema,
  DestinationFilterSchema,
  TourFilterSchema,
} from "./schema";

describe("explore fixtures", () => {
  it("seeds a non-empty catalog", () => {
    expect(EXPLORE_DESTINATIONS.length).toBeGreaterThan(0);
    expect(EXPLORE_TOURS.length).toBeGreaterThan(0);
  });

  it("every destination conforms to the schema", () => {
    for (const d of EXPLORE_DESTINATIONS) {
      expect(() => ExploreDestinationSchema.parse(d)).not.toThrow();
      expect(d.topActivities.length).toBeLessThanOrEqual(3);
    }
  });

  it("every tour conforms to the schema", () => {
    for (const t of EXPLORE_TOURS) {
      expect(() => ExploreTourSchema.parse(t)).not.toThrow();
      expect(t.availableFrom <= t.availableTo).toBe(true);
    }
  });
});

describe("explore filter schemas", () => {
  it("default destination filter is the empty (show-everything) filter", () => {
    const f = DestinationFilterSchema.parse({});
    expect(f.regions).toEqual([]);
    expect(f.familyFriendly).toBe(false);
    expect(f.province).toBeUndefined();
  });

  it("default tour filter spans the full price range", () => {
    const f = TourFilterSchema.parse({});
    expect(f.priceMin).toBe(0);
    expect(f.priceMax).toBe(2000);
    expect(f.durations).toEqual([]);
  });
});
