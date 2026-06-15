"use server";

import { approveTrip, rejectTrip, completeTrip } from "@/services/bookings.service";
import { ApiError } from "@/lib/api/client";

/**
 * Agency booking-decision server actions. Each wraps a `PUT /trips/{id}/…`
 * call; the caller refreshes the server-fetched incoming list afterwards.
 */
export type DecisionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): DecisionResult {
  return { ok: false, error: e instanceof ApiError ? e.message : "Something went wrong" };
}

export async function approveBookingAction(id: string, agencyNote?: string): Promise<DecisionResult> {
  try {
    await approveTrip(id, agencyNote ? { agencyNote } : undefined);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function rejectBookingAction(id: string, agencyNote?: string): Promise<DecisionResult> {
  try {
    await rejectTrip(id, agencyNote ? { agencyNote } : undefined);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function completeBookingAction(id: string, agencyNote?: string): Promise<DecisionResult> {
  try {
    await completeTrip(id, agencyNote ? { agencyNote } : undefined);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
