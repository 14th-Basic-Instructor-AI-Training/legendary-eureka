import { notFound } from "next/navigation";
import { getMyPackage } from "@/services/packages.service";
import { EditPackagePage } from "@/features/tours/components/EditPackagePage";

/**
 * Edit route for a draft tour package. Only draft packages can be edited
 * directly; published/archived packages go through an edit-request flow.
 * If the package isn't found or isn't a draft, return 404.
 */
export default async function AgencyTourEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  let pkg;
  try {
    pkg = await getMyPackage(id);
  } catch {
    notFound();
  }

  if (!pkg || pkg.status !== "DRAFT") notFound();

  return <EditPackagePage package={pkg} />;
}
