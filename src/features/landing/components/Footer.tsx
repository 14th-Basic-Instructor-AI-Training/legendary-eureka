"use client";

import { useTranslation } from "react-i18next";
import { Reveal } from "@/ui";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SOCIALS } from "./SocialIcons";

/** Footer link columns. Labels resolve through i18next; links are static
 * placeholders in the UI-first phase. */
const COLUMNS: { heading: string; links: string[] }[] = [
  {
    heading: "landing.footer.company",
    links: ["nav.about", "landing.footer.links.tourGuide", "landing.footer.links.packages", "landing.footer.links.contact"],
  },
  {
    heading: "landing.footer.travel",
    links: ["landing.footer.links.cambodia", "landing.footer.links.korea", "landing.footer.links.japan"],
  },
  {
    heading: "landing.footer.resources",
    links: ["landing.footer.links.ebooks", "landing.footer.links.travelGuide", "landing.footer.links.blog"],
  },
  {
    heading: "landing.footer.extra",
    links: ["landing.footer.links.support", "landing.footer.links.terms", "landing.footer.links.privacy"],
  },
];

/** Marketing footer. Brand + tagline + socials, four link columns, copyright. */
export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface mt-8 rounded-t-[2.5rem]">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <Reveal className="col-span-2">
            <span className="bg-primary inline-flex h-9 items-center rounded-xl px-3 font-bold tracking-tight text-white">
              {t("common.appName")}
            </span>
            <p className="text-muted mt-4 max-w-xs text-sm">{t("landing.footer.tagline")}</p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ key, Glyph }) => (
                <a
                  key={key}
                  href="#"
                  aria-label={key}
                  className="bg-background text-muted hover:bg-primary inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:text-white"
                >
                  <Glyph />
                </a>
              ))}
            </div>
          </Reveal>

          {COLUMNS.map((col, i) => (
            <Reveal key={col.heading} delay={Math.min(i + 1, 4) * 0.08}>
              <h4 className="text-foreground mb-4 text-sm font-semibold">{t(col.heading)}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li
                    key={link}
                    className="text-muted hover:text-primary cursor-pointer text-sm transition-colors"
                  >
                    {t(link)}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted text-xs">{t("landing.footer.rights", { year })}</p>
          <LanguageSwitcher />
        </Reveal>
      </div>
    </footer>
  );
}
