"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Add, CloseCircle, Trash } from "iconsax-reactjs";
import { sileo } from "sileo";
import { Button, StatusChip } from "@/ui";
import { formatPrice } from "@/lib/format";
import type {
  TourApprovalStatus,
  TourPackageResponse,
  TourPackageStatus,
} from "@/lib/api/packages";
import {
  submitPackageAction,
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
  onSubmitted: (id: string) => void;
  onDeleted: (id: string) => void;
};

/** The status the pill should reflect: publication state, or the approval state while still a draft. */
function chipStatus(p: TourPackageResponse): string {
  if (p.status === "PUBLISHED") return "published";
  if (p.status === "ARCHIVED") return "archived";
  const approval = p.approvalStatus?.toUpperCase() as TourApprovalStatus | undefined;
  if (approval === "PENDING") return "pending";
  if (approval === "REJECTED") return "rejected";
  if (approval === "APPROVED") return "approved";
  return "draft";
}

export function PackagesPanel({
  packages,
  destinations,
  agencyName,
  formOpen,
  setFormOpen,
  presetDestination,
  onPackageCreated,
  onStatusChanged,
  onSubmitted,
  onDeleted,
}: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const [pending, setPending] = useState<string | null>(null);

  // Agencies can't self-publish: they request admin approval. Admin approval auto-publishes.
  const handleSubmit = async (id: string) => {
    setPending(id);
    try {
      const res = await submitPackageAction(id);
      if (res.ok) {
        onSubmitted(id);
        sileo.success({
          title: t("tours.packages.toast.submitted"),
          description: t("tours.packages.toast.submittedDesc"),
        });
      } else {
        sileo.error({
          title: t("tours.packages.toast.submitError"),
          description: t("tours.packages.toast.submitErrorDesc"),
        });
      }
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
    <div className="flex flex-col gap-4">
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
                  <StatusChip status={chipStatus(p)} />
                </div>
                <p className="text-muted mt-1 text-sm">
                  {t(`destinations.provinces.${p.province}`)} ·{" "}
                  {t("tours.packages.days", { count: p.durationDays || p.days || 1 })} ·{" "}
                  {t("landing.tours.from")}{" "}
                  {formatPrice(p.priceFrom ?? p.price, p.currency, lng)}
                </p>
                {p.approvalStatus?.toUpperCase() === "REJECTED" && p.rejectionReason ? (
                  <p className="text-danger mt-1 text-xs">
                    {t("tours.packages.rejectedReason", { reason: p.rejectionReason })}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {p.status === "PUBLISHED" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    isPending={pending === p.id}
                    onPress={() => handleArchive(p.id)}
                  >
                    {t("tours.packages.archive")}
                  </Button>
                ) : p.status === "DRAFT" &&
                  p.approvalStatus?.toUpperCase() === "PENDING" ? (
                  <span className="text-warning text-sm font-medium">
                    {t("tours.packages.awaiting")}
                  </span>
                ) : p.status === "DRAFT" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    isPending={pending === p.id}
                    onPress={() => handleSubmit(p.id)}
                  >
                    {t(
                      p.approvalStatus?.toUpperCase() === "REJECTED"
                        ? "tours.packages.resubmit"
                        : "tours.packages.requestApproval",
                    )}
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
