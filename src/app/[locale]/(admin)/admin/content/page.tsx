import { getDestinations, type DestinationResponse } from "@/lib/api/activities";
import { getPackages, getArchivedPackages, type TourPackageResponse } from "@/lib/api/packages";
import { ContentPage } from "@/features/admin/components/ContentPage";

/**
 * Admin content page — server component. Fetches the platform's destinations and
 * tour packages (GET) in parallel and hands them to the (client) ContentPage,
 * which keeps the previous tabbed UI. Create / publish / archive / delete go
 * back to the API via server actions, then the client calls `router.refresh()`.
 */
export default async function AdminContentPage() {
  let destinations: DestinationResponse[] = [];
  let packages: TourPackageResponse[] = [];
  let loadError = false;

  try {
    const [destinationsPage, packagesPage, archivedPage] = await Promise.all([
      getDestinations({ size: 100 }),
      getPackages({ size: 100 }),
      getArchivedPackages({ size: 100 }),
    ]);
    destinations = destinationsPage.content;
    // Published (GET /tours) + archived (GET /tours/archived) — disjoint statuses,
    // so PackagesAdmin's Archive tab can filter to the archived ones.
    packages = [...packagesPage.content, ...archivedPage.content];
  } catch {
    loadError = true;
  }

  return <ContentPage destinations={destinations} packages={packages} loadError={loadError} />;
}
