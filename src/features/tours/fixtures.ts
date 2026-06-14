import {
  TourDestinationSchema,
  TourPackageSchema,
  type TourDestination,
  type TourPackage,
} from "./schema";

/**
 * Mock data for the tours flow. Parsed through the schemas so it can't drift.
 * Components import from `data.ts`, never from here directly.
 */

/** The agency name used for the demo session's own content. */
export const DEMO_AGENCY_NAME = "Angkor Trails";

export const TOUR_DESTINATIONS: TourDestination[] = [
  {
    id: "td-1",
    name: "Angkor Wat",
    province: "SIEM_REAP",
    travelType: "HISTORICAL",
    summary: "The iconic 12th-century temple complex at sunrise.",
    priceFrom: 25,
    currency: "USD",
    origin: "admin",
    ownerName: "Jalat Admin",
  },
  {
    id: "td-2",
    name: "Koh Rong Island",
    province: "PREAH_SIHANOUK",
    travelType: "BEACH",
    summary: "White-sand beaches and bioluminescent plankton.",
    priceFrom: 40,
    currency: "USD",
    origin: "admin",
    ownerName: "Jalat Admin",
  },
  {
    id: "td-3",
    name: "Kampot Pepper Farm",
    province: "KAMPOT",
    travelType: "NATURE",
    summary: "A guided tasting tour of the famous pepper plantations.",
    priceFrom: 18,
    currency: "USD",
    origin: "agency",
    ownerName: DEMO_AGENCY_NAME,
  },
].map((d) => TourDestinationSchema.parse(d));

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: "tp-1",
    title: "3-Day Angkor Explorer",
    destinationId: "td-1",
    destinationName: "Angkor Wat",
    agencyName: DEMO_AGENCY_NAME,
    days: 3,
    priceFrom: 220,
    currency: "USD",
    status: "approved",
  },
  {
    id: "tp-2",
    title: "Koh Rong Beach Escape",
    destinationId: "td-2",
    destinationName: "Koh Rong Island",
    agencyName: DEMO_AGENCY_NAME,
    days: 4,
    priceFrom: 360,
    currency: "USD",
    status: "pending",
    submittedAtLabel: "2 days ago",
  },
  {
    id: "tp-3",
    title: "Kampot Pepper & Riverside",
    destinationId: "td-3",
    destinationName: "Kampot Pepper Farm",
    agencyName: DEMO_AGENCY_NAME,
    days: 2,
    priceFrom: 140,
    currency: "USD",
    status: "draft",
  },
].map((p) => TourPackageSchema.parse(p));
