import { getAgencyById } from "@/features/tours/data";
import { assertCan, PermissionError, type Actor } from "@/lib/permissions";
import { ReportFormSchema, type ReportFormInput } from "./schema";
import type { ReportTarget } from "./types";

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

/** Submit a report (mock). Re-checks permission + validates against the schema. */
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
  // Static phase: no transport. The real impl posts to the moderation queue.
  return { ok: true, data: { agencyId } };
}
