import { getMyAgencyProfile, getMyAgencyReviews, getMyAgencyStats } from "@/lib/api/profile";
import { getIncomingTrips } from "@/lib/api/bookings";
import AgencyDashboardView from "@/features/agency/components/AgencyDashboardView";

export default async function DashboardPage() {
  const [stats, reviewsPage, tripsPage, profile] = await Promise.all([
    getMyAgencyStats(),
    getMyAgencyReviews({ size: 3 }),
    getIncomingTrips({ size: 6 }),
    getMyAgencyProfile(),
  ]);

  return (
    <AgencyDashboardView
      stats={stats}
      reviews={reviewsPage.content}
      trips={tripsPage.content}
      agencyName={profile.agencyName}
    />
  );
}
