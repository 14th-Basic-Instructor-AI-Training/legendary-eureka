"use client";

/**
 * Browser realtime transport over Server-Sent Events, relayed by the Next.js
 * server (`/api/realtime`). Kept deliberately separate from the feature state
 * machines (see CLAUDE.md: "Keep the transport concerns separate from the
 * booking state machine") — this module only moves frames; the stores/consumers
 * decide what a frame means.
 *
 * Why SSE through our own server (not a same-browser BroadcastChannel): events
 * must reach clients in *other browsers/devices* (e.g. admin in Chrome → explore
 * + landing in Brave). The shared server fans every emitted frame out to all
 * subscribed streams. Receiving uses `EventSource` (auto-reconnects on drop);
 * emitting POSTs the frame to the relay.
 */

export interface RealtimeMessage<T = unknown> {
  /** Event tag, e.g. "tours-changed" or "agency-report-<uuid>". */
  event: string;
  data: T;
}

type Handler = (msg: RealtimeMessage) => void;

/**
 * Shared event tag for tour-catalog changes. Emitted by the admin when a package
 * is published / archived / deleted; the public surfaces (explore Tours tab,
 * landing Trending tours) subscribe and refetch on receipt.
 */
export const TOURS_CHANGED = "tours-changed";

/**
 * Shared event tag for destination-catalog changes. Emitted by the admin when a
 * destination is edited or deleted; the public surfaces (explore Destinations tab,
 * landing destination sections) subscribe and refetch on receipt.
 */
export const DESTINATIONS_CHANGED = "destinations-changed";

/**
 * Shared event tag for an agency registration being approved. Emitted by the
 * admin from the requests queue when a pending agency is confirmed; the public
 * surfaces (landing + explore, via the marketing header) subscribe and — for the
 * matching agency only — surface the "you're approved" modal so the agency can
 * jump straight to its workspace without reloading. Frame data: the approved
 * agency's `userId` (used to target the right account) plus its `agencyName`.
 */
export const AGENCY_APPROVED = "agency-approved";

const ENDPOINT = "/api/realtime";

let source: EventSource | null = null;
const handlers = new Set<Handler>();

/** Open the shared SSE stream lazily on first subscribe. */
function ensureStream() {
  if (typeof window === "undefined" || source) return;
  source = new EventSource(ENDPOINT);
  source.addEventListener("message", (e) => {
    let msg: RealtimeMessage;
    try {
      msg = JSON.parse(e.data as string) as RealtimeMessage;
    } catch {
      return; // ignore non-JSON / comment frames
    }
    if (!msg || typeof msg.event !== "string") return;
    handlers.forEach((h) => h(msg));
  });
  // EventSource reconnects automatically after a drop — nothing to wire up.
}

/**
 * Emit a realtime frame. POSTs to the server relay, which broadcasts it to every
 * subscribed stream (across browsers/devices). Fire-and-forget; no-ops on the
 * server. `keepalive` lets the request survive a navigation right after the call.
 */
export function sendRealtime<T = unknown>(message: RealtimeMessage<T>): void {
  if (typeof window === "undefined") return;
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
    keepalive: true,
  }).catch(() => {
    // Transport errors are non-fatal — the UI still updates via its own refresh.
  });
}

/**
 * Subscribe to inbound realtime messages whose `event` tag matches. `match` is
 * either an exact tag or a predicate (e.g. a prefix test for the
 * `agency-report-<uuid>` family). Opens the shared stream lazily on first
 * subscribe. Returns an unsubscribe function — call it on unmount.
 */
export function onRealtime(
  match: string | ((event: string) => boolean),
  handler: Handler,
): () => void {
  const matches =
    typeof match === "function" ? match : (event: string) => event === match;

  const wrapped: Handler = (msg) => {
    if (matches(msg.event)) handler(msg);
  };

  handlers.add(wrapped);
  ensureStream();

  return () => {
    handlers.delete(wrapped);
  };
}
