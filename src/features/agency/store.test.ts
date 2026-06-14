import { beforeEach, describe, expect, it } from "vitest";
import { initialActivities, initialBookings } from "./data";
import { useAgencyStore } from "./store";

const reset = () =>
  useAgencyStore.setState({
    activities: initialActivities(),
    bookings: initialBookings(),
  });

const pendingId = "b-1"; // seeded as "pending"

describe("agency store — booking transitions", () => {
  beforeEach(reset);

  it("an agency can approve a pending booking", () => {
    const ok = useAgencyStore.getState().approveBooking("agency", pendingId);
    expect(ok).toBe(true);
    const booking = useAgencyStore.getState().bookings.find((b) => b.id === pendingId);
    expect(booking?.status).toBe("approved");
  });

  it("an agency can reject a pending booking", () => {
    useAgencyStore.getState().rejectBooking("agency", pendingId);
    const booking = useAgencyStore.getState().bookings.find((b) => b.id === pendingId);
    expect(booking?.status).toBe("rejected");
  });

  it("a traveler cannot approve bookings (permission re-check at mutation)", () => {
    const ok = useAgencyStore.getState().approveBooking("traveler", pendingId);
    expect(ok).toBe(false);
    const booking = useAgencyStore.getState().bookings.find((b) => b.id === pendingId);
    expect(booking?.status).toBe("pending");
  });

  it("a guest cannot approve bookings", () => {
    expect(useAgencyStore.getState().approveBooking("guest", pendingId)).toBe(false);
  });
});

describe("agency store — activity creation", () => {
  beforeEach(reset);

  it("an agency can create a draft activity", () => {
    const before = useAgencyStore.getState().activities.length;
    const ok = useAgencyStore.getState().addActivity("agency", {
      title: "Sunset Kayak",
      category: "thingToDo",
      location: "Kampot, Cambodia",
      priceFrom: 19,
    });
    expect(ok).toBe(true);
    const activities = useAgencyStore.getState().activities;
    expect(activities.length).toBe(before + 1);
    expect(activities[0].status).toBe("draft");
  });

  it("a traveler cannot create activities", () => {
    const before = useAgencyStore.getState().activities.length;
    const ok = useAgencyStore.getState().addActivity("traveler", {
      title: "x",
      category: "food",
      location: "y",
      priceFrom: 1,
    });
    expect(ok).toBe(false);
    expect(useAgencyStore.getState().activities.length).toBe(before);
  });
});
