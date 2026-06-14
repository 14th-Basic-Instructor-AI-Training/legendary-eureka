import { describe, expect, it } from "vitest";
import { DESTINATIONS, FEATURED_TOURS } from "./fixtures";
import { DestinationSchema, FeaturedTourSchema } from "./schema";

describe("destinations fixtures", () => {
  it("every destination conforms to DestinationSchema", () => {
    for (const d of DESTINATIONS) {
      expect(() => DestinationSchema.parse(d)).not.toThrow();
    }
  });

  it("every featured tour conforms to FeaturedTourSchema", () => {
    for (const tour of FEATURED_TOURS) {
      expect(() => FeaturedTourSchema.parse(tour)).not.toThrow();
    }
  });

  it("has at least one featured and one trending destination for the landing rows", () => {
    expect(DESTINATIONS.some((d) => d.featured)).toBe(true);
    expect(DESTINATIONS.some((d) => d.trending)).toBe(true);
    expect(DESTINATIONS.some((d) => d.category === "thingToDo")).toBe(true);
  });

  it("uses unique slugs (stable keys + future routing)", () => {
    const slugs = DESTINATIONS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
