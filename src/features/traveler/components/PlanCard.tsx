"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Location, Calendar, Eye, Lock1 } from "iconsax-reactjs";
import { Card } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { formatDate } from "@/lib/format";
import type { TripPlan } from "../schema";

/** Public/Private privacy badge colors (brief-specified, surfaced as constants). */
const PRIVACY_STYLE = {
  PUBLIC: { color: "#1F9E75", Icon: Eye },
  PRIVATE: { color: "#a1a1aa" /* zinc-400 */, Icon: Lock1 },
} as const;

/** A saved/created trip-plan tile. The whole card links to the plan detail. */
export function PlanCard({ plan }: { plan: TripPlan }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const privacy = PRIVACY_STYLE[plan.visibility];
  const PrivacyIcon = privacy.Icon;

  return (
    <LocaleLink
      href={`/traveler/trips/${plan.id}`}
      aria-label={plan.title}
      className="focus-visible:ring-primary block rounded-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Card className="group bg-background border-border flex h-full flex-col overflow-hidden rounded-2xl border p-0 shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={plan.coverImage}
            alt={plan.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white shadow-sm"
            style={{ backgroundColor: privacy.color }}
          >
            <PrivacyIcon size={13} color="currentColor" variant="Bold" />
            {t(`tripPlans.visibility.${plan.visibility === "PUBLIC" ? "public" : "private"}`)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="leading-tight font-semibold tracking-tight">{plan.title}</h3>
          <p className="text-muted flex items-center gap-1 text-sm">
            <Location size={15} color="currentColor" variant="Bold" className="text-primary" />
            {plan.destination}
          </p>
          <div className="text-muted mt-auto flex items-center justify-between pt-2 text-xs">
            <span className="flex items-center gap-1">
              <Calendar size={13} color="currentColor" variant="Bold" />
              {formatDate(plan.dateRange.start, lng)} – {formatDate(plan.dateRange.end, lng)}
            </span>
            <span className="text-foreground font-medium">
              {t("tripPlans.itemCount", { count: plan.itemCount })}
            </span>
          </div>
        </div>
      </Card>
    </LocaleLink>
  );
}
