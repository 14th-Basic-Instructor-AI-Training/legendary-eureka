import { AdminControlPanel } from "@/features/admin/components/AdminControlPanel";
import { getAdminDashboard } from "@/services/admin.service";

export default async function AdminControlPanelPage() {
  const dashboard = await getAdminDashboard();
  return <AdminControlPanel dashboard={dashboard} />;
}
