"use server";

import {
  approveEditRequest,
  rejectEditRequest,
  updateAdminAgency,
} from "@/services/admin.service";
import {
  approveDestination,
  rejectDestination,
} from "@/services/destinations.service";
import { ApiError } from "@/lib/api/client";

/**
 * Server actions for admin request moderation. These run on the server (so they
 * can use the session token via `apiFetch`) and are invoked from client
 * components; the caller calls `router.refresh()` afterwards to re-run the
 * server fetch. Mirrors the pattern in `features/tours/actions.ts`.
 */
type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof ApiError ? e.message : "Something went wrong" };
}

/** PUT /admin/agencies/{id} — confirm a become-an-agency request. */
export async function approveAgencyAction(id: string): Promise<ActionResult> {
  try {
    await updateAdminAgency(id, { status: "APPROVED" });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** PUT /admin/agencies/{id} — reject a become-an-agency request. */
export async function rejectAgencyAction(id: string): Promise<ActionResult> {
  try {
    await updateAdminAgency(id, { status: "REJECTED" });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** PUT /admin/edit-requests/{id}/approve */
export async function approveEditRequestAction(id: string): Promise<ActionResult> {
  try {
    await approveEditRequest(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** PUT /admin/edit-requests/{id}/reject */
export async function rejectEditRequestAction(id: string): Promise<ActionResult> {
  try {
    await rejectEditRequest(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** PUT /destinations/{id}/approve — admin approves a pending agency destination. */
export async function approveDestinationAction(id: string): Promise<ActionResult> {
  try {
    await approveDestination(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** PUT /destinations/{id}/reject — admin rejects a pending agency destination. */
export async function rejectDestinationAction(id: string): Promise<ActionResult> {
  try {
    await rejectDestination(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
