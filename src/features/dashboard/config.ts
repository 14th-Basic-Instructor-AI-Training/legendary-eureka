import type { ComponentType } from "react";
import {
  Airplane,
  Bookmark,
  Buildings,
  Category,
  Flag,
  Star1,
} from "iconsax-reactjs";
import type { Role } from "@/features/auth/schema";

export type IconType = ComponentType<{
  size?: number | string;
  color?: string;
  className?: string;
  variant?: "Linear" | "Outline" | "Bold" | "Bulk" | "Broken" | "TwoTone";
}>;

export interface DashCard {
  /** i18n key suffix under dashboard.<role>.cards.<key> */
  key: string;
  Icon: IconType;
  /** Placeholder metric shown on the card. */
  stat: string;
}

export interface RoleDashboard {
  accentText: string;
  accentBg: string;
  cards: DashCard[];
}

/**
 * Per-role dashboard content + accent. The card keys map to i18n copy.
 * The agency role has no entry here — its dashboard is the dedicated
 * `/agency/dashboard` route (ported from the destination app).
 */
export const DASHBOARDS: Partial<Record<Role, RoleDashboard>> = {
  admin: {
    accentText: "text-violet-600",
    accentBg: "bg-violet-500/10",
    cards: [
      { key: "agencies", Icon: Buildings, stat: "8" },
      { key: "reports", Icon: Flag, stat: "3" },
      { key: "activities", Icon: Category, stat: "142" },
    ],
  },
  traveler: {
    accentText: "text-blue-600",
    accentBg: "bg-blue-500/10",
    cards: [
      { key: "newsfeed", Icon: Star1, stat: "24" },
      { key: "trips", Icon: Airplane, stat: "2" },
      { key: "bookmarks", Icon: Bookmark, stat: "15" },
    ],
  },
};
