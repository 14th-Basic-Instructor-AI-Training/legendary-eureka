"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogoutCurve } from "iconsax-reactjs";
import { Avatar, Button } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSession } from "@/lib/auth";
import { useAuthStore } from "@/features/auth/store";
import { dashboardPathFor } from "@/lib/permissions";
import { useLocalizedRouter } from "@/lib/locale";
import { cn } from "@/lib/utils";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Header nav → landing sections. `hash` matches a `<section id>` on the landing
 * page; links resolve to `/#hash` so they smooth-scroll when already on the
 * landing page and navigate home-then-scroll from any other route (e.g. a
 * destination detail page). Scroll behavior + header offset live in globals.css.
 */
const NAV_ITEMS = [
  { key: "destinations", hash: "destinations" },
  { key: "tours", hash: "tours" },
  { key: "about", hash: "about" },
  { key: "thingsToDo", hash: "things-to-do" },
] as const;

/**
 * Public marketing header. Transparent over the hero, turns solid on scroll
 * (the only header motion). Shows guest auth actions or, when signed in, a link
 * to the role's dashboard/workspace/control panel plus the account menu.
 */
export function MarketingHeader() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const { user } = useSession();
  const signOut = useAuthStore((s) => s.signOut);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    signOut();
    router.replace("/");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-surface/90 border-border border-b shadow-primary backdrop-blur"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-6">
          <LocaleLink href="/" className="flex items-center">
            <span
              className={cn(
                "inline-flex h-8 items-center rounded-lg px-2.5 font-bold tracking-tight transition-colors",
                scrolled ? "bg-primary text-white" : "bg-white/95 text-primary",
              )}
            >
              {t("common.appName")}
            </span>
          </LocaleLink>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map(({ key, hash }) => (
              <LocaleLink
                key={key}
                href={`/#${hash}`}
                className={cn(
                  "group relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                  scrolled
                    ? "text-muted hover:text-foreground"
                    : "text-white/90 hover:text-white",
                )}
              >
                <span className="transition-transform duration-200 group-hover:-translate-y-px inline-block">
                  {t(`nav.${key}`)}
                </span>
                {/* Modern sliding underline: grows from the left on hover. */}
                <span
                  className={cn(
                    "bg-primary pointer-events-none absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100",
                  )}
                />
              </LocaleLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher
            className="hidden sm:block"
            tone={scrolled ? "default" : "onDark"}
          />
          {user ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => router.push(dashboardPathFor(user.role))}
              >
                {user.role === "admin"
                  ? t("nav.controlPanel")
                  : user.role === "agency"
                    ? t("nav.workspace")
                    : t("nav.dashboard")}
              </Button>
              <Avatar size="sm">
                <Avatar.Fallback>{initialsOf(user.name)}</Avatar.Fallback>
              </Avatar>
              <Button
                variant="tertiary"
                size="sm"
                onPress={handleLogout}
                aria-label={t("common.logout")}
              >
                <LogoutCurve size={16} color="currentColor" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={scrolled ? "tertiary" : "secondary"}
                size="sm"
                onPress={() => router.push("/login")}
              >
                {t("nav.login")}
              </Button>
              <Button variant="primary" size="sm" onPress={() => router.push("/register")}>
                {t("nav.signup")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
