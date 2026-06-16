"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Add, ArrowRight2, Layer, Star1, Trash } from "iconsax-reactjs";
import { sileo } from "sileo";
import { Button, StatusChip } from "@/ui";
import { formatPrice } from "@/lib/format";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocalizedRouter } from "@/lib/locale";
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

type Props = {
  packages: TourPackageResponse[];
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
  onStatusChanged,
  onSubmitted,
  onDeleted,
}: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useLocalizedRouter();
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
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-primary text-2xl font-bold tracking-tight">
            {t("tours.packages.pageTitle")}
          </h1>
          <p className="text-muted mt-1 text-sm">{t("tours.packages.pageSubtitle")}</p>
        </div>
        <Button variant="primary" size="sm" onPress={() => router.push("/agency/tours/new")}>
          <Add size={16} color="currentColor" />
          {t("tours.packages.new")}
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Layer size={22} color="currentColor" variant="Bulk" className="text-muted" />
          </span>
          <p className="text-muted text-sm">{t("tours.packages.empty")}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {packages.map((p) => {
            const approval = p.approvalStatus?.toUpperCase() as
              | TourApprovalStatus
              | undefined;
            const isPending = pending === p.id;
            return (
              <li
                key={p.id}
                className="bg-surface border-border shadow-primary group hover:border-primary/40 flex flex-col overflow-hidden rounded-2xl border transition-colors"
              >
                {/* Clickable card body → detail */}
                <LocaleLink
                  href={`/agency/tours/${p.id}`}
                  className="flex flex-1 flex-col"
                  aria-label={t("tours.packages.detail.viewLabel", { title: p.title })}
                >
                  <div className="bg-bg-ghostwhite relative aspect-[16/9] w-full overflow-hidden">
                    {p.coverImageUrl || p.image ? (
                      <Image
                        src={p.coverImageUrl || p.image}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 360px"
                      />
                    ) : (
                      <div className="text-muted flex h-full w-full items-center justify-center">
                        <Layer size={32} color="currentColor" variant="Bulk" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <StatusChip status={chipStatus(p)} />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-text-primary line-clamp-2 text-sm font-semibold">
                        {p.title}
                      </p>
                      <ArrowRight2
                        size={16}
                        color="currentColor"
                        className="text-muted group-hover:text-primary mt-0.5 shrink-0 transition-colors"
                      />
                    </div>
                    <p className="text-muted mt-1 text-xs">
                      {t(`destinations.provinces.${p.province}`)} ·{" "}
                      {t("tours.packages.days", { count: p.durationDays || p.days || 1 })}
                    </p>
                    {p.rating ? (
                      <div className="text-muted mt-2 flex items-center gap-1 text-xs">
                        <Star1
                          size={13}
                          color="currentColor"
                          variant="Bold"
                          className="text-amber-500"
                        />
                        <span className="text-text-primary font-medium tabular-nums">
                          {p.rating.toFixed(1)}
                        </span>
                        <span>({p.reviewCount ?? 0})</span>
                      </div>
                    ) : null}
                    <p className="text-primary mt-auto pt-3 text-base font-bold tracking-tight">
                      {t("landing.tours.from")}{" "}
                      {formatPrice(p.priceFrom ?? p.price, p.currency, lng)}
                    </p>
                    {approval === "REJECTED" && p.rejectionReason ? (
                      <p className="text-danger mt-1 line-clamp-2 text-xs">
                        {t("tours.packages.rejectedReason", { reason: p.rejectionReason })}
                      </p>
                    ) : null}
                  </div>
                </LocaleLink>

                {/* Action footer — sibling of the link so clicks don't navigate */}
                <div className="border-border bg-bg-ghostwhite flex items-center justify-end gap-2 border-t px-4 py-2.5">
                  {p.status === "PUBLISHED" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      isPending={isPending}
                      onPress={() => handleArchive(p.id)}
                    >
                      {t("tours.packages.archive")}
                    </Button>
                  ) : p.status === "DRAFT" && approval === "PENDING" ? (
                    <span className="text-warning mr-auto text-xs font-medium">
                      {t("tours.packages.awaiting")}
                    </span>
                  ) : p.status === "DRAFT" ? (
                    <Button
                      variant="primary"
                      size="sm"
                      isPending={isPending}
                      onPress={() => handleSubmit(p.id)}
                    >
                      {t(
                        approval === "REJECTED"
                          ? "tours.packages.resubmit"
                          : "tours.packages.requestApproval",
                      )}
                    </Button>
                  ) : null}
                  <Button
                    variant="tertiary"
                    size="sm"
                    isPending={isPending}
                    onPress={() => handleDelete(p.id)}
                    aria-label={t("common.delete")}
                  >
                    <Trash size={15} color="currentColor" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
