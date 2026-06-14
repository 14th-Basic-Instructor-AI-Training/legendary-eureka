"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Reveal, Skeleton } from "@/ui";
import { cn } from "@/lib/utils";
import type { ResourceStatus } from "../hooks";
import type { ExploreDestination, ExploreTour, ExploreView } from "../schema";
import { ExploreDestinationCard } from "./cards/ExploreDestinationCard";
import { ExploreTourCard } from "./cards/ExploreTourCard";
import { EmptyState } from "./EmptyState";

/** Tagged result payload so the grid can render the right card with clean types. */
export type ExplorePayload =
  | { tab: "destinations"; items: ExploreDestination[] }
  | { tab: "tours"; items: ExploreTour[] };

const PAGE_SIZE = 9;

function CardSkeleton({ view }: { view: ExploreView }) {
  if (view === "list") {
    return (
      <div className="bg-surface border-border flex overflow-hidden rounded-2xl border">
        <Skeleton className="aspect-[4/3] w-72 rounded-none" />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-surface border-border overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function ExploreResults({
  status,
  payload,
  view,
  resetKey,
  onRetry,
  onRequireAuth,
}: {
  status: ResourceStatus;
  payload: ExplorePayload | null;
  view: ExploreView;
  /** Changes whenever the query/filters/tab change — resets the Load-More window. */
  resetKey: string;
  onRetry: () => void;
  onRequireAuth: () => void;
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [resetKey]);

  const gridClass =
    view === "grid"
      ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      : "flex flex-col gap-4";

  if (status === "loading") {
    return (
      <div className={gridClass}>
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} view={view} />
        ))}
      </div>
    );
  }

  if (status === "error" || !payload) {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
        <p className="text-muted text-sm">{t("explore.states.error")}</p>
        <Button variant="secondary" size="sm" onPress={onRetry}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  if (payload.items.length === 0) {
    return <EmptyState />;
  }

  const shown = payload.items.slice(0, visible);
  const hasMore = visible < payload.items.length;

  return (
    <div className="flex flex-col gap-6">
      <div className={gridClass}>
        {payload.tab === "destinations"
          ? (shown as ExploreDestination[]).map((d, i) => (
              <Reveal key={d.id} delay={Math.min(i, 3) * 0.05}>
                <ExploreDestinationCard destination={d} view={view} onRequireAuth={onRequireAuth} />
              </Reveal>
            ))
          : (shown as ExploreTour[]).map((tour, i) => (
              <Reveal key={tour.id} delay={Math.min(i, 3) * 0.05}>
                <ExploreTourCard tour={tour} view={view} onRequireAuth={onRequireAuth} />
              </Reveal>
            ))}
      </div>

      {hasMore ? (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            size="md"
            onPress={() => setVisible((v) => v + PAGE_SIZE)}
            className={cn("min-w-48")}
          >
            {t("explore.loadMore")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
