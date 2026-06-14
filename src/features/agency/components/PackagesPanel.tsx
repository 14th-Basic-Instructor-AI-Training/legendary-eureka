"use client";

import { useTranslation } from "react-i18next";
import { Button, Skeleton, StatusChip } from "@/ui";
import { formatPrice } from "@/lib/format";
import type { ResourceState } from "@/lib/useResource";
import type { Package } from "../schema";

function RowSkeleton() {
  return (
    <div className="bg-surface border-border flex items-center justify-between rounded-2xl border p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

/** Read-only list of the agency's tour packages. Receives its load state from the workspace. */
export function PackagesPanel({ state }: { state: ResourceState<Package[]> }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { status, data, reload } = state;

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-10 text-center">
        <p className="text-muted text-sm">{t("destinations.states.error")}</p>
        <Button variant="secondary" size="sm" onPress={reload}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-muted py-8 text-center text-sm">{t("agency.packages.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((p) => (
        <li
          key={p.id}
          className="bg-surface border-border flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{p.title}</p>
              <StatusChip status={p.status} />
            </div>
            <p className="text-muted mt-1 text-sm">
              {t("agency.packages.days", { count: p.days })} ·{" "}
              {t("agency.packages.activitiesCount", { count: p.activityCount })} ·{" "}
              {t("agency.packages.bookingsCount", { count: p.bookingsCount })}
            </p>
          </div>
          <span className="text-sm font-semibold">
            {t("landing.tours.from")} {formatPrice(p.priceFrom, p.currency, lng)}
          </span>
        </li>
      ))}
    </ul>
  );
}
