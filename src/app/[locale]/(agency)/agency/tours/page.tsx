import { getMyPackages } from "@/services/packages.service";
import { PackagesClient } from "./PackagesClient";

export default async function AgencyToursPage() {
  const packagesPage = await getMyPackages({ page: 0, size: 100 });

  return <PackagesClient initialPackages={packagesPage.content} />;
}
