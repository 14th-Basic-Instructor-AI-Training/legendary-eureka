"use client";

import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { AreaTrendCard } from "./AreaTrendCard";
import { DonutCard } from "./DonutCard";
import { BarSeriesCard } from "./BarSeriesCard";
import { LineTrendCard } from "./LineTrendCard";
import { RecentTableCard } from "./RecentTableCard";
import { ActivityFeedCard } from "./ActivityFeedCard";
import { StatCard } from "./StatCard";
import type { AdminDashboardResponse } from "@/lib/api/admin";

/**
 * Read-only analytics overview shown above the admin queues. The data is fetched
 * server-side (see `admin/page.tsx`) and passed in as a prop. Gated by
 * `can(role, "viewAnalytics")` — defense in depth on top of the admin route guard.
 */
export function AdminDashboard({ data }: { data: AdminDashboardResponse }) {
  const { t } = useTranslation();
  const { role } = useSession();

  if (!can(role, "viewAnalytics")) return null;

  if (data.kpis.length === 0) {
    return <p className="text-muted py-8 text-center text-sm">{t("admin.dashboard.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
