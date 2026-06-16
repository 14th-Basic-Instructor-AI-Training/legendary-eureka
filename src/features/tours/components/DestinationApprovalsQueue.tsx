"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Location, SearchNormal1 } from "iconsax-reactjs";
import { sileo } from "sileo";
import { Button, Input, Pagination, useConfirm } from "@/ui";
import { CardImage } from "@/ui/CardImage";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatPrice } from "@/lib/format";
import { sendRealtime, DESTINATIONS_CHANGED } from "@/lib/realtime";
import { approveDestinationAction, rejectDestinationAction } from "@/actions/tours";
import type { DestinationResponse } from "@/lib/api/destinations";

/** Cards per page. */
const PAGE_SIZE = 9;

/** UPPER_SNAKE enum → "Title Case" (province / travel-type labels). */
function prettyEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Admin: review destinations agencies submitted for approval (GET /destinations/pending).
 * Mirrors the package `TourApprovalsQueue` (search + card grid + approve/reject); approve /
 * reject call server actions, emit a realtime frame, then refresh the page.
 */
export function DestinationApprovalsQueue({
  destinations,
}: {
  destinations: DestinationResponse[];
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { role } = useSession();
  const router = useRouter();
  const confirm = useConfirm();
  const canReview = can(role, "reviewDestinationApproval");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = destinations.filter((d) => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.province.toLowerCase().includes(q) ||
      d.travelType.toLowerCase().includes(q)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /** Run an approve/reject action, emit the realtime frame, toast, then refresh. */
  const runReview = async (
    d: DestinationResponse,
    action: (id: string) => Promise<{ ok: boolean }>,
    messages: { success: string; error: string },
  ) => {
    setBusyId(d.id);
    const res = await action(d.id);
    setBusyId(null);
    if (res?.ok) {
      sendRealtime({ event: DESTINATIONS_CHANGED, data: { id: d.id } });
      sileo.success({ title: messages.success, description: d.name });
    } else {
      sileo.error({ title: messages.error, description: d.name });
    }
    router.refresh();
  };

  const onApprove = (d: DestinationResponse) =>
    confirm({
      title: t("tours.admin.destinations.approve"),
      description: d.name,
      intent: "primary",
      confirmLabel: t("tours.admin.destinations.approve"),
      onConfirm: () =>
        runReview(d, approveDestinationAction, {
          success: t("tours.admin.destinations.toast.approved"),
          error: t("tours.admin.destinations.toast.approveError"),
        }),
    });

  const onReject = (d: DestinationResponse) =>
    confirm({
      title: t("tours.admin.destinations.reject"),
      description: d.name,
      intent: "danger",
      confirmLabel: t("tours.admin.destinations.reject"),
      onConfirm: () =>
        runReview(d, rejectDestinationAction, {
          success: t("tours.admin.destinations.toast.rejected"),
          error: t("tours.admin.destinations.toast.rejectError"),
        }),
    });

  return (
    <div className="flex flex-col gap-4">
      {destinations.length > 0 ? (
        <div className="bg-warning/10 border-warning/30 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5">
          <span className="text-warning text-sm font-medium">
            {t("tours.admin.destinations.pendingCount", { count: destinations.length })}
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <SearchNormal1
            size={16}
            color="currentColor"
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            aria-label={t("tours.admin.destinations.search")}
            placeholder={t("tours.admin.destinations.search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Location size={22} color="currentColor" className="text-muted" />
          </span>
          <p className="text-muted text-sm">{t("tours.admin.destinations.pendingEmpty")}</p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {paged.map((d) => (
              <li
                key={d.id}
                className="bg-surface shadow-primary flex flex-col gap-3 rounded-2xl p-4"
              >
                <div className="relative -mx-4 -mt-4 mb-1 aspect-[16/9] overflow-hidden rounded-t-2xl">
                  <CardImage
                    src={d.coverImageUrl || d.heroImage}
                    alt={d.name}
                    sizes="(max-width: 768px) 100vw, 280px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.name}</p>
                  <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                    <Location size={12} color="currentColor" />
                    {prettyEnum(d.province)} · {prettyEnum(d.travelType)}
                  </p>
                </div>
                <p className="text-muted line-clamp-2 text-sm">
                  {d.shortDescription || d.description}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                  <span className="text-sm font-semibold">
                    {t("tours.destinations.from")} {formatPrice(d.priceFrom, d.currency, lng)}
                  </span>
                  <span className="text-muted text-xs">{d.city}</span>
                </div>
                {canReview ? (
                  <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="text-danger"
                      isPending={busyId === d.id}
                      onPress={() => onReject(d)}
                    >
                      <CloseCircle size={15} color="currentColor" />
                      {t("tours.admin.destinations.reject")}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      isPending={busyId === d.id}
                      onPress={() => onApprove(d)}
                    >
                      <TickCircle size={15} color="currentColor" />
                      {t("tours.admin.destinations.approve")}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          <Pagination page={currentPage} total={pageCount} onChange={setPage} className="mt-2" />
        </>
      )}
    </div>
  );
}
