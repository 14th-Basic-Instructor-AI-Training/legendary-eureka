"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Card as CardIcon,
  Lock1,
  Mobile,
  Money,
  ScanBarcode,
} from "iconsax-reactjs";
import { Button, Card, Input, Label } from "@/ui";
import { cn } from "@/lib/utils";
import type { TourDetail } from "@/features/tours/types";
import {
  PaymentMethodSchema,
  type PaymentMethod,
  type Pricing,
} from "../schema";
import { PriceSummary } from "./PriceSummary";

const METHOD_ICON: Record<PaymentMethod, typeof CardIcon> = {
  card: CardIcon,
  mobile: Mobile,
  cash: Money,
};

function LabeledInput({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Step 2 — choose a payment method and (for cards) enter details. */
export function PaymentStep({
  tour,
  travelers,
  pricing,
  method,
  onMethodChange,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  tour: TourDetail;
  travelers: number;
  pricing: Pricing;
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const [card, setCard] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {t("booking.payment.title")}
          </h1>
          <p className="text-muted mt-1 flex items-center gap-1.5 text-sm">
            <Lock1
              size={15}
              color="currentColor"
              variant="Bold"
              className="text-primary-lightskyblue"
            />
            {t("booking.payment.demoNotice")}
          </p>
        </div>

        <Card className="bg-background border-border rounded-2xl border p-5 shadow-sm">
          <h3 className="mb-4 font-semibold tracking-tight">
            {t("booking.payment.methodTitle")}
          </h3>

          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">
              {t("booking.payment.methodTitle")}
            </legend>
            {PaymentMethodSchema.options.map((m) => {
              const Icon = METHOD_ICON[m];
              const selected = method === m;
              return (
                <label
                  key={m}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                    selected
                      ? "border-primary-lightskyblue bg-primary-lightskyblue/8"
                      : "border-border hover:border-primary-lightskyblue/50",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m}
                    checked={selected}
                    onChange={() => onMethodChange(m)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      selected
                        ? "border-primary-lightskyblue"
                        : "border-border",
                    )}
                  >
                    {selected ? (
                      <span className="bg-primary-lightskyblue h-2.5 w-2.5 rounded-full" />
                    ) : null}
                  </span>
                  <Icon
                    size={22}
                    color="currentColor"
                    variant="Bold"
                    className="text-foreground shrink-0"
                  />
                  <span className="flex flex-col">
                    <span className="text-foreground text-sm font-semibold">
                      {t(`booking.payment.methods.${m}.label`)}
                    </span>
                    <span className="text-muted text-xs">
                      {t(`booking.payment.methods.${m}.desc`)}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          {method === "card" ? (
            <div className="border-border mt-5 flex flex-col gap-4 border-t pt-5">
              <LabeledInput
                id="cc-number"
                label={t("booking.payment.card.number")}
                placeholder="1234 5678 9012 3456"
                value={card.cardNumber}
                onChange={(v) => setCard((c) => ({ ...c, cardNumber: v }))}
              />
              <LabeledInput
                id="cc-name"
                label={t("booking.payment.card.name")}
                placeholder="MARA SOK"
                value={card.cardName}
                onChange={(v) => setCard((c) => ({ ...c, cardName: v }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <LabeledInput
                  id="cc-expiry"
                  label={t("booking.payment.card.expiry")}
                  placeholder="MM / YY"
                  value={card.expiry}
                  onChange={(v) => setCard((c) => ({ ...c, expiry: v }))}
                />
                <LabeledInput
                  id="cc-cvc"
                  label={t("booking.payment.card.cvc")}
                  placeholder="123"
                  value={card.cvc}
                  onChange={(v) => setCard((c) => ({ ...c, cvc: v }))}
                />
              </div>
            </div>
          ) : null}

          {method === "mobile" ? (
            <div className="border-border mt-5 flex flex-col items-center gap-3 border-t pt-5 text-center">
              <span className="bg-agency-navy flex h-28 w-28 items-center justify-center rounded-xl">
                <ScanBarcode size={56} color="#ffffff" variant="Linear" />
              </span>
              <p className="text-muted text-sm">
                {t("booking.payment.mobile.hint")}
              </p>
            </div>
          ) : null}

          {method === "cash" ? (
            <p className="text-muted border-border mt-5 border-t pt-5 text-sm leading-relaxed">
              {t("booking.payment.cash.hint", { agency: tour.agency.name })}
            </p>
          ) : null}
        </Card>

        <div>
          <Button variant="tertiary" onPress={onBack}>
            <ArrowLeft size={16} color="currentColor" />
            {t("booking.payment.back")}
          </Button>
        </div>
      </div>

      <PriceSummary
        pricing={pricing}
        unitPrice={tour.unitPrice}
        travelers={travelers}
        currency={tour.currency}
        cta={
          <Button
            variant="primary"
            size="lg"
            fullWidth
            isPending={isSubmitting}
            onPress={onSubmit}
          >
            {t("booking.payment.submit")}
          </Button>
        }
      />
    </div>
  );
}
