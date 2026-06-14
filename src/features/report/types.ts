export type { ReportReason, ReportFormValues, ReportFormInput } from "./schema";

/** The agency a report is filed against (resolved for the form header). */
export interface ReportTarget {
  agencyId: string;
  agencyName: string;
}
