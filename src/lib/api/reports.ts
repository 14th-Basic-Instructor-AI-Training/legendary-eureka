// Wire types for the report-submission endpoint (`POST /reports`). These mirror
// the backend `ReportRequest`/`ReportResponse` exactly (the admin queue uses the
// richer `ReportResponse` in `lib/api/admin.ts`).

export type ReportTargetType =
  | "DESTINATION"
  | "ACTIVITY"
  | "TOUR"
  | "RESTAURANT"
  | "ACCOMMODATION"
  | "AGENCY"
  | "TRIP";

export type ReportReason =
  | "SPAM"
  | "INAPPROPRIATE"
  | "INCORRECT_INFO"
  | "MISLEADING"
  | "OTHER"
  | "FRAUD"
  | "SAFETY"
  | "CONDUCT";

export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH";

export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export interface ReportResponse {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: string | null;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string | null;
  reason: ReportReason;
  severity: ReportSeverity;
  description: string | null;
  status: ReportStatus;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  severity?: ReportSeverity;
  description?: string;
}
