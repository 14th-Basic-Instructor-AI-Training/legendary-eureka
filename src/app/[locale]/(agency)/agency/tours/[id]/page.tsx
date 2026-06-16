import { notFound } from "next/navigation";
import { getMyPackage } from "@/services/packages.service";
import { getMyActivities } from "@/services/activities.service";
import { AgencyTourDetail } from "@/features/tours/components/AgencyTourDetail";
import type { AgendaActivity } from "@/features/tours/components/AgendaBuilder";

/**
 * Agency tour-package detail route. Resolves the package and the agency's
 * activity library (for the agenda builder) in parallel, then composes the
 * agency detail screen.
 */
export default async function AgencyTourDetailPage({
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

  if (!pkg) notFound();

  // Fetch the agency's Activity (things-to-do) library for the agenda builder.
  // The backend validates agenda activity IDs against the `activities` table only
  // (see TourServiceImpl.validateActivities) — destinations/restaurants/
  // accommodations live in separate tables and would fail validation.
  const activitiesResult = await Promise.allSettled([getMyActivities({ size: 200 })]);

  const agendaActivities: AgendaActivity[] =
    activitiesResult[0].status === "fulfilled"
      ? activitiesResult[0].value.content.map((a) => ({
          id: a.id,
          name: a.name,
          category: "thingToDo" as const,
        }))
      : [];

  return <AgencyTourDetail package={pkg} activities={agendaActivities} />;
}
