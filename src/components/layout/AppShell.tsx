"use client";

import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Spinner } from "@/ui";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/sidebar/sidebar";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useRequireRole, useSession } from "@/lib/auth";
import type { Role } from "@/features/auth/schema";

/**
 * Per-role notifications inbox route. Only roles with a page get a header bell;
 * extend this as agency/admin inboxes are added.
 */
const NOTIFICATIONS_HREF: Partial<Record<Role, string>> = {
  traveler: "/traveler/notifications",
  agency: "/agency/notifications",
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="text-muted flex min-h-dvh items-center justify-center gap-3">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/**
 * Role-aware app shell: guards the route (useRequireRole), then renders the
 * collapsible shadcn sidebar + topbar (collapse trigger, user, language,
 * logout) around the page. Holds rendering until the mock session has hydrated
 * and the role matches.
 */
export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const { ready } = useRequireRole(role);
  const { user } = useSession();
  const { t } = useTranslation();

  if (!ready || !user) {
    return <LoadingScreen label={t("common.loading")} />;
  }

  const notificationsHref = NOTIFICATIONS_HREF[role];

  return (
    <Suspense fallback={<LoadingScreen label={t("common.loading")} />}>
      <SidebarProvider>
        <DashboardSidebar role={role} />

        <SidebarInset className="min-h-0 bg-[var(--bg-dashboard)] p-3">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white">
            {/* Ogee corner at the top-left (matches the supplied clip sample):
                three tangent arcs of equal radius — convex into the top edge,
                concave scoop in the middle, convex into the left edge — filled
                with the page background so it reads as a clip. The collapse
                trigger sits in front of it. Tune R below to scale the notch. */}
            <svg
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-20 shrink-0"
              width={89}
              height={84}
              viewBox="0 0 89 84"
              fill="none"
            >
              <path
                d="M0,0 L89,0 A29.67,28 0 0 0 59.33,28 A29.67,28 0 0 1 29.67,56 A29.67,28 0 0 0 0,84 Z"
                fill="var(--color-bg-dashboard)"
              />
            </svg>
          <header className="border-border flex h-16 shrink-0 items-center gap-3 rounded-t-xl border-b bg-white px-4 md:pr-8 md:pl-2 ">
              <span className="relative z-30 flex">
                <SidebarTrigger />
              </span>
              <div className="flex flex-1 items-center justify-end gap-3">
                {notificationsHref ? (
                  <NotificationBell href={notificationsHref} />
                ) : null}
                <LanguageSwitcher />
                <div className="hidden text-right sm:block">
                  <p className="text-sm leading-tight font-medium">{user.name}</p>
                  <p className="text-muted text-xs leading-tight">{t(`roles.${role}`)}</p>
                </div>
                <Avatar size="sm">
                  <Avatar.Fallback>{initialsOf(user.name)}</Avatar.Fallback>
                </Avatar>
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-y-auto p-4 md:pt-8 md:px-8 md:pb-4">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
