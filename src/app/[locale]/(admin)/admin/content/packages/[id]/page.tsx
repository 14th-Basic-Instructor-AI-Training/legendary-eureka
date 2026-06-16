import { notFound } from "next/navigation";
import { getPackage } from "@/services/packages.service";
import { PackageDetail } from "@/features/admin/components/PackageDetail";
import type { TourPackageResponse } from "@/lib/api/packages";

/**
 * Admin tour-package detail route (`/[locale]/admin/content/packages/[id]`).
 * Server component — fetches the single package (GET /tours/{id}) and composes
 * the admin-styled detail view inside the admin shell. A missing package
 * renders the segment's not-found.
 */
export default async function AdminPackageDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  let pkg: TourPackageResponse;
  try {
    pkg = await getPackage(id);
  } catch {
    notFound();
  }

  return <PackageDetail pkg={pkg} />;
}
