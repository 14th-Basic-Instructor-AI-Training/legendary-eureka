import { DEMO_AGENCY_NAME, TOUR_DESTINATIONS, TOUR_PACKAGES } from "./fixtures";
import type { TourDestination, TourPackage } from "./schema";

/**
 * Read seam for the tours feature. The mutable, transition-bearing state
 * (create destination / package, request approval, approve / reject) lives in
 * `store.ts`; the store seeds from these `initialX()` helpers — never from
 * `fixtures.ts` directly. Swapping fixtures for API calls is a one-file change.
 */

export { DEMO_AGENCY_NAME };

export function initialDestinations(): TourDestination[] {
  return TOUR_DESTINATIONS;
}

export function initialPackages(): TourPackage[] {
  return TOUR_PACKAGES;
}
