import { beforeEach, describe, expect, it } from "vitest";
import {
  initialActivities,
  initialAgencyRequests,
  initialReports,
  initialUsers,
} from "./data";
import { useAdminStore } from "./store";

const reset = () =>
  useAdminStore.setState({
    agencyRequests: initialAgencyRequests(),
    reports: initialReports(),
    activities: initialActivities(),
    users: initialUsers(),
  });

describe("admin store — agency onboarding queue", () => {
  beforeEach(reset);

  it("an admin can approve a pending agency request", () => {
    const ok = useAdminStore.getState().approveAgency("admin", "ar-1");
    expect(ok).toBe(true);
    expect(useAdminStore.getState().agencyRequests.find((r) => r.id === "ar-1")?.status).toBe(
      "approved",
    );
  });

  it("a non-admin cannot approve agency requests", () => {
    expect(useAdminStore.getState().approveAgency("agency", "ar-1")).toBe(false);
    expect(useAdminStore.getState().approveAgency("traveler", "ar-1")).toBe(false);
    expect(useAdminStore.getState().approveAgency("guest", "ar-1")).toBe(false);
    expect(useAdminStore.getState().agencyRequests.find((r) => r.id === "ar-1")?.status).toBe(
      "pending",
    );
  });
});

describe("admin store — reports queue", () => {
  beforeEach(reset);

  it("an admin can resolve and dismiss reports", () => {
    expect(useAdminStore.getState().resolveReport("admin", "rp-1")).toBe(true);
    expect(useAdminStore.getState().reports.find((r) => r.id === "rp-1")?.status).toBe("resolved");

    expect(useAdminStore.getState().dismissReport("admin", "rp-2")).toBe(true);
    expect(useAdminStore.getState().reports.find((r) => r.id === "rp-2")?.status).toBe("dismissed");
  });

  it("a traveler cannot act on reports", () => {
    expect(useAdminStore.getState().resolveReport("traveler", "rp-1")).toBe(false);
    expect(useAdminStore.getState().reports.find((r) => r.id === "rp-1")?.status).toBe("open");
  });
});

describe("admin store — activity moderation", () => {
  beforeEach(reset);

  it("an admin can edit any activity", () => {
    const ok = useAdminStore
      .getState()
      .updateActivity("admin", "pa-1", { title: "Renamed", category: "food", status: "draft" });
    expect(ok).toBe(true);
    const a = useAdminStore.getState().activities.find((x) => x.id === "pa-1");
    expect(a?.title).toBe("Renamed");
    expect(a?.category).toBe("food");
    expect(a?.status).toBe("draft");
  });

  it("an admin can delete any activity", () => {
    expect(useAdminStore.getState().deleteActivity("admin", "pa-1")).toBe(true);
    expect(useAdminStore.getState().activities.find((x) => x.id === "pa-1")).toBeUndefined();
  });

  it("non-admins cannot edit or delete activities", () => {
    expect(
      useAdminStore
        .getState()
        .updateActivity("agency", "pa-1", { title: "x", category: "food", status: "draft" }),
    ).toBe(false);
    expect(useAdminStore.getState().deleteActivity("traveler", "pa-1")).toBe(false);
    expect(useAdminStore.getState().deleteActivity("guest", "pa-1")).toBe(false);
    expect(useAdminStore.getState().activities.find((x) => x.id === "pa-1")?.title).toBe(
      "Angkor Wat Sunrise Tour",
    );
  });
});

describe("admin store — user moderation", () => {
  beforeEach(reset);

  it("an admin can suspend, ban, and reactivate a user", () => {
    expect(useAdminStore.getState().suspendUser("admin", "u-traveler")).toBe(true);
    expect(useAdminStore.getState().users.find((u) => u.id === "u-traveler")?.status).toBe(
      "suspended",
    );

    expect(useAdminStore.getState().banUser("admin", "u-traveler")).toBe(true);
    expect(useAdminStore.getState().users.find((u) => u.id === "u-traveler")?.status).toBe("banned");

    expect(useAdminStore.getState().reactivateUser("admin", "u-traveler")).toBe(true);
    expect(useAdminStore.getState().users.find((u) => u.id === "u-traveler")?.status).toBe("active");
  });

  it("non-admins cannot moderate users", () => {
    expect(useAdminStore.getState().suspendUser("agency", "u-traveler")).toBe(false);
    expect(useAdminStore.getState().banUser("traveler", "u-traveler")).toBe(false);
    expect(useAdminStore.getState().reactivateUser("guest", "u-traveler-2")).toBe(false);
    expect(useAdminStore.getState().users.find((u) => u.id === "u-traveler")?.status).toBe("active");
  });
});
