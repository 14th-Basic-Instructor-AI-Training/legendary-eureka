"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

/**
 * Client-side providers, scoped under `[locale]`. The active locale comes from
 * the route segment and drives i18next's language (so the URL is the source of
 * truth). HeroUI v3 needs no provider; WebSocket / Knock providers slot in here
 * later.
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

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
