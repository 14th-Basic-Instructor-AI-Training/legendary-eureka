import { AdminQueuePage } from "@/features/admin/components/AdminQueuePage";
import { SystemSettings } from "@/features/admin/components/SystemSettings";

export default function AdminSettingsPage() {
  return (
    <AdminQueuePage
      titleKey="admin.settings.title"
      subtitleKey="admin.pages.settings.subtitle"
    >
      <SystemSettings />
    </AdminQueuePage>
  );
}
