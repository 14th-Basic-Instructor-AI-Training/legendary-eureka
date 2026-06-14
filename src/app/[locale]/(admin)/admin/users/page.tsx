import { AdminQueuePage } from "@/features/admin/components/AdminQueuePage";
import { UsersPanel } from "@/features/admin/components/UsersPanel";

export default function AdminUsersPage() {
  return (
    <AdminQueuePage titleKey="admin.users.title" subtitleKey="admin.pages.users.subtitle">
      <UsersPanel />
    </AdminQueuePage>
  );
}
