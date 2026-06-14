"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, SearchNormal1 } from "iconsax-reactjs";
import { Input } from "@/ui";
import { SUPPORT_CARDS, type SupportCard as SupportCardType } from "../config";

function SupportCard({ card }: { card: SupportCardType }) {
  const { t } = useTranslation();
  const base = `settings.support.cards.${card.key}`;
  const { Icon } = card;
  return (
    <li>
      <button
        type="button"
        className="group bg-surface border-border hover:border-primary/40 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors"
      >
        <span className="border-border text-foreground inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
          <Icon size={20} color="currentColor" variant="Linear" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground font-semibold">{t(`${base}.title`)}</p>
          <p className="text-muted mt-0.5 text-sm">
            {t(`${base}.desc`)}
            {card.hasLink ? (
              <>
                {" "}
                <span className="text-primary font-medium">{t(`${base}.link`)}</span>
              </>
            ) : null}
          </p>
        </div>
        <ArrowRight
          size={18}
          color="currentColor"
          className="text-muted shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </li>
  );
}

export function SupportCenter() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const cards = SUPPORT_CARDS.filter((c) => {
    if (!q) return true;
    const title = t(`settings.support.cards.${c.key}.title`).toLowerCase();
    const desc = t(`settings.support.cards.${c.key}.desc`).toLowerCase();
    return title.includes(q) || desc.includes(q);
  });

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-foreground text-lg font-semibold">{t("settings.support.title")}</h2>
        <p className="text-muted mt-1 text-sm">{t("settings.support.subtitle")}</p>
      </header>

      <div className="border-border border-t" />

      <div className="relative">
        <SearchNormal1
          size={18}
          color="currentColor"
          className="text-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
        />
        <Input
          aria-label={t("settings.support.searchPlaceholder")}
          placeholder={t("settings.support.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-full pl-11"
        />
      </div>

      {cards.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("common.noResults")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {cards.map((c) => (
            <SupportCard key={c.key} card={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
