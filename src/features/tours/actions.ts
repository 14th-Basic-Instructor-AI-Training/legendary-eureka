"use server";

import { createDestination, type DestinationRequest } from "@/lib/api/activities";
import { archivePackage, deletePackage, publishPackage } from "@/lib/api/packages";
import { ApiError } from "@/lib/api/client";

/**
 * Server actions for content mutations. These run on the server (so they can use
 * the session token via `apiFetch`) and are invoked from client components; the
 * caller calls `router.refresh()` afterwards to re-run the server fetch.
 */
type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof ApiError ? e.message : "Something went wrong" };
}

/** POST /destinations — create a destination (owner derived from the token). */
export async function createDestinationAction(body: DestinationRequest): Promise<ActionResult> {
  try {
    await createDestination(body);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** PUT /tours/{id}/publish */
export async function publishPackageAction(id: string): Promise<ActionResult> {
  try {
    await publishPackage(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** PUT /tours/{id}/archive */
export async function archivePackageAction(id: string): Promise<ActionResult> {
  try {
    await archivePackage(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** DELETE /tours/{id} */
export async function deletePackageAction(id: string): Promise<ActionResult> {
  try {
    await deletePackage(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
