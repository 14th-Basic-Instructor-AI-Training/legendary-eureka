"use client";

import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Buildings, Flag, Category } from "iconsax-reactjs";
import { Tabs } from "@/ui";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import { useResource } from "@/lib/useResource";
import { getPlatformActivities } from "../data";
import { useAdminStore } from "../store";
import { AgencyRequestsQueue } from "./AgencyRequestsQueue";
import { ReportsQueue } from "./ReportsQueue";
import { ActivitiesAdmin } from "./ActivitiesAdmin";
import { UsersPanel } from "./UsersPanel";
import type { ComponentType } from "react";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

function Stat({ label, value, Icon }: { label: string; value: number; Icon: IconType }) {
  return (
    <div className="bg-surface border-border flex items-center gap-3 rounded-2xl border p-4">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
        <Icon size={20} color="currentColor" variant="Bold" />
      </span>
      <div>
        <p className="text-xl font-bold tracking-tight">{value}</p>
        <p className="text-muted text-xs">{label}</p>
      </div>
    </div>
  );
}

export function AdminControlPanel() {
  const { t } = useTranslation();
  const { user } = useSession();
  const params = useSearchParams();
  const router = useLocalizedRouter();
  const tab = params.get("tab") ?? "requests";
  const agencyRequests = useAdminStore((s) => s.agencyRequests);
  const reports = useAdminStore((s) => s.reports);
  const activitiesState = useResource(getPlatformActivities);

  const pendingRequests = agencyRequests.filter((r) => r.status === "pending").length;
  const openReports = reports.filter((r) => r.status === "open").length;
  const activityCount = activitiesState.data?.length ?? 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-primary text-2xl font-bold tracking-tight">{t("admin.title")}</h1>
        <p className="text-muted mt-1">
          {user ? t("dashboard.greeting", { name: user.name }) : t("admin.subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label={t("admin.stats.pendingRequests")} value={pendingRequests} Icon={Buildings} />
        <Stat label={t("admin.stats.openReports")} value={openReports} Icon={Flag} />
        <Stat label={t("admin.stats.activities")} value={activityCount} Icon={Category} />
      </div>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => router.replace(`/admin?tab=${String(key)}`)}
        variant="primary"
      >
        <Tabs.List aria-label={t("admin.title")}>
          <Tabs.Tab id="requests">{t("admin.tabs.requests")}</Tabs.Tab>
          <Tabs.Tab id="reports">{t("admin.tabs.reports")}</Tabs.Tab>
          <Tabs.Tab id="activities">{t("admin.tabs.activities")}</Tabs.Tab>
          <Tabs.Tab id="users">{t("admin.tabs.users")}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="requests" className="pt-5">
          <AgencyRequestsQueue />
        </Tabs.Panel>
        <Tabs.Panel id="reports" className="pt-5">
          <ReportsQueue />
        </Tabs.Panel>
        <Tabs.Panel id="activities" className="pt-5">
          <ActivitiesAdmin state={activitiesState} />
        </Tabs.Panel>
        <Tabs.Panel id="users" className="pt-5">
          <UsersPanel />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
