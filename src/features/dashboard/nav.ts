import {
  Buildings,
  Flag,
  Category,
  ClipboardText,
  Calendar,
  Element3,
  Profile2User,
  Star1,
  Chart2,
  Receipt21,
  Setting2,
} from "iconsax-reactjs";
import type { Role } from "@/features/auth/schema";
import type { IconType } from "./config";

/**
 * Dashboard sidebar nav, per role. An item links to its own route via `href`
 * (a locale-relative path), or deep-links into the role page's tab via the
 * `?tab=` query param when `tab` is present — the first tab item is the
 * default tab. Labels reuse the existing tab/nav i18n keys.
 */
export interface NavItem {
  labelKey: string;
  Icon: IconType;
  /** Locale-relative route this item links to (e.g. "/agency/dashboard"). */
  href?: string;
  /** Deep-links into the role page's `?tab=` query param. */
  tab?: string;
}

export const SIDEBAR_NAV: Record<Role, NavItem[]> = {
  admin: [
    { labelKey: "admin.nav.overview", Icon: Chart2, href: "/admin" },
    { labelKey: "admin.nav.requests", Icon: Buildings, href: "/admin/requests" },
    { labelKey: "admin.tabs.reports", Icon: Flag, href: "/admin/reports" },
    { labelKey: "admin.nav.content", Icon: Category, href: "/admin/content" },
    { labelKey: "admin.tabs.users", Icon: Profile2User, href: "/admin/users" },
    { labelKey: "admin.nav.bookings", Icon: Receipt21, href: "/admin/bookings" },
    { labelKey: "admin.nav.settings", Icon: Setting2, href: "/admin/settings" },
  ],
  agency: [
    { labelKey: "nav.dashboard", Icon: Element3, href: "/agency/dashboard" },
    { labelKey: "agency.tabs.bookings", Icon: ClipboardText, tab: "bookings" },
    { labelKey: "agency.tabs.activities", Icon: Category, tab: "activities" },
    { labelKey: "agency.tabs.packages", Icon: Calendar, tab: "packages" },
  ],
  traveler: [
    { labelKey: "nav.dashboard", Icon: Star1, href: "/traveler" },
    { labelKey: "profile.nav.profile", Icon: Profile2User, href: "/traveler/profile" },
  ],
};
