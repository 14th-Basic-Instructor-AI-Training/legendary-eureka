import { AdminQueuePage } from "@/features/admin/components/AdminQueuePage";
import { ActivitiesAdmin } from "@/features/admin/components/ActivitiesAdmin";

export default function AdminActivitiesPage() {
  return (
    <AdminQueuePage titleKey="admin.activities.title" subtitleKey="admin.pages.activities.subtitle">
      <ActivitiesAdmin />
    </AdminQueuePage>
  );
}
