import { getMyTrips } from "@/lib/api/bookings";
import { tripToBookingHistory } from "@/features/traveler/mappers";
import { TravelerBookingsScreen } from "@/features/traveler/components/TravelerBookingsScreen";

/**
 * "My Bookings" list (`/[locale]/traveler/bookings`) — the menu destination for
 * the traveler's booking history. Traveler-guarded by the `(traveler)` shell.
 * Thin: server-fetches the trips and composes the screen (mirrors the profile
 * page's data flow).
 */
export default async function TravelerBookingsPage() {
  const tripsPage = await getMyTrips({ page: 0, size: 50 });
  const bookings = tripsPage.content.map(tripToBookingHistory);
  return <TravelerBookingsScreen bookings={bookings} />;
}
