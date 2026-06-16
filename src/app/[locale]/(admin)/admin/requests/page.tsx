import { RequestsPage } from "@/features/admin/components/RequestsPage";
import { getAdminAgencies } from "@/services/admin.service";
import { getApprovalPackages } from "@/services/packages.service";
import { getPendingDestinations } from "@/services/destinations.service";

export default async function AdminRequestsPage() {
  const [agencies, tourApprovalsPage, pendingDestinationsPage] = await Promise.all([
    getAdminAgencies({ size: 100 }),
    // Tour packages + destinations agencies submitted for admin approval.
    getApprovalPackages({ size: 100 }),
    getPendingDestinations({ size: 100 }),
  ]);

  // `getAdminAgencies` already returns the `AdminAgencyProfile` shape the UI
  // expects (id, userId, agencyName, email, status, adminNote, …), so no adapter.
  return (
    <RequestsPage
      agencies={agencies.content}
      tourApprovals={tourApprovalsPage.content}
      pendingDestinations={pendingDestinationsPage.content}
    />
  );
}
