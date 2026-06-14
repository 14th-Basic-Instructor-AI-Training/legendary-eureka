import { beforeEach, describe, expect, it } from "vitest";
import { initialAgencyRequests, initialReports } from "./data";
import { useAdminStore } from "./store";

const reset = () =>
  useAdminStore.setState({
    agencyRequests: initialAgencyRequests(),
    reports: initialReports(),
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
