"use server";

import {
  createDestination,
  deleteDestination,
  type CreateDestinationRequest,
  type DestinationResponse,
} from "@/lib/api/destinations";
import {
  archivePackage,
  createPackage,
  deletePackage,
  publishPackage,
  type TourPackageRequest,
  type TourPackageResponse,
} from "@/lib/api/packages";
import { ApiError } from "@/lib/api/client";

/**
 * Server actions for content mutations. These run on the server (so they can use
 * the session token via `apiFetch`) and are invoked from client components.
 *
 * Create actions return the created resource so the caller can update local state
 * optimistically; status/delete actions return a typed `ActionResult` consumed by
 * the admin panels' `runAction` helper (which branches on `ok`).
 */
type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof ApiError ? e.message : "Something went wrong" };
}

/** POST /destinations — create a destination (owner derived from the token). */
export async function createDestinationAction(
  body: CreateDestinationRequest,
): Promise<DestinationResponse> {
  return createDestination(body);
}

/** DELETE /destinations/{id} */
export async function deleteDestinationAction(id: string): Promise<void> {
  return deleteDestination(id);
}

/** POST /tours — create a tour package. */
export async function createPackageAction(
  body: TourPackageRequest,
): Promise<TourPackageResponse> {
  return createPackage(body);
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
