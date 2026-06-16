import { AdminQueuePage } from "@/features/admin/components/AdminQueuePage";
import { SystemSettings } from "@/features/admin/components/SystemSettings";
import { getSystemSettings } from "@/services/admin.service";
import type { SystemSettingsResponse } from "@/lib/api/admin";

export default async function AdminSettingsPage() {
  // Server-fetch current settings; a failure renders the component's error state
  // (the admin layout already enforces the admin-only guard).
  let settings: SystemSettingsResponse | null = null;
  try {
    settings = await getSystemSettings();
  } catch {
    settings = null;
  }

  return (
    <AdminQueuePage titleKey="admin.settings.title" subtitleKey="admin.pages.settings.subtitle">
      <SystemSettings initial={settings} />
    </AdminQueuePage>
  );
}
