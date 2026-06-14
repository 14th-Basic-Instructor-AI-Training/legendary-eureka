"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { SearchNormal1 } from "iconsax-reactjs";
import { Button, Input } from "@/ui";

/**
 * Hero search bar. Static in the UI-first phase — captures a query but doesn't
 * route anywhere yet (search results land with the traveler browse feature).
 */
export function SearchBar() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: route to search results once the browse feature exists.
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface/95 flex w-full items-center gap-2 rounded-2xl p-2 shadow-primary backdrop-blur"
    >
      <div className="text-text-input-color pl-2">
        <SearchNormal1 size={20} color="currentColor" />
      </div>
      <Input
        aria-label={t("landing.hero.searchPlaceholder")}
        placeholder={t("landing.hero.searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 border-0 bg-transparent shadow-none focus:ring-0"
      />
      <Button type="submit" variant="primary" size="lg" className="shrink-0">
        {t("landing.hero.searchCta")}
      </Button>
    </form>
  );
}
