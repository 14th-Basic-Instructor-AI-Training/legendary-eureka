"use server";

import {
  createDestination,
  updateDestination,
  deleteDestination,
} from "@/services/destinations.service";
import type { CreateDestinationRequest, DestinationResponse } from "@/lib/api/destinations";
import {
  approvePackage,
  archivePackage,
  createPackage,
  deletePackage,
  publishPackage,
  rejectPackage,
  submitPackage,
} from "@/services/packages.service";
import type { TourPackageRequest, TourPackageResponse } from "@/lib/api/packages";
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

/** PUT /destinations/{id} — update a destination (owner or admin). */
export async function updateDestinationAction(
  id: string,
  body: Partial<CreateDestinationRequest>,
): Promise<DestinationResponse> {
  return updateDestination(id, body);
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

/** POST /tours/{id}/submit — agency submits a draft package for admin approval. */
export async function submitPackageAction(id: string): Promise<ActionResult> {
  try {
    await submitPackage(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** PUT /tours/{id}/approve — admin approves a pending package (also publishes it). */
export async function approvePackageAction(id: string): Promise<ActionResult> {
  try {
    await approvePackage(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** PUT /tours/{id}/reject — admin rejects a pending package with an optional reason. */
export async function rejectPackageAction(id: string, reason?: string): Promise<ActionResult> {
  try {
    await rejectPackage(id, reason);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
