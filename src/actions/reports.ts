"use server";

import { submitReport } from "@/services/reports.service";
import { resolveAdminReport } from "@/services/admin.service";
import type { CreateReportRequest, ReportResponse } from "@/lib/api/reports";
import type { AdminReportDecision } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

/**
 * Server actions for reports. They run on the server (so `apiFetch` carries the
 * session token) and are invoked from client components.
 */
type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof ApiError ? e.message : "Something went wrong" };
}

/** POST /reports — submit a content/agency report (traveler or agency). */
export async function submitReportAction(
  body: CreateReportRequest,
): Promise<ReportResponse> {
  return submitReport(body);
}

/** PUT /admin/reports/{id}/resolve — admin resolves or dismisses a report. */
export async function resolveReportAction(
  id: string,
  body: AdminReportDecision,
): Promise<ActionResult> {
  try {
    await resolveAdminReport(id, body);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
