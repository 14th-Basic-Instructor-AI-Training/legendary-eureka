"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Add, Location } from "iconsax-reactjs";
import { Button } from "@/ui";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useSession } from "@/lib/auth";
import type { DestinationResponse } from "@/lib/api/destinations";
import { deleteDestinationAction } from "@/actions/tours";
import { DestinationForm } from "./DestinationForm";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_BADGE: Record<ApprovalStatus, { cls: string; dot: string }> = {
  PENDING:  { cls: "bg-warning/10 text-warning",  dot: "bg-warning" },
  APPROVED: { cls: "bg-green/10 text-green",       dot: "bg-green" },
  REJECTED: { cls: "bg-danger/10 text-danger",     dot: "bg-danger" },
};

type Props = {
  destinations: DestinationResponse[];
  publicDestinations: DestinationResponse[];
  agencyName: string;
  onBuildPackage: (destinationId: string) => void;
  onCreated: (dest: DestinationResponse) => void;
  onDeleted: (id: string) => void;
};

export function DestinationsPanel({
  destinations,
  publicDestinations,
  agencyName,
  onBuildPackage,
  onCreated,
  onDeleted,
}: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { user } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const adminDestinations = publicDestinations.filter((d) => d.ownerId !== user?.id);
  const hasPending = destinations.some((d) => d.approvalStatus === "PENDING");

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-2xl font-semibold tracking-tight">{t("tours.destinations.title")}</h2>
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

      {/* Section A: Admin-approved destinations */}
      <section className="flex flex-col gap-3">
        <h3 className="text-primary text-base font-semibold tracking-tight">
          {t("tours.destinations.sectionAdmin")}
        </h3>
        {adminDestinations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Location size={22} color="currentColor" className="text-muted" />
            </span>
            <p className="text-muted text-sm">{t("tours.destinations.adminEmpty")}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {adminDestinations.map((d) => (
              <DestinationCard
                key={d.id}
                d={d}
                lng={lng}
                t={t}
                showBuildPackage
                onBuildPackage={onBuildPackage}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Section B: Agency's own destinations */}
      <section className="flex flex-col gap-3">
        <h3 className="text-primary text-base font-semibold tracking-tight">
          {t("tours.destinations.sectionYours")}
        </h3>

        {hasPending && (
          <div className="bg-warning/10 border-warning/30 flex items-center gap-2 rounded-xl border px-4 py-2.5">
            <span className="text-warning text-sm font-medium">{t("tours.destinations.pendingNotice")}</span>
          </div>
        )}

        {destinations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Location size={22} color="currentColor" className="text-muted" />
            </span>
            <p className="text-muted text-sm">{t("tours.destinations.empty")}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {destinations.map((d) => (
              <DestinationCard
                key={d.id}
                d={d}
                lng={lng}
                t={t}
                showBuildPackage={d.approvalStatus === "APPROVED"}
                showDelete
                isPendingDelete={deletingId === d.id}
                onBuildPackage={onBuildPackage}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type CardProps = {
  d: DestinationResponse;
  lng: string;
  t: (key: string) => string;
  showBuildPackage?: boolean;
  showDelete?: boolean;
  isPendingDelete?: boolean;
  onBuildPackage: (id: string) => void;
  onDelete?: (id: string) => void;
};

function DestinationCard({
  d,
  lng,
  t,
  showBuildPackage,
  showDelete,
  isPendingDelete,
  onBuildPackage,
  onDelete,
}: CardProps) {
  const badge = STATUS_BADGE[d.approvalStatus];
  return (
    <li className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-4 shadow-primary">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{d.name}</p>
          <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
            <Location size={12} color="currentColor" />
            {t(`destinations.provinces.${d.province}`)} ·{" "}
            {t(`destinations.travelTypes.${d.travelType}`)}
          </p>
        </div>
        {badge && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
              badge.cls,
            )}
          >
            <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", badge.dot)} />
            {t(`tours.destinations.status${d.approvalStatus.charAt(0) + d.approvalStatus.slice(1).toLowerCase()}`)}
          </span>
        )}
      </div>

      <p className="text-muted line-clamp-2 text-sm">{d.description || d.shortDescription}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span className="text-sm font-semibold">
          {t("tours.destinations.from")} {formatPrice(d.priceFrom, d.currency, lng)}
        </span>
        <div className="flex items-center gap-2">
          {showBuildPackage && (
            <Button variant="secondary" size="sm" onPress={() => onBuildPackage(d.id)}>
              {t("tours.destinations.buildPackage")}
            </Button>
          )}
          {showDelete && onDelete && (
            <Button
              variant="tertiary"
              size="sm"
              isPending={isPendingDelete}
              onPress={() => onDelete(d.id)}
              aria-label={t("common.delete")}
            >
              ×
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
