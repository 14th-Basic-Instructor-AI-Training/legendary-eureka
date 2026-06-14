"use client";

import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

/**
 * Standard shell for an admin control page: the max-width container, a localized
 * title/subtitle header, and the queue component as children. Route files stay
 * thin server components that just pass i18n keys + the body.
 */
export function AdminQueuePage({
  titleKey,
  subtitleKey,
  children,
}: {
  titleKey: string;
  subtitleKey: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-full flex-col gap-6">
      <header>
        <h1 className="text-primary text-2xl font-bold tracking-tight">{t(titleKey)}</h1>
        <p className="text-muted mt-1">{t(subtitleKey)}</p>
      </header>
      {children}
    </div>
  );
}
