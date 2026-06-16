import { AdminQueuePage } from "@/features/admin/components/AdminQueuePage";
import { ReportsQueue } from "@/features/admin/components/ReportsQueue";
import { getAdminReports } from "@/services/admin.service";
import { formatDate } from "@/lib/format";
import type { ReportResponse, ReportStatus, ReportSeverity } from "@/lib/api/admin";
import type { Report } from "@/features/admin/schema";

const STATUS_MAP: Record<ReportStatus, Report["status"]> = {
  PENDING: "open",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
};

const SEVERITY_MAP: Record<ReportSeverity, Report["severity"]> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

/** Adapt the backend ReportResponse to the admin queue's Report shape. */
function toReport(r: ReportResponse, locale: string): Report {
  return {
    id: r.id,
    targetAgency: r.targetLabel ?? "—",
    reporterName: r.reporterName,
    // The reporter's explanation is the useful triage text; reason category is the
    // fallback when there's no description.
    reason: r.description ?? r.reason,
    submittedAtLabel: formatDate(r.createdAt, locale),
    status: STATUS_MAP[r.status],
    severity: SEVERITY_MAP[r.severity],
    adminNote: r.adminNote ?? undefined,
  };
}

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let initialReports: Report[] = [];
  let loadError = false;
  try {
    const page = await getAdminReports({ size: 100 });
    initialReports = page.content.map((r) => toReport(r, locale));
  } catch {
    loadError = true;
  }

  return (
    <AdminQueuePage titleKey="admin.reports.title" subtitleKey="admin.pages.reports.subtitle">
      <ReportsQueue initialReports={initialReports} loadError={loadError} />
    </AdminQueuePage>
  );
}
