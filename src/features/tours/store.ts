import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import { initialDestinations, initialPackages } from "./data";
import type {
  DestinationOrigin,
  NewDestinationInput,
  NewPackageInput,
  ReviewDraft,
  TourDestination,
  TourPackage,
  TourReview,
} from "./schema";

/**
 * The single tours store, backing both surfaces of the feature. Every mutation
 * re-checks permission via `can(...)` before changing state (defense in depth) —
 * UI gates are UX; this is the enforcement seam the real API will mirror.
 * Mutations return `false` when denied.
 *
 *  1. Public tour detail / booking — per-tour UI state that survives tab switches
 *     (optimistic review list, bookmark, booking-request status), keyed by tour id.
 *  2. Agency destination → package → approval flow — a shared in-memory list of
 *     destinations + packages driving the agency (create / submit) and admin
 *     (approve / reject) surfaces end to end.
 */
interface TourUiState {
  reviews: TourReview[];
  bookmarked: boolean;
  bookingStatus: "idle" | "requested";
}

interface ToursState {
  // ── 1. Public tour detail / booking ──
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

  // ── 2. Agency destination → package → approval flow ──
  destinations: TourDestination[];
  packages: TourPackage[];
  /** Create a destination. `origin` marks Flow 1 (admin) vs Flow 2 (agency). */
  addDestination: (
    actor: Actor | null,
    input: NewDestinationInput,
    origin: DestinationOrigin,
    ownerName: string,
  ) => boolean;
  /** Create a draft tour package against a destination. */
  addPackage: (actor: Actor | null, input: NewPackageInput, agencyName: string) => boolean;
  /** Agency action: submit a draft package for admin approval (draft → pending). */
  submitForApproval: (actor: Actor | null, id: string, submittedAtLabel: string) => boolean;
  /** Admin action: approve a pending package (pending → approved). */
  approvePackage: (actor: Actor | null, id: string) => boolean;
  /** Admin action: reject a pending package (pending → rejected). */
  rejectPackage: (actor: Actor | null, id: string) => boolean;
}

const EMPTY: TourUiState = { reviews: [], bookmarked: false, bookingStatus: "idle" };

const setPackageStatus = (
  packages: TourPackage[],
  id: string,
  status: TourPackage["status"],
  submittedAtLabel?: string,
) =>
  packages.map((p) =>
    p.id === id
      ? { ...p, status, ...(submittedAtLabel ? { submittedAtLabel } : {}) }
      : p,
  );

export const useToursStore = create<ToursState>((set, get) => ({
  // ── 1. Public tour detail / booking ──
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

  // ── 2. Agency destination → package → approval flow ──
  destinations: initialDestinations(),
  packages: initialPackages(),

  addDestination: (actor, input, origin, ownerName) => {
    if (!can(actor, "createDestination")) return false;
    const next: TourDestination = {
      id: `td-new-${get().destinations.length + 1}`,
      name: input.name,
      description: input.description,
      province: input.province,
      travelType: input.travelType,
      coverImageUrl: input.coverImageUrl,
      priceFrom: input.priceFrom,
      currency: input.currency,
      latitude: input.latitude,
      longitude: input.longitude,
      origin,
      ownerName,
    };
    set((s) => ({ destinations: [next, ...s.destinations] }));
    return true;
  },

  addPackage: (actor, input, agencyName) => {
    if (!can(actor, "managePackages")) return false;
    const destination = input.destinationId
      ? get().destinations.find((d) => d.id === input.destinationId)
      : undefined;
    const next: TourPackage = {
      id: `tp-new-${get().packages.length + 1}`,
      title: input.title,
      destinationId: destination?.id ?? "unknown",
      destinationName: destination?.name ?? input.province ?? "—",
      agencyName,
      days: input.days,
      priceFrom: input.priceFrom,
      currency: input.currency ?? "USD",
      status: "draft",
    };
    set((s) => ({ packages: [next, ...s.packages] }));
    return true;
  },

  submitForApproval: (actor, id, submittedAtLabel) => {
    if (!can(actor, "submitPackageApproval")) return false;
    set((s) => ({
      packages: setPackageStatus(s.packages, id, "pending", submittedAtLabel),
    }));
    return true;
  },

  approvePackage: (actor, id) => {
    if (!can(actor, "reviewPackageApproval")) return false;
    set((s) => ({ packages: setPackageStatus(s.packages, id, "approved") }));
    return true;
  },

  rejectPackage: (actor, id) => {
    if (!can(actor, "reviewPackageApproval")) return false;
    set((s) => ({ packages: setPackageStatus(s.packages, id, "rejected") }));
    return true;
  },
}));
