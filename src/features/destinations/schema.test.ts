import { describe, expect, it } from "vitest";
import { DESTINATIONS, FEATURED_TOURS, AGENCIES, REVIEWS } from "./fixtures";
import {
  DestinationSchema,
  FeaturedTourSchema,
  AgencyProfileSchema,
  ReviewSchema,
} from "./schema";

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

  it("every destination carries a province + travelType for the Discover filters", () => {
    for (const d of DESTINATIONS) {
      expect(d.province.length).toBeGreaterThan(0);
      expect(d.travelType).toBeTruthy();
    }
  });

  it("every featured tour carries a travelType", () => {
    for (const tour of FEATURED_TOURS) {
      expect(tour.travelType).toBeTruthy();
    }
  });
});

describe("agency + review fixtures", () => {
  it("every agency conforms to AgencyProfileSchema", () => {
    for (const a of AGENCIES) {
      expect(() => AgencyProfileSchema.parse(a)).not.toThrow();
    }
  });

  it("every review conforms to ReviewSchema", () => {
    for (const r of REVIEWS) {
      expect(() => ReviewSchema.parse(r)).not.toThrow();
    }
  });

  it("has at least one approved agency for the Top agencies strip", () => {
    expect(AGENCIES.some((a) => a.status === "APPROVED")).toBe(true);
  });
});
