import { AdminQueuePage } from "@/features/admin/components/AdminQueuePage";
import { BookingsAdmin } from "@/features/admin/components/BookingsAdmin";
import { getAllTrips, getAdminMonthlyBookings } from "@/lib/api/bookings";

export default async function AdminBookingsPage() {
  const [trips, monthly] = await Promise.all([
    getAllTrips({ size: 100 }),
    // The trend is a secondary card — don't let it take down the whole page.
    getAdminMonthlyBookings(12).catch(() => []),
  ]);
  return (
    <AdminQueuePage
      titleKey="admin.bookings.title"
      subtitleKey="admin.pages.bookings.subtitle"
    >
      <BookingsAdmin
        bookings={trips.content}
        totalCount={trips.totalElements}
        monthly={monthly}
      />
    </AdminQueuePage>
  );
}
