"use client";

import { useTranslation } from "react-i18next";
import { Button, Reveal, Skeleton } from "@/ui";
import { DestinationCard } from "@/features/destinations/components/DestinationCard";
import { useResource } from "@/features/destinations/hooks";
import type { Result } from "@/features/destinations/data";
import type { Destination } from "@/features/destinations/schema";
import { SectionHeading } from "./SectionHeading";

function CardSkeleton() {
  return (
    <div className="bg-surface border-border overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

/**
 * A titled section that loads destinations from a `data.ts` getter and renders
 * loading / error / empty / success states. Reused for featured, things-to-do,
 * and recommended rows by swapping the fetcher + copy.
 */
export function DestinationSection({
  id,
  title,
  subtitle,
  fetcher,
}: {
  id: string;
  title: string;
  subtitle?: string;
  fetcher: () => Promise<Result<Destination[]>>;
}) {
  const { t } = useTranslation();
  const { status, data, reload } = useResource(fetcher);

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeading title={title} subtitle={subtitle} />

      {status === "loading" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : status === "error" ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
          <p className="text-muted text-sm">{t("destinations.states.error")}</p>
          <Button variant="secondary" size="sm" onPress={reload}>
            {t("common.retry")}
          </Button>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="border-border rounded-2xl border border-dashed py-12 text-center">
          <p className="text-muted text-sm">{t("destinations.states.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((destination, i) => (
            <Reveal key={destination.id} delay={Math.min(i, 4) * 0.06}>
              <DestinationCard destination={destination} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
