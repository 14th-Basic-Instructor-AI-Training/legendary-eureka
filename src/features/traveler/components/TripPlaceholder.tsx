"use client";

import { useTranslation } from "react-i18next";
import { Map1, ArrowLeft } from "iconsax-reactjs";
import { Button } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";

/**
 * Placeholder for the trip-plan builder / detail routes. The Trip Plans tab links
 * here; the full editor lands in a later phase. Keeps the links resolving to a
 * real, on-brand screen instead of a 404.
 */
export function TripPlaceholder({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  const router = useLocalizedRouter();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 text-center">
      <span className="bg-primary/10 text-primary inline-flex h-20 w-20 items-center justify-center rounded-3xl">
        <Map1 size={34} color="currentColor" variant="Bold" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{t(titleKey)}</h1>
        <p className="text-muted">{t("tripPlans.placeholder.subtitle")}</p>
      </div>
      <Button variant="secondary" onPress={() => router.push("/traveler/profile?tab=tripPlans")}>
        <ArrowLeft size={16} color="currentColor" />
        {t("tripPlans.placeholder.back")}
      </Button>
    </div>
  );
}
