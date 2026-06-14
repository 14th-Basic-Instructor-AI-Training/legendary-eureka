"use client";

import { useTranslation } from "react-i18next";
import { Button, Skeleton, StatusChip } from "@/ui";
import { formatRating } from "@/lib/format";
import type { ResourceState } from "@/lib/useResource";
import type { PlatformActivity } from "../schema";

function RowSkeleton() {
  return (
    <div className="bg-surface border-border flex items-center justify-between rounded-2xl border p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

/** Read-only view of every activity on the platform (Admin can edit any — wired later). */
export function ActivitiesAdmin({ state }: { state: ResourceState<PlatformActivity[]> }) {
  const { t, i18n } = useTranslation();
  const { status, data, reload } = state;

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
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
    return <p className="text-muted py-8 text-center text-sm">{t("admin.activities.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {data.map((a) => (
        <li
          key={a.id}
          className="bg-surface border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{a.title}</p>
              <StatusChip status={a.status} />
            </div>
            <p className="text-muted mt-0.5 text-sm">
              {t(`destinations.categories.${a.category}`)} ·{" "}
              {t("admin.activities.by", { agency: a.agencyName })}
            </p>
          </div>
          {a.rating > 0 ? (
            <span className="text-warning text-sm font-medium">
              ★ {formatRating(a.rating, i18n.language)}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
