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
import { signOut } from "next-auth/react";
import { useLocalizedRouter } from "@/lib/locale";
import { useConfirm } from "@/ui";
import { cn } from "@/lib/utils";
import type { Role } from "@/features/auth/schema";

/** Items that get a divider rule above them in the sidebar. */
const DIVIDER_ABOVE = new Set(["admin.tabs.users", "nav.settings"]);

/** Role-aware dashboard sidebar. Nav items deep-link into the page's tabs. */
export function DashboardSidebar({ role }: { role: Role }) {
  const { t } = useTranslation();
  const params = useSearchParams();
  const pathname = usePathname() ?? "";
  const router = useLocalizedRouter();
  const confirm = useConfirm();

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
    router.replace("/login");
  };
  const groups = SIDEBAR_NAV[role];
  const allItems = groups.flatMap((g) => g.items);
  const defaultTab = allItems.find((item) => item.tab)?.tab;
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
        {groups.map((group, gi) => (
          <SidebarMenu
            key={group.labelKey ?? `group-${gi}`}
            className={cn(gi > 0 && "mt-3", group.separated && "border-border border-t pt-2")}
          >
            {group.labelKey ? (
              <li className="text-muted px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider uppercase group-data-[state=collapsed]:hidden">
                {t(group.labelKey)}
              </li>
            ) : null}
            {group.items.map(({ labelKey, Icon, href: route, tab }) => {
              const href = route ?? (tab ? `${base}?tab=${tab}` : base);
              const active = route
                ? pathname.endsWith(route)
                : onBase && (tab ? activeTab === tab : true);
              return (
                <SidebarMenuItem
                  key={labelKey}
                  className={cn(
                    DIVIDER_ABOVE.has(labelKey) && "border-border mt-2 border-t pt-2",
                  )}
                >
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
        ))}
      </SidebarContent>

      <SidebarFooter className="pb-6">
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
            <SidebarMenuButton
              onClick={handleLogout}
              title={t("common.logout")}
              className="py-3 hover:bg-danger/10 hover:text-danger"
            >
              <LogoutCurve size={20} color="currentColor" />
              <SidebarLabel>{t("common.logout")}</SidebarLabel>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
