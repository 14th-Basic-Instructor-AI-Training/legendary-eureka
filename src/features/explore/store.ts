import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import {
  EMPTY_DESTINATION_FILTER,
  EMPTY_TOUR_FILTER,
  type DestinationFilter,
  type ExploreSort,
  type ExploreTab,
  type ExploreView,
  type TourFilter,
} from "./schema";

/**
 * Explore view state shared by the tabs, sidebar, toolbar, and results. Filter
 * edits are patch-merge so the store stays the single source of truth. Bookmark
 * toggles re-check `can(actor, "bookmark")` (defense in depth) — UI gating is UX,
 * this is the authorization gate.
 */
interface ExploreState {
  tab: ExploreTab;
  view: ExploreView;
  sort: ExploreSort;
  destinationFilter: DestinationFilter;
  tourFilter: TourFilter;
  bookmarks: ReadonlySet<string>;

  setTab: (tab: ExploreTab) => void;
  setView: (view: ExploreView) => void;
  setSort: (sort: ExploreSort) => void;
  patchDestinationFilter: (patch: Partial<DestinationFilter>) => void;
  patchTourFilter: (patch: Partial<TourFilter>) => void;
  /** Resets the active tab's filter to its empty default. */
  clearFilters: () => void;
  /** Toggles a bookmark; returns false (no-op) when the actor can't bookmark. */
  toggleBookmark: (actor: Actor | null, id: string) => boolean;
  isBookmarked: (id: string) => boolean;
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  tab: "destinations",
  view: "grid",
  sort: "recommended",
  destinationFilter: EMPTY_DESTINATION_FILTER,
  tourFilter: EMPTY_TOUR_FILTER,
  bookmarks: new Set<string>(),

  setTab: (tab) => set({ tab }),
  setView: (view) => set({ view }),
  setSort: (sort) => set({ sort }),

  patchDestinationFilter: (patch) =>
    set((s) => ({ destinationFilter: { ...s.destinationFilter, ...patch } })),
  patchTourFilter: (patch) =>
    set((s) => ({ tourFilter: { ...s.tourFilter, ...patch } })),

  clearFilters: () =>
    set((s) =>
      s.tab === "destinations"
        ? { destinationFilter: EMPTY_DESTINATION_FILTER }
        : { tourFilter: EMPTY_TOUR_FILTER },
    ),

  toggleBookmark: (actor, id) => {
    if (!can(actor, "bookmark")) return false;
    set((s) => {
      const next = new Set(s.bookmarks);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { bookmarks: next };
    });
    return true;
  },

  isBookmarked: (id) => get().bookmarks.has(id),
}));
