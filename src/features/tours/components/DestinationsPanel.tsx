"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Add, Location } from "iconsax-reactjs";
import { Button } from "@/ui";
import { formatPrice } from "@/lib/format";
import type { DestinationResponse } from "@/lib/api/destinations";
import { deleteDestinationAction } from "@/actions/tours";
import { DestinationForm } from "./DestinationForm";

type Props = {
  destinations: DestinationResponse[];
  agencyName: string;
  onBuildPackage: (destinationId: string) => void;
  onCreated: (dest: DestinationResponse) => void;
  onDeleted: (id: string) => void;
};

export function DestinationsPanel({
  destinations,
  agencyName,
  onBuildPackage,
  onCreated,
  onDeleted,
}: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDestinationAction(id);
      onDeleted(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{t("tours.destinations.title")}</h2>
        <Button variant="primary" size="sm" onPress={() => setShowForm(true)}>
          <Add size={16} color="currentColor" />
          {t("tours.destinations.new")}
        </Button>
      </div>

      <DestinationForm
        isOpen={showForm}
        origin="agency"
        ownerName={agencyName}
        onClose={() => setShowForm(false)}
        onCreated={(dest) => {
          onCreated(dest);
          setShowForm(false);
        }}
      />

      {destinations.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("tours.destinations.empty")}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {destinations.map((d) => (
            <li
              key={d.id}
              className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-4 shadow-primary"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{d.name}</p>
                <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                  <Location size={12} color="currentColor" />
                  {t(`destinations.provinces.${d.province}`)} ·{" "}
                  {t(`destinations.travelTypes.${d.travelType}`)}
                </p>
              </div>

              <p className="text-muted line-clamp-2 text-sm">{d.description || d.shortDescription}</p>

              <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                <span className="text-sm font-semibold">
                  {t("tours.destinations.from")} {formatPrice(d.priceFrom, d.currency, lng)}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onPress={() => onBuildPackage(d.id)}>
                    {t("tours.destinations.buildPackage")}
                  </Button>
                  <Button
                    variant="tertiary"
                    size="sm"
                    isPending={deletingId === d.id}
                    onPress={() => handleDelete(d.id)}
                    aria-label={t("common.delete")}
                  >
                    ×
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
