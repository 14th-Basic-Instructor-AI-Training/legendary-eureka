"use client";

import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { LogoutCurve } from "iconsax-reactjs";
import { Avatar, Button, Spinner } from "@/ui";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/sidebar/sidebar";
import { useRequireRole, useSession } from "@/lib/auth";
import { useAuthStore } from "@/features/auth/store";
import { useLocalizedRouter } from "@/lib/locale";
import type { Role } from "@/features/auth/schema";

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
  const router = useLocalizedRouter();
  const signOut = useAuthStore((s) => s.signOut);

  if (!ready || !user) {
    return <LoadingScreen label={t("common.loading")} />;
  }

  const handleLogout = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <Suspense fallback={<LoadingScreen label={t("common.loading")} />}>
      <SidebarProvider>
        <DashboardSidebar role={role} />

        <SidebarInset>
          <header className="border-border bg-surface/80 sticky top-0 z-10 flex h-16 items-center gap-3 border-b px-4 backdrop-blur md:px-8">
            <SidebarTrigger />
            <div className="flex flex-1 items-center justify-end gap-3">
              <LanguageSwitcher />
              <div className="hidden text-right sm:block">
                <p className="text-sm leading-tight font-medium">{user.name}</p>
                <p className="text-muted text-xs leading-tight">{t(`roles.${role}`)}</p>
              </div>
              <Avatar size="sm">
                <Avatar.Fallback>{initialsOf(user.name)}</Avatar.Fallback>
              </Avatar>
              <Button variant="secondary" size="sm" onPress={handleLogout}>
                <LogoutCurve size={16} color="currentColor" />
                {t("common.logout")}
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
