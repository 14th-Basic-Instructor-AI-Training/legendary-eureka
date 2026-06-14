import { beforeEach, describe, expect, it } from "vitest";
import {
  initialBookings,
  initialNotificationPrefs,
  initialPrivacy,
  initialProfile,
  initialReviews,
} from "./data";
import { useTravelerStore } from "./store";

const reset = () =>
  useTravelerStore.setState({
    profile: initialProfile(),
    bookings: initialBookings(),
    reviews: initialReviews(),
    notificationPrefs: initialNotificationPrefs(),
    privacy: initialPrivacy(),
  });

const get = () => useTravelerStore.getState();
const NON_TRAVELERS = ["guest", "agency", "admin", null] as const;

describe("traveler store — cancel booking", () => {
  beforeEach(reset);
  const upcomingId = "bk-1"; // seeded as "approved"

  it("a traveler can cancel an upcoming booking (sets refund pending)", () => {
    expect(get().cancelBooking("traveler", upcomingId)).toBe(true);
    const booking = get().bookings.find((b) => b.id === upcomingId);
    expect(booking?.status).toBe("cancelled");
    expect(booking?.refundStatus).toBe("pending");
  });

  it("non-travelers cannot cancel bookings", () => {
    for (const actor of NON_TRAVELERS) {
      expect(get().cancelBooking(actor, upcomingId)).toBe(false);
    }
    expect(get().bookings.find((b) => b.id === upcomingId)?.status).toBe("approved");
  });
});

describe("traveler store — reviews", () => {
  beforeEach(reset);
  const reviewId = "rv-1";

  it("a traveler can edit and delete their review", () => {
    expect(get().editReview("traveler", reviewId, { rating: 3, comment: "updated" })).toBe(true);
    expect(get().reviews.find((r) => r.id === reviewId)?.comment).toBe("updated");

    const before = get().reviews.length;
    expect(get().deleteReview("traveler", reviewId)).toBe(true);
    expect(get().reviews.length).toBe(before - 1);
    expect(get().reviews.some((r) => r.id === reviewId)).toBe(false);
  });

  it("non-travelers cannot delete reviews", () => {
    for (const actor of NON_TRAVELERS) {
      expect(get().deleteReview(actor, reviewId)).toBe(false);
    }
    expect(get().reviews.some((r) => r.id === reviewId)).toBe(true);
  });
});

describe("traveler store — profile + settings", () => {
  beforeEach(reset);

  it("a traveler can update their profile name + bio", () => {
    const ok = get().updateProfile("traveler", {
      name: "New Name",
      email: "n@example.com",
      phone: "",
      bio: "new bio",
      avatar: "",
    });
    expect(ok).toBe(true);
    expect(get().profile.name).toBe("New Name");
    expect(get().profile.bio).toBe("new bio");
  });

  it("an empty avatar input leaves the existing avatar intact", () => {
    const original = get().profile.avatar;
    get().updateProfile("traveler", {
      name: "x",
      email: "x@example.com",
      phone: "",
      bio: "",
      avatar: "",
    });
    expect(get().profile.avatar).toBe(original);
  });

  it("non-travelers cannot edit the profile, prefs, privacy, or delete the account", () => {
    for (const actor of NON_TRAVELERS) {
      expect(
        get().updateProfile(actor, {
          name: "x",
          email: "x@example.com",
          phone: "",
          bio: "",
          avatar: "",
        }),
      ).toBe(false);
      expect(get().setPrivacy(actor, "PRIVATE")).toBe(false);
      expect(get().changePassword(actor)).toBe(false);
      expect(get().deleteAccount(actor)).toBe(false);
    }
  });

  it("a traveler can change the default trip-plan visibility", () => {
    expect(get().setPrivacy("traveler", "PRIVATE")).toBe(true);
    expect(get().privacy.defaultVisibility).toBe("PRIVATE");
  });

  it("a traveler can delete their account (guarded action returns true)", () => {
    expect(get().deleteAccount("traveler")).toBe(true);
  });
});
