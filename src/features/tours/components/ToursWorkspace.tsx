"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/ui";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import { DEMO_AGENCY_NAME } from "../data";
import { useToursStore } from "../store";
import { DestinationsPanel } from "./DestinationsPanel";
import { FlowGuide } from "./FlowGuide";
import { PackagesPanel } from "./PackagesPanel";

/**
 * Agency tour builder. Drives both flows: pick/create a destination, build a
 * package against it, then request admin approval. Tab state lives in the URL
 * (`?tab=`); "Build package" deep-links into the packages tab with the
 * destination pre-selected.
 */
export function ToursWorkspace() {
  const { t } = useTranslation();
  const { user } = useSession();
  const params = useSearchParams();
  const router = useLocalizedRouter();
  const tab = params.get("tab") ?? "destinations";

  const destinations = useToursStore((s) => s.destinations);
  const packages = useToursStore((s) => s.packages);
  const agencyName = user?.name ?? DEMO_AGENCY_NAME;

  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [presetDestinationId, setPresetDestinationId] = useState<string | undefined>();

  const handleBuildPackage = (destinationId: string) => {
    setPresetDestinationId(destinationId);
    setPackageFormOpen(true);
    router.replace("/agency/tours?tab=packages");
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-primary text-2xl font-bold tracking-tight">{t("tours.agency.title")}</h1>
        <p className="text-muted mt-1">{t("tours.agency.subtitle")}</p>
      </header>

      <FlowGuide />

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => router.replace(`/agency/tours?tab=${String(key)}`)}
        variant="primary"
      >
        <Tabs.List aria-label={t("tours.agency.title")}>
          <Tabs.Tab id="destinations">{t("tours.tabs.destinations")}</Tabs.Tab>
          <Tabs.Tab id="packages">{t("tours.tabs.packages")}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="destinations" className="pt-5">
          <DestinationsPanel destinations={destinations} onBuildPackage={handleBuildPackage} />
        </Tabs.Panel>
        <Tabs.Panel id="packages" className="pt-5">
          <PackagesPanel
            destinations={destinations}
            packages={packages}
            agencyName={agencyName}
            formOpen={packageFormOpen}
            setFormOpen={setPackageFormOpen}
            presetDestinationId={presetDestinationId}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
