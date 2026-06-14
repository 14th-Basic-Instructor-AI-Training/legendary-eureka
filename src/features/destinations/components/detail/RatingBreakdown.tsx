"use client";

import type { RatingBucket } from "../../schema";

/** Vertical 5★→1★ distribution bars for the reviews summary card. */
export function RatingBreakdown({ buckets }: { buckets: RatingBucket[] }) {
  const ordered = [...buckets].sort((a, b) => b.stars - a.stars);
  return (
    <div className="mt-5 flex flex-col gap-2">
      {ordered.map((b) => (
        <div key={b.stars} className="flex items-center gap-2.5">
          <span className="text-muted w-7 text-right text-xs">{b.stars} ★</span>
          <div className="bg-border h-1.5 flex-1 overflow-hidden rounded-full">
            <div className="bg-warning h-full rounded-full" style={{ width: `${b.pct}%` }} />
          </div>
          <span className="text-muted w-8 text-right text-xs">{b.pct}%</span>
        </div>
      ))}
    </div>
  );
}
