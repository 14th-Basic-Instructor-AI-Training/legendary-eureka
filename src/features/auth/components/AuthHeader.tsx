"use client";

import { useTranslation } from "react-i18next";
import { LocaleLink } from "@/components/LocaleLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function AuthHeader() {
  const { t } = useTranslation();

  return (
    <header className="relative z-10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <LocaleLink href="/" className="flex items-center">
          <span className="bg-primary inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-bold tracking-tight text-white">
            {t("common.appName")}
          </span>
        </LocaleLink>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
