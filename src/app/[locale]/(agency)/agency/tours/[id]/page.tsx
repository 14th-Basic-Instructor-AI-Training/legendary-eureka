import { notFound } from "next/navigation";
import { getPackage } from "@/services/packages.service";
import { AgencyTourDetail } from "@/features/tours/components/AgencyTourDetail";

/**
 * Agency tour-package detail route. Thin: resolves the id, loads the package
 * through the service seam, and composes the agency detail screen (lifecycle
 * actions + every authored field). Lives inside the agency AppShell.
 */
export default async function AgencyTourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  let pkg;
  try {
    pkg = await getPackage(id);
  } catch {
    notFound();
  }

  if (!pkg) notFound();

  return <AgencyTourDetail package={pkg} />;
}
