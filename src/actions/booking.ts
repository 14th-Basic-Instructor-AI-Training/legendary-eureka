"use server";

import { bookTrip, cancelTrip } from "@/services/bookings.service";
import type { TripRequest, TripResponse } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";

/**
 * Traveler booking server action. Runs on the server (so it can attach the
 * session token via `apiFetch`) and POSTs to `/trips`, which routes the request
 * to the agency that owns the tour package.
 */
export type CreateBookingResult =
  | { ok: true; trip: TripResponse }
  | { ok: false; error: string };

export async function createBookingAction(body: TripRequest): Promise<CreateBookingResult> {
  try {
    const trip = await bookTrip(body);
    return { ok: true, trip };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : "Something went wrong" };
  }
}

export type CancelBookingResult = { ok: true } | { ok: false; error: string };

/**
 * Traveler cancels their own booking (`PUT /trips/{id}/cancel`). The backend
 * enforces ownership + the PENDING/APPROVED-only transition and notifies the
 * owning agency.
 */
export async function cancelBookingAction(id: string): Promise<CancelBookingResult> {
  try {
    await cancelTrip(id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : "Something went wrong" };
  }
}
