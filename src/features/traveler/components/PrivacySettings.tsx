"use client";

import { useTranslation } from "react-i18next";
import { Eye, Lock1 } from "iconsax-reactjs";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useTravelerStore } from "../store";
import { VisibilitySchema, type Visibility } from "../schema";

const OPTIONS: { value: Visibility; Icon: typeof Eye }[] = [
  { value: "PUBLIC", Icon: Eye },
  { value: "PRIVATE", Icon: Lock1 },
];

/** Settings → default trip-plan visibility (Public / Private). */
export function PrivacySettings() {
  const { t } = useTranslation();
  const { role } = useSession();
  const privacy = useTravelerStore((s) => s.privacy);
  const setPrivacy = useTravelerStore((s) => s.setPrivacy);

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">{t("settings.privacy.defaultVisibility")}</legend>
      <p className="text-muted -mt-1 text-xs">{t("settings.privacy.description")}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONS.map(({ value, Icon }) => {
          const isActive = privacy.defaultVisibility === value;
          const key = value === "PUBLIC" ? "public" : "private";
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setPrivacy(role, VisibilitySchema.parse(value))}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted/40",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  isActive ? "bg-primary text-white" : "bg-surface text-muted",
                )}
              >
                <Icon size={18} color="currentColor" variant="Bold" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {t(`tripPlans.visibility.${key}`)}
                </span>
                <span className="text-muted mt-0.5 block text-xs">
                  {t(`settings.privacy.${key}Hint`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
