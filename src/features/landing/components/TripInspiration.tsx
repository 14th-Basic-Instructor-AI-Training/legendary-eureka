"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useExploreStore } from "@/features/explore/store";
import {
  ActivityFocusSchema,
  EMPTY_DESTINATION_FILTER,
  type ActivityFocus,
} from "@/features/explore/schema";
import type { Result } from "@/features/destinations/data";
import type { TripInspirationResponse } from "@/types/trip-inspiration";
import { SectionHeading } from "./SectionHeading";

/** Seed the Explore store so the tile opens Explore filtered to the theme's focus. */
function openExploreWithFocus(focus: ActivityFocus) {
  const { setTab, patchDestinationFilter } = useExploreStore.getState();
  setTab("destinations");
  patchDestinationFilter({ ...EMPTY_DESTINATION_FILTER, activityFocus: [focus] });
}

/**
 * "Trip inspiration" — an editorial band of travel themes loaded from the backend
 * (`/trip-inspirations`). Each tile links to the Explore page pre-filtered by the theme's
 * activity focus, so a mood becomes a browse. Titles/descriptions are backend content;
 * the heading and CTA stay localized.
 */
export function TripInspiration({ result }: { result: Result<TripInspirationResponse[]> }) {
  const { t } = useTranslation();
  const items = result.ok ? result.data : [];

  return (
    <section id="inspiration" className="from-primary/5 to-background bg-gradient-to-b py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          title={t("landing.inspiration.title")}
          subtitle={t("landing.inspiration.subtitle")}
        />

        {items.length === 0 ? (
          <div className="border-border rounded-2xl border border-dashed py-12 text-center">
            <p className="text-muted text-sm">{t("destinations.states.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => {
              const focus = ActivityFocusSchema.safeParse(item.activityFocus);
              return (
                <Reveal key={item.id} delay={Math.min(i, 3) * 0.06}>
                  <LocaleLink
                    href="/explore"
                    onClick={focus.success ? () => openExploreWithFocus(focus.data) : undefined}
                    className="group focus-visible:ring-primary block h-full rounded-3xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl">
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
                        <p className="mt-1 text-sm text-white/85">{item.description}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/90 transition-transform group-hover:translate-x-1">
                          {t("landing.inspiration.cta")}
                          <ArrowRight size={16} color="currentColor" />
                        </span>
                      </div>
                    </div>
                  </LocaleLink>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
