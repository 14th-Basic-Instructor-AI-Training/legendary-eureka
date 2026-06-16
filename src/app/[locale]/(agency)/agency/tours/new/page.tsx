import { getDestinations, getMyDestinations } from "@/services/destinations.service";
import { NewPackagePage } from "@/features/tours/components/NewPackagePage";

export default async function AgencyToursNewPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  const [myDestinationsPage, publicDestinationsPage] = await Promise.all([
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

  const presetDestination = from ? allDestinations.find((d) => d.id === from) : undefined;

  return <NewPackagePage destinations={allDestinations} presetDestination={presetDestination} />;
}
