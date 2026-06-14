import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import {
  initialBookings,
  initialNotificationPrefs,
  initialPrivacy,
  initialProfile,
  initialReviews,
} from "./data";
import type {
  BookingHistory,
  MyReview,
  NotificationPrefs,
  PersonalInfoInput,
  PrivacySettings,
  TravelerProfile,
  Visibility,
} from "./schema";

/** Fields a traveler can edit on their own review. */
export interface ReviewEdit {
  rating: number;
  comment: string;
}

interface TravelerState {
  profile: TravelerProfile;
  bookings: BookingHistory[];
  reviews: MyReview[];
  notificationPrefs: NotificationPrefs;
  privacy: PrivacySettings;

  /** Update name / bio / avatar. Re-checks permission (defense in depth). */
  updateProfile: (actor: Actor | null, input: PersonalInfoInput) => boolean;
  /** Mock password change — guarded, no persisted state in the static phase. */
  changePassword: (actor: Actor | null) => boolean;
  setNotificationPrefs: (
    actor: Actor | null,
    prefs: NotificationPrefs,
  ) => boolean;
  setPrivacy: (actor: Actor | null, visibility: Visibility) => boolean;
  /** Append a newly-requested booking (from the checkout flow) → pending. */
  addBooking: (actor: Actor | null, booking: BookingHistory) => boolean;
  /** Cancel an upcoming booking → cancelled, refund pending. */
  cancelBooking: (actor: Actor | null, id: string) => boolean;
  editReview: (actor: Actor | null, id: string, input: ReviewEdit) => boolean;
  deleteReview: (actor: Actor | null, id: string) => boolean;
  /** Delete account — guarded; the caller signs the session out. */
  deleteAccount: (actor: Actor | null) => boolean;
}

export const useTravelerStore = create<TravelerState>((set) => ({
  profile: initialProfile(),
  bookings: initialBookings(),
  reviews: initialReviews(),
  notificationPrefs: initialNotificationPrefs(),
  privacy: initialPrivacy(),

  updateProfile: (actor, input) => {
    if (!can(actor, "editOwnProfile")) return false;
    set((s) => ({
      profile: {
        ...s.profile,
        name: input.name,
        bio: input.bio,
        ...(input.avatar ? { avatar: input.avatar } : {}),
      },
    }));
    return true;
  },

  changePassword: (actor) => can(actor, "editOwnProfile"),

  setNotificationPrefs: (actor, prefs) => {
    if (!can(actor, "editOwnProfile")) return false;
    set({ notificationPrefs: prefs });
    return true;
  },

  setPrivacy: (actor, visibility) => {
    if (!can(actor, "editOwnProfile")) return false;
    set({ privacy: { defaultVisibility: visibility } });
    return true;
  },

  addBooking: (actor, booking) => {
    if (!can(actor, "bookTour")) return false;
    set((s) => ({
      bookings: s.bookings.some((b) => b.id === booking.id)
        ? s.bookings
        : [booking, ...s.bookings],
    }));
    return true;
  },

  cancelBooking: (actor, id) => {
    if (!can(actor, "bookTour")) return false;
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id
          ? { ...b, status: "cancelled", refundStatus: "pending" }
          : b,
      ),
    }));
    return true;
  },

  editReview: (actor, id, input) => {
    if (!can(actor, "writeReview")) return false;
    set((s) => ({
      reviews: s.reviews.map((r) =>
        r.id === id
          ? { ...r, rating: input.rating, comment: input.comment }
          : r,
      ),
    }));
    return true;
  },

  deleteReview: (actor, id) => {
    if (!can(actor, "writeReview")) return false;
    set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
    return true;
  },

  deleteAccount: (actor) => can(actor, "editOwnProfile"),
}));
