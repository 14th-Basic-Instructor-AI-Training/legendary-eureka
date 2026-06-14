"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";

/**
 * Shared chrome for every auth screen (login, register, OTP, forgot, reset):
 * brand mark, title, subtitle, a card body, and an optional footer slot.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <LocaleLink href="/" className="inline-flex">
          <span className="bg-primary inline-flex h-11 items-center rounded-xl px-4 text-lg font-bold tracking-tight text-white">
            {t("common.appName")}
          </span>
        </LocaleLink>
        <h1 className="text-primary mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-muted mt-1 text-sm">{subtitle}</p> : null}
      </div>

      <Card variant="default" className="bg-surface rounded-2xl p-6 shadow-primary">
        {children}
      </Card>

      {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
    </div>
  );
}
