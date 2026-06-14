"use client";

import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth";
import { getTrendingDestinations } from "@/features/destinations/data";
import { DestinationSection } from "./DestinationSection";

/**
 * Logged-in-only personalized row. Guests see nothing here (they get the public
 * sections instead); travelers and agencies get a name-greeted recommendations
 * strip — the "more info/locations after login" the brief asked for.
 */
export function RecommendedForYou() {
  const { t } = useTranslation();
  const { user } = useSession();

  if (!user) return null;

  return (
    <DestinationSection
      id="recommended"
      title={t("landing.recommended.title", { name: user.name })}
      subtitle={t("landing.recommended.subtitle")}
      fetcher={getTrendingDestinations}
    />
  );
}
