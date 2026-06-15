"use client";

import { useTranslation } from "react-i18next";
import { Button, Skeleton } from "@/ui";

/** Card-shaped loading placeholder, matching the discovery grids. */
export function CardSkeleton() {
  return (
    <div className="bg-surface border-border overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/** A responsive grid of card skeletons for a loading tab. */
export function GridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Recoverable error state with a retry button. */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
      <p className="text-muted text-sm">{t("profile.states.error")}</p>
      <Button variant="secondary" size="sm" onPress={onRetry}>
        {t("common.retry")}
      </Button>
    </div>
  );
}
