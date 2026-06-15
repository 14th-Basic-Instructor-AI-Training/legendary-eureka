import { getIncomingTrips } from "@/lib/api/bookings";
import { tripToBookingRequest } from "@/features/agency/mappers";
import { BookingsContent } from "@/features/agency/components/BookingsContent";

/**
 * Agency bookings — incoming traveler requests for this agency's packages
 * (`GET /trips/incoming`). Server-fetched; the client component approves/rejects
 * via server actions and calls `router.refresh()` to re-pull this list.
 */
export default async function BookingsPage() {
  let bookings = [] as ReturnType<typeof tripToBookingRequest>[];
  try {
    const page = await getIncomingTrips({ page: 0, size: 100 });
    bookings = page.content.map(tripToBookingRequest);
  } catch {
    // Degrade to an empty list rather than crashing the whole page.
    bookings = [];
  }

  return <BookingsContent bookings={bookings} />;
}
