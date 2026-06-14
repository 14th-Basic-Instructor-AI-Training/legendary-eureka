"use client";

import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Category, ClipboardText, Calendar } from "iconsax-reactjs";
import { Tabs } from "@/ui";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import { useResource } from "@/lib/useResource";
import { getPackages } from "../data";
import { useAgencyStore } from "../store";
import { ActivitiesPanel } from "./ActivitiesPanel";
import { BookingRequestsPanel } from "./BookingRequestsPanel";
import { PackagesPanel } from "./PackagesPanel";
import type { ComponentType } from "react";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

function Stat({ label, value, Icon }: { label: string; value: number; Icon: IconType }) {
  return (
    <div className="bg-surface border-border flex items-center gap-3 rounded-2xl border p-4">
      <span className="bg-emerald-500/10 text-emerald-600 inline-flex h-10 w-10 items-center justify-center rounded-xl">
        <Icon size={20} color="currentColor" variant="Bold" />
      </span>
      <div>
        <p className="text-xl font-bold tracking-tight">{value}</p>
        <p className="text-muted text-xs">{label}</p>
      </div>
    </div>
  );
}

export function AgencyWorkspace() {
  const { t } = useTranslation();
  const { user } = useSession();
  const params = useSearchParams();
  const router = useLocalizedRouter();
  const tab = params.get("tab") ?? "bookings";
  const activities = useAgencyStore((s) => s.activities);
  const bookings = useAgencyStore((s) => s.bookings);
  const packagesState = useResource(getPackages);

  const publishedActivities = activities.filter((a) => a.status === "published").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const activePackages =
    packagesState.data?.filter((p) => p.status === "published").length ?? 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-primary text-2xl font-bold tracking-tight">{t("agency.title")}</h1>
        <p className="text-muted mt-1">
          {user ? t("dashboard.greeting", { name: user.name }) : t("agency.subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label={t("agency.stats.published")} value={publishedActivities} Icon={Category} />
        <Stat
          label={t("agency.stats.pendingBookings")}
          value={pendingBookings}
          Icon={ClipboardText}
        />
        <Stat label={t("agency.stats.packages")} value={activePackages} Icon={Calendar} />
      </div>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => router.replace(`/agency?tab=${String(key)}`)}
        variant="primary"
      >
        <Tabs.List aria-label={t("agency.title")}>
          <Tabs.Tab id="bookings">{t("agency.tabs.bookings")}</Tabs.Tab>
          <Tabs.Tab id="activities">{t("agency.tabs.activities")}</Tabs.Tab>
          <Tabs.Tab id="packages">{t("agency.tabs.packages")}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="bookings" className="pt-5">
          <BookingRequestsPanel />
        </Tabs.Panel>
        <Tabs.Panel id="activities" className="pt-5">
          <ActivitiesPanel />
        </Tabs.Panel>
        <Tabs.Panel id="packages" className="pt-5">
          <PackagesPanel state={packagesState} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
