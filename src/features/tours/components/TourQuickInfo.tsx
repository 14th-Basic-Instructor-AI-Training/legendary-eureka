"use client";

import { useTranslation } from "react-i18next";
import { Clock, Profile2User, Global, ShieldTick, CloseCircle } from "iconsax-reactjs";
import { Chip } from "@/ui";
import type { TourDetail } from "../types";

/** Horizontal icon + label bar: duration, group size, languages, cancellation. */
export function TourQuickInfo({ tour }: { tour: TourDetail }) {
  const { t } = useTranslation();
  const free = tour.cancellationPolicy === "free";

  return (
    <div className="border-border flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border px-5 py-4">
      <span className="text-foreground flex items-center gap-2 text-sm">
        <Clock size={18} color="currentColor" variant="Bold" className="text-primary" />
        {t("tours.detail.quickInfo.duration", { count: tour.durationDays })}
      </span>

      <span className="text-foreground flex items-center gap-2 text-sm">
        <Profile2User size={18} color="currentColor" variant="Bold" className="text-primary" />
        {t("tours.detail.quickInfo.groupSize", { count: tour.groupSizeMax })}
      </span>

      <span className="text-foreground flex items-center gap-2 text-sm">
        <Global size={18} color="currentColor" variant="Bold" className="text-primary" />
        {tour.languages.join(" · ")}
      </span>

      <Chip color={free ? "success" : "danger"} variant="soft" size="sm" className="gap-1">
        {free ? (
          <ShieldTick size={14} color="currentColor" variant="Bold" />
        ) : (
          <CloseCircle size={14} color="currentColor" variant="Bold" />
        )}
        {free
          ? t("tours.detail.quickInfo.cancellationFree")
          : t("tours.detail.quickInfo.cancellationNonRefundable")}
      </Chip>
    </div>
  );
}
