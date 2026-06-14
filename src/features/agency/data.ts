import {
  AGENCY_ACTIVITIES,
  AGENCY_BOOKINGS,
  AGENCY_DASHBOARD_STATS,
  AGENCY_PACKAGES,
  AGENCY_PROFILE,
  AGENCY_REVIEWS,
  PROFILE_REVIEWS,
} from "./fixtures";
import type {
  Activity,
  AgencyDashboardStats,
  AgencyProfile,
  AgencyReview,
  BookingRequest,
  Package,
  ProfileReview,
} from "./schema";

/**
 * Read seam for the agency workspace. Packages are read-only here; the mutable
 * activities + booking-request state (with approve/reject transitions) lives in
 * the Zustand store. Functions return typed results.
 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: "load_failed" };

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getPackages(): Promise<Result<Package[]>> {
  await delay();
  return { ok: true, data: AGENCY_PACKAGES };
}

export function initialPackages(): Package[] {
  return AGENCY_PACKAGES;
}

export async function getRecentReviews(): Promise<Result<AgencyReview[]>> {
  await delay();
  return { ok: true, data: AGENCY_REVIEWS };
}

export async function getDashboardStats(): Promise<Result<AgencyDashboardStats>> {
  await delay();
  return { ok: true, data: AGENCY_DASHBOARD_STATS };
}

/** Initial activities / bookings used to seed the store. */
export function initialActivities(): Activity[] {
  return AGENCY_ACTIVITIES;
}

export function initialBookings(): BookingRequest[] {
  return AGENCY_BOOKINGS;
}

export async function getAgencyProfile(): Promise<Result<AgencyProfile>> {
  await delay();
  return { ok: true, data: AGENCY_PROFILE };
}

export async function getProfileReviews(): Promise<Result<ProfileReview[]>> {
  await delay();
  return { ok: true, data: PROFILE_REVIEWS };
}
