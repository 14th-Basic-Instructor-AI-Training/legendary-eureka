"use client";

/**
 * Minimal browser WebSocket transport. Kept deliberately separate from the
 * feature state machines (see CLAUDE.md: "Keep the transport concerns separate
 * from the booking state machine") — this module only moves frames; the stores
 * decide what a frame means.
 *
 * Real-time is still being brought up, so the socket is opt-in via
 * `NEXT_PUBLIC_WS_URL` and no-ops when that is unset, which lets the static-UI
 * build run without a server. A single shared connection is fanned out to all
 * subscribers; it reconnects with a fixed backoff after a drop.
 */

export interface RealtimeMessage<T = unknown> {
  /** Event tag, e.g. "agency-report-<uuid>". */
  event: string;
  data: T;
}

type Handler = (msg: RealtimeMessage) => void;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
const RECONNECT_MS = 3000;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const handlers = new Set<Handler>();

function connect() {
  // SSR, or realtime not configured yet — stay a no-op so the build is green.
  if (typeof window === "undefined" || !WS_URL) return;
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.addEventListener("message", (e) => {
    let msg: RealtimeMessage;
    try {
      msg = JSON.parse(e.data as string) as RealtimeMessage;
    } catch {
      return; // ignore non-JSON frames
    }
    if (!msg || typeof msg.event !== "string") return;
    handlers.forEach((h) => h(msg));
  });

  socket.addEventListener("close", () => {
    socket = null;
    if (handlers.size === 0) return; // nobody listening — don't reconnect
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, RECONNECT_MS);
  });

  socket.addEventListener("error", () => {
    socket?.close();
  });
}

/**
 * Subscribe to inbound realtime messages whose `event` tag matches. `match` is
 * either an exact tag or a predicate (e.g. a prefix test for the
 * `agency-report-<uuid>` family). Opens the shared socket lazily on first
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
  connect();

  return () => {
    handlers.delete(wrapped);
  };
}
