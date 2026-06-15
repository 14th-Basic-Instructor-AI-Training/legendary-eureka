import { RequestsPage } from "@/features/admin/components/RequestsPage";
import { getAdminAgencies, getAdminEditRequests } from "@/services/admin.service";
import type { AdminAgencyProfile, AdminEditRequest, EditRequestTargetType } from "@/lib/api/admin";

export default async function AdminRequestsPage() {
  const [agencies, editRequests] = await Promise.all([
    getAdminAgencies({ size: 100 }),
    getAdminEditRequests({ size: 100 }),
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

  const requests: AdminEditRequest[] = editRequests.content.map((e) => ({
    id: e.id,
    requesterId: e.agencyId,
    targetType: e.targetType as EditRequestTargetType,
    targetId: e.targetId,
    message: e.message,
    status: e.status,
    adminNote: e.adminNote,
    createdAt: e.createdAt,
    updatedAt: e.createdAt,
  }));

  return <RequestsPage agencies={agencyProfiles} editRequests={requests} />;
}
