import { z } from "zod";

/**
 * Report an agency — the traveler-side submit form. Zod is the source of truth
 * (RHF validates against it). Distinct from the admin moderation `ReportSchema`,
 * which is the queue/review shape. Evidence is file metadata only in the static
 * phase (no upload).
 */

/** Why the traveler is reporting — drives the reason radio cards. */
export const ReportReasonSchema = z.enum([
  "fraud",
  "misleading",
  "safety",
  "conduct",
  "other",
]);
export type ReportReason = z.infer<typeof ReportReasonSchema>;

export const REPORT_MAX_DESCRIPTION = 1500;

export const ReportFormSchema = z.object({
  reason: ReportReasonSchema,
  description: z.string().trim().min(1).max(REPORT_MAX_DESCRIPTION),
});
export type ReportFormValues = z.input<typeof ReportFormSchema>;
export type ReportFormInput = z.output<typeof ReportFormSchema>;
