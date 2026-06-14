import { create } from "zustand";
import { can, type Actor } from "@/lib/permissions";
import { initialAgencyRequests, initialReports } from "./data";
import type { AgencyRequest, Report } from "./schema";

interface AdminState {
  agencyRequests: AgencyRequest[];
  reports: Report[];
  /** Confirm a traveler's become-an-agency request (agency-onboarding flow). */
  approveAgency: (actor: Actor | null, id: string) => boolean;
  rejectAgency: (actor: Actor | null, id: string) => boolean;
  /** Act on a traveler report. */
  resolveReport: (actor: Actor | null, id: string) => boolean;
  dismissReport: (actor: Actor | null, id: string) => boolean;
}

const setRequestStatus = (
  list: AgencyRequest[],
  id: string,
  status: AgencyRequest["status"],
) => list.map((r) => (r.id === id ? { ...r, status } : r));

const setReportStatus = (list: Report[], id: string, status: Report["status"]) =>
  list.map((r) => (r.id === id ? { ...r, status } : r));

export const useAdminStore = create<AdminState>((set) => ({
  agencyRequests: initialAgencyRequests(),
  reports: initialReports(),

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
}));
