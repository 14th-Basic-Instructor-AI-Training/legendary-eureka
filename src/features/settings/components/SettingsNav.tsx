"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { SETTINGS_SECTIONS } from "../config";

/** Left vertical sub-nav for the settings page. */
export function SettingsNav({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (key: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("settings.title")} className="flex flex-col gap-1">
      {SETTINGS_SECTIONS.map((s) => {
        const isActive = s.key === active;
        return (
          <button
            key={s.key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelect(s.key)}
            className={cn(
              "rounded-lg px-3 py-2 text-left text-sm transition-colors",
              isActive
                ? "bg-muted/15 text-foreground font-semibold"
                : "text-muted hover:bg-muted/10 hover:text-foreground",
            )}
          >
            {t(s.labelKey)}
          </button>
        );
      })}
    </nav>
  );
}
