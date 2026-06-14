"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ShieldTick } from "iconsax-reactjs";
import { Card } from "@/ui";
import { formatPrice } from "@/lib/format";
import type { Pricing } from "../schema";

/** Sticky price breakdown sidebar shared by the Review and Payment steps. */
export function PriceSummary({
  pricing,
  unitPrice,
  travelers,
  currency,
  cta,
}: {
  pricing: Pricing;
  unitPrice: number;
  travelers: number;
  currency: string;
  cta: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <Card className="bg-background border-border sticky top-24 flex flex-col gap-4 rounded-2xl border p-5 shadow-sm">
      <h2 className="font-semibold tracking-tight">
        {t("booking.summary.title")}
      </h2>

      <div className="flex flex-col gap-2 text-sm">
        <div className="text-muted flex items-center justify-between">
          <span>
            {t("booking.summary.unitPrice", {
              price: formatPrice(unitPrice, currency, lng),
              count: travelers,
            })}
          </span>
          <span className="text-foreground">
            {formatPrice(pricing.subtotal, currency, lng)}
          </span>
        </div>
        <div className="text-muted flex items-center justify-between">
          <span>{t("booking.summary.platformFee")}</span>
          <span className="text-foreground">
            {formatPrice(pricing.fee, currency, lng)}
          </span>
        </div>
        <div className="border-border flex items-center justify-between border-t pt-3 text-base font-bold">
          <span>{t("booking.summary.total")}</span>
          <span>{formatPrice(pricing.total, currency, lng)}</span>
        </div>
      </div>

      {cta}

      <p className="text-muted flex items-center justify-center gap-1.5 text-xs">
        <ShieldTick
          size={14}
          color="currentColor"
          variant="Bold"
          className="text-success"
        />
        {t("booking.summary.secure")}
      </p>
    </Card>
  );
}
