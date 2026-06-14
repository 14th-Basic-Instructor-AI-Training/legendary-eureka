"use client";

import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/ui";

type NotifKey = "text" | "push" | "weekly" | "promo" | "offers";

type NotifOption = { key: NotifKey; hasDesc?: boolean };

const MOBILE_OPTIONS: NotifOption[] = [
  { key: "text", hasDesc: true },
  { key: "push", hasDesc: true },
  { key: "weekly", hasDesc: true },
];

const EMAIL_OPTIONS: NotifOption[] = [
  { key: "promo" },
  { key: "offers", hasDesc: true },
];

/** Label column + checkbox column row with a top divider. */
function NotifSection({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="border-border grid grid-cols-1 gap-4 border-t py-5 sm:grid-cols-[1fr_1fr] sm:gap-8">
      <div>
        <p className="text-foreground text-sm font-semibold">{title}</p>
        <p className="text-muted mt-1 text-sm">{desc}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function OptionCheckbox({
  option,
  selected,
  onToggle,
}: {
  option: NotifOption;
  selected: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const base = `settings.notifications.options.${option.key}`;
  return (
    <Checkbox isSelected={selected} onChange={onToggle} className="items-start gap-3">
      <Checkbox.Control className="mt-0.5">
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <span className="text-foreground block text-sm font-medium">{t(`${base}.label`)}</span>
        {option.hasDesc ? (
          <span className="text-muted mt-0.5 block text-xs">{t(`${base}.desc`)}</span>
        ) : null}
      </Checkbox.Content>
    </Checkbox>
  );
}

/** Notification preferences panel (static UI). */
export function NotificationsSettings() {
  const { t } = useTranslation();
  const [state, setState] = useState<Record<NotifKey, boolean>>({
    text: true,
    push: true,
    weekly: false,
    promo: true,
    offers: false,
  });

  const toggle = (key: NotifKey) => setState((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="flex flex-col">
      <header className="pb-5">
        <h2 className="text-foreground text-lg font-semibold">
          {t("settings.notifications.title")}
        </h2>
        <p className="text-muted mt-1 text-sm">{t("settings.notifications.subtitle")}</p>
      </header>

      <NotifSection
        title={t("settings.notifications.mobileTitle")}
        desc={t("settings.notifications.mobileDesc")}
      >
        {MOBILE_OPTIONS.map((o) => (
          <OptionCheckbox
            key={o.key}
            option={o}
            selected={state[o.key]}
            onToggle={() => toggle(o.key)}
          />
        ))}
      </NotifSection>

      <NotifSection
        title={t("settings.notifications.emailTitle")}
        desc={t("settings.notifications.emailDesc")}
      >
        {EMAIL_OPTIONS.map((o) => (
          <OptionCheckbox
            key={o.key}
            option={o}
            selected={state[o.key]}
            onToggle={() => toggle(o.key)}
          />
        ))}
      </NotifSection>
    </div>
  );
}
