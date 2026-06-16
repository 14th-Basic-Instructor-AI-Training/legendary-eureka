"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth";
import type { TourPackageResponse, TourPackageStatus } from "@/lib/api/packages";
import type { DestinationResponse } from "@/lib/api/destinations";
import { PackagesPanel } from "@/features/tours/components/PackagesPanel";

type Props = {
  initialPackages: TourPackageResponse[];
  destinations: DestinationResponse[];
};

export function PackagesClient({ initialPackages, destinations }: Props) {
  const { user } = useSession();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState(initialPackages);

  // Pre-fill form when arriving via "Build Package" from the destinations page
  const fromId = searchParams.get("from");
  const presetDestination = fromId ? destinations.find((d) => d.id === fromId) : undefined;
  const [formOpen, setFormOpen] = useState(!!presetDestination);

  return (
    <PackagesPanel
      packages={packages}
      destinations={destinations}
      agencyName={user?.name ?? ""}
      formOpen={formOpen}
      setFormOpen={setFormOpen}
      presetDestination={presetDestination}
      onPackageCreated={(pkg) => setPackages((prev) => [pkg, ...prev])}
      onStatusChanged={(id, status: TourPackageStatus) =>
        setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
      }
      onSubmitted={(id) =>
        setPackages((prev) =>
          prev.map((p) => (p.id === id ? { ...p, approvalStatus: "PENDING" } : p)),
        )
      }
      onDeleted={(id) => setPackages((prev) => prev.filter((p) => p.id !== id))}
    />
  );
}
