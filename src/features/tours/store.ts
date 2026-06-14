import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import type { ReviewDraft, TourReview } from "./schema";

/**
 * Tours interaction store. Holds the mutable, per-tour UI state that survives tab
 * switches: the (optimistic) review list, bookmark, and booking-request status.
 * Every mutation re-checks permission via `can(...)` before changing state
 * (defense in depth) — UI gates are UX, this is the enforcement seam that the
 * real booking/review API will mirror. Returns `false` when denied.
 */
interface TourUiState {
  reviews: TourReview[];
  bookmarked: boolean;
  bookingStatus: "idle" | "requested";
}

interface ToursState {
  byTour: Record<string, TourUiState>;
  /** Seed a tour's state once it loads (idempotent — keeps existing edits). */
  ensureTour: (tourId: string, seedReviews: TourReview[]) => void;
  /** Traveler requests a booking. */
  requestBooking: (actor: Actor | null, tourId: string) => boolean;
  /** Traveler bookmarks / unbookmarks the tour. */
  toggleBookmark: (actor: Actor | null, tourId: string) => boolean;
  /** Traveler submits a review (prepended optimistically). */
  submitReview: (
    actor: Actor | null,
    tourId: string,
    draft: ReviewDraft,
    author: { name: string; avatar: string },
  ) => boolean;
}

const EMPTY: TourUiState = { reviews: [], bookmarked: false, bookingStatus: "idle" };

export const useToursStore = create<ToursState>((set, get) => ({
  byTour: {},

  ensureTour: (tourId, seedReviews) => {
    if (get().byTour[tourId]) return;
    set((s) => ({
      byTour: {
        ...s.byTour,
        [tourId]: { reviews: seedReviews, bookmarked: false, bookingStatus: "idle" },
      },
    }));
  },

  requestBooking: (actor, tourId) => {
    if (!can(actor, "bookTour")) return false;
    set((s) => {
      const cur = s.byTour[tourId] ?? EMPTY;
      return { byTour: { ...s.byTour, [tourId]: { ...cur, bookingStatus: "requested" } } };
    });
    return true;
  },

  toggleBookmark: (actor, tourId) => {
    if (!can(actor, "bookmark")) return false;
    set((s) => {
      const cur = s.byTour[tourId] ?? EMPTY;
      return { byTour: { ...s.byTour, [tourId]: { ...cur, bookmarked: !cur.bookmarked } } };
    });
    return true;
  },

  submitReview: (actor, tourId, draft, author) => {
    if (!can(actor, "writeReview")) return false;
    set((s) => {
      const cur = s.byTour[tourId] ?? EMPTY;
      const review: TourReview = {
        id: `tr-new-${cur.reviews.length + 1}-${tourId}`,
        authorName: author.name,
        authorAvatar: author.avatar,
        rating: draft.rating,
        comment: draft.comment,
        createdAt: new Date().toISOString(),
        photos: [],
        bookingCompleted: true,
      };
      return { byTour: { ...s.byTour, [tourId]: { ...cur, reviews: [review, ...cur.reviews] } } };
    });
    return true;
  },
}));
