import { clientApiFetch } from "@/lib/api/client";
import type { AdminDashboardResponse } from "@/lib/api/admin";
import type {
  AdminBooking,
  AdminDashboard,
  AdminPackage,
  AgencyRequest,
  EditRequest,
  PlatformActivity,
  Report,
  SystemSettings,
  UserSummary,
} from "./schema";

export type Result<T> = { ok: true; data: T } | { ok: false; error: "load_failed" };

// ── Empty dashboard (rendered while store loads or on error) ─────────────────

const EMPTY_DASHBOARD: AdminDashboard = {
  kpis: [],
  volume: [],
  distribution: [],
  approvals: [],
  newUsers: [],
  recentRequests: [],
  feed: [],
};

// ── Read-only dashboard getter ────────────────────────────────────────────────

export async function getAdminDashboard(): Promise<Result<AdminDashboard>> {
  try {
    const raw = await clientApiFetch<AdminDashboardResponse>("/admin/dashboard");
    // The API returns generic Record<string, unknown>[] arrays — cast to the
    // feature schema's typed arrays. The dashboard charts handle missing fields gracefully.
    const dashboard: AdminDashboard = {
      kpis: (raw.kpis ?? []) as AdminDashboard["kpis"],
      volume: (raw.volume ?? []) as AdminDashboard["volume"],
      distribution: (raw.distribution ?? []) as AdminDashboard["distribution"],
      approvals: (raw.approvals ?? []) as AdminDashboard["approvals"],
      newUsers: (raw.newUsers ?? []) as AdminDashboard["newUsers"],
      recentRequests: (raw.recentRequests ?? []) as AdminDashboard["recentRequests"],
      feed: (raw.feed ?? []) as AdminDashboard["feed"],
    };
    return { ok: true, data: dashboard };
  } catch {
    return { ok: true, data: EMPTY_DASHBOARD };
  }
}

// ── Store seeders (return empty defaults — stores load real data via API actions) ──

export function initialAgencyRequests(): AgencyRequest[] {
  return [];
}

export function initialReports(): Report[] {
  return [];
}

export function initialActivities(): PlatformActivity[] {
  return [];
}

export function initialUsers(): UserSummary[] {
  return [];
}

export function initialEditRequests(): EditRequest[] {
  return [];
}

export function initialAdminPackages(): AdminPackage[] {
  return [];
}

export function initialAdminBookings(): AdminBooking[] {
  return [];
}

export function initialSystemSettings(): SystemSettings {
  return {
    commissionRate: 0,
    maxPackageDays: 30,
    minActivityPriceUsd: 0,
    registrationOpen: true,
    bookingEnabled: true,
    maintenanceMode: false,
  };
}
