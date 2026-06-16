"use client";

import { useState } from "react";
import type { TourPackageResponse, TourPackageStatus } from "@/lib/api/packages";
import { PackagesPanel } from "@/features/tours/components/PackagesPanel";

type Props = {
  initialPackages: TourPackageResponse[];
};

export function PackagesClient({ initialPackages }: Props) {
  const [packages, setPackages] = useState(initialPackages);

  return (
    <PackagesPanel
      packages={packages}
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
