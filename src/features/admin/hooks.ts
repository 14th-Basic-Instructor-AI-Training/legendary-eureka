"use client";

import { useEffect } from "react";
import { onRealtime } from "@/lib/realtime";
import { useAdminStore } from "./store";
import { ReportSchema } from "./schema";

/**
 * Event-tag prefix for inbound traveler reports. The producer — a Traveler
 * reporting an agency (or an Agency-side action) — emits on a per-report tag
 * shaped like `agency-report-<uuid>`. This app only LISTENS for that family of
 * tags; it never emits them (the emit side lives in the traveler/agency app).
 */
export const REPORT_EVENT_PREFIX = "agency-report-";

/**
 * Subscribe the admin Reports screen to live report events. Each inbound frame
 * is validated against `ReportSchema` (boundary validation — never trust the
 * wire) and folded into the admin store, so a freshly filed report appears in
 * the queue without a refresh. Call once from the Reports component.
 */
export function useReportRealtime() {
  const receiveReport = useAdminStore((s) => s.receiveReport);

  useEffect(() => {
    return onRealtime(
      (event) => event.startsWith(REPORT_EVENT_PREFIX),
      (msg) => {
        const parsed = ReportSchema.safeParse(msg.data);
        if (!parsed.success) {
          // Log technical detail to the console, not the UI.
          console.error(
            "Discarding malformed report event",
            msg.event,
            parsed.error.issues,
          );
          return;
        }
        receiveReport(parsed.data);
      },
    );
  }, [receiveReport]);
}
