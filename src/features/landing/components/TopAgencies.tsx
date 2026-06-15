"use client";

import { useTranslation } from "react-i18next";
import { Button, Reveal, Skeleton } from "@/ui";
import { AgencyCard } from "@/features/destinations/components/AgencyCard";
import { useResource } from "@/features/destinations/hooks";
import { getTopAgencies } from "@/features/destinations/data";
import { SectionHeading } from "./SectionHeading";

function AgencySkeleton() {
  return (
    <div className="bg-surface border-border flex flex-col items-center gap-3 rounded-2xl border p-5">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
      <div className="flex w-full justify-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid w-full grid-cols-3 gap-2 pt-2">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
      <Skeleton className="mt-1 h-9 w-full rounded-lg" />
    </div>
  );
}

/** Landing "Top-rated agencies" row — approved partners, highest rated first. */
export function TopAgencies() {
  const { t } = useTranslation();
  const { status, data, reload } = useResource(getTopAgencies);

  return (
    <section id="agencies" className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        title={t("landing.topAgencies.title")}
        subtitle={t("landing.topAgencies.subtitle")}
      />

      {status === "loading" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AgencySkeleton key={i} />
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((agency, i) => (
            <Reveal key={agency.id} delay={Math.min(i, 3) * 0.05}>
              <AgencyCard agency={agency} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
