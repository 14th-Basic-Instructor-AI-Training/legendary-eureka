import { describe, expect, it } from "vitest";
import {
  ACTIVITY_FEED,
  BOOKINGS,
  BOOKMARKS,
  MY_REVIEWS,
  TRAVELER_PROFILE,
  TRIP_PLANS,
} from "./fixtures";
import {
  ActivityItemSchema,
  BookingHistorySchema,
  BookmarkSchema,
  MyReviewSchema,
  PasswordChangeSchema,
  PersonalInfoSchema,
  TravelerProfileSchema,
  TripPlanSchema,
} from "./schema";

describe("traveler fixtures conform to their schemas", () => {
  it("profile parses", () => {
    expect(() => TravelerProfileSchema.parse(TRAVELER_PROFILE)).not.toThrow();
  });

  it("every trip plan parses", () => {
    for (const p of TRIP_PLANS) expect(() => TripPlanSchema.parse(p)).not.toThrow();
  });

  it("every bookmark parses and carries each kind", () => {
    for (const b of BOOKMARKS) expect(() => BookmarkSchema.parse(b)).not.toThrow();
    const kinds = new Set(BOOKMARKS.map((b) => b.kind));
    expect(kinds).toEqual(new Set(["destination", "tour", "tripPlan"]));
  });

  it("every booking parses and the statuses span all segments", () => {
    for (const b of BOOKINGS) expect(() => BookingHistorySchema.parse(b)).not.toThrow();
    const statuses = new Set(BOOKINGS.map((b) => b.status));
    expect(statuses.has("pending")).toBe(true);
    expect(statuses.has("approved")).toBe(true);
    expect(statuses.has("completed")).toBe(true);
    expect(statuses.has("cancelled")).toBe(true);
    expect(statuses.has("rejected")).toBe(true);
  });

  it("has a completed booking without a review so 'Leave review' can show", () => {
    expect(BOOKINGS.some((b) => b.status === "completed" && !b.hasReview)).toBe(true);
  });

  it("every review parses", () => {
    for (const r of MY_REVIEWS) expect(() => MyReviewSchema.parse(r)).not.toThrow();
  });

  it("every activity item parses", () => {
    for (const a of ACTIVITY_FEED) expect(() => ActivityItemSchema.parse(a)).not.toThrow();
  });
});

describe("traveler form schemas", () => {
  it("accepts valid personal info and an empty optional phone", () => {
    expect(() =>
      PersonalInfoSchema.parse({
        name: "Dara",
        email: "dara@example.com",
        phone: "",
        bio: "hi",
        avatar: "",
      }),
    ).not.toThrow();
  });

  it("rejects an invalid email", () => {
    expect(
      PersonalInfoSchema.safeParse({
        name: "Dara",
        email: "not-an-email",
        phone: "",
        bio: "",
        avatar: "",
      }).success,
    ).toBe(false);
  });

  it("rejects a bio over 280 characters", () => {
    expect(
      PersonalInfoSchema.safeParse({
        name: "Dara",
        email: "dara@example.com",
        phone: "",
        bio: "x".repeat(281),
        avatar: "",
      }).success,
    ).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    expect(
      PasswordChangeSchema.safeParse({
        currentPassword: "old-secret",
        newPassword: "new-secret-1",
        confirmPassword: "different-1",
      }).success,
    ).toBe(false);
  });

  it("rejects a new password under 8 characters", () => {
    expect(
      PasswordChangeSchema.safeParse({
        currentPassword: "old",
        newPassword: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });
});
