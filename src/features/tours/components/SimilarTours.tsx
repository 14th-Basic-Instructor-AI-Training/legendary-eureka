"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useResource } from "@/lib/useResource";
import { TourCard } from "@/features/destinations/components/TourCard";
import { getSimilarTours } from "../data";
import type { TourDetail } from "../types";

/** Below-fold "Similar tours" row — same province/category, reusing TourCard. */
export function SimilarTours({ tour }: { tour: TourDetail }) {
  const { t } = useTranslation();
  const fetcher = useCallback(() => getSimilarTours(tour), [tour]);
  const { status, data } = useResource(fetcher);

  if (status === "error" || (status === "success" && (!data || data.length === 0))) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-foreground text-xl font-bold tracking-tight">
        {t("tours.similar.title")}
      </h2>
      <p className="text-muted mt-1 text-sm">{t("tours.similar.subtitle")}</p>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {status === "loading"
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-64 shrink-0 rounded-2xl" />
            ))
          : data?.map((similar) => (
              <LocaleLink key={similar.id} href={`/tours/${similar.slug}`} className="w-64 shrink-0">
                <TourCard tour={similar} />
              </LocaleLink>
            ))}
      </div>
    </section>
  );
}
