"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import type { DestinationResponse } from "@/lib/api/destinations";
import { DestinationsPanel } from "@/features/tours/components/DestinationsPanel";

type Props = {
  initialDestinations: DestinationResponse[];
  publicDestinations: DestinationResponse[];
};

export function DestinationsClient({ initialDestinations, publicDestinations }: Props) {
  const { user } = useSession();
  const router = useLocalizedRouter();
  const [destinations, setDestinations] = useState(initialDestinations);

  return (
    <DestinationsPanel
      destinations={destinations}
      publicDestinations={publicDestinations}
      agencyName={user?.name ?? ""}
      onBuildPackage={(id) => router.push(`/agency/tours?from=${id}`)}
      onCreated={(dest) => setDestinations((prev) => [dest, ...prev])}
      onDeleted={(id) => setDestinations((prev) => prev.filter((d) => d.id !== id))}
    />
  );
}
