import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import { initialDestinations, initialPackages } from "./data";
import type {
  DestinationOrigin,
  NewDestinationInput,
  NewPackageInput,
  TourDestination,
  TourPackage,
} from "./schema";

/**
 * Shared tours state for the destination → package → approval flow. A single
 * in-memory store backs both the agency surface (create / submit) and the admin
 * surface (approve / reject) so the demo flows connect end to end. Every
 * mutation re-checks permission via `can(...)` (defense in depth on top of the
 * route guard + UI gate).
 */
interface ToursState {
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
    const destination = get().destinations.find((d) => d.id === input.destinationId);
    if (!destination) return false;
    const next: TourPackage = {
      id: `tp-new-${get().packages.length + 1}`,
      title: input.title,
      destinationId: destination.id,
      destinationName: destination.name,
      agencyName,
      days: input.days,
      priceFrom: input.priceFrom,
      currency: "USD",
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
