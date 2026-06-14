"use client";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { Tabs, Chip } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { useAdminStore } from "../store";
import { AgencyRequestsQueue } from "./AgencyRequestsQueue";
import { EditRequestsQueue } from "./EditRequestsQueue";

export function RequestsPage() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "agencies";
  const router = useLocalizedRouter();

  const agencyRequests = useAdminStore((s) => s.agencyRequests);
  const editRequests = useAdminStore((s) => s.editRequests);

  const pendingAgency = agencyRequests.filter((r) => r.status === "pending").length;
  const pendingEdit = editRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-primary text-2xl font-bold tracking-tight">
          {t("admin.nav.requests")}
        </h1>
        <p className="text-muted mt-1">{t("admin.pages.requests.subtitle")}</p>
      </header>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => router.replace(`/admin/requests?tab=${String(key)}`)}
        variant="primary"
      >
        <Tabs.List aria-label={t("admin.nav.requests")}>
          <Tabs.Tab id="agencies">
            <span className="flex items-center gap-2">
              {t("admin.requests.tabs.agencies")}
              {pendingAgency > 0 ? (
                <Chip color="warning" variant="soft" size="sm">
                  {pendingAgency}
                </Chip>
              ) : null}
            </span>
          </Tabs.Tab>
          <Tabs.Tab id="editRequests">
            <span className="flex items-center gap-2">
              {t("admin.requests.tabs.editRequests")}
              {pendingEdit > 0 ? (
                <Chip color="accent" variant="soft" size="sm">
                  {pendingEdit}
                </Chip>
              ) : null}
            </span>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="agencies" className="pt-5">
          <AgencyRequestsQueue />
        </Tabs.Panel>
        <Tabs.Panel id="editRequests" className="pt-5">
          <EditRequestsQueue />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
