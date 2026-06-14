import { BookingStatusScreen } from "@/features/booking/components/BookingStatusScreen";

/**
 * Booking status (`/[locale]/traveler/bookings/[bookingId]`). Traveler-only — the
 * `(traveler)` shell guards the role. Thin: resolves the booking id and composes
 * the feature screen, which reads the booking from the traveler store.
 */
export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ locale: string; bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <BookingStatusScreen bookingId={bookingId} />;
}
