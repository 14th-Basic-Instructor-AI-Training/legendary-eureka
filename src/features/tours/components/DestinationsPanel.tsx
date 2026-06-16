"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Add, Location, DollarCircle } from "iconsax-reactjs";
import Image from "next/image";
import { Button, Tabs, useConfirm } from "@/ui";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useSession } from "@/lib/auth";
import type { DestinationResponse } from "@/lib/api/destinations";
import { deleteDestinationAction } from "@/actions/tours";
import { DestinationForm } from "./DestinationForm";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_BADGE: Record<ApprovalStatus, { cls: string; dot: string }> = {
  PENDING:  { cls: "bg-amber-100 text-amber-800",  dot: "bg-amber-500" },
  APPROVED: { cls: "bg-green/10 text-green",        dot: "bg-green" },
  REJECTED: { cls: "bg-danger/10 text-danger",      dot: "bg-danger" },
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
  const confirm = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const adminDestinations = publicDestinations.filter((d) => d.ownerId !== user?.id);
  const hasPending = destinations.some((d) => d.approvalStatus?.toUpperCase() === "PENDING");

  const handleDelete = async (id: string, name: string) => {
    await confirm({
      intent: "danger",
      title: t("tours.destinations.deleteTitle"),
      description: t("tours.destinations.deleteDescription", { name }),
      confirmLabel: t("common.delete"),
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await deleteDestinationAction(id);
          onDeleted(id);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1
          className="text-4xl font-black tracking-tight"
          style={{ color: "var(--primary-lightskyblue)" }}
        >
          {t("tours.destinations.pageTitle")}
        </h1>
        <p className="text-muted mt-1 text-sm">{t("tours.destinations.pageSubtitle")}</p>
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

      <Tabs variant="primary" defaultSelectedKey="admin">
        <Tabs.List aria-label={t("tours.destinations.title")}>
          <Tabs.Tab id="admin">{t("tours.destinations.sectionAdmin")}</Tabs.Tab>
          <Tabs.Tab id="yours">{t("tours.destinations.sectionYours")}</Tabs.Tab>
        </Tabs.List>

        {/* Tab A: Admin-created destinations */}
        <Tabs.Panel id="admin" className="pt-5">
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
        </Tabs.Panel>

        {/* Tab B: Agency's own destinations */}
        <Tabs.Panel id="yours" className="pt-5">
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onPress={() => setShowForm(true)}>
                <Add size={16} color="currentColor" />
                {t("tours.destinations.new")}
              </Button>
            </div>

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
                    showBuildPackage={d.approvalStatus?.toUpperCase() === "APPROVED"}
                    showDelete
                    isPendingDelete={deletingId === d.id}
                    onBuildPackage={onBuildPackage}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
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
  onDelete?: (id: string, name: string) => void;
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
  const status = (d.approvalStatus?.toUpperCase() ?? "PENDING") as ApprovalStatus;
  const badge = STATUS_BADGE[status];
  const imageUrl = d.coverImageUrl ?? null;

  return (
    <li className="bg-surface border-border group overflow-hidden rounded-3xl border shadow-primary transition-shadow hover:shadow-lg">
      {/* Padded image with its own corner radius — per design */}
      <div className="p-3 pb-0">
        <div className="relative w-full overflow-hidden rounded-2xl bg-muted/20" style={{ aspectRatio: "1 / 0.7" }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={d.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Location size={28} color="currentColor" className="text-muted/30" />
              <span className="text-muted/40 text-[11px]">{t("tours.destinations.noImage")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-5 pt-4">
        {/* Title */}
        <h3 className="text-text-primary truncate text-xl font-semibold">{d.name}</h3>

        {/* Subtitle + status badge row */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted text-sm">
            {t(`destinations.travelTypes.${d.travelType}`)}
          </p>
          {badge && (
            <span className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold", badge.cls)}>
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", badge.dot, status === "PENDING" && "animate-pulse")} />
              {t(`tours.destinations.status${status.charAt(0) + status.slice(1).toLowerCase()}`)}
            </span>
          )}
        </div>

        {/* Price + location row */}
        <div className="flex items-center gap-6 text-sm">
          <span className="text-text-primary flex items-center gap-2 font-medium">
            <DollarCircle size={16} color="currentColor" className="text-primary" />
            {t("tours.destinations.from")} {formatPrice(d.priceFrom, d.currency, lng)}
          </span>
          <span className="text-muted flex items-center gap-2">
            <Location size={16} color="currentColor" />
            {t(`destinations.provinces.${d.province}`)}
          </span>
        </div>

        {/* Actions */}
        {(showBuildPackage || showDelete) && (
          <div className="flex flex-col gap-2">
            {showBuildPackage && (
              <Button
                variant="primary"
                size="md"
                className="w-full rounded-full"
                onPress={() => onBuildPackage(d.id)}
              >
                {t("tours.destinations.buildPackage")}
              </Button>
            )}
            {showDelete && onDelete && (
              <Button
                variant="tertiary"
                size="sm"
                className="text-danger w-full"
                isPending={isPendingDelete}
                onPress={() => onDelete(d.id, d.name)}
                aria-label={t("common.delete")}
              >
                {t("common.delete")}
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
