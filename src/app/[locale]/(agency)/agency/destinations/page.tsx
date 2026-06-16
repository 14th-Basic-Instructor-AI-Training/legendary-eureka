import { getDestinations, getMyDestinations } from "@/services/destinations.service";
import { DestinationsClient } from "./DestinationsClient";

export default async function AgencyDestinationsPage() {
  const [myDestinationsPage, publicDestinationsPage] = await Promise.all([
    getMyDestinations({ page: 0, size: 100 }),
    getDestinations({ page: 0, size: 100 }),
  ]);

  return (
    <DestinationsClient
      initialDestinations={myDestinationsPage.content}
      publicDestinations={publicDestinationsPage.content}
    />
  );
}
