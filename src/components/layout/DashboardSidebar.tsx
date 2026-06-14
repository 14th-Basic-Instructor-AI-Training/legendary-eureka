"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LogoutCurve, UserSquare } from "iconsax-reactjs";
import { LocaleLink } from "@/components/LocaleLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar/sidebar";
import { SIDEBAR_NAV } from "@/features/dashboard/nav";
import { dashboardPathFor } from "@/lib/permissions";
import { useAuthStore } from "@/features/auth/store";
import { useLocalizedRouter } from "@/lib/locale";
import type { Role } from "@/features/auth/schema";

/** Role-aware dashboard sidebar. Nav items deep-link into the page's tabs. */
export function DashboardSidebar({ role }: { role: Role }) {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const params = useSearchParams();

  const handleLogout = () => {
    signOut();
    router.replace("/login");
  };
  const pathname = usePathname() ?? "";
  const items = SIDEBAR_NAV[role];
  const defaultTab = items.find((item) => item.tab)?.tab;
  const activeTab = params.get("tab") ?? defaultTab;
  const base = dashboardPathFor(role);
  const onBase = pathname.endsWith(base);

  return (
    <Sidebar>
      <SidebarHeader>
        <LocaleLink href="/" className="flex items-center gap-2 px-1 py-1">
          <span className="bg-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-white">
            J
          </span>
          <SidebarLabel className="text-lg font-bold tracking-tight">
            {t("common.appName")}
          </SidebarLabel>
        </LocaleLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map(({ labelKey, Icon, href: route, tab }) => {
            const href = route ?? (tab ? `${base}?tab=${tab}` : base);
            const active = route
              ? pathname.endsWith(route)
              : onBase && (tab ? activeTab === tab : true);
            return (
              <SidebarMenuItem key={labelKey}>
                <SidebarMenuButton asChild active={active}>
                  <LocaleLink href={href} title={t(labelKey)}>
                    <Icon
                      size={20}
                      color="currentColor"
                      variant={active ? "Bold" : "Linear"}
                    />
                    <SidebarLabel>{t(labelKey)}</SidebarLabel>
                  </LocaleLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {role === "agency" && (() => {
            const profileHref = "/agency/profile";
            const profileActive = pathname.endsWith(profileHref);
            return (
              <SidebarMenuItem>
                <SidebarMenuButton asChild active={profileActive}>
                  <LocaleLink href={profileHref} title={t("agency.profile.title")}>
                    <UserSquare
                      size={20}
                      color="currentColor"
                      variant={profileActive ? "Bold" : "Linear"}
                    />
                    <SidebarLabel>{t("agency.profile.title")}</SidebarLabel>
                  </LocaleLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })()}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} title={t("common.logout")} className="text-danger hover:bg-danger/10">
              <LogoutCurve size={20} color="currentColor" />
              <SidebarLabel>{t("common.logout")}</SidebarLabel>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
