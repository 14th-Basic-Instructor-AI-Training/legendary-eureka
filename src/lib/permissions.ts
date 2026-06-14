import type { Role } from "@/features/auth/schema";

/**
 * Central authorization surface. Every role check in the app routes through here
 * — never re-derive role logic inside a component. Table-driven so it stays
 * testable. Expands into the full matrix as features land.
 *
 * An unauthenticated visitor is a "guest": read-only access to public content.
 */

/** Anyone making a request — the three roles plus the unauthenticated guest. */
export type Actor = Role | "guest";

/**
 * Post-sign-in home. Travelers and agencies land on the public landing page
 * (browse-first); admins go straight to the control panel. Used by login +
 * route guards.
 */
export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  agency: "/",
  traveler: "/",
};

export function homePathFor(role: Role): string {
  return ROLE_HOME[role];
}

/**
 * Where a role's dashboard / workspace / control panel lives — the target of the
 * header nav link (distinct from the landing home above).
 */
export const ROLE_DASHBOARD: Record<Role, string> = {
  admin: "/admin",
  agency: "/agency",
  traveler: "/traveler",
};

export function dashboardPathFor(role: Role): string {
  return ROLE_DASHBOARD[role];
}

export type Action =
  // public / read
  | "browse"
  // traveler
  | "book"
  | "bookmark"
  | "createTripPlan"
  | "rateActivity"
  | "reportAgency"
  | "requestAgencyUpgrade"
  // agency
  | "viewWorkspace"
  | "manageOwnActivities"
  | "requestActivityEdit"
  | "managePackages"
  | "approveBookings"
  // admin
  | "moderate"
  | "manageAgencyRequests"
  | "manageReports"
  | "manageUsers"
  | "editAnyActivity";

const MATRIX: Record<Actor, Action[]> = {
  guest: ["browse"],
  traveler: [
    "browse",
    "book",
    "bookmark",
    "createTripPlan",
    "rateActivity",
    "reportAgency",
    "requestAgencyUpgrade",
  ],
  agency: [
    "browse",
    "viewWorkspace",
    "manageOwnActivities",
    "requestActivityEdit",
    "managePackages",
    "approveBookings",
  ],
  admin: [
    "browse",
    "moderate",
    "manageAgencyRequests",
    "manageReports",
    "manageUsers",
    "editAnyActivity",
  ],
};

/** Can this actor perform this action? `null` is treated as a guest. */
export function can(actor: Actor | null, action: Action): boolean {
  const key: Actor = actor ?? "guest";
  return MATRIX[key]?.includes(action) ?? false;
}

/**
 * Assert an actor may perform an action — throws a typed error the data layer
 * maps to a localized "not allowed" result. Mutation paths call this in addition
 * to any UI gate (defense in depth).
 */
export class PermissionError extends Error {
  constructor(public action: Action) {
    super(`Permission denied: ${action}`);
    this.name = "PermissionError";
  }
}

export function assertCan(actor: Actor | null, action: Action): void {
  if (!can(actor, action)) throw new PermissionError(action);
}
