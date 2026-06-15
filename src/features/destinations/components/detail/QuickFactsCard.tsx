"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Location, Calendar, Translate, Money, DollarCircle } from "iconsax-reactjs";
import { Card } from "@/ui";
import { formatPrice } from "@/lib/format";
import type { Destination } from "../../schema";

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="border-border flex items-center gap-3 border-b py-3 last:border-none">
      <span className="text-primary flex shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-muted text-xs font-medium">{label}</div>
        <div className="text-foreground text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

/** "Quick Facts" sidebar card — province, best time, language, currency, price. */
export function QuickFactsCard({ destination }: { destination: Destination }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  const price =
    destination.priceFrom === 0
      ? t("common.free")
      : `${formatPrice(destination.priceFrom, destination.currency, lng)} / ${t("destinations.detail.perPerson")}`;

  return (
    <Card className="bg-background border-border rounded-2xl border p-5 shadow-sm">
      <h3 className="text-foreground mb-2 text-base font-semibold">
        {t("destinations.detail.quickFacts")}
      </h3>
      <Fact
        icon={<Location size={18} color="currentColor" variant="Bold" />}
        label={t("destinations.detail.provinceLabel")}
        value={`${destination.province}, ${destination.country}`}
      />
      {destination.bestTime ? (
        <Fact
          icon={<Calendar size={18} color="currentColor" variant="Bold" />}
          label={t("destinations.detail.bestTime")}
          value={destination.bestTime}
        />
      ) : null}
      {destination.language ? (
        <Fact
          icon={<Translate size={18} color="currentColor" variant="Bold" />}
          label={t("destinations.detail.language")}
          value={destination.language}
        />
      ) : null}
      <Fact
        icon={<Money size={18} color="currentColor" variant="Bold" />}
        label={t("destinations.detail.currency")}
        value={destination.currency}
      />
      <Fact
        icon={<DollarCircle size={18} color="currentColor" variant="Bold" />}
        label={t("destinations.detail.priceFromLabel")}
        value={price}
      />
    </Card>
  );
}
