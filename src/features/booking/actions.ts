"use server";

import { bookTrip, type TripRequest, type TripResponse } from "@/lib/api/bookings";
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
