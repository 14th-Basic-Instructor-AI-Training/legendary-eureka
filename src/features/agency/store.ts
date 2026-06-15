import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import { initialActivities, initialBookings, initialPackages } from "./data";
import type { Activity, BookingRequest, ItineraryDay, NewActivityInput, Package } from "./schema";

interface AgencyState {
  activities: Activity[];
  bookings: BookingRequest[];
  packages: Package[];
  /** Create a draft activity. Re-checks permission at the mutation (defense in depth). */
  addActivity: (actor: Actor | null, input: NewActivityInput) => boolean;
  /** Delete an activity by id. Re-checks permission before mutating. */
  deleteActivity: (actor: Actor | null, id: string) => boolean;
  /** Update an existing activity's fields. Re-checks permission before mutating. */
  updateActivity: (actor: Actor | null, id: string, input: NewActivityInput) => boolean;
  /** Move a pending booking to approved. */
  approveBooking: (actor: Actor | null, id: string) => boolean;
  /** Move a pending booking to rejected. */
  rejectBooking: (actor: Actor | null, id: string) => boolean;
  /** Cancel an approved booking. */
  cancelBooking: (actor: Actor | null, id: string) => boolean;
  /** Create a new package as draft. */
  addPackage: (actor: Actor | null, input: PackageInput) => boolean;
  /** Update an existing package's fields. */
  updatePackage: (actor: Actor | null, id: string, input: PackageInput) => boolean;
  /** Delete a package by id. */
  deletePackage: (actor: Actor | null, id: string) => boolean;
  /** Publish a draft or archived package. */
  publishPackage: (actor: Actor | null, id: string) => boolean;
  /** Archive a published package. */
  archivePackage: (actor: Actor | null, id: string) => boolean;
  /** Seed/replace the packages list (used to hydrate from the API on mount). */
  setPackages: (packages: Package[]) => void;
}

export interface PackageInput {
  title: string;
  description?: string;
  location?: string;
  maxGroupSize?: number;
  days: number;
  priceFrom: number;
  itinerary?: ItineraryDay[];
}

const setBookingStatus = (
  bookings: BookingRequest[],
  id: string,
  status: BookingRequest["status"],
) => bookings.map((b) => (b.id === id ? { ...b, status } : b));

const setPackageStatus = (
  packages: Package[],
  id: string,
  status: Package["status"],
) => packages.map((p) => (p.id === id ? { ...p, status } : p));

export const useAgencyStore = create<AgencyState>((set, get) => ({
  activities: initialActivities(),
  bookings: initialBookings(),
  packages: initialPackages(),

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
      description: input.description,
    };
    set((s) => ({ activities: [next, ...s.activities] }));
    return true;
  },

  deleteActivity: (actor, id) => {
    if (!can(actor, "manageOwnActivities")) return false;
    set((s) => ({ activities: s.activities.filter((a) => a.id !== id) }));
    return true;
  },

  updateActivity: (actor, id, input) => {
    if (!can(actor, "manageOwnActivities")) return false;
    set((s) => ({
      activities: s.activities.map((a) =>
        a.id === id
          ? {
              ...a,
              title: input.title,
              category: input.category,
              location: input.location,
              priceFrom: input.priceFrom,
              description: input.description,
            }
          : a,
      ),
    }));
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

  cancelBooking: (actor, id) => {
    if (!can(actor, "approveBookings")) return false;
    set((s) => ({ bookings: setBookingStatus(s.bookings, id, "cancelled") }));
    return true;
  },

  addPackage: (actor, input) => {
    if (!can(actor, "manageOwnActivities")) return false;
    const itinerary = input.itinerary ?? Array.from({ length: input.days }, (_, i) => ({
      day: i + 1,
      notes: "",
      activityIds: [],
    }));
    const next: Package = {
      id: `p-new-${get().packages.length + 1}`,
      title: input.title,
      description: input.description,
      location: input.location,
      maxGroupSize: input.maxGroupSize,
      days: input.days,
      priceFrom: input.priceFrom,
      currency: "USD",
      status: "draft",
      activityCount: itinerary.reduce((sum, d) => sum + d.activityIds.length, 0),
      bookingsCount: 0,
      itinerary,
    };
    set((s) => ({ packages: [next, ...s.packages] }));
    return true;
  },

  updatePackage: (actor, id, input) => {
    if (!can(actor, "manageOwnActivities")) return false;
    set((s) => ({
      packages: s.packages.map((p) =>
        p.id === id
          ? {
              ...p,
              title: input.title,
              description: input.description,
              location: input.location,
              maxGroupSize: input.maxGroupSize,
              days: input.days,
              priceFrom: input.priceFrom,
              itinerary: input.itinerary ?? p.itinerary,
              activityCount: (input.itinerary ?? p.itinerary ?? []).reduce(
                (sum, d) => sum + d.activityIds.length,
                0,
              ),
            }
          : p,
      ),
    }));
    return true;
  },

  deletePackage: (actor, id) => {
    if (!can(actor, "manageOwnActivities")) return false;
    set((s) => ({ packages: s.packages.filter((p) => p.id !== id) }));
    return true;
  },

  publishPackage: (actor, id) => {
    if (!can(actor, "manageOwnActivities")) return false;
    set((s) => ({ packages: setPackageStatus(s.packages, id, "published") }));
    return true;
  },

  archivePackage: (actor, id) => {
    if (!can(actor, "manageOwnActivities")) return false;
    set((s) => ({ packages: setPackageStatus(s.packages, id, "archived") }));
    return true;
  },

  setPackages: (packages) => set({ packages }),
}));
