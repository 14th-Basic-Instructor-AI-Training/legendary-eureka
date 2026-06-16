"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Add, CloseCircle, Trash } from "iconsax-reactjs";
import { Button, StatusChip } from "@/ui";
import { formatPrice } from "@/lib/format";
import type { TourPackageResponse, TourPackageStatus } from "@/lib/api/packages";
import {
  publishPackageAction,
  archivePackageAction,
  deletePackageAction,
} from "@/actions/tours";
import type { DestinationResponse } from "@/lib/api/destinations";
import { PackageForm } from "./PackageForm";

type Props = {
  packages: TourPackageResponse[];
  destinations: DestinationResponse[];
  agencyName: string;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  presetDestination?: DestinationResponse;
  onPackageCreated: (pkg: TourPackageResponse) => void;
  onStatusChanged: (id: string, status: TourPackageStatus) => void;
  onDeleted: (id: string) => void;
};

export function PackagesPanel({
  packages,
  destinations,
  agencyName,
  formOpen,
  setFormOpen,
  presetDestination,
  onPackageCreated,
  onStatusChanged,
  onDeleted,
}: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const [pending, setPending] = useState<string | null>(null);

  const handlePublish = async (id: string) => {
    setPending(id);
    try {
      await publishPackageAction(id);
      onStatusChanged(id, "PUBLISHED");
    } finally {
      setPending(null);
    }
  };

  const handleArchive = async (id: string) => {
    setPending(id);
    try {
      await archivePackageAction(id);
      onStatusChanged(id, "ARCHIVED");
    } finally {
      setPending(null);
    }
  };

  const handleDelete = async (id: string) => {
    setPending(id);
    try {
      await deletePackageAction(id);
      onDeleted(id);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1
          className="text-4xl font-black tracking-tight"
          style={{ color: "var(--primary-lightskyblue)" }}
        >
          {t("tours.packages.pageTitle")}
        </h1>
        <p className="text-muted mt-1 text-sm">{t("tours.packages.pageSubtitle")}</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{t("tours.packages.title")}</h2>
        <Button variant="primary" size="sm" onPress={() => setFormOpen(!formOpen)}>
          {formOpen ? (
            <CloseCircle size={16} color="currentColor" />
          ) : (
            <Add size={16} color="currentColor" />
          )}
          {t("tours.packages.new")}
        </Button>
      </div>

      {formOpen ? (
        <PackageForm
          key={presetDestination?.id ?? "new"}
          destinations={destinations}
          agencyName={agencyName}
          presetDestination={presetDestination}
          onCreated={(pkg) => {
            onPackageCreated(pkg);
            setFormOpen(false);
          }}
          onCancel={() => setFormOpen(false)}
        />
      ) : null}

      {packages.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("tours.packages.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {packages.map((p) => (
            <li
              key={p.id}
              className="bg-surface border-border flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{p.title}</p>
                  <StatusChip status={p.status.toLowerCase()} />
                </div>
                <p className="text-muted mt-1 text-sm">
                  {t(`destinations.provinces.${p.province}`)} ·{" "}
                  {t("tours.packages.days", { count: p.durationDays || p.days || 1 })} ·{" "}
                  {t("landing.tours.from")}{" "}
                  {formatPrice(p.priceFrom ?? p.price, p.currency, lng)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {p.status === "DRAFT" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    isPending={pending === p.id}
                    onPress={() => handlePublish(p.id)}
                  >
                    {t("tours.packages.publish")}
                  </Button>
                ) : p.status === "PUBLISHED" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    isPending={pending === p.id}
                    onPress={() => handleArchive(p.id)}
                  >
                    {t("tours.packages.archive")}
                  </Button>
                ) : null}
                <Button
                  variant="tertiary"
                  size="sm"
                  isPending={pending === p.id}
                  onPress={() => handleDelete(p.id)}
                  aria-label={t("common.delete")}
                >
                  <Trash size={15} color="currentColor" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
