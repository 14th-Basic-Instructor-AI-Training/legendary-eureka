import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import {
  initialActivities,
  initialAgencyRequests,
  initialReports,
  initialUsers,
} from "./data";
import type {
  ActivityEdit,
  AgencyRequest,
  PlatformActivity,
  Report,
  UserStatus,
  UserSummary,
} from "./schema";

interface AdminState {
  agencyRequests: AgencyRequest[];
  reports: Report[];
  activities: PlatformActivity[];
  users: UserSummary[];
  /** Confirm a traveler's become-an-agency request (agency-onboarding flow). */
  approveAgency: (actor: Actor | null, id: string) => boolean;
  rejectAgency: (actor: Actor | null, id: string) => boolean;
  /** Act on a traveler report. */
  resolveReport: (actor: Actor | null, id: string) => boolean;
  dismissReport: (actor: Actor | null, id: string) => boolean;
  /** Content moderation — admin may edit or delete any activity. */
  updateActivity: (actor: Actor | null, id: string, patch: ActivityEdit) => boolean;
  deleteActivity: (actor: Actor | null, id: string) => boolean;
  /** User moderation — suspend / ban / reactivate accounts. */
  suspendUser: (actor: Actor | null, id: string) => boolean;
  banUser: (actor: Actor | null, id: string) => boolean;
  reactivateUser: (actor: Actor | null, id: string) => boolean;
}

const setRequestStatus = (
  list: AgencyRequest[],
  id: string,
  status: AgencyRequest["status"],
) => list.map((r) => (r.id === id ? { ...r, status } : r));

const setReportStatus = (list: Report[], id: string, status: Report["status"]) =>
  list.map((r) => (r.id === id ? { ...r, status } : r));

const setUserStatus = (list: UserSummary[], id: string, status: UserStatus) =>
  list.map((u) => (u.id === id ? { ...u, status } : u));

export const useAdminStore = create<AdminState>((set) => ({
  agencyRequests: initialAgencyRequests(),
  reports: initialReports(),
  activities: initialActivities(),
  users: initialUsers(),

  approveAgency: (actor, id) => {
    if (!can(actor, "manageAgencyRequests")) return false;
    set((s) => ({ agencyRequests: setRequestStatus(s.agencyRequests, id, "approved") }));
    return true;
  },

  rejectAgency: (actor, id) => {
    if (!can(actor, "manageAgencyRequests")) return false;
    set((s) => ({ agencyRequests: setRequestStatus(s.agencyRequests, id, "rejected") }));
    return true;
  },

  resolveReport: (actor, id) => {
    if (!can(actor, "manageReports")) return false;
    set((s) => ({ reports: setReportStatus(s.reports, id, "resolved") }));
    return true;
  },

  dismissReport: (actor, id) => {
    if (!can(actor, "manageReports")) return false;
    set((s) => ({ reports: setReportStatus(s.reports, id, "dismissed") }));
    return true;
  },

  updateActivity: (actor, id, patch) => {
    if (!can(actor, "editAnyActivity")) return false;
    set((s) => ({
      activities: s.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    return true;
  },

  deleteActivity: (actor, id) => {
    if (!can(actor, "editAnyActivity")) return false;
    set((s) => ({ activities: s.activities.filter((a) => a.id !== id) }));
    return true;
  },

  suspendUser: (actor, id) => {
    if (!can(actor, "manageUsers")) return false;
    set((s) => ({ users: setUserStatus(s.users, id, "suspended") }));
    return true;
  },

  banUser: (actor, id) => {
    if (!can(actor, "manageUsers")) return false;
    set((s) => ({ users: setUserStatus(s.users, id, "banned") }));
    return true;
  },

  reactivateUser: (actor, id) => {
    if (!can(actor, "manageUsers")) return false;
    set((s) => ({ users: setUserStatus(s.users, id, "active") }));
    return true;
  },
}));
