import { AGENCY_ACTIVITIES, AGENCY_BOOKINGS, AGENCY_PACKAGES } from "./fixtures";
import type { Activity, BookingRequest, Package } from "./schema";

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

/** Initial activities / bookings used to seed the store. */
export function initialActivities(): Activity[] {
  return AGENCY_ACTIVITIES;
}

export function initialBookings(): BookingRequest[] {
  return AGENCY_BOOKINGS;
}
