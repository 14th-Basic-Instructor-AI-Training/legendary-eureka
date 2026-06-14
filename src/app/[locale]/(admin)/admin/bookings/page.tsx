import { AdminQueuePage } from "@/features/admin/components/AdminQueuePage";
import { BookingsAdmin } from "@/features/admin/components/BookingsAdmin";

export default function AdminBookingsPage() {
  return (
    <AdminQueuePage
      titleKey="admin.bookings.title"
      subtitleKey="admin.pages.bookings.subtitle"
    >
      <BookingsAdmin />
    </AdminQueuePage>
  );
}
