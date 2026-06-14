import { AdminQueuePage } from "@/features/admin/components/AdminQueuePage";
import { AgencyRequestsQueue } from "@/features/admin/components/AgencyRequestsQueue";

export default function AdminAgenciesPage() {
  return (
    <AdminQueuePage titleKey="admin.requests.title" subtitleKey="admin.pages.agencies.subtitle">
      <AgencyRequestsQueue />
    </AdminQueuePage>
  );
}
