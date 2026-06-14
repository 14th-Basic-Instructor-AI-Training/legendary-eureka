"use client";

import { useTranslation } from "react-i18next";
import { Location, Eye, Lock1 } from "iconsax-reactjs";
import { JalatCard } from "@/ui";
import type { TripPlan } from "../schema";

/** Public/Private privacy badge colors (brief-specified, surfaced as constants). */
const PRIVACY_STYLE = {
  PUBLIC: { color: "#1F9E75", Icon: Eye },
  PRIVATE: { color: "#a1a1aa" /* zinc-400 */, Icon: Lock1 },
} as const;

/**
 * Ice-Matcha styled trip-plan tile (Trip Plans row). Maps a {@link TripPlan} onto
 * the shared {@link JalatCard}: the visibility badge floats top-right; the footer
 * shows the title + destination/item-count and an "Explore" action.
 */
export function TripPlanCardJalat({ plan }: { plan: TripPlan }) {
  const { t } = useTranslation();
  const privacy = PRIVACY_STYLE[plan.visibility];
  const PrivacyIcon = privacy.Icon;

  return (
    <JalatCard
      href={`/traveler/trips/${plan.id}`}
      imageAspect="aspect-[16/10]"
      image={{ src: plan.coverImage, alt: plan.title }}
      badge={
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white shadow-sm"
          style={{ backgroundColor: privacy.color }}
        >
          <PrivacyIcon size={13} color="currentColor" variant="Bold" />
          {t(`tripPlans.visibility.${plan.visibility === "PUBLIC" ? "public" : "private"}`)}
        </span>
      }
      title={plan.title}
      meta={
        <span className="flex items-center gap-1">
          <Location size={15} color="currentColor" variant="Bold" className="text-primary" />
          {plan.destination}
          <span className="text-foreground ml-2 font-medium">
            {t("tripPlans.itemCount", { count: plan.itemCount })}
          </span>
        </span>
      }
      action={`${t("landing.card.explore")} →`}
    />
  );
}
