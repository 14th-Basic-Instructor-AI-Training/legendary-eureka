"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/ui";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { DestinationResponse } from "@/lib/api/destinations";
import { DestinationsPanel } from "./DestinationsPanel";
import { PackagesPanel } from "./PackagesPanel";

interface Props {
  initialPackages: TourPackageResponse[];
  initialDestinations: DestinationResponse[];
  publicDestinations: DestinationResponse[];
}

export function ToursWorkspace({ initialPackages, initialDestinations, publicDestinations }: Props) {
  const { t } = useTranslation();
  const { user } = useSession();
  const params = useSearchParams();
  const router = useLocalizedRouter();
  const tab = params.get("tab") ?? "destinations";

  const [packages, setPackages] = useState(initialPackages);
  const [destinations, setDestinations] = useState(initialDestinations);
  const agencyName = user?.name ?? "";

  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [presetDestination, setPresetDestination] = useState<DestinationResponse | undefined>();

  const handleBuildPackage = (destinationId: string) => {
    const dest =
      publicDestinations.find((d) => d.id === destinationId) ??
      destinations.find((d) => d.id === destinationId && d.approvalStatus === "APPROVED");
    setPresetDestination(dest);
    setPackageFormOpen(true);
    router.replace("/agency/tours?tab=packages");
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-primary text-2xl font-bold tracking-tight">{t("tours.agency.title")}</h1>
        <p className="text-muted mt-1">{t("tours.agency.subtitle")}</p>
      </header>

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
          <DestinationsPanel
            destinations={destinations}
            publicDestinations={publicDestinations}
            agencyName={agencyName}
            onBuildPackage={handleBuildPackage}
            onCreated={(dest) => setDestinations((prev) => [dest, ...prev])}
            onDeleted={(id) => setDestinations((prev) => prev.filter((d) => d.id !== id))}
          />
        </Tabs.Panel>
        <Tabs.Panel id="packages" className="pt-5">
          <PackagesPanel
            packages={packages}
            destinations={[
              ...publicDestinations,
              ...destinations.filter(
                (d) =>
                  d.approvalStatus === "APPROVED" &&
                  !publicDestinations.some((p) => p.id === d.id),
              ),
            ]}
            agencyName={agencyName}
            formOpen={packageFormOpen}
            setFormOpen={setPackageFormOpen}
            presetDestination={presetDestination}
            onPackageCreated={(pkg) => setPackages((prev) => [pkg, ...prev])}
            onStatusChanged={(id, status) =>
              setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
            }
            onDeleted={(id) => setPackages((prev) => prev.filter((p) => p.id !== id))}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
