import { getMyPackages } from "@/services/packages.service";
import { getDestinations, getMyDestinations } from "@/services/destinations.service";
import { PackagesClient } from "./PackagesClient";

export default async function AgencyToursPage() {
  const [packagesPage, myDestinationsPage, publicDestinationsPage] = await Promise.all([
    getMyPackages({ page: 0, size: 100 }),
    getMyDestinations({ page: 0, size: 100 }),
    getDestinations({ page: 0, size: 100 }),
  ]);

  const allDestinations = [
    ...publicDestinationsPage.content,
    ...myDestinationsPage.content.filter(
      (d) =>
        d.approvalStatus?.toUpperCase() === "APPROVED" &&
        !publicDestinationsPage.content.some((p) => p.id === d.id),
    ),
  ];

  return (
    <PackagesClient
      initialPackages={packagesPage.content}
      destinations={allDestinations}
    />
  );
}
