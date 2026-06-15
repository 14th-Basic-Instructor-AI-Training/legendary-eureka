import { BookingCheckoutScreen } from "@/features/booking/components/BookingCheckoutScreen";

/**
 * Booking checkout (`/[locale]/traveler/booking/[tourId]`). Traveler-only — the
 * `(traveler)` shell guards the role. Thin: resolves the tour id/slug and
 * composes the feature screen, which loads the tour and drives the 3-step flow.
 */
export default async function BookingCheckoutPage({
  params,
}: {
  params: Promise<{ locale: string; tourId: string }>;
}) {
  const { tourId } = await params;
  return <BookingCheckoutScreen tourId={tourId} />;
}
