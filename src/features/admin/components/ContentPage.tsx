"use client";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { Tabs } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { ActivitiesAdmin } from "./ActivitiesAdmin";
import { PackagesAdmin } from "./PackagesAdmin";
import { AdminDestinationsManager } from "@/features/tours/components/AdminDestinationsManager";
import { TourApprovalsQueue } from "@/features/tours/components/TourApprovalsQueue";

export function ContentPage() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "activities";
  const router = useLocalizedRouter();

  return (
    <div className="mx-auto flex max-w-full flex-col gap-6">
      <header>
        <h1 className="text-primary text-2xl font-bold tracking-tight">
          {t("admin.nav.content")}
        </h1>
        <p className="text-muted mt-1">{t("admin.pages.content.subtitle")}</p>
      </header>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => router.replace(`/admin/content?tab=${String(key)}`)}
        variant="primary"
      >
        <Tabs.List aria-label={t("admin.nav.content")}>
          <Tabs.Tab id="activities">{t("admin.content.tabs.activities")}</Tabs.Tab>
          <Tabs.Tab id="destinations">{t("tours.nav.destinations")}</Tabs.Tab>
          <Tabs.Tab id="packages">{t("admin.content.tabs.packages")}</Tabs.Tab>
          <Tabs.Tab id="approvals">{t("tours.nav.approvals")}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="activities" className="pt-5">
          <ActivitiesAdmin />
        </Tabs.Panel>
        <Tabs.Panel id="destinations" className="pt-5">
          <AdminDestinationsManager />
        </Tabs.Panel>
        <Tabs.Panel id="packages" className="pt-5">
          <PackagesAdmin />
        </Tabs.Panel>
        <Tabs.Panel id="approvals" className="pt-5">
          <TourApprovalsQueue />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
