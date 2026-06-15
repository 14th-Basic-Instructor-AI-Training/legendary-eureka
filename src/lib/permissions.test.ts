import { describe, expect, it } from "vitest";
import {
  assertCan,
  can,
  dashboardPathFor,
  homePathFor,
  PermissionError,
} from "./permissions";

describe("permissions.can", () => {
  it("lets everyone, including guests, browse public content", () => {
    expect(can("guest", "browse")).toBe(true);
    expect(can("traveler", "browse")).toBe(true);
    expect(can("agency", "browse")).toBe(true);
    expect(can("admin", "browse")).toBe(true);
  });

  it("treats a null actor as a read-only guest", () => {
    expect(can(null, "browse")).toBe(true);
    expect(can(null, "book")).toBe(false);
    expect(can(null, "manageAgencyRequests")).toBe(false);
  });

  it("gates traveler-only actions", () => {
    expect(can("traveler", "book")).toBe(true);
    expect(can("traveler", "requestAgencyUpgrade")).toBe(true);
    expect(can("guest", "book")).toBe(false);
    expect(can("agency", "book")).toBe(false);
    expect(can("admin", "book")).toBe(false);
  });

  it("gates tour booking and review writing to travelers", () => {
    expect(can("traveler", "bookTour")).toBe(true);
    expect(can("traveler", "writeReview")).toBe(true);
    expect(can("guest", "bookTour")).toBe(false);
    expect(can("guest", "writeReview")).toBe(false);
    expect(can("agency", "bookTour")).toBe(false);
    expect(can("agency", "writeReview")).toBe(false);
    expect(can("admin", "bookTour")).toBe(false);
    expect(can("admin", "writeReview")).toBe(false);
    expect(can(null, "bookTour")).toBe(false);
  });

  it("lets only travelers edit their own profile", () => {
    expect(can("traveler", "editOwnProfile")).toBe(true);
    expect(can("guest", "editOwnProfile")).toBe(false);
    expect(can("agency", "editOwnProfile")).toBe(false);
    expect(can("admin", "editOwnProfile")).toBe(false);
    expect(can(null, "editOwnProfile")).toBe(false);
  });

  it("gates agency-only actions", () => {
    expect(can("agency", "approveBookings")).toBe(true);
    expect(can("agency", "manageOwnActivities")).toBe(true);
    expect(can("traveler", "approveBookings")).toBe(false);
    expect(can("admin", "approveBookings")).toBe(false);
  });

  it("gates admin-only actions", () => {
    expect(can("admin", "manageAgencyRequests")).toBe(true);
    expect(can("admin", "manageReports")).toBe(true);
    expect(can("admin", "editAnyActivity")).toBe(true);
    expect(can("agency", "manageAgencyRequests")).toBe(false);
    expect(can("traveler", "manageReports")).toBe(false);
  });

  it("restricts analytics to admins", () => {
    expect(can("admin", "viewAnalytics")).toBe(true);
    expect(can("agency", "viewAnalytics")).toBe(false);
    expect(can("traveler", "viewAnalytics")).toBe(false);
    expect(can("guest", "viewAnalytics")).toBe(false);
    expect(can(null, "viewAnalytics")).toBe(false);
  });

  it("restricts edit-request approval and system config to admins", () => {
    expect(can("admin", "manageEditRequests")).toBe(true);
    expect(can("admin", "configureSystem")).toBe(true);
    expect(can("admin", "managePackages")).toBe(true);
    expect(can("agency", "manageEditRequests")).toBe(false);
    expect(can("agency", "configureSystem")).toBe(false);
    expect(can("traveler", "configureSystem")).toBe(false);
  });
});

describe("permissions.assertCan", () => {
  it("throws a PermissionError when denied", () => {
    expect(() => assertCan("guest", "book")).toThrowError(PermissionError);
  });

  it("does not throw when allowed", () => {
    expect(() => assertCan("traveler", "book")).not.toThrow();
  });
});

describe("role routing", () => {
  it("sends travelers and agencies to the landing page, admins to the control panel", () => {
    expect(homePathFor("traveler")).toBe("/");
    expect(homePathFor("agency")).toBe("/");
    expect(homePathFor("admin")).toBe("/admin");
  });

  it("maps each role to its own dashboard/workspace/control panel", () => {
    expect(dashboardPathFor("traveler")).toBe("/traveler");
    expect(dashboardPathFor("agency")).toBe("/agency");
    expect(dashboardPathFor("admin")).toBe("/admin");
  });
});
