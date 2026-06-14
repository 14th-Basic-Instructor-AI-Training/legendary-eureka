"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Add, Card as CardIcon, InfoCircle, Edit2, ArrowDown2 } from "iconsax-reactjs";
import { Button } from "@/ui";
import { cn } from "@/lib/utils";

type SavedCard = {
  id: string;
  /** Card brand — a proper noun, kept as data. */
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
};

const SAVED_CARDS: SavedCard[] = [
  { id: "c1", brand: "Mastercard", last4: "1234", expiry: "06/2024", isDefault: true },
  { id: "c2", brand: "Visa", last4: "5678", expiry: "06/2024", isDefault: false },
  { id: "c3", brand: "PayPal", last4: "9012", expiry: "06/2024", isDefault: false },
];

/** Small on/off toggle (no wrapped Switch primitive exists yet). */
function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-primary" : "bg-muted/30",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          on ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/** Saved cards / payment methods panel (static UI). */
export function PaymentInformation() {
  const { t } = useTranslation();
  const [cards, setCards] = useState(SAVED_CARDS);

  const setDefault = (id: string) =>
    setCards((cs) => cs.map((c) => ({ ...c, isDefault: c.id === id })));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            {t("settings.payment.title")}
          </h2>
          <p className="text-muted mt-1 text-sm">{t("settings.payment.subtitle")}</p>
        </div>
        <Button variant="primary" size="sm">
          <Add size={16} color="currentColor" />
          {t("settings.payment.addNew")}
        </Button>
      </header>

      <div className="border-border border-t" />

      <div className="flex flex-col gap-3">
        <h3 className="text-foreground text-sm font-semibold">
          {t("settings.payment.savedCards")}
        </h3>

        <div className="bg-green/10 text-green flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
          <InfoCircle size={16} color="currentColor" className="shrink-0" />
          {t("settings.payment.secured")}
        </div>

        <ul className="flex flex-col gap-3">
          {cards.map((c) => (
            <li key={c.id} className="bg-surface border-border rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="border-border inline-flex h-9 w-12 shrink-0 items-center justify-center rounded-lg border">
                    <CardIcon size={18} color="currentColor" className="text-muted" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-medium">
                      {t("settings.payment.endingIn", { brand: c.brand, last4: c.last4 })}
                    </p>
                    <p className="text-muted text-xs">
                      {t("settings.payment.expiry", { date: c.expiry })}
                    </p>
                    <div className="mt-1.5 flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Toggle
                          on={c.isDefault}
                          onChange={() => setDefault(c.id)}
                          label={t("settings.payment.default")}
                        />
                        <span className="text-muted text-xs">{t("settings.payment.default")}</span>
                      </span>
                      <button
                        type="button"
                        className="text-primary flex items-center gap-1 text-xs font-medium"
                      >
                        <Edit2 size={13} color="currentColor" />
                        {t("settings.payment.edit")}
                      </button>
                    </div>
                  </div>
                </div>
                <ArrowDown2 size={18} color="currentColor" className="text-muted shrink-0" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
