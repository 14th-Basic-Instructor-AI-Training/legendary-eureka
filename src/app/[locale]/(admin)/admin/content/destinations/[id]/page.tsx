import { notFound } from "next/navigation";
import { getDestination } from "@/services/destinations.service";
import { DestinationDetail } from "@/features/admin/components/DestinationDetail";
import type { DestinationResponse } from "@/lib/api/destinations";

/**
 * Admin destination detail route (`/[locale]/admin/content/destinations/[id]`).
 * Server component — fetches the single destination (GET /destinations/{id})
 * and composes the admin-styled detail view inside the admin shell. A missing
 * destination renders the segment's not-found.
 */
export default async function AdminDestinationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  let destination: DestinationResponse;
  try {
    destination = await getDestination(id);
  } catch {
    notFound();
  }

  return <DestinationDetail destination={destination} />;
}
