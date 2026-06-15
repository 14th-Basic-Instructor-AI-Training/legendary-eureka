"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Lock1, Notification, Profile, ShieldTick, Trash } from "iconsax-reactjs";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { NotificationPrefs } from "./NotificationPrefs";
import { PrivacySettings } from "./PrivacySettings";
import { DangerZone } from "./DangerZone";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

type SectionKey = "personalInfo" | "password" | "notifications" | "privacy" | "danger";

const SECTIONS: {
  key: SectionKey;
  Icon: IconType;
  titleKey: string;
  descKey?: string;
  Panel: ComponentType;
  danger?: boolean;
}[] = [
  {
    key: "personalInfo",
    Icon: Profile,
    titleKey: "settings.personalInfo.title",
    descKey: "settings.personalInfo.description",
    Panel: PersonalInfoForm,
  },
  {
    key: "password",
    Icon: Lock1,
    titleKey: "settings.password.title",
    descKey: "settings.password.description",
    Panel: PasswordChangeForm,
  },
  {
    key: "notifications",
    Icon: Notification,
    titleKey: "settings.notifications.title",
    descKey: "settings.notifications.description",
    Panel: NotificationPrefs,
  },
  {
    key: "privacy",
    Icon: ShieldTick,
    titleKey: "settings.privacy.title",
    descKey: "settings.privacy.description",
    Panel: PrivacySettings,
  },
  {
    key: "danger",
    Icon: Trash,
    titleKey: "settings.danger.title",
    Panel: DangerZone,
    danger: true,
  },
];

/** Card wrapper for a settings section's title + body (Danger Zone renders raw). */
function SectionCard({
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

/**
 * Settings tab: a left vertical sub-nav (Personal Info / Password / Notifications
 * / Privacy / Danger Zone) selecting the panel shown on the right. The active
 * section is tracked locally; on mobile the nav scrolls horizontally above the
 * panel.
 */
export function SettingsTab() {
  const { t } = useTranslation();
  const [active, setActive] = useState<SectionKey>("personalInfo");

  const current = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];
  const { Panel } = current;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Column sub-nav */}
      <nav
        aria-label={t("profile.tabs.settings")}
        className="bg-surface border-border flex gap-1 overflow-x-auto rounded-2xl border p-2 lg:w-60 lg:shrink-0 lg:flex-col"
      >
        {SECTIONS.map(({ key, Icon, titleKey, danger }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors lg:w-full",
                isActive
                  ? danger
                    ? "bg-danger/10 text-danger"
                    : "bg-primary/10 text-primary"
                  : danger
                    ? "text-danger/80 hover:bg-danger/5"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground",
              ].join(" ")}
            >
              <Icon size={18} color="currentColor" variant={isActive ? "Bold" : "Linear"} />
              {t(titleKey)}
            </button>
          );
        })}
      </nav>

      {/* Active panel */}
      <section className="min-w-0 flex-1">
        {current.danger ? (
          <Panel />
        ) : (
          <SectionCard
            title={t(current.titleKey)}
            description={current.descKey ? t(current.descKey) : undefined}
          >
            <Panel />
          </SectionCard>
        )}
      </section>
    </div>
  );
}
