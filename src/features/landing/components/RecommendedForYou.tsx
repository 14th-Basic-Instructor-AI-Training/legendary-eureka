"use client";

import { useTranslation } from "react-i18next";
import type { Result } from "@/features/destinations/data";
import type { FeaturedTour } from "@/features/destinations/schema";
import { FeaturedTours } from "./FeaturedTours";

/**
 * Signed-in travelers only (the server gates rendering on the traveler-only
 * "createTripPlan" capability). A personalized, name-greeted strip of recommended tour
 * packages — the highest-rated tours from the backend's `/tours/recommended` endpoint.
 */
export function RecommendedForYou({
  result,
  name,
}: {
  result: Result<FeaturedTour[]>;
  name: string;
}) {
  const { t } = useTranslation();

  return (
    <FeaturedTours
      id="recommended"
      title={t("landing.recommended.title", { name })}
      subtitle={t("landing.recommended.subtitle")}
      result={result}
    />
  );
}
