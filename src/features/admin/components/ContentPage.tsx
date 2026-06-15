"use client";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { InfoCircle } from "iconsax-reactjs";
import { Tabs } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { PackagesAdmin } from "./PackagesAdmin";
import { AdminDestinationsManager } from "@/features/tours/components/AdminDestinationsManager";
import type { DestinationResponse } from "@/lib/api/destinations";
import type { TourPackageResponse } from "@/lib/api/packages";

export function ContentPage({
  destinations,
  packages,
  loadError = false,
}: {
  destinations: DestinationResponse[];
  packages: TourPackageResponse[];
  loadError?: boolean;
}) {
  const { t } = useTranslation();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "destinations";
  const router = useLocalizedRouter();

  return (
    <div className="mx-auto flex max-w-full flex-col gap-6">
      <header>
        <h1 className="text-primary text-2xl font-bold tracking-tight">
          {t("admin.nav.content")}
        </h1>
        <p className="text-muted mt-1">{t("admin.pages.content.subtitle")}</p>
      </header>

      {loadError ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
          <InfoCircle size={28} color="currentColor" className="text-muted" />
          <p className="text-muted text-sm">{t("admin.content.error")}</p>
        </div>
      ) : (
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => router.replace(`/admin/content?tab=${String(key)}`)}
          variant="primary"
        >
          <Tabs.List aria-label={t("admin.nav.content")}>
            <Tabs.Tab id="destinations">{t("tours.nav.destinations")}</Tabs.Tab>
            <Tabs.Tab id="packages">{t("admin.content.tabs.packages")}</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="destinations" className="pt-5">
            <AdminDestinationsManager destinations={destinations} />
          </Tabs.Panel>
          <Tabs.Panel id="packages" className="pt-5">
            <PackagesAdmin packages={packages} />
          </Tabs.Panel>
        </Tabs>
      )}
    </div>
  );
}
