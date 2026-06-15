import { apiFetch } from "@/lib/api/client";
import type { CreateReportRequest, ReportResponse } from "@/lib/api/reports";

export function submitReport(body: CreateReportRequest): Promise<ReportResponse> {
  return apiFetch("/reports", { method: "POST", body });
}
