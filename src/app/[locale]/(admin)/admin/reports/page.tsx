import { AdminQueuePage } from "@/features/admin/components/AdminQueuePage";
import { ReportsQueue } from "@/features/admin/components/ReportsQueue";

export default function AdminReportsPage() {
  return (
    <AdminQueuePage titleKey="admin.reports.title" subtitleKey="admin.pages.reports.subtitle">
      <ReportsQueue />
    </AdminQueuePage>
  );
}
