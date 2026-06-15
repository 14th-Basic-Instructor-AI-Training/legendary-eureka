export type ReportTargetType = "AGENCY" | "TOUR";
export type ReportReason = "FRAUD" | "MISLEADING" | "INAPPROPRIATE" | "OTHER";

export interface ReportResponse {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  reporterId: string;
  createdAt: string;
}

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}
