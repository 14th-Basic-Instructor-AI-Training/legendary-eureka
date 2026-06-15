import { clientApiFetch } from "@/lib/api/client";
import type { AdminDashboardResponse } from "@/lib/api/admin";
import type {
  AdminBooking,
  AdminDashboard,
  AdminPackage,
  AgencyRequest,
  EditRequest,
  KpiKey,
  KpiMetric,
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

const KPI_KEYS = new Set<KpiKey>([
  "totalUsers",
  "totalDestinations",
  "totalTours",
  "totalTrips",
  "pendingAgencies",
  "pendingReports",
]);

function mapKpi(raw: Record<string, unknown>): KpiMetric | null {
  const key = raw.key;
  if (typeof key !== "string" || !KPI_KEYS.has(key as KpiKey)) return null;

  const deltaDir = raw.deltaDir;
  const normalizedDir =
    deltaDir === "up" || deltaDir === "down" || deltaDir === "neutral" ? deltaDir : "neutral";

  return {
    key: key as KpiKey,
    value: Number(raw.value ?? 0),
    deltaPct: Number(raw.deltaPct ?? 0),
    deltaDir: normalizedDir,
    deltaGood: Boolean(raw.deltaGood),
    comparison: typeof raw.comparison === "string" ? raw.comparison : "",
  };
}

export async function getAdminDashboard(): Promise<Result<AdminDashboard>> {
  try {
    const raw = await clientApiFetch<AdminDashboardResponse>("/admin/dashboard");
    const dashboard: AdminDashboard = {
      kpis: (raw.kpis ?? [])
        .map((item) => mapKpi(item as Record<string, unknown>))
        .filter((item): item is KpiMetric => item !== null),
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
