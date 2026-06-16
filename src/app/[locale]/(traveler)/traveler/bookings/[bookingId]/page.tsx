import { getTrip } from "@/services/bookings.service";
import { tripToBookingHistory } from "@/features/traveler/mappers";
import { BookingStatusScreen } from "@/features/booking/components/BookingStatusScreen";

/**
 * Booking status (`/[locale]/traveler/bookings/[bookingId]`). Traveler-only — the
 * `(traveler)` shell guards the role. Thin: server-fetches the trip
 * (`GET /trips/{id}`, ownership-gated) and composes the feature screen, which
 * renders the lifecycle timeline and a real cancel action.
 */
export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ locale: string; bookingId: string }>;
}) {
  const { bookingId } = await params;
  let booking = null;
  try {
    const trip = await getTrip(bookingId);
    booking = tripToBookingHistory(trip);
  } catch {
    booking = null;
  }
  return <BookingStatusScreen booking={booking} />;
}
