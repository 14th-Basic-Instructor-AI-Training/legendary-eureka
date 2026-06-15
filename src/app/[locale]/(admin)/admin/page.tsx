import { AdminControlPanel } from "@/features/admin/components/AdminControlPanel";
import { getAdminDashboard } from "@/lib/api/admin";

export default async function AdminControlPanelPage() {
  const dashboard = await getAdminDashboard();
  return <AdminControlPanel dashboard={dashboard} />;
}
