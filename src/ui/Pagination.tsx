"use client";

import { Pagination as HeroPagination } from "@heroui/react";
import { cn } from "@/lib/utils";

export type UIPaginationProps = {
  /** 1-based current page. */
  page: number;
  /** Total number of pages. */
  total: number;
  onChange: (page: number) => void;
  className?: string;
};

/** Compact page list with ellipses, e.g. 1 … 4 5 6 … 20. */
function pageRange(page: number, total: number): Array<number | "ellipsis"> {
  const range: Array<number | "ellipsis"> = [];
  const left = Math.max(2, page - 1);
  const right = Math.min(total - 1, page + 1);

  range.push(1);
  if (left > 2) range.push("ellipsis");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("ellipsis");
  if (total > 1) range.push(total);
  return range;
}

/**
 * Wrapped HeroUI Pagination — controlled (`page` / `total` page count /
 * `onChange`). Renders nothing for a single page. Feature code uses this rather
 * than the raw `@heroui/react` compound.
 */
export function Pagination({ page, total, onChange, className }: UIPaginationProps) {
  if (total <= 1) return null;

  return (
    <HeroPagination className={cn("flex justify-center", className)}>
      <HeroPagination.Content>
        <HeroPagination.Item>
          <HeroPagination.Previous
            isDisabled={page <= 1}
            onPress={() => onChange(page - 1)}
          >
            <HeroPagination.PreviousIcon />
          </HeroPagination.Previous>
        </HeroPagination.Item>

        {pageRange(page, total).map((p, i) =>
          p === "ellipsis" ? (
            <HeroPagination.Item key={`ellipsis-${i}`}>
              <HeroPagination.Ellipsis />
            </HeroPagination.Item>
          ) : (
            <HeroPagination.Item key={p}>
              <HeroPagination.Link isActive={p === page} onPress={() => onChange(p)}>
                {p}
              </HeroPagination.Link>
            </HeroPagination.Item>
          ),
        )}

        <HeroPagination.Item>
          <HeroPagination.Next isDisabled={page >= total} onPress={() => onChange(page + 1)}>
            <HeroPagination.NextIcon />
          </HeroPagination.Next>
        </HeroPagination.Item>
      </HeroPagination.Content>
    </HeroPagination>
  );
}
