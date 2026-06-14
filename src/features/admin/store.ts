import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import {
  initialActivities,
  initialAdminBookings,
  initialAdminPackages,
  initialAgencyRequests,
  initialEditRequests,
  initialReports,
  initialSystemSettings,
  initialUsers,
} from "./data";
import type { Role } from "@/features/auth/schema";
import type {
  ActivityEdit,
  AdminBooking,
  AdminBookingStatus,
  AdminPackage,
  AdminPackageStatus,
  AgencyRequest,
  EditRequest,
  PlatformActivity,
  Report,
  SystemSettings,
  UserStatus,
  UserSummary,
} from "./schema";

interface AdminState {
  agencyRequests: AgencyRequest[];
  reports: Report[];
  activities: PlatformActivity[];
  users: UserSummary[];
  editRequests: EditRequest[];
  adminPackages: AdminPackage[];
  adminBookings: AdminBooking[];
  settings: SystemSettings;
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
  /** Agency edit requests — admin approves or rejects changes to published activities. */
  approveEditRequest: (actor: Actor | null, id: string) => boolean;
  rejectEditRequest: (actor: Actor | null, id: string) => boolean;
  /** Package moderation — admin can publish, archive, or delete any package. */
  setPackageStatus: (actor: Actor | null, id: string, status: AdminPackageStatus) => boolean;
  deletePackage: (actor: Actor | null, id: string) => boolean;
  /** System settings — platform-wide config. */
  updateSettings: (actor: Actor | null, patch: Partial<SystemSettings>) => boolean;
  /** Reports — attach an admin note explaining the resolution. */
  addReportNote: (actor: Actor | null, id: string, note: string) => boolean;
  /** Users — change a user's role (e.g. downgrade agency → traveler). */
  changeUserRole: (actor: Actor | null, id: string, role: Role) => boolean;
  /** Bookings — admin can cancel a pending or approved booking. */
  cancelBooking: (actor: Actor | null, id: string) => boolean;
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

const setEditRequestStatus = (list: EditRequest[], id: string, status: EditRequest["status"]) =>
  list.map((r) => (r.id === id ? { ...r, status } : r));

export const useAdminStore = create<AdminState>((set) => ({
  agencyRequests: initialAgencyRequests(),
  reports: initialReports(),
  activities: initialActivities(),
  users: initialUsers(),
  editRequests: initialEditRequests(),
  adminPackages: initialAdminPackages(),
  adminBookings: initialAdminBookings(),
  settings: initialSystemSettings(),

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

  approveEditRequest: (actor, id) => {
    if (!can(actor, "manageEditRequests")) return false;
    set((s) => ({ editRequests: setEditRequestStatus(s.editRequests, id, "approved") }));
    return true;
  },

  rejectEditRequest: (actor, id) => {
    if (!can(actor, "manageEditRequests")) return false;
    set((s) => ({ editRequests: setEditRequestStatus(s.editRequests, id, "rejected") }));
    return true;
  },

  setPackageStatus: (actor, id, status) => {
    if (!can(actor, "managePackages")) return false;
    set((s) => ({
      adminPackages: s.adminPackages.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
    return true;
  },

  deletePackage: (actor, id) => {
    if (!can(actor, "managePackages")) return false;
    set((s) => ({ adminPackages: s.adminPackages.filter((p) => p.id !== id) }));
    return true;
  },

  updateSettings: (actor, patch) => {
    if (!can(actor, "configureSystem")) return false;
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    return true;
  },

  addReportNote: (actor, id, note) => {
    if (!can(actor, "manageReports")) return false;
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, adminNote: note } : r)),
    }));
    return true;
  },

  changeUserRole: (actor, id, role) => {
    if (!can(actor, "manageUsers")) return false;
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, role } : u)),
    }));
    return true;
  },

  cancelBooking: (actor, id) => {
    if (!can(actor, "managePackages")) return false;
    set((s) => ({
      adminBookings: s.adminBookings.map((b) =>
        b.id === id && (b.status === "pending" || b.status === "approved")
          ? { ...b, status: "rejected" as AdminBookingStatus }
          : b,
      ),
    }));
    return true;
  },
}));
