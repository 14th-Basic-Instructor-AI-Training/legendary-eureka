"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Add, Map1 } from "iconsax-reactjs";
import { Button, Reveal } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { useTravelerProfileData } from "../context";
import { PlanCard } from "./PlanCard";
import { EmptyState } from "./EmptyState";

/** Trip Plans tab: the traveler's itineraries + a create-new CTA. */
export function TripPlansTab() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const { tripPlans } = useTravelerProfileData();

  const createCta = (
    <Button variant="primary" size="sm" onPress={() => router.push("/traveler/trips/new")}>
      <Add size={18} color="currentColor" />
      {t("tripPlans.create")}
    </Button>
  );

  return (
    <section className="flex flex-col gap-5">
      {tripPlans.length > 0 ? <div className="flex justify-end">{createCta}</div> : null}

      {tripPlans.length === 0 ? (
        <EmptyState
          Icon={Map1}
          message={t("tripPlans.empty")}
          hint={t("tripPlans.emptyHint")}
          action={createCta}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tripPlans.map((plan, i) => (
            <Reveal key={plan.id} delay={Math.min(i, 3) * 0.05}>
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
