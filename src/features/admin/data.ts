import {
  ADMIN_ACTIVITIES,
  ADMIN_AGENCY_REQUESTS,
  ADMIN_DASHBOARD,
  ADMIN_REPORTS,
  ADMIN_USERS,
} from "./fixtures";
import type {
  AdminDashboard,
  AgencyRequest,
  PlatformActivity,
  Report,
  UserSummary,
} from "./schema";

/**
 * Read seam for the admin control panel. Activities + users are read-only here;
 * the mutable agency-request and report queues (with their transitions) live in
 * the Zustand store.
 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: "load_failed" };

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getPlatformActivities(): Promise<Result<PlatformActivity[]>> {
  await delay();
  return { ok: true, data: ADMIN_ACTIVITIES };
}

export async function getUsers(): Promise<Result<UserSummary[]>> {
  await delay();
  return { ok: true, data: ADMIN_USERS };
}

/** Read-only analytics for the admin overview dashboard (mock metrics today). */
export async function getAdminDashboard(): Promise<Result<AdminDashboard>> {
  await delay();
  return { ok: true, data: ADMIN_DASHBOARD };
}

/** Initial queues used to seed the store. */
export function initialAgencyRequests(): AgencyRequest[] {
  return ADMIN_AGENCY_REQUESTS;
}

export function initialReports(): Report[] {
  return ADMIN_REPORTS;
}
