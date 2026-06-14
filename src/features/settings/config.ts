import type { ComponentType } from "react";
import {
  ShieldTick,
  Ticket,
  DollarCircle,
  Global,
  MessageQuestion,
} from "iconsax-reactjs";

export type IconType = ComponentType<{
  size?: number | string;
  color?: string;
  className?: string;
  variant?: "Linear" | "Outline" | "Bold" | "Bulk" | "Broken" | "TwoTone";
}>;

/** One entry in the left settings sub-nav. `labelKey` is an i18n key. */
export interface SettingsSection {
  key: string;
  labelKey: string;
}

/**
 * Traveler account settings sections (left nav order matches the design).
 * Only "support" has a built panel today; the rest render a placeholder.
 */
export const SETTINGS_SECTIONS: SettingsSection[] = [
  { key: "account", labelKey: "settings.nav.account" },
  { key: "payment", labelKey: "settings.nav.payment" },
  { key: "notifications", labelKey: "settings.nav.notifications" },
  { key: "approval", labelKey: "settings.nav.approval" },
  { key: "support", labelKey: "settings.nav.support" },
  { key: "becomeHost", labelKey: "settings.nav.becomeHost" },
  { key: "terms", labelKey: "settings.nav.terms" },
];

/** A Support Center entry. Copy lives under `settings.support.cards.<key>.*`. */
export interface SupportCard {
  key: string;
  Icon: IconType;
  /** Whether the description carries an emphasized link suffix (`.link`). */
  hasLink?: boolean;
}

export const SUPPORT_CARDS: SupportCard[] = [
  { key: "safety", Icon: ShieldTick, hasLink: true },
  { key: "ticket", Icon: Ticket, hasLink: true },
  { key: "dispute", Icon: DollarCircle },
  { key: "howItWorks", Icon: Global },
  { key: "faq", Icon: MessageQuestion },
];
