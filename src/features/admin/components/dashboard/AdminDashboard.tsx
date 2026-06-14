"use client";

import { useTranslation } from "react-i18next";
import { Button, Skeleton } from "@/ui";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useResource } from "@/lib/useResource";
import { getAdminDashboard } from "../../data";
import { AreaTrendCard } from "./AreaTrendCard";
import { DonutCard } from "./DonutCard";
import { BarSeriesCard } from "./BarSeriesCard";
import { LineTrendCard } from "./LineTrendCard";
import { RecentTableCard } from "./RecentTableCard";
import { ActivityFeedCard } from "./ActivityFeedCard";
import { StatCard } from "./StatCard";

/**
 * Read-only analytics overview shown above the admin queues. Gated by
 * `can(role, "viewAnalytics")` (defense in depth on top of the admin route
 * guard); renders loading / error / empty / success explicitly.
 */
export function AdminDashboard() {
  const { t } = useTranslation();
  const { role } = useSession();
  const state = useResource(getAdminDashboard);

  // UI gate — analytics is admin-only. The route is already admin-scoped, but
  // we never rely on a single gate (see auth-permissions rules).
  if (!can(role, "viewAnalytics")) return null;

  if (state.status === "loading") return <DashboardSkeleton />;

  if (state.status === "error") {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
        <p className="text-muted text-sm">{t("admin.dashboard.error")}</p>
        <Button variant="secondary" size="sm" onPress={state.reload}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  const data = state.data;
  if (!data || data.kpis.length === 0) {
    return <p className="text-muted py-8 text-center text-sm">{t("admin.dashboard.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpis.map((metric) => (
          <StatCard key={metric.key} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaTrendCard data={data.volume} />
        </div>
        <DonutCard data={data.distribution} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarSeriesCard data={data.approvals} />
        <LineTrendCard data={data.newUsers} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTableCard rows={data.recentRequests} />
        </div>
        <ActivityFeedCard items={data.feed} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
