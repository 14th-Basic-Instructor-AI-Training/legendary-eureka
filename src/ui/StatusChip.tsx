"use client";

import { useTranslation } from "react-i18next";
import { Chip } from "./Chip";

type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

/** Maps a domain status to a chip color. Labels come from the `status.*` i18n keys. */
const STATUS_COLOR: Record<string, ChipColor> = {
  draft: "default",
  pending: "warning",
  open: "warning",
  published: "success",
  approved: "success",
  resolved: "success",
  completed: "accent",
  rejected: "danger",
  dismissed: "default",
};

/**
 * Shared status pill used across agency + admin surfaces. Renders the localized
 * `status.<status>` label in a color appropriate to the state.
 */
export function StatusChip({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <Chip color={STATUS_COLOR[status] ?? "default"} variant="soft" size="sm">
      {t(`status.${status}`)}
    </Chip>
  );
}
