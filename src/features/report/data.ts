import { getAgencyById } from "@/features/tours/data";
import { assertCan, PermissionError, type Actor } from "@/lib/permissions";
import { submitReportAction } from "@/actions/reports";
import { ApiError } from "@/lib/api/client";
import type { ReportReason as ApiReportReason } from "@/lib/api/reports";
import { ReportFormSchema, type ReportFormInput, type ReportReason } from "./schema";
import type { ReportTarget } from "./types";

/** Map the form's reason onto the backend `ReportReason` enum. */
const REASON_TO_API: Record<ReportReason, ApiReportReason> = {
  fraud: "FRAUD",
  misleading: "MISLEADING",
  safety: "SAFETY",
  conduct: "CONDUCT",
  other: "OTHER",
};

/**
 * The ONE data seam for agency reports. `getReportTarget` resolves the agency
 * name for the form header (via the tours seam); `submitReport` re-checks the
 * `reportAgency` permission (defense in depth) and validates the payload before
 * the mock "send". Returns typed results, never throws to the UI.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" | "forbidden" | "invalid" };

/** Resolve the agency being reported (for the header). */
export async function getReportTarget(
  agencyId: string,
): Promise<Result<ReportTarget>> {
  const res = await getAgencyById(agencyId);
  if (!res.ok) return { ok: false, error: "not_found" };
  return { ok: true, data: { agencyId, agencyName: res.data.name } };
}

/**
 * Submit a report against an agency. Re-checks the `reportAgency` permission
 * (defense in depth) and validates against the schema, then posts to the backend
 * via the server action. `agencyId` is the agency-profile UUID the backend's
 * `AGENCY` target resolves against. Returns typed results, never throws to the UI.
 */
export async function submitReport(
  actor: Actor | null,
  agencyId: string,
  form: ReportFormInput,
): Promise<Result<{ agencyId: string }>> {
  try {
    assertCan(actor, "reportAgency");
  } catch (err) {
    if (err instanceof PermissionError)
      return { ok: false, error: "forbidden" };
    throw err;
  }
  const parsed = ReportFormSchema.safeParse(form);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    await submitReportAction({
      targetType: "AGENCY",
      targetId: agencyId,
      reason: REASON_TO_API[parsed.data.reason],
      description: parsed.data.description,
    });
    return { ok: true, data: { agencyId } };
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: "load_failed" };
    throw err;
  }
}
