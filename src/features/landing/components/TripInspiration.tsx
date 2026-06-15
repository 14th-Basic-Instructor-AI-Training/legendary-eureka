"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useExploreStore } from "@/features/explore/store";
import { EMPTY_DESTINATION_FILTER, type ActivityFocus } from "@/features/explore/schema";
import { LANDING_IMAGES } from "../images";
import { SectionHeading } from "./SectionHeading";

/**
 * Theme-led inspiration tiles — each opens the Explore page pre-filtered by the
 * theme's Activity Focus, so a mood becomes a browse.
 */
const COLLECTIONS: ReadonlyArray<{ key: string; image: string; focus: ActivityFocus }> = [
  { key: "adventure", image: LANDING_IMAGES.hero, focus: "Adventure" },
  { key: "cultural", image: LANDING_IMAGES.journeyTicket, focus: "History" },
  { key: "food", image: LANDING_IMAGES.ctaBeach, focus: "Food" },
  { key: "nature", image: LANDING_IMAGES.ctaIsland, focus: "Nature" },
];

/** Seed the Explore store so the tile opens Explore filtered to the theme. */
function openExploreWithFocus(focus: ActivityFocus) {
  const { setTab, patchDestinationFilter } = useExploreStore.getState();
  setTab("destinations");
  patchDestinationFilter({ ...EMPTY_DESTINATION_FILTER, activityFocus: [focus] });
}

/**
 * "Trip inspiration" — an editorial band that pitches a few travel themes. Each
 * tile links to the browse page so a guest or traveler can turn a mood into a
 * search. Pure marketing content; no role gating.
 */
export function TripInspiration() {
  const { t } = useTranslation();

  return (
    <section id="inspiration" className="from-primary/5 to-background bg-gradient-to-b py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          title={t("landing.inspiration.title")}
          subtitle={t("landing.inspiration.subtitle")}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.key} delay={Math.min(i, 3) * 0.06}>
              <LocaleLink
                href="/explore"
                onClick={() => openExploreWithFocus(c.focus)}
                className="group focus-visible:ring-primary block h-full rounded-3xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="text-lg font-bold tracking-tight">
                      {t(`landing.inspiration.items.${c.key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm text-white/85">
                      {t(`landing.inspiration.items.${c.key}.desc`)}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/90 transition-transform group-hover:translate-x-1">
                      {t("landing.inspiration.cta")}
                      <ArrowRight size={16} color="currentColor" />
                    </span>
                  </div>
                </div>
              </LocaleLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
