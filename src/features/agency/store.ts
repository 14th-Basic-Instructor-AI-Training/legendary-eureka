import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import { initialActivities, initialBookings } from "./data";
import type { Activity, BookingRequest, NewActivityInput } from "./schema";

interface AgencyState {
  activities: Activity[];
  bookings: BookingRequest[];
  /** Create a draft activity. Re-checks permission at the mutation (defense in depth). */
  addActivity: (actor: Actor | null, input: NewActivityInput) => boolean;
  /** Move a pending booking to approved. */
  approveBooking: (actor: Actor | null, id: string) => boolean;
  /** Move a pending booking to rejected. */
  rejectBooking: (actor: Actor | null, id: string) => boolean;
}

const setBookingStatus = (
  bookings: BookingRequest[],
  id: string,
  status: BookingRequest["status"],
) => bookings.map((b) => (b.id === id ? { ...b, status } : b));

export const useAgencyStore = create<AgencyState>((set, get) => ({
  activities: initialActivities(),
  bookings: initialBookings(),

  addActivity: (actor, input) => {
    if (!can(actor, "manageOwnActivities")) return false;
    const next: Activity = {
      id: `a-new-${get().activities.length + 1}`,
      title: input.title,
      category: input.category,
      location: input.location,
      priceFrom: input.priceFrom,
      currency: "USD",
      status: "draft",
      rating: 0,
    };
    set((s) => ({ activities: [next, ...s.activities] }));
    return true;
  },

  approveBooking: (actor, id) => {
    if (!can(actor, "approveBookings")) return false;
    set((s) => ({ bookings: setBookingStatus(s.bookings, id, "approved") }));
    return true;
  },

  rejectBooking: (actor, id) => {
    if (!can(actor, "approveBookings")) return false;
    set((s) => ({ bookings: setBookingStatus(s.bookings, id, "rejected") }));
    return true;
  },
}));
