import {
  ADMIN_ACTIVITIES,
  ADMIN_AGENCY_REQUESTS,
  ADMIN_BOOKINGS,
  ADMIN_DASHBOARD,
  ADMIN_EDIT_REQUESTS,
  ADMIN_PACKAGES,
  ADMIN_REPORTS,
  ADMIN_USERS,
  INITIAL_SYSTEM_SETTINGS,
} from "./fixtures";
import type {
  AdminBooking,
  AdminDashboard,
  AdminPackage,
  AgencyRequest,
  EditRequest,
  PlatformActivity,
  Report,
  SystemSettings,
  UserSummary,
} from "./schema";

/**
 * Read seam for the admin control panel. The mutable control surfaces —
 * agency-request, report, activity, and user queues (with their transitions) —
 * are seeded from the `initial*` helpers into the Zustand store, which re-checks
 * permissions before every mutation. The dashboard metrics stay a read getter.
 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: "load_failed" };

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/** Read-only analytics for the admin overview dashboard (mock metrics today). */
export async function getAdminDashboard(): Promise<Result<AdminDashboard>> {
  await delay();
  return { ok: true, data: ADMIN_DASHBOARD };
}

/** Initial collections used to seed the store. */
export function initialAgencyRequests(): AgencyRequest[] {
  return ADMIN_AGENCY_REQUESTS;
}

export function initialReports(): Report[] {
  return ADMIN_REPORTS;
}

export function initialActivities(): PlatformActivity[] {
  return ADMIN_ACTIVITIES;
}

export function initialUsers(): UserSummary[] {
  return ADMIN_USERS;
}

export function initialEditRequests(): EditRequest[] {
  return ADMIN_EDIT_REQUESTS;
}

export function initialAdminPackages(): AdminPackage[] {
  return ADMIN_PACKAGES;
}

export function initialAdminBookings(): AdminBooking[] {
  return ADMIN_BOOKINGS;
}

export function initialSystemSettings(): SystemSettings {
  return INITIAL_SYSTEM_SETTINGS;
}
