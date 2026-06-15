"use client";

import { useTranslation } from "react-i18next";
import { Heart } from "iconsax-reactjs";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useExploreStore } from "../../store";

/**
 * Bookmark toggle shown on every Explore card. Visible to everyone, but the
 * mutation gates on `can(role, "bookmark")` in the store (defense in depth);
 * when a guest taps it we surface the login prompt via `onRequireAuth`.
 */
export function BookmarkButton({
  id,
  onRequireAuth,
  className,
}: {
  id: string;
  onRequireAuth: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const { role } = useSession();
  const bookmarked = useExploreStore((s) => s.bookmarks.has(id));
  const toggleBookmark = useExploreStore((s) => s.toggleBookmark);

  const handleClick = () => {
    if (!can(role, "bookmark")) {
      onRequireAuth();
      return;
    }
    toggleBookmark(role, id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? t("explore.card.bookmarked") : t("explore.card.bookmark")}
      className={cn(
        "bg-background/90 hover:bg-background flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors",
        className,
      )}
    >
      <Heart
        size={18}
        color="currentColor"
        variant={bookmarked ? "Bold" : "Linear"}
        className={bookmarked ? "text-red-500" : "text-foreground"}
      />
    </button>
  );
}
