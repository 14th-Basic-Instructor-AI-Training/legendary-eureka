import {
  getDestinations,
  getMyDestinations,
} from "@/services/destinations.service";
import { getMyActivities } from "@/services/activities.service";
import { NewPackagePage } from "@/features/tours/components/NewPackagePage";
import type { AgendaActivity } from "@/features/tours/components/AgendaBuilder";

export default async function AgencyToursNewPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  const [myDestinationsPage, publicDestinationsPage, activitiesPage] =
    await Promise.allSettled([
      getMyDestinations({ page: 0, size: 100 }),
      getDestinations({ page: 0, size: 100 }),
      // Only Activity (things-to-do) IDs are accepted by the backend's agenda
      // endpoint — destinations/restaurants/accommodations are in separate tables
      // and fail TourServiceImpl.validateActivities with a 400.
      getMyActivities({ size: 200 }),
    ]);

  const myDests =
    myDestinationsPage.status === "fulfilled" ? myDestinationsPage.value.content : [];
  const publicDests =
    publicDestinationsPage.status === "fulfilled" ? publicDestinationsPage.value.content : [];

  const allDestinations = [
    ...publicDests,
    ...myDests.filter(
      (d) =>
        d.approvalStatus?.toUpperCase() === "APPROVED" &&
        !publicDests.some((p) => p.id === d.id),
    ),
  ];

  const presetDestination = from ? allDestinations.find((d) => d.id === from) : undefined;

  const agendaActivities: AgendaActivity[] =
    activitiesPage.status === "fulfilled"
      ? activitiesPage.value.content.map((a) => ({
          id: a.id,
          name: a.name,
          category: "thingToDo" as const,
        }))
      : [];

  return (
    <NewPackagePage
      destinations={allDestinations}
      presetDestination={presetDestination}
      activities={agendaActivities}
    />
  );
}
