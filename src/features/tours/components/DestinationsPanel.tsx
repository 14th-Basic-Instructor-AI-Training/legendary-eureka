"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Add, CloseCircle, Location } from "iconsax-reactjs";
import { Button, Chip } from "@/ui";
import { formatPrice } from "@/lib/format";
import { DestinationForm } from "./DestinationForm";
import type { TourDestination } from "../schema";

type Props = {
  destinations: TourDestination[];
  agencyName: string;
  /** Switch to the packages tab with this destination pre-selected (Flow 1/2). */
  onBuildPackage: (destinationId: string) => void;
};

/** Agency: browse admin + own destinations, create a new one, build a package. */
export function DestinationsPanel({ destinations, agencyName, onBuildPackage }: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{t("tours.destinations.title")}</h2>
        <Button variant="primary" size="sm" onPress={() => setShowForm((v) => !v)}>
          {showForm ? (
            <CloseCircle size={16} color="currentColor" />
          ) : (
            <Add size={16} color="currentColor" />
          )}
          {t("tours.destinations.new")}
        </Button>
      </div>

      {showForm ? (
        <DestinationForm origin="agency" ownerName={agencyName} onDone={() => setShowForm(false)} />
      ) : null}

      {destinations.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("tours.destinations.empty")}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {destinations.map((d) => (
            <li
              key={d.id}
              className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-4 shadow-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.name}</p>
                  <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                    <Location size={12} color="currentColor" />
                    {t(`destinations.provinces.${d.province}`)} ·{" "}
                    {t(`destinations.travelTypes.${d.travelType}`)}
                  </p>
                </div>
                <Chip color={d.origin === "admin" ? "accent" : "default"} variant="soft" size="sm">
                  {t(`tours.destinations.origin.${d.origin}`)}
                </Chip>
              </div>

              <p className="text-muted line-clamp-2 text-sm">{d.summary}</p>

              <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                <span className="text-sm font-semibold">
                  {t("tours.destinations.from")} {formatPrice(d.priceFrom, d.currency, lng)}
                </span>
                <Button variant="secondary" size="sm" onPress={() => onBuildPackage(d.id)}>
                  {t("tours.destinations.buildPackage")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
