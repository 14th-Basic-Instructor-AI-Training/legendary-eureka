"use client";

import { useTranslation } from "react-i18next";
import { Routing } from "iconsax-reactjs";
import { Button } from "@/ui";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useLocalizedRouter } from "@/lib/locale";
import { useExploreStore } from "@/features/explore/store";

/**
 * "Make it your trip" sidebar CTA. "Plan a Trip Here" is gated by
 * `can(role, "createTripPlan")` (guests → login prompt); "Book a Tour Here"
 * opens Explore on the Tours tab.
 */
export function PlanTripCard({ onRequireAuth }: { onRequireAuth: () => void }) {
  const { t } = useTranslation();
  const { role } = useSession();
  const router = useLocalizedRouter();

  const handlePlan = () => {
    if (can(role, "createTripPlan")) router.push("/traveler/trips/new");
    else onRequireAuth();
  };

  const handleBook = () => {
    useExploreStore.getState().setTab("tours");
    router.push("/explore");
  };

  return (
    <div className="bg-foreground text-background rounded-2xl p-6 shadow-sm">
      <span className="text-warning inline-flex">
        <Routing size={24} color="currentColor" variant="Bold" />
      </span>
      <h3 className="mt-2 text-lg font-bold tracking-tight">
        {t("destinations.detail.planCardTitle")}
      </h3>
      <p className="text-background/70 mt-1.5 text-sm leading-relaxed">
        {t("destinations.detail.planCardBody")}
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        <Button variant="primary" size="md" className="w-full" onPress={handlePlan}>
          {t("destinations.detail.planTripHere")}
        </Button>
        <Button variant="secondary" size="md" className="w-full" onPress={handleBook}>
          {t("destinations.detail.bookTourHere")}
        </Button>
      </div>
    </div>
  );
}
