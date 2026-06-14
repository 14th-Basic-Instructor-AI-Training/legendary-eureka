import { notFound } from "next/navigation";
import { Providers } from "@/app/providers";
import { LOCALES, type Locale } from "@/lib/locales";

/** Pre-render one tree per locale. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Locale segment layout. Validates the `[locale]` param against the supported
 * locales and scopes the i18n providers (which set the active language from it).
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();

  return <Providers locale={locale as Locale}>{children}</Providers>;
}
