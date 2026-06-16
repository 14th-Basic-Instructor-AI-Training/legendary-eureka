"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogoutCurve } from "iconsax-reactjs";
import { Avatar, Button, useConfirm } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSession } from "@/lib/auth";
import { signOut } from "next-auth/react";
import { dashboardPathFor } from "@/lib/permissions";
import { useLocalizedRouter } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { clientApiFetch } from "@/lib/api/client";
import { onRealtime, AGENCY_APPROVED } from "@/lib/realtime";
import type { AgencyProfileResponse, AgencyStatus } from "@/lib/api/profile";
import { AgencyApprovalPendingModal } from "./AgencyApprovalPendingModal";
import { AgencyApprovedModal } from "./AgencyApprovedModal";

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
  const confirm = useConfirm();
  const [scrolled, setScrolled] = useState(false);
  // Agency-registration approval state (only fetched for agency accounts).
  const [agencyStatus, setAgencyStatus] = useState<AgencyStatus | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showApprovedModal, setShowApprovedModal] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A pending agency keeps the `agency` role but its profile isn't approved yet,
  // so gate the Workspace button until an admin confirms the registration.
  useEffect(() => {
    if (user?.role !== "agency") return;
    let active = true;
    clientApiFetch<AgencyProfileResponse>("/agencies/me")
      .then((profile) => {
        if (active) setAgencyStatus(profile.status);
      })
      .catch(() => {
        // On failure, leave the button navigating normally — don't block access.
        if (active) setAgencyStatus(null);
      });
    return () => {
      active = false;
    };
  }, [user?.role, user?.id]);

  // Live approval: when an admin approves THIS agency, the requests queue emits an
  // `AGENCY_APPROVED` frame. Unlock the workspace in place (clears the pending gate)
  // and surface the success modal so the agency can jump straight in — no reload.
  useEffect(() => {
    if (user?.role !== "agency") return;
    return onRealtime(AGENCY_APPROVED, (msg) => {
      const data = msg.data as { userId?: string } | null;
      if (data?.userId !== user.id) return;
      setAgencyStatus("APPROVED");
      setShowPendingModal(false);
      setShowApprovedModal(true);
    });
  }, [user?.role, user?.id]);

  const goToWorkspace = () => {
    if (!user) return;
    setShowApprovedModal(false);
    router.push(dashboardPathFor(user.role));
  };

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === "agency" && agencyStatus === "PENDING") {
      setShowPendingModal(true);
      return;
    }
    router.push(dashboardPathFor(user.role));
  };

  const handleLogout = async () => {
    const ok = await confirm({
      intent: "danger",
      icon: <LogoutCurve size={20} color="currentColor" />,
      title: t("common.confirmDialog.logoutTitle"),
      description: t("common.confirmDialog.logoutDescription"),
      confirmLabel: t("common.logout"),
    });
    if (!ok) return;
    await signOut({ redirect: false });
    router.replace("/");
  };

  return (
    <>
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
            <span className="bg-primary inline-flex h-8 items-center rounded-lg px-2.5 font-bold tracking-tight text-white">

              {t("common.appName")}
            </span>
          </LocaleLink>
          <nav className="hidden items-center gap-1 lg:flex">
            <LocaleLink
              href="/explore"
              className="group text-muted hover:text-foreground relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              <span className="transition-transform duration-200 group-hover:-translate-y-px inline-block">
                {t("explore.navLabel")}
              </span>
              <span className="bg-primary pointer-events-none absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </LocaleLink>
            {NAV_ITEMS.map(({ key, hash }) => (
              <LocaleLink
                key={key}
                href={`/#${hash}`}
                className="group text-muted hover:text-foreground relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
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
          <LanguageSwitcher className="hidden sm:block" tone="default" />
          {user ? (
            <>
              <Button variant="secondary" size="sm" onPress={goToDashboard}>
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
                variant="tertiary"
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

    <AgencyApprovalPendingModal
      isOpen={showPendingModal}
      onClose={() => setShowPendingModal(false)}
    />

    <AgencyApprovedModal
      isOpen={showApprovedModal}
      onClose={() => setShowApprovedModal(false)}
      onGoToWorkspace={goToWorkspace}
    />
    </>
  );
}
