import { describe, expect, it } from "vitest";
import { mapDestination } from "./destination.service";
import { mapFeaturedTour } from "./tour.service";
import { mapAgencyProfile } from "./agency.service";
import { mapReview } from "./review.service";
import { DestinationResponseSchema, DestinationPageSchema } from "@/types/destination";
import { TourPackageResponseSchema } from "@/types/tour";
import { AgencyProfileResponseSchema } from "@/types/agency";
import { RecentReviewResponseSchema } from "@/types/review";

/**
 * Unit tests for the landing-page service layer: the Zod response schemas (validation
 * boundary) and the DTO→domain mappers. No network — these exercise mapping + parsing only.
 */

describe("destination service", () => {
  it("validates and maps a destination DTO, preferring heroImage and aliased coords", () => {
    const dto = DestinationResponseSchema.parse({
      id: "d1",
      slug: "angkor-wat",
      name: "Angkor Wat",
      description: "World's largest religious monument.",
      shortDescription: "Icon of Cambodia.",
      province: "SIEM_REAP",
      travelType: "CULTURAL",
      category: "DESTINATION",
      coverImageUrl: "https://img/cover.jpg",
      heroImage: "https://img/hero.jpg",
      priceFrom: 25,
      currency: "USD",
      lat: 13.41,
      lng: 103.86,
      featured: true,
      trending: true,
      tags: ["UNESCO"],
      rating: 4.5,
      reviewCount: 12,
      photos: ["https://img/1.jpg"],
    });

    const mapped = mapDestination(dto);
    expect(mapped.heroImage).toBe("https://img/hero.jpg");
    expect(mapped.category).toBe("destination");
    expect(mapped.travelType).toBe("CULTURAL");
    expect(mapped.lat).toBe(13.41);
    expect(mapped.gallery).toEqual(["https://img/1.jpg"]);
  });

  it("falls back to a safe category/travelType and defaults missing numbers", () => {
    const dto = DestinationResponseSchema.parse({
      id: "d2",
      slug: "x",
      name: "X",
      category: "FOOD",
      travelType: "UNKNOWN_TYPE",
    });
    const mapped = mapDestination(dto);
    expect(mapped.category).toBe("food");
    expect(mapped.travelType).toBe("CULTURAL"); // unknown → fallback
    expect(mapped.priceFrom).toBe(0);
    expect(mapped.currency).toBe("USD");
  });

  it("rejects a payload missing required fields", () => {
    expect(() => DestinationResponseSchema.parse({ slug: "x" })).toThrow();
  });
});

describe("paged schema", () => {
  it("validates a Spring PagedResponse envelope", () => {
    const page = DestinationPageSchema.parse({
      content: [{ id: "d1", slug: "s", name: "N" }],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    expect(page.content).toHaveLength(1);
  });
});

describe("tour service", () => {
  it("maps duration/price aliases and slug fallback", () => {
    const dto = TourPackageResponseSchema.parse({
      id: "t1",
      title: "Angkor Discovery",
      agencyName: "Angkor Tours",
      travelType: "CULTURAL",
      coverImageUrl: "https://img/t.jpg",
      durationDays: 3,
      price: 299,
      currency: "USD",
      rating: 5,
      reviewCount: 1,
    });
    const mapped = mapFeaturedTour(dto);
    expect(mapped.slug).toBe("t1"); // no slug → falls back to id
    expect(mapped.days).toBe(3);
    expect(mapped.priceFrom).toBe(299);
    expect(mapped.image).toBe("https://img/t.jpg");
  });
});

describe("agency service", () => {
  it("maps avatar→logo, address→province, averageRating→rating", () => {
    const dto = AgencyProfileResponseSchema.parse({
      id: "a1",
      slug: "angkor",
      agencyName: "Angkor Tours",
      avatarUrl: "https://img/logo.png",
      address: "Siem Reap",
      status: "APPROVED",
      averageRating: 4.8,
      reviewCount: 9,
    });
    const mapped = mapAgencyProfile(dto);
    expect(mapped.logo).toBe("https://img/logo.png");
    expect(mapped.province).toBe("Siem Reap");
    expect(mapped.rating).toBe(4.8);
    expect(mapped.status).toBe("APPROVED");
  });
});

describe("review service", () => {
  it("uses the reviewer avatar when present", () => {
    const dto = RecentReviewResponseSchema.parse({
      id: "r1",
      reviewerName: "Dara Kim",
      reviewerAvatarUrl: "https://img/dara.png",
      rating: 5,
      comment: "Unforgettable!",
      createdAt: "2026-06-01T00:00:00Z",
    });
    expect(mapReview(dto).authorAvatar).toBe("https://img/dara.png");
  });

  it("falls back to a generated avatar and 'Traveler' name when missing", () => {
    const dto = RecentReviewResponseSchema.parse({
      id: "r2",
      rating: 4,
      createdAt: "2026-06-02T00:00:00Z",
    });
    const mapped = mapReview(dto);
    expect(mapped.authorName).toBe("Traveler");
    expect(mapped.authorAvatar).toContain("dicebear");
    expect(mapped.comment).toBe("");
  });
});
