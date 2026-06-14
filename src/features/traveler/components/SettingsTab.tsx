"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { NotificationPrefs } from "./NotificationPrefs";
import { PrivacySettings } from "./PrivacySettings";
import { DangerZone } from "./DangerZone";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-surface border-border flex flex-col gap-5 rounded-2xl border p-6">
      <div className="border-border border-b pb-3">
        <h3 className="font-semibold">{title}</h3>
        {description ? <p className="text-muted mt-0.5 text-sm">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** Settings tab: personal info, password, notifications, privacy, danger zone. */
export function SettingsTab() {
  const { t } = useTranslation();

  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <Section
        title={t("settings.personalInfo.title")}
        description={t("settings.personalInfo.description")}
      >
        <PersonalInfoForm />
      </Section>

      <Section title={t("settings.password.title")} description={t("settings.password.description")}>
        <PasswordChangeForm />
      </Section>

      <Section
        title={t("settings.notifications.title")}
        description={t("settings.notifications.description")}
      >
        <NotificationPrefs />
      </Section>

      <Section title={t("settings.privacy.title")} description={t("settings.privacy.title")}>
        <PrivacySettings />
      </Section>

      <DangerZone />
    </section>
  );
}
