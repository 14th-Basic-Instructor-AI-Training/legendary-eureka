"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SETTINGS_SECTIONS } from "../config";
import { SettingsNav } from "./SettingsNav";
import { SupportCenter } from "./SupportCenter";
import { AccountInformation } from "./AccountInformation";
import { PaymentInformation } from "./PaymentInformation";
import { NotificationsSettings } from "./NotificationsSettings";

/** Placeholder for sections not yet built out. */
function PlaceholderSection({ sectionKey }: { sectionKey: string }) {
  const { t } = useTranslation();
  const section = SETTINGS_SECTIONS.find((s) => s.key === sectionKey);
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-foreground text-lg font-semibold">
        {section ? t(section.labelKey) : null}
      </h2>
      <p className="text-muted text-sm">{t("settings.placeholder")}</p>
    </div>
  );
}

/**
 * Traveler account settings: a left sub-nav + the selected section panel.
 * Defaults to "Support Center" (the only fully built section today).
 */
export function SettingsPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState("support");

  return (
    <div className="mx-auto w-full max-w-full">
      <header className="border-border border-b pb-5">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {t("settings.title")}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-8 pt-6 md:grid-cols-[200px_1fr]">
        <SettingsNav active={active} onSelect={setActive} />
        <div>
          {active === "account" ? (
            <AccountInformation />
          ) : active === "payment" ? (
            <PaymentInformation />
          ) : active === "notifications" ? (
            <NotificationsSettings />
          ) : active === "support" ? (
            <SupportCenter />
          ) : (
            <PlaceholderSection sectionKey={active} />
          )}
        </div>
      </div>
    </div>
  );
}
