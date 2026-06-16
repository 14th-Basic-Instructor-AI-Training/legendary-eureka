import { RequestsPage } from "@/features/admin/components/RequestsPage";
import { getAdminAgencies } from "@/services/admin.service";
import { getApprovalPackages } from "@/services/packages.service";
import { getPendingDestinations } from "@/services/destinations.service";
import type { AdminAgencyProfile } from "@/lib/api/admin";

export default async function AdminRequestsPage() {
  const [agencies, tourApprovalsPage, pendingDestinationsPage] = await Promise.all([
    getAdminAgencies({ size: 100 }),
    // Tour packages + destinations agencies submitted for admin approval.
    getApprovalPackages({ size: 100 }),
    getPendingDestinations({ size: 100 }),
  ]);

  // Adapt the backend response shapes to the admin requests UI's prop types.
  const agencyProfiles: AdminAgencyProfile[] = agencies.content.map((a) => ({
    id: a.id,
    userId: "",
    agencyName: a.agencyName,
    description: a.bio,
    logoUrl: a.avatarUrl,
    status: a.status,
    adminNote: a.rejectionReason,
    createdAt: a.createdAt,
  }));

  return (
    <RequestsPage
      agencies={agencyProfiles}
      tourApprovals={tourApprovalsPage.content}
      pendingDestinations={pendingDestinationsPage.content}
    />
  );
}
