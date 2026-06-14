"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { ConfirmRoot } from "@/ui";

/**
 * Client-side providers, scoped under `[locale]`. The active locale comes from
 * the route segment and drives i18next's language. SessionProvider makes
 * the Auth.js session available to useSession() in any client component.
 */
export function Providers({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  // Set the language synchronously on first render (SSR + client) so children
  // render in the correct locale without a flash.
  useState(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
    return null;
  });

  // Keep i18next + <html lang> in sync on client-side locale navigations.
  useEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>
        {children}
        {/* Single app-wide confirmation modal, driven imperatively by useConfirm(). */}
        <ConfirmRoot />
      </I18nextProvider>
    </SessionProvider>
  );
}
