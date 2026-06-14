"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Select, ListBox } from "@/ui";
import { LOCALES, type Locale } from "@/lib/locales";
import { persistLocaleCookie, useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

/** Short code shown in the trigger + as the option's primary label. */
const CODE: Record<Locale, string> = { en: "ENG", kh: "KH", kr: "KR" };
/** Full language name shown alongside the code in the dropdown. */
const LABELS: Record<Locale, string> = { en: "English", kh: "ខ្មែរ", kr: "한국어" };
/** Emoji flags (no image assets needed). */
const FLAG: Record<Locale, string> = { en: "🇬🇧", kh: "🇰🇭", kr: "🇰🇷" };

/**
 * Language picker (HeroUI Select). Present on every page — selecting a locale
 * navigates to the same path under the new `/[locale]` prefix and persists the
 * NEXT_LOCALE cookie. `tone="onDark"` styles the trigger for the transparent hero.
 */
export function LanguageSwitcher({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  const { t, i18n } = useTranslation();
  const current = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (key: string | number | null) => {
    if (key === null) return;
    const loc = String(key) as Locale;
    if (loc === current) return;
    persistLocaleCookie(loc);
    void i18n.changeLanguage(loc);
    const rest = pathname.replace(/^\/(en|kh|kr)(?=\/|$)/, "");
    router.push(`/${loc}${rest}`);
  };

  return (
    <Select
      aria-label={t("common.language")}
      selectedKey={current}
      onSelectionChange={handleChange}
      variant="secondary"
      className={className}
    >
      <Select.Trigger
        className={cn(
          "h-9 w-fit justify-between gap-5 rounded-lg px-3 text-sm font-medium",
          tone === "onDark" &&
            "border-white/30 bg-white/10 text-white hover:bg-white/20",
        )}
      >
        <span className="flex items-center gap-2 mr-5">
          <span className="text-base leading-none">{FLAG[current]}</span>
          <span>{CODE[current]}</span>
        </span>
        <Select.Indicator className="text-text-input-color" />
      </Select.Trigger>

      <Select.Popover className="w-fit max-w-[calc(100vw-2rem)]">
        <ListBox>
          {LOCALES.map((loc) => (
            <ListBox.Item
              key={loc}
              id={loc}
              textValue={CODE[loc]}
              className="flex items-center justify-between gap-5 px-3 py-2.5"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl leading-none">{FLAG[loc]}</span>
                <span className="font-medium">{CODE[loc]}</span>
              </span>
              <span className="text-muted text-sm">{LABELS[loc]}</span>
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
