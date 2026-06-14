"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Clock } from "iconsax-reactjs";
import type { TourDay } from "../types";

/** Vertical day-by-day itinerary with numbered stops and a connector line. */
export function TravelPlanTimeline({ days }: { days: TourDay[] }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      {days.map((day) => (
        <section key={day.day}>
          <h3 className="text-foreground flex items-center gap-2 text-base font-bold tracking-tight">
            <span className="bg-primary-lightskyblue inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold text-white">
              {t("tours.detail.travelPlan.day", { day: day.day })}
            </span>
            {day.title}
          </h3>

          <ol className="mt-4 flex flex-col">
            {day.stops.map((stop, i) => {
              const last = i === day.stops.length - 1;
              return (
                <li key={stop.order} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Connector line + node */}
                  <div className="flex flex-col items-center">
                    <span className="border-primary-lightskyblue text-primary-lightskyblue bg-background flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold">
                      {stop.order}
                    </span>
                    {!last ? <span className="border-border w-px flex-1 border-l" /> : null}
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 pt-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-foreground text-sm font-semibold">{stop.name}</p>
                      <span className="text-muted flex items-center gap-1 text-xs">
                        <Clock size={13} color="currentColor" variant="Bold" />
                        {stop.durationLabel}
                      </span>
                    </div>
                    {stop.notes ? <p className="text-muted text-sm">{stop.notes}</p> : null}
                    {stop.image ? (
                      <div className="relative mt-1 aspect-[16/9] w-full max-w-sm overflow-hidden rounded-xl">
                        <Image
                          src={stop.image}
                          alt={stop.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 24rem"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
