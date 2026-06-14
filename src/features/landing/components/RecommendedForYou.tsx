"use client";

import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getTrendingDestinations } from "@/features/destinations/data";
import { RecommendedCardJalat } from "./RecommendedCardJalat";
import { DestinationSection } from "./DestinationSection";

/**
 * Signed-in travelers only. Guests and non-traveler roles (agency/admin) see
 * nothing here — the gate is `can(role, "createTripPlan")`, which is the
 * traveler-only capability — so this personalized, name-greeted recommendations
 * strip is hidden for everyone else.
 */
export function RecommendedForYou() {
  const { t } = useTranslation();
  const { user, role } = useSession();

  if (!user || !can(role, "createTripPlan")) return null;

  return (
    <DestinationSection
      id="recommended"
      title={t("landing.recommended.title", { name: user.name })}
      subtitle={t("landing.recommended.subtitle")}
      fetcher={getTrendingDestinations}
      renderCard={(destination) => <RecommendedCardJalat destination={destination} />}
    />
  );
}
