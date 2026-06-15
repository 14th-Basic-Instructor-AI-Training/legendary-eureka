import { RequestsPage } from "@/features/admin/components/RequestsPage";
import { getAdminAgencies, getAdminEditRequests } from "@/lib/api/admin";

export default async function AdminRequestsPage() {
  const [agencies, editRequests] = await Promise.all([
    getAdminAgencies({ size: 100 }),
    getAdminEditRequests({ size: 100 }),
  ]);
  return (
    <RequestsPage
      agencies={agencies.content}
      editRequests={editRequests.content}
    />
  );
}
