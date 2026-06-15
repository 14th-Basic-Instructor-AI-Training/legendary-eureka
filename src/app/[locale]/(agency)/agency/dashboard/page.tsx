import {
  getMyAgencyProfile,
  getMyAgencyReviews,
  getMyAgencyStats,
  getMonthlyBookings,
  getBookingStatusSummary,
} from "@/services/profile.service";
import { getIncomingTrips } from "@/services/bookings.service";
import AgencyDashboardView from "@/features/agency/components/AgencyDashboardView";

export default async function DashboardPage() {
  const [stats, monthlyBookings, bookingStatusSummary, reviewsPage, tripsPage, profile] =
    await Promise.all([
      getMyAgencyStats(),
      getMonthlyBookings(6),
      getBookingStatusSummary(),
      getMyAgencyReviews({ size: 3 }),
      getIncomingTrips({ size: 6 }),
      getMyAgencyProfile(),
    ]);

  return (
    <AgencyDashboardView
      stats={stats}
      monthlyBookings={monthlyBookings}
      bookingStatusSummary={bookingStatusSummary}
      reviews={reviewsPage.content}
      trips={tripsPage.content}
      agencyName={profile.agencyName}
    />
  );
}
