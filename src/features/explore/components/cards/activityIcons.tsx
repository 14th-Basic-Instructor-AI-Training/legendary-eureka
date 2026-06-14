import type { ComponentType } from "react";
import { Flag, Health, Coffee, Building, Tree } from "iconsax-reactjs";
import type { ActivityFocus } from "../../schema";

type IconProps = { size?: number; color?: string; variant?: "Linear" | "Bold" };

/** Maps a destination Activity Focus to an Iconsax glyph for the card icon row. */
export const ACTIVITY_ICON: Record<ActivityFocus, ComponentType<IconProps>> = {
  Adventure: Flag,
  Wellness: Health,
  Food: Coffee,
  History: Building,
  Nature: Tree,
};
