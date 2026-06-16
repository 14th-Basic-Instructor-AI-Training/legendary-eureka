import { getMyPackages } from "@/services/packages.service";
import { getDestinations, getMyDestinations } from "@/services/destinations.service";
import { ToursWorkspace } from "@/features/tours/components/ToursWorkspace";

export default async function AgencyToursPage() {
  const [packagesPage, myDestinationsPage, publicDestinationsPage] = await Promise.all([
    getMyPackages({ page: 0, size: 100 }),
    getMyDestinations({ page: 0, size: 100 }),
    getDestinations({ page: 0, size: 100 }),
  ]);

  return (
    <ToursWorkspace
      initialPackages={packagesPage.content}
      initialDestinations={myDestinationsPage.content}
      publicDestinations={publicDestinationsPage.content}
    />
  );
}
